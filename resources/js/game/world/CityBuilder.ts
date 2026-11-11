import * as THREE from 'three';
import { CollisionSystem } from './CollisionSystem';

export interface RoleplayMarker {
    id: string;
    type: 'atm' | 'shop' | 'job_center' | 'hospital';
    title: string;
    prompt: string;
    position: THREE.Vector3;
    mesh: THREE.Group;
}

export class CityBuilder {
    private scene: THREE.Scene;
    private collisionSystem: CollisionSystem;
    public cityBounds = { minX: -180, maxX: 180, minZ: -180, maxZ: 180 };
    public roleplayMarkers: RoleplayMarker[] = [];
    public missionMarkerMesh: THREE.Group | null = null;

    constructor(scene: THREE.Scene, collisionSystem: CollisionSystem) {
        this.scene = scene;
        this.collisionSystem = collisionSystem;
    }

    buildCity() {
        this.createGroundAndRoads();
        this.createBuildings();
        this.createProps();
        this.createRoleplayMarkers();
    }

    private createGroundAndRoads() {
        // Base ground (grass/pavement base)
        const groundGeo = new THREE.PlaneGeometry(400, 400);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x2d5a27, // Lush green lawn
            roughness: 0.9,
            metalness: 0.1,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid road layout: 5 avenues (X-axis) and 5 streets (Z-axis)
        const roadPositions = [-120, -60, 0, 60, 120];
        const roadWidth = 14;
        const roadMat = new THREE.MeshStandardMaterial({
            color: 0x22252a, // Dark asphalt
            roughness: 0.8,
            metalness: 0.1,
        });

        const lineMat = new THREE.MeshBasicMaterial({ color: 0xf5b041 }); // Yellow road divider lines
        const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White curb markings

        // Build horizontal roads (along X)
        for (const z of roadPositions) {
            const roadGeo = new THREE.PlaneGeometry(360, roadWidth);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.rotation.x = -Math.PI / 2;
            road.position.set(0, 0.02, z);
            road.receiveShadow = true;
            this.scene.add(road);

            // Sidewalks on both sides
            this.createSidewalk(0, z - (roadWidth / 2 + 2), 360, 4);
            this.createSidewalk(0, z + (roadWidth / 2 + 2), 360, 4);

            // Dashed yellow centerline
            for (let x = -170; x < 170; x += 8) {
                const dashGeo = new THREE.PlaneGeometry(4, 0.3);
                const dash = new THREE.Mesh(dashGeo, lineMat);
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(x, 0.03, z);
                this.scene.add(dash);
            }
        }

        // Build vertical roads (along Z)
        for (const x of roadPositions) {
            const roadGeo = new THREE.PlaneGeometry(roadWidth, 360);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.rotation.x = -Math.PI / 2;
            road.position.set(x, 0.02, 0);
            road.receiveShadow = true;
            this.scene.add(road);

            // Sidewalks
            this.createSidewalk(x - (roadWidth / 2 + 2), 0, 4, 360);
            this.createSidewalk(x + (roadWidth / 2 + 2), 0, 4, 360);

            // Dashed yellow centerline
            for (let z = -170; z < 170; z += 8) {
                const dashGeo = new THREE.PlaneGeometry(0.3, 4);
                const dash = new THREE.Mesh(dashGeo, lineMat);
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(x, 0.03, z);
                this.scene.add(dash);
            }

            // Crosswalks at intersections
            for (const rz of roadPositions) {
                this.createCrosswalk(x, rz, roadWidth);
            }
        }

        // Central plaza fountain area at (0, 0)
        this.createCentralPlaza();
    }

    private createSidewalk(x: number, z: number, width: number, depth: number) {
        const sidewalkGeo = new THREE.BoxGeometry(width, 0.25, depth);
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x95a5a6, // Light gray concrete
            roughness: 0.85,
        });
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(x, 0.125, z);
        sidewalk.receiveShadow = true;
        this.scene.add(sidewalk);
    }

    private createCrosswalk(cx: number, cz: number, roadW: number) {
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
        const half = roadW / 2 + 2;

        const offsets = [
            { x: cx, z: cz - half, rot: 0 },
            { x: cx, z: cz + half, rot: 0 },
            { x: cx - half, z: cz, rot: Math.PI / 2 },
            { x: cx + half, z: cz, rot: Math.PI / 2 },
        ];

        offsets.forEach(pos => {
            for (let i = -4; i <= 4; i += 1.5) {
                const barGeo = new THREE.PlaneGeometry(0.8, 3.5);
                const bar = new THREE.Mesh(barGeo, whiteMat);
                bar.rotation.x = -Math.PI / 2;
                bar.rotation.z = pos.rot;
                if (pos.rot === 0) {
                    bar.position.set(pos.x + i, 0.035, pos.z);
                } else {
                    bar.position.set(pos.x, 0.035, pos.z + i);
                }
                this.scene.add(bar);
            }
        });
    }

    private createCentralPlaza() {
        // Round plaza around center
        const plazaGeo = new THREE.CylinderGeometry(18, 18, 0.4, 32);
        const plazaMat = new THREE.MeshStandardMaterial({ color: 0xd5dbdb, roughness: 0.7 });
        const plaza = new THREE.Mesh(plazaGeo, plazaMat);
        plaza.position.set(30, 0.2, 30);
        plaza.receiveShadow = true;
        this.scene.add(plaza);

        // Water fountain
        const poolGeo = new THREE.CylinderGeometry(8, 8, 1.2, 24);
        const poolMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.position.set(30, 0.6, 30);
        this.scene.add(pool);

        const waterGeo = new THREE.CylinderGeometry(7.5, 7.5, 0.1, 24);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8,
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.set(30, 1.15, 30);
        this.scene.add(water);

        // Register collider for fountain
        this.collisionSystem.addBoxCollider('fountain', new THREE.Vector3(30, 0.6, 30), new THREE.Vector3(16, 2, 16));
    }

    private createBuildings() {
        // Building blocks are placed in the spaces between roads
        const blockCenters = [-90, -30, 30, 90];

        const buildingColors = [
            0x2c3e50, // Dark navy
            0x34495e, // Charcoal slate
            0x7f8c8d, // Light slate
            0x95a5a6, // Concrete silver
            0x1a5276, // Ocean blue
            0x5d6d7e, // Steel
            0xd35400, // Rust orange brick
            0x8e44ad, // Royal purple
            0x16a085, // Teal
            0x27ae60, // Emerald
        ];

        let bIndex = 0;

        for (const bx of blockCenters) {
            for (const bz of blockCenters) {
                // Leave block (30, 30) partially open for the plaza
                if (bx === 30 && bz === 30) continue;

                // 2x2 buildings per city block
                const subOffsets = [-12, 12];

                for (const ox of subOffsets) {
                    for (const oz of subOffsets) {
                        const posX = bx + ox;
                        const posZ = bz + oz;

                        // Deterministic pseudo-random height based on coordinates
                        const seed = Math.sin(posX * 12.9898 + posZ * 78.233) * 43758.5453;
                        const rand = seed - Math.floor(seed);

                        const width = 16 + (rand * 4);
                        const depth = 16 + ((1 - rand) * 4);
                        const height = 15 + Math.floor(rand * 55);

                        const color = buildingColors[(bIndex++) % buildingColors.length];

                        // Building main body
                        const bGeo = new THREE.BoxGeometry(width, height, depth);
                        const bMat = new THREE.MeshStandardMaterial({
                            color,
                            roughness: 0.6,
                            metalness: 0.2,
                        });
                        const building = new THREE.Mesh(bGeo, bMat);
                        building.position.set(posX, height / 2, posZ);
                        building.castShadow = true;
                        building.receiveShadow = true;
                        this.scene.add(building);

                        // Window bands or rooftop feature
                        this.addBuildingDetails(posX, height, posZ, width, depth, rand);

                        // Register box collider
                        this.collisionSystem.addBoxCollider(
                            `building_${posX}_${posZ}`,
                            building.position,
                            new THREE.Vector3(width + 0.5, height, depth + 0.5)
                        );
                    }
                }
            }
        }
    }

    private addBuildingDetails(x: number, h: number, z: number, w: number, d: number, rand: number) {
        // Rooftop border / AC unit
        const roofBorderGeo = new THREE.BoxGeometry(w, 1.2, d);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1c2833 });
        const roofBorder = new THREE.Mesh(roofBorderGeo, roofMat);
        roofBorder.position.set(x, h + 0.6, z);
        this.scene.add(roofBorder);

        // Rooftop AC unit box
        const acGeo = new THREE.BoxGeometry(3, 2, 4);
        const acMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(x + (rand - 0.5) * 4, h + 1.6, z + (rand - 0.5) * 4);
        this.scene.add(ac);

        // Tall antenna for tall buildings
        if (h > 45) {
            const antGeo = new THREE.CylinderGeometry(0.15, 0.3, 10, 8);
            const antMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
            const ant = new THREE.Mesh(antGeo, antMat);
            ant.position.set(x, h + 5, z);
            this.scene.add(ant);

            // Flashing red beacon light
            const lightGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const beacon = new THREE.Mesh(lightGeo, lightMat);
            beacon.position.set(x, h + 10, z);
            this.scene.add(beacon);
        }
    }

    private createProps() {
        // Place streetlamps and trees along sidewalks
        const roadPositions = [-120, -60, 0, 60, 120];

        for (const rx of roadPositions) {
            for (let z = -140; z <= 140; z += 25) {
                if (roadPositions.some(rz => Math.abs(z - rz) < 15)) continue; // Don't spawn inside intersection

                this.createStreetLamp(rx - 8.5, z, Math.PI / 2);
                this.createStreetLamp(rx + 8.5, z, -Math.PI / 2);
                this.createTree(rx - 9.5, z + 12);
                this.createTree(rx + 9.5, z + 12);
            }
        }
    }

    private createStreetLamp(x: number, z: number, rotationY: number) {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(x, 0, z);
        lampGroup.rotation.y = rotationY;

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 3.5;
        lampGroup.add(pole);

        // Arm
        const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 8);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.rotation.z = Math.PI / 3;
        arm.position.set(0.8, 6.8, 0);
        lampGroup.add(arm);

        // Lantern head
        const headGeo = new THREE.BoxGeometry(0.6, 0.25, 0.5);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xffeaa7 }); // Warm yellow glow
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(1.6, 7.3, 0);
        lampGroup.add(head);

        this.scene.add(lampGroup);

        // Collider for lamp pole
        this.collisionSystem.addBoxCollider('lamp', new THREE.Vector3(x, 3.5, z), new THREE.Vector3(0.5, 7, 0.5));
    }

    private createTree(x: number, z: number) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x, 0, z);

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 4.5, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.25;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage (low-poly 2-tier cone)
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8 });

        const leaf1Geo = new THREE.ConeGeometry(2.4, 4, 7);
        const leaf1 = new THREE.Mesh(leaf1Geo, leafMat);
        leaf1.position.y = 5.5;
        leaf1.castShadow = true;
        treeGroup.add(leaf1);

        const leaf2Geo = new THREE.ConeGeometry(1.8, 3.2, 7);
        const leaf2 = new THREE.Mesh(leaf2Geo, leafMat);
        leaf2.position.y = 7.5;
        leaf2.castShadow = true;
        treeGroup.add(leaf2);

        this.scene.add(treeGroup);

        // Collider for trunk
        this.collisionSystem.addBoxCollider('tree', new THREE.Vector3(x, 2.25, z), new THREE.Vector3(0.8, 4.5, 0.8));
    }

    private createRoleplayMarkers() {
        const markerDefs: Array<{
            id: string;
            type: 'atm' | 'shop' | 'job_center' | 'hospital';
            title: string;
            prompt: string;
            pos: [number, number, number];
            color: number;
        }> = [
            {
                id: 'atm_1',
                type: 'atm',
                title: 'Maze Bank ATM',
                prompt: 'Tekan [E] untuk Membuka ATM',
                pos: [10, 0, 10],
                color: 0xf1c40f, // Golden yellow
            },
            {
                id: 'shop_1',
                type: 'shop',
                title: '24/7 Supermarket',
                prompt: 'Tekan [E] untuk Belanja Makanan & Alat',
                pos: [-15, 0, 15],
                color: 0x2ecc71, // Green
            },
            {
                id: 'job_1',
                type: 'job_center',
                title: 'Balai Kota / Job Center',
                prompt: 'Tekan [E] untuk Mengambil Pekerjaan',
                pos: [15, 0, -15],
                color: 0x9b59b6, // Purple
            },
            {
                id: 'hosp_1',
                type: 'hospital',
                title: 'Pillbox Hill Medical',
                prompt: 'Tekan [E] untuk Pengobatan Medis ($250)',
                pos: [-25, 0, -25],
                color: 0xe74c3c, // Red
            },
        ];

        for (const def of markerDefs) {
            const group = new THREE.Group();
            group.position.set(def.pos[0], 0.05, def.pos[2]);

            // Ground glowing disc
            const ringGeo = new THREE.RingGeometry(1.2, 1.6, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: def.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            group.add(ring);

            // Floating 3D Diamond / Crystal
            const crystalGeo = new THREE.OctahedronGeometry(0.55);
            const crystalMat = new THREE.MeshStandardMaterial({
                color: def.color,
                emissive: def.color,
                emissiveIntensity: 0.5,
                roughness: 0.2,
                metalness: 0.8,
            });
            const crystal = new THREE.Mesh(crystalGeo, crystalMat);
            crystal.position.y = 1.6;
            group.add(crystal);

            // Vertical light pillar cylinder
            const cylinderGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 16, 1, true);
            const cylinderMat = new THREE.MeshBasicMaterial({
                color: def.color,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
            });
            const pillar = new THREE.Mesh(cylinderGeo, cylinderMat);
            pillar.position.y = 1.25;
            group.add(pillar);

            this.scene.add(group);

            this.roleplayMarkers.push({
                id: def.id,
                type: def.type,
                title: def.title,
                prompt: def.prompt,
                position: new THREE.Vector3(def.pos[0], def.pos[1], def.pos[2]),
                mesh: group,
            });
        }
    }

    setMissionMarker(target: { x: number; z: number } | null) {
        if (!target) {
            if (this.missionMarkerMesh) {
                this.scene.remove(this.missionMarkerMesh);
                this.missionMarkerMesh = null;
            }
            return;
        }

        if (!this.missionMarkerMesh) {
            this.missionMarkerMesh = new THREE.Group();

            const ringGeo = new THREE.RingGeometry(1.8, 2.4, 24);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            this.missionMarkerMesh.add(ring);

            const beaconGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16, 1, true);
            const beaconMat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide,
            });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.y = 4;
            this.missionMarkerMesh.add(beacon);

            this.scene.add(this.missionMarkerMesh);
        }

        this.missionMarkerMesh.position.set(target.x, 0.05, target.z);
    }

    updateMarkers(time: number) {
        // Gently rotate and bob marker crystals
        for (const marker of this.roleplayMarkers) {
            const crystal = marker.mesh.children[1];
            if (crystal) {
                crystal.rotation.y = time * 1.5;
                crystal.position.y = 1.6 + Math.sin(time * 3) * 0.15;
            }
        }

        if (this.missionMarkerMesh) {
            this.missionMarkerMesh.rotation.y = time;
            const beacon = this.missionMarkerMesh.children[1];
            if (beacon) {
                beacon.scale.y = 1 + Math.sin(time * 4) * 0.1;
            }
        }
    }
}

