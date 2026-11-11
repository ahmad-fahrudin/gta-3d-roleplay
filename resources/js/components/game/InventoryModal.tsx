import React, { useState } from 'react';
import { GameState, gameEvents, InventoryItem } from '../../game/state/gameEvents';
import { soundManager } from '../../game/audio/SoundManager';
import { Backpack, X, Utensils, Droplets, Heart, Shield, Info, Trash2 } from 'lucide-react';

interface InventoryModalProps {
    gameState: GameState;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ gameState }) => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    if (!gameState.inventoryOpen) return null;

    const closeInv = () => {
        gameEvents.updateState({ inventoryOpen: false });
    };

    const totalWeight = gameState.inventory.reduce((sum, item) => sum + item.weight * item.count, 0);
    const maxWeight = 20.0;

    const handleUse = (item: InventoryItem) => {
        gameEvents.useItem(item.id);
        soundManager.playDoorSound(); // soft item use click
    };

    const handleDrop = (item: InventoryItem) => {
        gameEvents.dropItem(item.id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto animate-in fade-in duration-200">
            <div className="max-w-xl w-full rounded-3xl border border-white/15 bg-neutral-900/95 p-6 shadow-2xl text-white flex flex-col gap-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Backpack className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-wide">INVENTARIS SAKU</h2>
                            <div className="text-[11px] text-neutral-400">
                                Kapasitas: <span className="font-mono text-amber-400">{totalWeight.toFixed(1)}</span> / {maxWeight} kg
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={closeInv}
                        className="rounded-full p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Vitals Bar: Lapar & Haus */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-black/40 p-3 border border-white/5">
                    {/* Hunger */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
                                <Utensils className="h-3.5 w-3.5" />
                                <span>Kekenyangan</span>
                            </span>
                            <span className="font-mono text-neutral-300">{gameState.hunger}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-300"
                                style={{ width: `${gameState.hunger}%` }}
                            />
                        </div>
                    </div>

                    {/* Thirst */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                                <Droplets className="h-3.5 w-3.5" />
                                <span>Hidrasi</span>
                            </span>
                            <span className="font-mono text-neutral-300">{gameState.thirst}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300"
                                style={{ width: `${gameState.thirst}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content: Grid & Details */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Left: 2x3 Grid Slots */}
                    <div className="col-span-2 grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                        {gameState.inventory.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all h-24 ${
                                    selectedItem?.id === item.id
                                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                                        : 'bg-black/50 border-white/10 hover:border-white/30 hover:bg-black/70'
                                }`}
                            >
                                <span className="text-3xl filter drop-shadow">{item.icon}</span>
                                <span className="mt-1 text-[11px] font-semibold text-white/90 truncate max-w-[80px]">
                                    {item.name}
                                </span>
                                <span className="absolute top-2 right-2 rounded-full bg-neutral-800 px-1.5 py-0.2 font-mono text-[10px] font-bold text-amber-300 border border-white/10">
                                    x{item.count}
                                </span>
                            </button>
                        ))}

                        {/* Empty Slots placeholder */}
                        {Array.from({ length: Math.max(0, 6 - gameState.inventory.length) }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 rounded-2xl border border-dashed border-white/10 bg-black/20 flex items-center justify-center text-neutral-600 text-xs"
                            >
                                Kosong
                            </div>
                        ))}
                    </div>

                    {/* Right: Selected Item Details */}
                    <div className="col-span-1 rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col justify-between">
                        {selectedItem ? (
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="text-3xl text-center mb-2">{selectedItem.icon}</div>
                                    <h4 className="font-bold text-sm text-white text-center">{selectedItem.name}</h4>
                                    <div className="mt-1 text-center text-[10px] text-neutral-400 font-mono">
                                        Bobot: {(selectedItem.weight * selectedItem.count).toFixed(2)} kg
                                    </div>
                                    <p className="mt-3 text-xs text-neutral-300 leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5">
                                        {selectedItem.desc}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleUse(selectedItem)}
                                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-white transition-colors shadow"
                                    >
                                        Gunakan
                                    </button>
                                    <button
                                        onClick={() => handleDrop(selectedItem)}
                                        className="w-full rounded-xl bg-neutral-800 hover:bg-rose-950 py-1.5 text-xs font-medium text-neutral-300 hover:text-rose-400 transition-colors flex items-center justify-center gap-1 border border-white/5"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        <span>Buang</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 text-xs">
                                <Info className="h-6 w-6 mb-2 opacity-50" />
                                <span>Pilih item di sebelah kiri untuk melihat aksi</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer hint */}
                <div className="text-center text-[11px] text-neutral-500">
                    Tekan <kbd className="rounded bg-black/60 px-1 py-0.5 font-mono text-[10px] border border-white/20">TAB</kbd> atau <kbd className="rounded bg-black/60 px-1 py-0.5 font-mono text-[10px] border border-white/20">I</kbd> untuk menutup inventaris
                </div>
            </div>
        </div>
    );
};

