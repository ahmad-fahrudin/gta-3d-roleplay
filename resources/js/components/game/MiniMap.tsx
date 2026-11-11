import React, { useEffect, useRef } from 'react';
import { GameState } from '../../game/state/gameEvents';

interface MiniMapProps {
    gameState: GameState;
}

export const MiniMap: React.FC<MiniMapProps> = ({ gameState }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width;
        const center = size / 2;
        const radius = size / 2 - 4;

        ctx.clearRect(0, 0, size, size);

        // Circular clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.clip();

        // Background terrain color
        ctx.fillStyle = '#1c2833';
        ctx.fillRect(0, 0, size, size);

        // Transform map to rotate and center on player
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(-gameState.playerCoords.heading);

        const scale = 0.8; // Map zoom scale (pixels per world meter)
        const px = gameState.playerCoords.x;
        const pz = gameState.playerCoords.z;

        // Draw Roads (Grid matching CityBuilder roadPositions: -120, -60, 0, 60, 120)
        const roadPositions = [-120, -60, 0, 60, 120];
        ctx.fillStyle = '#34495e';
        const roadWidth = 14 * scale;

        // Horizontal roads
        for (const rz of roadPositions) {
            const screenY = (rz - pz) * scale;
            ctx.fillRect(-200 * scale, screenY - roadWidth / 2, 400 * scale, roadWidth);
        }

        // Vertical roads
        for (const rx of roadPositions) {
            const screenX = (rx - px) * scale;
            ctx.fillRect(screenX - roadWidth / 2, -200 * scale, roadWidth, 400 * scale);
        }

        // Draw Central Plaza
        ctx.fillStyle = '#16a085';
        ctx.beginPath();
        ctx.arc((30 - px) * scale, (30 - pz) * scale, 18 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Draw Roleplay POI Blips (ATM, Shop, Job, Hospital)
        const pois = [
            { x: 10, z: 10, color: '#f1c40f', label: '$' }, // ATM
            { x: -15, z: 15, color: '#2ecc71', label: 'S' }, // Shop
            { x: 15, z: -15, color: '#9b59b6', label: 'J' }, // Job Center
            { x: -25, z: -25, color: '#e74c3c', label: '+' }, // Hospital
        ];

        for (const poi of pois) {
            const bx = (poi.x - px) * scale;
            const bz = (poi.z - pz) * scale;
            ctx.save();
            ctx.translate(bx, bz);
            ctx.fillStyle = poi.color;
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(poi.label, 0, 0);
            ctx.restore();
        }

        // Draw Active Mission Waypoint Blip
        if (gameState.activeMission) {
            const mx = (gameState.activeMission.target.x - px) * scale;
            const mz = (gameState.activeMission.target.z - pz) * scale;
            ctx.save();
            ctx.translate(mx, mz);
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }

        // Draw other vehicles as blips
        for (const v of gameState.vehiclesCoords) {
            if (gameState.inVehicle && Math.abs(v.x - px) < 1 && Math.abs(v.z - pz) < 1) continue;

            const vx = (v.x - px) * scale;
            const vz = (v.z - pz) * scale;

            ctx.save();
            ctx.translate(vx, vz);
            ctx.fillStyle = v.id.includes('taxi') ? '#f1c40f' : v.id.includes('blue') ? '#3498db' : '#e74c3c';
            ctx.fillRect(-4, -4, 8, 8);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-4, -4, 8, 8);
            ctx.restore();
        }

        ctx.restore(); // Restore map rotation
        ctx.restore(); // Restore clip

        // Compass Rose / Outer Ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.stroke();

        // North Marker 'N'
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(-gameState.playerCoords.heading);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', 0, -radius + 12);
        ctx.restore();

        // Player Triangle in center (pointing up)
        ctx.save();
        ctx.translate(center, center);
        ctx.fillStyle = gameState.inVehicle ? '#f39c12' : '#00ffcc';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(6, 7);
        ctx.lineTo(0, 4);
        ctx.lineTo(-6, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }, [gameState.playerCoords, gameState.vehiclesCoords, gameState.inVehicle]);

    return (
        <div className="relative flex flex-col items-center">
            {/* Radar Canvas */}
            <div className="relative rounded-full border-2 border-white/20 bg-black/60 p-1 shadow-2xl backdrop-blur-md">
                <canvas ref={canvasRef} width={150} height={150} className="rounded-full" />
                {/* Zone Label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow border border-white/10">
                    {gameState.currentZone}
                </div>
            </div>

            {/* Health & Armor Status Bars */}
            <div className="mt-7 flex w-36 flex-col gap-1 rounded bg-black/60 p-1.5 backdrop-blur-md border border-white/10 shadow-lg">
                {/* Health Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded bg-neutral-800">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-200"
                        style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                    />
                </div>
                {/* Armor Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded bg-neutral-800">
                    <div
                        className="h-full bg-blue-500 transition-all duration-200"
                        style={{ width: `${gameState.armor}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

