import * as THREE from 'three';
import { InputManager } from './InputManager';
import { CollisionSystem } from '../world/CollisionSystem';
import { CityBuilder, RoleplayMarker } from '../world/CityBuilder';
import { Player } from '../entities/Player';
import { Vehicle } from '../entities/Vehicle';
import { gameEvents } from '../state/gameEvents';
import { soundManager } from '../audio/SoundManager';

export class GameEngine {
    private container: HTMLElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private clock: THREE.Clock;

    public inputManager: InputManager;
    public collisionSystem: CollisionSystem;
    public cityBuilder: CityBuilder;
    public player: Player;
    public vehicles: Vehicle[] = [];
    public currentVehicle: Vehicle | null = null;
    private activeNearMarker: RoleplayMarker | null = null;
    private isNearMissionTarget: boolean = false;

    private isRunning: boolean = false;
    private animFrameId: number = 0;
    private unsubscribeActions: Array<() => void> = [];

    constructor(container: HTMLElement) {
        this.container = container;
        this.clock = new THREE.Clock();

        // 1. Scene setup with warm GTA Vice/Los Santos haze
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.FogExp2(0x99ccff, 0.007); // Gentle distance fog

        // 2. Camera setup
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 400);
        this.camera.position.set(0, 5, 15);

        // 3. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio for high FPS
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // 4. Lighting
        this.setupLighting();

        // 5. Systems
        this.inputManager = new InputManager();
        this.inputManager.init(this.renderer.domElement);

        this.collisionSystem = new CollisionSystem();
        this.cityBuilder = new CityBuilder(this.scene, this.collisionSystem);
        this.cityBuilder.buildCity();

        // 6. Spawn Player
        this.player = new Player();
        this.scene.add(this.player.mesh);

        // 7. Spawn Vehicles
        this.spawnVehicles();

        // 8. Bind Key Actions
        this.bindActions();

        // 9. Resize Listener
        window.addEventListener('resize', this.handleResize);

        // 10. Start Loop
        this.isRunning = true;
        this.tick();
    }

    private setupLighting() {
        // Ambient skylight
        const hemiLight = new THREE.HemisphereLight(0xfff7e6, 0x3d5a80, 0.85);
        this.scene.add(hemiLight);

        // Directional Sunlight
        const sun = new THREE.DirectionalLight(0xfff1d0, 1.3);
        sun.position.set(80, 120, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 300;
        sun.shadow.camera.left = -100;
        sun.shadow.camera.right = 100;
        sun.shadow.camera.top = 100;
        sun.shadow.camera.bottom = -100;
        sun.shadow.bias = -0.0005;
        this.scene.add(sun);
    }

    private spawnVehicles() {
        // Spawn 3 cars with distinct colors: Red Sports Coupe, Yellow Taxi, Blue GT
        const car1 = new Vehicle('car_red', new THREE.Vector3(0, 0, 14), 0, 0xe74c3c);
        const car2 = new Vehicle('car_taxi', new THREE.Vector3(60, 0, 20), Math.PI / 2, 0xf1c40f);
        const car3 = new Vehicle('car_blue', new THREE.Vector3(-60, 0, -30), Math.PI, 0x2980b9);

        this.vehicles = [car1, car2, car3];

        for (const car of this.vehicles) {
            this.scene.add(car.mesh);
        }
    }

    private bindActions() {
        // Toggle vehicle enter/exit
        const unsubInteract = this.inputManager.onAction('interact', () => {
            this.handleInteraction();
        });

        // Toggle headlights
        const unsubLights = this.inputManager.onAction('lights', () => {
            if (this.currentVehicle) {
                this.currentVehicle.toggleHeadlights();
            }
        });

        // Toggle camera view
        const unsubCam = this.inputManager.onAction('cameraToggle', () => {
            if (!this.currentVehicle) {
                this.player.cycleCameraDistance();
            }
        });

        // Toggle Smartphone
        const unsubPhone = this.inputManager.onAction('togglePhone', () => {
            const current = gameEvents.getState().phoneOpen;
            gameEvents.updateState({ phoneOpen: !current });
            if (!current) soundManager.playNotification();
        });

        // Toggle Inventory
        const unsubInv = this.inputManager.onAction('toggleInventory', () => {
            const current = gameEvents.getState().inventoryOpen;
            gameEvents.updateState({ inventoryOpen: !current });
        });

        // Use Marker / Deliver Mission [E]
        const unsubUseMarker = this.inputManager.onAction('useMarker', () => {
            if (this.isNearMissionTarget) {
                const mission = gameEvents.getState().activeMission;
                if (mission) {
                    soundManager.playMoney();
                    soundManager.playMissionSuccess();
                    gameEvents.updateState({
                        cash: gameEvents.getState().cash + mission.reward,
                        activeMission: null,
                    });
                    this.cityBuilder.setMissionMarker(null);
                    gameEvents.addChatMessage({
                        sender: 'Misi Selesai',
                        text: `Pengiriman berhasil! Anda menerima bayaran $${mission.reward.toLocaleString()}.`,
                        type: 'system',
                    });
                }
                return;
            }

            if (this.activeNearMarker) {
                const marker = this.activeNearMarker;
                if (marker.type === 'hospital') {
                    if (gameEvents.getState().cash >= 250) {
                        gameEvents.updateState({
                            cash: gameEvents.getState().cash - 250,
                            health: 100,
                        });
                        soundManager.playNotification();
                        gameEvents.addChatMessage({
                            sender: 'Medis',
                            text: 'Pemeriksaan selesai, kesehatan Anda kini pulih 100%!',
                            type: 'system',
                        });
                    } else {
                        gameEvents.addChatMessage({
                            sender: 'Medis',
                            text: 'Uang tunai Anda tidak mencukupi untuk biaya pengobatan ($250).',
                            type: 'system',
                        });
                    }
                } else {
                    gameEvents.updateState({ activeModal: marker.type });
                    soundManager.playNotification();
                }
            }
        });

        // Listen to chat commands (e.g. /car to spawn vehicle nearby)
        const unsubSpawn = gameEvents.onCommand('spawn_car', () => {
            const spawnPos = this.player.position.clone().add(new THREE.Vector3(3, 0, 0));
            const newCar = new Vehicle(`car_${Date.now()}`, spawnPos, this.player.rotationY, 0x9b59b6);
            this.vehicles.push(newCar);
            this.scene.add(newCar.mesh);
            gameEvents.addChatMessage({
                sender: 'System',
                text: 'Kendaraan baru berhasil di-spawn di dekat Anda!',
                type: 'system',
            });
        });

        this.unsubscribeActions = [unsubInteract, unsubLights, unsubCam, unsubPhone, unsubInv, unsubUseMarker, unsubSpawn];
    }

    private handleInteraction() {
        if (this.currentVehicle) {
            // Exit vehicle
            const exitPos = this.currentVehicle.position.clone().add(
                new THREE.Vector3(-2.2, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentVehicle.rotationY)
            );
            this.player.position.copy(exitPos);
            this.player.rotationY = this.currentVehicle.rotationY;
            this.player.setVisible(true);

            this.currentVehicle.exit();
            this.currentVehicle = null;
            gameEvents.updateState({ interactionPrompt: null });
        } else {
            // Check for nearest vehicle to enter
            let nearestCar: Vehicle | null = null;
            let minDist = 4.5; // Interaction radius

            for (const car of this.vehicles) {
                const dist = this.player.position.distanceTo(car.position);
                if (dist < minDist) {
                    minDist = dist;
                    nearestCar = car;
                }
            }

            if (nearestCar) {
                this.currentVehicle = nearestCar;
                this.player.setVisible(false);
                nearestCar.enter();
                gameEvents.updateState({ interactionPrompt: null });
            }
        }
    }

    private tick = () => {
        if (!this.isRunning) return;
        this.animFrameId = requestAnimationFrame(this.tick);

        const delta = Math.min(this.clock.getDelta(), 0.1); // Clamp delta against tab pauses
        const time = this.clock.getElapsedTime();

        // Animate 3D Roleplay world markers
        this.cityBuilder.updateMarkers(time);

        // Update active mission 3D beacon
        const activeMission = gameEvents.getState().activeMission;
        this.cityBuilder.setMissionMarker(activeMission?.target || null);

        // 1. Update Entities
        if (this.currentVehicle) {
            this.currentVehicle.update(delta, this.inputManager, this.collisionSystem);
            this.currentVehicle.updateCamera(this.camera);
            // Sync player position to car position
            this.player.position.copy(this.currentVehicle.position);
            gameEvents.updateState({ interactionPrompt: null });
        } else {
            this.player.update(delta, this.inputManager, this.collisionSystem);
            this.player.updateCamera(this.camera);

            let promptText: string | null = null;
            this.activeNearMarker = null;
            this.isNearMissionTarget = false;

            // Check if near active mission target
            if (activeMission) {
                const distMission = new THREE.Vector2(this.player.position.x, this.player.position.z).distanceTo(
                    new THREE.Vector2(activeMission.target.x, activeMission.target.z)
                );
                if (distMission < 4.5) {
                    this.isNearMissionTarget = true;
                    promptText = `Tekan [E] untuk Selesaikan: ${activeMission.title}`;
                }
            }

            // Check if near roleplay marker (ATM, Shop, Job Center, Hospital)
            if (!promptText) {
                for (const marker of this.cityBuilder.roleplayMarkers) {
                    const dist = new THREE.Vector2(this.player.position.x, this.player.position.z).distanceTo(
                        new THREE.Vector2(marker.position.x, marker.position.z)
                    );
                    if (dist < 3.2) {
                        this.activeNearMarker = marker;
                        promptText = marker.prompt;
                        break;
                    }
                }
            }

            // Check if near vehicle to enter
            if (!promptText) {
                for (const car of this.vehicles) {
                    const dist = this.player.position.distanceTo(car.position);
                    if (dist < 4.5) {
                        promptText = 'Tekan [F] untuk Masuk Mobil';
                        break;
                    }
                }
            }

            gameEvents.updateState({ interactionPrompt: promptText });
        }

        // 2. Broadcast vehicle coordinates for minimap
        gameEvents.updateState({
            vehiclesCoords: this.vehicles.map(v => ({
                id: v.id,
                x: v.position.x,
                z: v.position.z,
                heading: v.rotationY,
            })),
        });

        // 3. Render frame
        this.renderer.render(this.scene, this.camera);
    };

    private handleResize = () => {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    destroy() {
        this.isRunning = false;
        cancelAnimationFrame(this.animFrameId);
        window.removeEventListener('resize', this.handleResize);

        this.unsubscribeActions.forEach(unsub => unsub());
        this.inputManager.destroy();

        if (this.currentVehicle) {
            this.currentVehicle.exit();
        }

        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
    }
}

