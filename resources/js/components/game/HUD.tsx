import React, { useState, useEffect } from 'react';
import { GameState, gameEvents } from '../../game/state/gameEvents';
import { InputManager } from '../../game/core/InputManager';
import { MiniMap } from './MiniMap';
import { Speedometer } from './Speedometer';
import { TextChat } from './TextChat';
import { DollarSign, Building2, Star, HelpCircle, Car, Volume2, Shield } from 'lucide-react';

interface HUDProps {
    inputManager: InputManager | null;
}

export const HUD: React.FC<HUDProps> = ({ inputManager }) => {
    const [gameState, setGameState] = useState<GameState>(gameEvents.getState());
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        return gameEvents.subscribeState(state => {
            setGameState(state);
        });
    }, []);

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 select-none">
            {/* Top Bar */}
            <div className="flex items-start justify-between">
                {/* Top-Left: Text Chat */}
                <TextChat inputManager={inputManager} />

                {/* Top-Right: Money, Bank & Wanted Level */}
                <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
                    {/* Cash & Bank container */}
                    <div className="flex flex-col items-end rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 shadow-2xl backdrop-blur-md">
                        {/* Cash */}
                        <div className="flex items-center gap-1 font-mono text-xl font-black tracking-wide text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                            <span className="text-emerald-500 font-sans text-base">$</span>
                            <span>{gameState.cash.toLocaleString()}</span>
                        </div>
                        {/* Bank */}
                        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-neutral-300">
                            <Building2 className="h-3 w-3 text-neutral-400" />
                            <span>${gameState.bank.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Wanted Stars */}
                    <div className="flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 backdrop-blur-sm border border-white/5">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`h-4 w-4 ${
                                    star <= gameState.wantedLevel
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                        : 'text-neutral-600 fill-neutral-800'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Help toggle button */}
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-white/80 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm shadow"
                    >
                        <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                        <span>Panduan Tombol</span>
                    </button>
                </div>
            </div>

            {/* Center-Bottom: Dynamic Interaction Prompt */}
            <div className="flex justify-center pb-2">
                {gameState.interactionPrompt && (
                    <div className="animate-bounce rounded-xl border border-amber-400/50 bg-black/80 px-5 py-2.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md">
                        <span className="text-sm font-bold tracking-wide text-amber-300 drop-shadow">
                            {gameState.interactionPrompt}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Bar: MiniMap (Left) & Speedometer (Right) */}
            <div className="flex items-end justify-between">
                {/* Bottom-Left: MiniMap */}
                <div className="pointer-events-auto">
                    <MiniMap gameState={gameState} />
                </div>

                {/* Vehicle Hints when inside car */}
                {gameState.inVehicle && (
                    <div className="mb-2 hidden sm:flex items-center gap-3 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur-md">
                        <span><kbd className="rounded bg-white/15 px-1 py-0.5 font-mono text-[10px]">F</kbd> Keluar</span>
                        <span><kbd className="rounded bg-white/15 px-1 py-0.5 font-mono text-[10px]">H</kbd> Klakson</span>
                        <span><kbd className="rounded bg-white/15 px-1 py-0.5 font-mono text-[10px]">L</kbd> Lampu</span>
                        <span><kbd className="rounded bg-white/15 px-1 py-0.5 font-mono text-[10px]">Spasi</kbd> Handbrake</span>
                    </div>
                )}

                {/* Bottom-Right: Speedometer */}
                <div className="pointer-events-auto">
                    <Speedometer gameState={gameState} />
                </div>
            </div>

            {/* Help / Controls Modal */}
            {showHelp && (
                <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="max-w-md w-full rounded-2xl border border-white/15 bg-neutral-900/95 p-6 shadow-2xl text-white">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Panduan Kontrol GTA 3D
                            </h3>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="rounded px-2 py-0.5 text-sm text-neutral-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs leading-relaxed text-neutral-300">
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">W, A, S, D</span>
                                <span>Gerak / Menyetir Mobil</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">Shift</span>
                                <span>Sprint (Lari Cepat)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">Spasi</span>
                                <span>Lompat / Rem Tangan (Drift)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">F / E</span>
                                <span>Masuk / Keluar Mobil</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">Klik & Drag Mouse</span>
                                <span>Putar Kamera 360°</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">C</span>
                                <span>Ganti Jarak Kamera</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">H</span>
                                <span>Klakson Mobil</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                                <span className="font-semibold text-white">L</span>
                                <span>Nyalakan / Matikan Lampu</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pb-2">
                                <span className="font-semibold text-white">T / Enter</span>
                                <span>Buka Chat RP (/help, /me, /car)</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-center text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow"
                        >
                            Saya Mengerti, Mulai Main
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

