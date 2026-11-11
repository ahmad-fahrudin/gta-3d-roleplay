import React from 'react';
import { GameState } from '../../game/state/gameEvents';
import { Gauge, Fuel } from 'lucide-react';

interface SpeedometerProps {
    gameState: GameState;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ gameState }) => {
    if (!gameState.inVehicle) return null;

    const speed = gameState.vehicleSpeed;
    const maxSpeed = 140;
    const speedPercent = Math.min(speed / maxSpeed, 1);

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/70 p-4 shadow-2xl backdrop-blur-md text-white animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Circular Gauge / Speed Value */}
            <div className="relative flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                        {speed}
                    </span>
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                        KM/H
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-neutral-800">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                        style={{ width: `${speedPercent * 100}%` }}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-white/15" />

            {/* Gear & Fuel Info */}
            <div className="flex flex-col gap-1.5 text-xs">
                {/* Gear Display */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase">GEAR</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 font-mono text-xs font-bold text-amber-400 border border-amber-500/40">
                        {gameState.vehicleGear}
                    </span>
                </div>

                {/* Fuel Display */}
                <div className="flex items-center gap-1 text-[11px] text-neutral-300">
                    <Fuel className="h-3 w-3 text-neutral-400" />
                    <span className="font-mono">{gameState.vehicleFuel}%</span>
                </div>
            </div>
        </div>
    );
};

