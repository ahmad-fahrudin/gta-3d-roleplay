import * as THREE from 'three';
import { InputManager } from '../core/InputManager';
import { CollisionSystem } from '../world/CollisionSystem';
import { soundManager } from '../audio/SoundManager';
import { gameEvents } from '../state/gameEvents';

export class Vehicle {
    public id: string;
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    public rotationY: number = 0;
    public isOccupied: boolean = false;

    // Wheels for steering and rotation animation
    private frontLeftWheel: THREE.Group;
    private frontRightWheel: THREE.Group;
    private rearLeftWheel: THREE.Group;
    private rearRightWheel: THREE.Group;

    // Lights
    private headLightL: THREE.SpotLight;
    private headLightR: THREE.SpotLight;
    private headLightTarget: THREE.Object3D;
    private tailLightsMat: THREE.MeshStandardMaterial;
    public areLightsOn: boolean = false;

    // Driving physics parameters
    public speed: number = 0; // m/s
    private maxForwardSpeed: number = 38.0; // ~137 km/h
    private maxReverseSpeed: number = -12.0; // ~43 km/h
    private accelerationRate: number = 18.0; // m/s^2
    private brakeRate: number = 28.0;
    private naturalDecel: number = 8.0;
    private steeringAngle: number = 0;
    private maxSteerAngle: number = 0.55; // Radians (~31 degrees)
    private fuel: number = 94.0;

    constructor(id: string, initialPos: THREE.Vector3, initialRotY: number = 0, color: number = 0xe74c3c) {
        this.id = id;
        this.position = initialPos.clone();
        this.rotationY = initialRotY;
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotationY;

        const { fl, fr, rl, rr, hLightL, hLightR, hTarget, tailMat } = this.buildCarMesh(color);
        this.frontLeftWheel = fl;
        this.frontRightWheel = fr;
        this.rearLeftWheel = rl;
        this.rearRightWheel = rr;
        this.headLightL = hLightL;
        this.headLightR = hLightR;
        this.headLightTarget = hTarget;
        this.tailLightsMat = tailMat;
    }

    private buildCarMesh(bodyColor: number) {
        // Main car body / chassis
        const bodyGeo = new THREE.BoxGeometry(2.3, 0.7, 4.8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: bodyColor,
            metalness: 0.7,
            roughness: 0.3,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.65;
        body.castShadow = true;
        body.receiveShadow = true;
        this.mesh.add(body);

        // Cabin / Roof (sloped sports car roof)
        const cabinGeo = new THREE.BoxGeometry(1.9, 0.65, 2.4);
        const cabin = new THREE.Mesh(cabinGeo, bodyMat);
        cabin.position.set(0, 1.25, -0.3);
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // Windows (dark tinted glass)
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x111827,
            roughness: 0.1,
            metalness: 0.9,
        });

        // Windshield
        const windshieldGeo = new THREE.BoxGeometry(1.82, 0.55, 0.1);
        const windshield = new THREE.Mesh(windshieldGeo, glassMat);
        windshield.rotation.x = -Math.PI / 6;
        windshield.position.set(0, 1.18, 0.95);
        this.mesh.add(windshield);

        // Rear window
        const rearGlass = new THREE.Mesh(windshieldGeo, glassMat);
        rearGlass.rotation.x = Math.PI / 6;
        rearGlass.position.set(0, 1.18, -1.55);
        this.mesh.add(rearGlass);

        // Rear spoiler / wing
        const spoilerGeo = new THREE.BoxGeometry(2.2, 0.08, 0.4);
        const spoiler = new THREE.Mesh(spoilerGeo, bodyMat);
        spoiler.position.set(0, 1.25, -2.2);
        spoiler.castShadow = true;
        this.mesh.add(spoiler);

        const standGeo = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const standL = new THREE.Mesh(standGeo, bodyMat);
        standL.position.set(-0.8, 1.1, -2.2);
        this.mesh.add(standL);
        const standR = new THREE.Mesh(standGeo, bodyMat);
        standR.position.set(0.8, 1.1, -2.2);
        this.mesh.add(standR);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 18);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

        const createWheel = () => {
            const wheelPivot = new THREE.Group();
            const tire = new THREE.Mesh(wheelGeo, tireMat);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelPivot.add(tire);

            const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.36, 12);
            const rim = new THREE.Mesh(rimGeo, rimMat);
            rim.rotation.z = Math.PI / 2;
            wheelPivot.add(rim);

            return wheelPivot;
        };

        const fl = createWheel();
        fl.position.set(-1.2, 0.42, 1.4);
        this.mesh.add(fl);

        const fr = createWheel();
        fr.position.set(1.2, 0.42, 1.4);
        this.mesh.add(fr);

        const rl = createWheel();
        rl.position.set(-1.2, 0.42, -1.4);
        this.mesh.add(rl);

        const rr = createWheel();
        rr.position.set(1.2, 0.42, -1.4);
        this.mesh.add(rr);

        // Headlights (Meshes + Spotlights)
        const hlGeo = new THREE.BoxGeometry(0.45, 0.18, 0.1);
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const hlLeftMesh = new THREE.Mesh(hlGeo, hlMat);
        hlLeftMesh.position.set(-0.8, 0.65, 2.41);
        this.mesh.add(hlLeftMesh);

        const hlRightMesh = new THREE.Mesh(hlGeo, hlMat);
        hlRightMesh.position.set(0.8, 0.65, 2.41);
        this.mesh.add(hlRightMesh);

        // Spotlight targets
        const hTarget = new THREE.Object3D();
        hTarget.position.set(0, 0, 20);
        this.mesh.add(hTarget);

        const hLightL = new THREE.SpotLight(0xfff5cc, 0, 45, Math.PI / 5, 0.4, 1.5);
        hLightL.position.set(-0.8, 0.7, 2.5);
        hLightL.target = hTarget;
        this.mesh.add(hLightL);

        const hLightR = new THREE.SpotLight(0xfff5cc, 0, 45, Math.PI / 5, 0.4, 1.5);
        hLightR.position.set(0.8, 0.7, 2.5);
        hLightR.target = hTarget;
        this.mesh.add(hLightR);

        // Taillights
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0xaa0000,
            emissive: 0x440000,
            roughness: 0.3,
        });

        const tlMeshL = new THREE.Mesh(hlGeo, tailMat);
        tlMeshL.position.set(-0.8, 0.65, -2.41);
        this.mesh.add(tlMeshL);

        const tlMeshR = new THREE.Mesh(hlGeo, tailMat);
        tlMeshR.position.set(0.8, 0.65, -2.41);
        this.mesh.add(tlMeshR);

        return { fl, fr, rl, rr, hLightL, hLightR, hTarget, tailMat };
    }

    toggleHeadlights() {
        this.areLightsOn = !this.areLightsOn;
        const intensity = this.areLightsOn ? 2.8 : 0;
        this.headLightL.intensity = intensity;
        this.headLightR.intensity = intensity;
    }

    enter() {
        this.isOccupied = true;
        soundManager.playDoorSound();
        soundManager.startEngine();
        gameEvents.updateState({ inVehicle: true });
    }

    exit() {
        this.isOccupied = false;
        this.speed = 0;
        soundManager.playDoorSound();
        soundManager.stopEngine();
        soundManager.stopHorn();
        gameEvents.updateState({ inVehicle: false, vehicleSpeed: 0, vehicleGear: 'P' });
    }

    update(delta: number, input: InputManager, collision: CollisionSystem) {
        if (!this.isOccupied) {
            // Gradually bring to complete stop if empty
            this.speed = THREE.MathUtils.lerp(this.speed, 0, delta * 5);
            return;
        }

        const isAccelerating = input.state.forward;
        const isBraking = input.state.backward;
        const isHandbrake = input.state.jump;

        // Acceleration & Braking logic
        if (isAccelerating) {
            if (this.speed < 0) {
                // If moving backwards, W acts as brake first
                this.speed += this.brakeRate * delta;
            } else {
                this.speed = Math.min(this.speed + this.accelerationRate * delta, this.maxForwardSpeed);
            }
        } else if (isBraking) {
            if (this.speed > 0.5) {
                // If moving forwards, S acts as brake
                this.speed = Math.max(this.speed - this.brakeRate * delta, 0);
            } else {
                // Once stopped, S accelerates in reverse
                this.speed = Math.max(this.speed - (this.accelerationRate * 0.6) * delta, this.maxReverseSpeed);
            }
        } else {
            // Natural coasting deceleration
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - this.naturalDecel * delta, 0);
            } else if (this.speed < 0) {
                this.speed = Math.min(this.speed + this.naturalDecel * delta, 0);
            }
        }

        // Handbrake stops faster and allows drifting
        if (isHandbrake) {
            this.speed = THREE.MathUtils.lerp(this.speed, 0, delta * 4);
        }

        // Taillights brighten on brake
        if (isBraking || isHandbrake) {
            this.tailLightsMat.emissive.setHex(0xff0000);
        } else {
            this.tailLightsMat.emissive.setHex(0x330000);
        }

        // Steering logic
        const steerTarget = (input.state.left ? 1 : 0) - (input.state.right ? 1 : 0);
        this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, steerTarget * this.maxSteerAngle, delta * 10);

        // Turn front wheels visual
        this.frontLeftWheel.rotation.y = this.steeringAngle;
        this.frontRightWheel.rotation.y = this.steeringAngle;

        // Rotate car according to speed and steering
        if (Math.abs(this.speed) > 0.1) {
            const turnSpeedMultiplier = Math.sign(this.speed) * (isHandbrake ? 2.0 : 1.2);
            this.rotationY += this.steeringAngle * turnSpeedMultiplier * (Math.abs(this.speed) / this.maxForwardSpeed) * delta * 4;
            this.mesh.rotation.y = this.rotationY;
        }

        // Forward vector
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);

        this.position.x += forward.x * this.speed * delta;
        this.position.z += forward.z * this.speed * delta;

        // Collision check against city buildings (car radius ~ 1.8)
        const col = collision.checkCircleCollision(this.position.x, this.position.z, 1.8);
        if (col.collided) {
            this.position.x += col.pushX;
            this.position.z += col.pushZ;
            // Dampen speed on crash
            this.speed *= -0.2;
        }

        this.mesh.position.copy(this.position);

        // Spin wheels forward/backward
        const wheelSpin = (this.speed * delta) / 0.42;
        this.frontLeftWheel.children[0].rotation.x += wheelSpin;
        this.frontRightWheel.children[0].rotation.x += wheelSpin;
        this.rearLeftWheel.children[0].rotation.x += wheelSpin;
        this.rearRightWheel.children[0].rotation.x += wheelSpin;

        // Horn audio
        if (input.state.horn) {
            soundManager.startHorn();
        } else {
            soundManager.stopHorn();
        }

        // Engine sound modulation
        const speedKmH = Math.round(this.speed * 3.6);
        soundManager.updateEngine(speedKmH, isAccelerating);

        // Gear computation
        let gear = 'N';
        if (this.speed < -0.5) gear = 'R';
        else if (speedKmH > 90) gear = '4';
        else if (speedKmH > 60) gear = '3';
        else if (speedKmH > 30) gear = '2';
        else if (speedKmH > 2) gear = '1';

        // Fuel consumption
        if (Math.abs(this.speed) > 1) {
            this.fuel = Math.max(0, this.fuel - delta * 0.04);
        }

        // Broadcast to HUD
        gameEvents.updateState({
            vehicleSpeed: Math.abs(speedKmH),
            vehicleGear: gear,
            vehicleFuel: Math.round(this.fuel),
            playerCoords: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
                heading: this.rotationY,
            },
        });
    }

    updateCamera(camera: THREE.PerspectiveCamera) {
        // Vehicle chase camera (follows behind the car)
        const camDistance = 8.5;
        const camHeight = 3.2;

        const behind = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
        const desiredCamPos = this.position.clone()
            .add(behind.clone().multiplyScalar(camDistance))
            .add(new THREE.Vector3(0, camHeight, 0));

        const lookTarget = this.position.clone().add(new THREE.Vector3(0, 1.2, 0));

        camera.position.lerp(desiredCamPos, 0.12);
        camera.lookAt(lookTarget);
    }
}

