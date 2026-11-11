import React, { useState, useEffect } from 'react';
import { GameState, gameEvents } from '../../game/state/gameEvents';
import { InputManager } from '../../game/core/InputManager';
import { MiniMap } from './MiniMap';
import { Speedometer } from './Speedometer';
import { TextChat } from './TextChat';
import { Smartphone } from './Smartphone';
import { InventoryModal } from './InventoryModal';
import { RoleplayModals } from './RoleplayModals';
import { soundManager } from '../../game/audio/SoundManager';
import {
    Building2,
    Star,
    HelpCircle,
    Car,
    Smartphone as SmartphoneIcon,
    Backpack,
    Briefcase,
    Navigation
} from 'lucide-react';

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

    const togglePhone = () => {
        const next = !gameState.phoneOpen;
        gameEvents.updateState({ phoneOpen: next });
        if (next) soundManager.playNotification();
    };

    const toggleInventory = () => {
        gameEvents.updateState({ inventoryOpen: !gameState.inventoryOpen });
    };

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 select-none">
            {/* Top Bar */}
            <div className="flex items-start justify-between">
                {/* Top-Left: Text Chat & Active Mission Widget */}
                <div className="flex flex-col gap-2">
                    <TextChat inputManager={inputManager} />

                    {/* Active Mission HUD Widget */}
                    {gameState.activeMission && (
                        <div className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-black/75 px-3 py-2 text-white shadow-xl backdrop-blur-md animate-in slide-in-from-left-4 duration-300">
                            <Navigation className="h-4 w-4 text-cyan-400 animate-pulse" />
                            <div>
                                <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                                    MISI BERJALAN
                                </div>
                                <div className="text-xs font-semibold text-white">
                                    {gameState.activeMission.title}
                                </div>
                            </div>
                            <span className="ml-2 font-mono text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                +${gameState.activeMission.reward.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Top-Right: Money, Bank & Wanted Level & Action Bar */}
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

                    {/* Job & Wanted Stars */}
                    <div className="flex items-center gap-2">
                        {/* Job Badge */}
                        <div className="flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm border border-white/10">
                            <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                            <span>{gameState.job}</span>
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
                    </div>

                    {/* Quick Access Action Bar (Phone, Inventory, Help) */}
                    <div className="mt-1 flex items-center gap-1.5">
                        <button
                            onClick={togglePhone}
                            title="Buka Smartphone [M]"
                            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all backdrop-blur-sm shadow ${
                                gameState.phoneOpen
                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                    : 'border-white/10 bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
                            }`}
                        >
                            <SmartphoneIcon className="h-3.5 w-3.5 text-indigo-400" />
                            <span>HP [M]</span>
                        </button>

                        <button
                            onClick={toggleInventory}
                            title="Buka Tas [TAB / I]"
                            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all backdrop-blur-sm shadow ${
                                gameState.inventoryOpen
                                    ? 'bg-amber-600 border-amber-400 text-white'
                                    : 'border-white/10 bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
                            }`}
                        >
                            <Backpack className="h-3.5 w-3.5 text-amber-400" />
                            <span>Tas [TAB]</span>
                        </button>

                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            title="Panduan Kontrol"
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 text-xs text-white/80 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm shadow"
                        >
                            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                            <span className="hidden sm:inline">Kontrol</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Center-Bottom: Dynamic Interaction Prompt */}
            <div className="flex justify-center pb-2">
                {gameState.interactionPrompt && (
                    <div className="animate-bounce rounded-xl border border-amber-400/50 bg-black/85 px-5 py-2.5 shadow-[0_0_25px_rgba(245,158,11,0.4)] backdrop-blur-md">
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
                        <span><kbd className="rounded bg-white/15 px-1 py-0.5 font-mono text-[10px]">Spasi</kbd> Drift</span>
                    </div>
                )}

                {/* Bottom-Right: Speedometer */}
                <div className="pointer-events-auto">
                    <Speedometer gameState={gameState} />
                </div>
            </div>

            {/* Smartphone Overlay Component */}
            <Smartphone gameState={gameState} />

            {/* Inventory Modal Overlay Component */}
            <InventoryModal gameState={gameState} />

            {/* Roleplay World Interaction Modals (ATM, Shop, Job Center) */}
            <RoleplayModals gameState={gameState} />

            {/* Help / Controls Modal */}
            {showHelp && (
                <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="max-w-md w-full rounded-2xl border border-white/15 bg-neutral-900/95 p-6 shadow-2xl text-white">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Panduan Kontrol & Roleplay
                            </h3>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="rounded px-2 py-0.5 text-sm text-neutral-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-neutral-300">
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">W, A, S, D</span>
                                <span>Gerak Karakter / Setir Mobil</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">Shift</span>
                                <span>Sprint (Lari Cepat)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">Spasi</span>
                                <span>Lompat / Rem Tangan (Drift)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">F</span>
                                <span>Masuk / Keluar Mobil</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">E</span>
                                <span>Interaksi Titik RP (ATM, Toko, Job)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">M</span>
                                <span>Buka / Tutup Smartphone</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">TAB / I</span>
                                <span>Buka / Tutup Tas Inventaris</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">Klik & Drag Mouse</span>
                                <span>Putar Kamera 360°</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">C</span>
                                <span>Ganti Jarak Zoom Kamera</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-1.5">
                                <span className="font-semibold text-white">H / L</span>
                                <span>Klakson / Lampu Depan Mobil</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pb-1.5">
                                <span className="font-semibold text-white">T / Enter</span>
                                <span>Chat Roleplay (/help, /me, /do, /car)</span>
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
