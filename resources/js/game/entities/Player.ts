import * as THREE from 'three';
import { InputManager } from '../core/InputManager';
import { CollisionSystem } from '../world/CollisionSystem';
import { soundManager } from '../audio/SoundManager';
import { gameEvents } from '../state/gameEvents';

export class Player {
    public mesh: THREE.Group;
    public position: THREE.Vector3;
    public rotationY: number = 0;
    public isGrounded: boolean = true;
    public isVisible: boolean = true;

    // Sub-parts for animation
    private head: THREE.Mesh;
    private torso: THREE.Mesh;
    private leftArm: THREE.Group;
    private rightArm: THREE.Group;
    private leftLeg: THREE.Group;
    private rightLeg: THREE.Group;

    // Movement state
    private velocity: THREE.Vector3 = new THREE.Vector3();
    private walkSpeed: number = 6.0;
    private runSpeed: number = 12.0;
    private jumpForce: number = 9.0;
    private gravity: number = 24.0;
    private animTime: number = 0;
    private footstepTimer: number = 0;

    // Camera orbit parameters
    public cameraDistance: number = 6.5;
    public cameraAngleH: number = 0; // Horizontal rotation
    public cameraAngleV: number = 0.35; // Vertical pitch (radians)
    private cameraDistances: number[] = [4.5, 7.0, 10.0];
    private cameraDistIndex: number = 1;

    constructor() {
        this.position = new THREE.Vector3(0, 0, 5);
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        // Build low-poly character model
        const { head, torso, leftArm, rightArm, leftLeg, rightLeg } = this.buildCharacterMesh();
        this.head = head;
        this.torso = torso;
        this.leftArm = leftArm;
        this.rightArm = rightArm;
        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;
    }

    private buildCharacterMesh() {
        // Torso / Jacket (Black/Dark grey leather jacket)
        const torsoGeo = new THREE.BoxGeometry(0.8, 1.0, 0.45);
        const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 1.4;
        torso.castShadow = true;
        this.mesh.add(torso);

        // Inner shirt collar (Red accent)
        const shirtGeo = new THREE.BoxGeometry(0.35, 0.2, 0.46);
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        const shirt = new THREE.Mesh(shirtGeo, shirtMat);
        shirt.position.set(0, 0.4, 0);
        torso.add(shirt);

        // Head
        const headGeo = new THREE.BoxGeometry(0.45, 0.5, 0.45);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.7 });
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 2.15;
        head.castShadow = true;
        this.mesh.add(head);

        // Hair / Cap
        const hairGeo = new THREE.BoxGeometry(0.48, 0.2, 0.48);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 0.2;
        head.add(hair);

        // Sunglasses (Cool GTA vibe)
        const glassesGeo = new THREE.BoxGeometry(0.4, 0.1, 0.08);
        const glassesMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.9, roughness: 0.1 });
        const glasses = new THREE.Mesh(glassesGeo, glassesMat);
        glasses.position.set(0, 0.05, 0.24);
        head.add(glasses);

        // Arms (Pivot at shoulders)
        const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
        const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });

        // Left Arm
        const leftArm = new THREE.Group();
        leftArm.position.set(-0.55, 1.8, 0);
        const leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
        leftArmMesh.position.y = -0.4;
        leftArmMesh.castShadow = true;
        leftArm.add(leftArmMesh);
        this.mesh.add(leftArm);

        // Right Arm
        const rightArm = new THREE.Group();
        rightArm.position.set(0.55, 1.8, 0);
        const rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
        rightArmMesh.position.y = -0.4;
        rightArmMesh.castShadow = true;
        rightArm.add(rightArmMesh);
        this.mesh.add(rightArm);

        // Legs (Pivot at hips)
        const legGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 }); // Blue jeans
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White sneakers

        // Left Leg
        const leftLeg = new THREE.Group();
        leftLeg.position.set(-0.24, 0.9, 0);
        const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
        leftLegMesh.position.y = -0.45;
        leftLegMesh.castShadow = true;
        leftLeg.add(leftLegMesh);

        const leftShoeGeo = new THREE.BoxGeometry(0.3, 0.2, 0.45);
        const leftShoe = new THREE.Mesh(leftShoeGeo, shoeMat);
        leftShoe.position.set(0, -0.85, 0.07);
        leftShoe.castShadow = true;
        leftLeg.add(leftShoe);
        this.mesh.add(leftLeg);

        // Right Leg
        const rightLeg = new THREE.Group();
        rightLeg.position.set(0.24, 0.9, 0);
        const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
        rightLegMesh.position.y = -0.45;
        rightLegMesh.castShadow = true;
        rightLeg.add(rightLegMesh);

        const rightShoe = new THREE.Mesh(leftShoeGeo, shoeMat);
        rightShoe.position.set(0, -0.85, 0.07);
        rightShoe.castShadow = true;
        rightLeg.add(rightShoe);
        this.mesh.add(rightLeg);

        return { head, torso, leftArm, rightArm, leftLeg, rightLeg };
    }

    cycleCameraDistance() {
        this.cameraDistIndex = (this.cameraDistIndex + 1) % this.cameraDistances.length;
        this.cameraDistance = this.cameraDistances[this.cameraDistIndex];
    }

    update(delta: number, input: InputManager, collision: CollisionSystem) {
        if (!this.isVisible) return;

        // Process mouse look delta
        const mouseDelta = input.consumeMouseDelta();
        const sensitivity = 0.003;
        this.cameraAngleH -= mouseDelta.x * sensitivity;
        this.cameraAngleV += mouseDelta.y * sensitivity;
        // Clamp pitch so camera doesn't invert
        this.cameraAngleV = Math.max(0.08, Math.min(Math.PI / 2.3, this.cameraAngleV));

        // Movement direction relative to camera heading
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleH);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleH);

        const moveDir = new THREE.Vector3();
        if (input.state.forward) moveDir.add(forward);
        if (input.state.backward) moveDir.sub(forward);
        if (input.state.right) moveDir.add(right);
        if (input.state.left) moveDir.sub(right);

        const isMoving = moveDir.lengthSq() > 0.001;
        const currentSpeed = input.state.sprint ? this.runSpeed : this.walkSpeed;

        if (isMoving) {
            moveDir.normalize();
            this.velocity.x = moveDir.x * currentSpeed;
            this.velocity.z = moveDir.z * currentSpeed;

            // Rotate character mesh towards movement direction with smooth slerp
            const targetRotation = Math.atan2(moveDir.x, moveDir.z);
            let diff = targetRotation - this.rotationY;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.rotationY += diff * Math.min(delta * 14, 1);
            this.mesh.rotation.y = this.rotationY;
        } else {
            this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, delta * 12);
            this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, delta * 12);
        }

        // Jump & gravity
        if (input.state.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        if (!this.isGrounded) {
            this.velocity.y -= this.gravity * delta;
        }

        // Apply movement
        this.position.x += this.velocity.x * delta;
        this.position.z += this.velocity.z * delta;
        this.position.y += this.velocity.y * delta;

        // Ground collision (base ground is y = 0)
        if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Obstacle collision resolution (player radius ~ 0.5)
        const col = collision.checkCircleCollision(this.position.x, this.position.z, 0.55);
        if (col.collided) {
            this.position.x += col.pushX;
            this.position.z += col.pushZ;
        }

        this.mesh.position.copy(this.position);

        // Procedural Animation
        this.animate(delta, isMoving, input.state.sprint);

        // Broadcast player coordinates to HUD/Minimap
        gameEvents.updateState({
            playerCoords: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
                heading: this.rotationY,
            },
        });
    }

    private animate(delta: number, isMoving: boolean, isSprinting: boolean) {
        if (!this.isGrounded) {
            // Jump pose
            this.leftLeg.rotation.x = -0.5;
            this.rightLeg.rotation.x = -0.5;
            this.leftArm.rotation.x = 0.8;
            this.rightArm.rotation.x = 0.8;
            this.torso.rotation.x = 0.1;
            return;
        }

        if (isMoving) {
            const freq = isSprinting ? 14 : 9;
            this.animTime += delta * freq;

            const limbAngle = Math.sin(this.animTime) * (isSprinting ? 0.9 : 0.6);

            // Legs swing alternately
            this.leftLeg.rotation.x = limbAngle;
            this.rightLeg.rotation.x = -limbAngle;

            // Arms swing opposite to legs
            this.leftArm.rotation.x = -limbAngle * 0.9;
            this.rightArm.rotation.x = limbAngle * 0.9;

            // Body leans forward slightly when running
            this.torso.rotation.x = isSprinting ? 0.18 : 0.05;

            // Footstep audio trigger
            this.footstepTimer += delta * (isSprinting ? 1.6 : 1.0);
            if (this.footstepTimer > 0.35) {
                soundManager.playFootstep();
                this.footstepTimer = 0;
            }
        } else {
            // Idle breathing animation
            this.animTime += delta * 2;
            const breath = Math.sin(this.animTime) * 0.03;

            this.torso.position.y = 1.4 + breath;
            this.head.position.y = 2.15 + breath * 1.2;

            // Smoothly return limbs to rest
            this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, delta * 10);
            this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, delta * 10);
            this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, delta * 10);
            this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, delta * 10);
            this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0, delta * 10);
            this.footstepTimer = 0;
        }
    }

    updateCamera(camera: THREE.PerspectiveCamera) {
        // Camera calculates target position orbiting behind the player
        const targetPos = this.position.clone().add(new THREE.Vector3(0, 1.6, 0));

        const offsetX = Math.sin(this.cameraAngleH) * Math.cos(this.cameraAngleV) * this.cameraDistance;
        const offsetY = Math.sin(this.cameraAngleV) * this.cameraDistance;
        const offsetZ = Math.cos(this.cameraAngleH) * Math.cos(this.cameraAngleV) * this.cameraDistance;

        const desiredCamPos = targetPos.clone().add(new THREE.Vector3(offsetX, offsetY, offsetZ));

        // Smooth camera lerp
        camera.position.lerp(desiredCamPos, 0.15);
        camera.lookAt(targetPos);
    }

    setVisible(visible: boolean) {
        this.isVisible = visible;
        this.mesh.visible = visible;
    }
}

