import * as THREE from 'three';

export interface BoundingBoxCollider {
    id: string;
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
}

export class CollisionSystem {
    private colliders: BoundingBoxCollider[] = [];

    addBoxCollider(id: string, center: THREE.Vector3, size: THREE.Vector3) {
        const halfX = size.x / 2;
        const halfZ = size.z / 2;
        this.colliders.push({
            id,
            minX: center.x - halfX,
            maxX: center.x + halfX,
            minZ: center.z - halfZ,
            maxZ: center.z + halfZ,
        });
    }

    checkCircleCollision(x: number, z: number, radius: number): { collided: boolean; pushX: number; pushZ: number } {
        let collided = false;
        let pushX = 0;
        let pushZ = 0;

        for (let i = 0; i < this.colliders.length; i++) {
            const b = this.colliders[i];

            // Nearest point in rectangle to circle center
            const closestX = Math.max(b.minX, Math.min(x, b.maxX));
            const closestZ = Math.max(b.minZ, Math.min(z, b.maxZ));

            const distX = x - closestX;
            const distZ = z - closestZ;
            const distSq = distX * distX + distZ * distZ;

            if (distSq < radius * radius) {
                collided = true;
                const dist = Math.sqrt(distSq);
                if (dist > 0.0001) {
                    const overlap = radius - dist;
                    pushX += (distX / dist) * overlap;
                    pushZ += (distZ / dist) * overlap;
                } else {
                    // Circle center is inside rectangle: push towards nearest edge
                    const left = x - b.minX;
                    const right = b.maxX - x;
                    const top = z - b.minZ;
                    const bottom = b.maxZ - z;
                    const min = Math.min(left, right, top, bottom);

                    if (min === left) pushX -= radius;
                    else if (min === right) pushX += radius;
                    else if (min === top) pushZ -= radius;
                    else pushZ += radius;
                }
            }
        }

        return { collided, pushX, pushZ };
    }

    clear() {
        this.colliders = [];
    }
}

