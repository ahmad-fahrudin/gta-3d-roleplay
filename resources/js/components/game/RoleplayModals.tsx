import React, { useState } from 'react';
import { GameState, gameEvents } from '../../game/state/gameEvents';
import { soundManager } from '../../game/audio/SoundManager';
import {
    Building2,
    ShoppingBag,
    Briefcase,
    X,
    Check,
    Plus,
    Utensils,
    Droplets,
    HeartPulse,
    Wrench,
    Truck,
    Shield,
    Car
} from 'lucide-react';

interface RoleplayModalsProps {
    gameState: GameState;
}

export const RoleplayModals: React.FC<RoleplayModalsProps> = ({ gameState }) => {
    const modalType = gameState.activeModal;
    const [atmAmount, setAtmAmount] = useState<number>(1000);

    if (!modalType) return null;

    const closeModal = () => {
        gameEvents.updateState({ activeModal: null });
    };

    // Shop Catalog
    const shopCatalog = [
        { id: 'burger', name: 'Burger Bleeder', price: 50, icon: '🍔', weight: 0.3, desc: 'Memulihkan lapar & HP', type: 'food' as const },
        { id: 'soda', name: 'Sprunk Soda', price: 25, icon: '🥤', weight: 0.25, desc: 'Memulihkan rasa haus', type: 'drink' as const },
        { id: 'medkit', name: 'First Aid Kit (P3K)', price: 300, icon: '🩹', weight: 1.0, desc: 'Memulihkan HP 100%', type: 'medical' as const },
        { id: 'repair_kit', name: 'Toolkit Mekanik', price: 500, icon: '🔧', weight: 2.5, desc: 'Memperbaiki bensin & mesin mobil', type: 'tool' as const },
    ];

    const handleBuyItem = (item: typeof shopCatalog[0]) => {
        if (gameState.cash < item.price) {
            gameEvents.addChatMessage({
                sender: 'Kasir',
                text: 'Uang tunai Anda tidak mencukupi untuk membeli item ini.',
                type: 'system',
            });
            return;
        }

        soundManager.playMoney();
        const existing = gameState.inventory.find(i => i.id === item.id);
        let updatedInv;
        if (existing) {
            updatedInv = gameState.inventory.map(i => i.id === item.id ? { ...i, count: i.count + 1 } : i);
        } else {
            updatedInv = [...gameState.inventory, { ...item, count: 1 }];
        }

        gameEvents.updateState({
            cash: gameState.cash - item.price,
            inventory: updatedInv,
        });

        gameEvents.addChatMessage({
            sender: 'Kasir Supermarket',
            text: `Terima kasih! Anda membeli ${item.name} seharga $${item.price}.`,
            type: 'system',
        });
    };

    // Jobs list
    const jobsList = [
        {
            title: 'Warga Sipil',
            desc: 'Warga bebas tanpa keterikatan dinas. Bebas bekerja serabutan dan mengeksplorasi kota.',
            icon: <Car className="h-5 w-5 text-neutral-400" />,
            salary: 150,
        },
        {
            title: 'Kurir / Delivery',
            desc: 'Mengantar paket pesanan makanan & barang ke seluruh penjuru kota menggunakan mobil atau motor.',
            icon: <Truck className="h-5 w-5 text-emerald-400" />,
            salary: 450,
        },
        {
            title: 'Supir Taksi',
            desc: 'Melayani antar-jemput warga kota Los Santos dengan armada taksi kuning.',
            icon: <Car className="h-5 w-5 text-amber-400" />,
            salary: 400,
        },
        {
            title: 'Petugas Polisi',
            desc: 'Menegakkan hukum dan ketertiban lalu lintas, merespons kejahatan jalanan.',
            icon: <Shield className="h-5 w-5 text-blue-400" />,
            salary: 750,
        },
        {
            title: 'Medis / Paramedis',
            desc: 'Memberikan pertolongan pertama pada korban kecelakaan dan merawat pasien di rumah sakit.',
            icon: <HeartPulse className="h-5 w-5 text-rose-400" />,
            salary: 700,
        },
    ];

    const handleSelectJob = (jobTitle: string) => {
        gameEvents.updateState({ job: jobTitle, activeModal: null });
        soundManager.playNotification();
        gameEvents.addChatMessage({
            sender: 'Balai Kota',
            text: `Selamat! Anda kini resmi bekerja sebagai: ${jobTitle}.`,
            type: 'system',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto animate-in fade-in duration-200">
            {/* ATM Modal */}
            {modalType === 'atm' && (
                <div className="max-w-md w-full rounded-3xl border border-yellow-500/30 bg-neutral-900/95 p-6 shadow-2xl text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-amber-400">MAZE BANK ATM</h3>
                                <div className="text-[11px] text-neutral-400">Pusat Layanan Tarik & Setor Tunai</div>
                            </div>
                        </div>
                        <button onClick={closeModal} className="rounded-full p-1.5 text-neutral-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="rounded-2xl bg-black/50 p-4 border border-white/5 space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                            <span className="text-neutral-400">Saldo Rekening:</span>
                            <span className="font-mono font-bold text-white">${gameState.bank.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-neutral-400">Uang Tunai di Dompet:</span>
                            <span className="font-mono font-bold text-emerald-400">${gameState.cash.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-neutral-300">Pilih Jumlah Cepat</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[500, 2000, 5000, 10000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setAtmAmount(amt)}
                                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                                        atmAmount === amt
                                            ? 'bg-amber-500 text-black border-amber-400'
                                            : 'bg-black/40 text-neutral-300 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    ${amt >= 1000 ? `${amt / 1000}k` : amt}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => {
                                    gameEvents.depositMoney(atmAmount);
                                    soundManager.playMoney();
                                }}
                                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white transition-colors shadow"
                            >
                                Setor Uang (${atmAmount})
                            </button>
                            <button
                                onClick={() => {
                                    gameEvents.withdrawMoney(atmAmount);
                                    soundManager.playMoney();
                                }}
                                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-bold text-white transition-colors shadow"
                            >
                                Tarik Uang (${atmAmount})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 24/7 Supermarket Modal */}
            {modalType === 'shop' && (
                <div className="max-w-lg w-full rounded-3xl border border-emerald-500/30 bg-neutral-900/95 p-6 shadow-2xl text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-emerald-400">24/7 CONVENIENCE STORE</h3>
                                <div className="text-[11px] text-neutral-400">Toko Kebutuhan Sehari-hari & Perkakas</div>
                            </div>
                        </div>
                        <button onClick={closeModal} className="rounded-full p-1.5 text-neutral-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                        {shopCatalog.map(item => (
                            <div
                                key={item.id}
                                className="flex flex-col justify-between p-3.5 rounded-2xl border border-white/10 bg-black/40 hover:border-emerald-500/40 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <span className="text-3xl">{item.icon}</span>
                                    <span className="font-mono text-sm font-extrabold text-emerald-400">
                                        ${item.price}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <h4 className="font-bold text-xs text-white">{item.name}</h4>
                                    <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleBuyItem(item)}
                                    className="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-1.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1 shadow"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Beli</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-3 flex justify-between items-center text-xs">
                        <span className="text-neutral-400">Uang Tunai Anda:</span>
                        <span className="font-mono font-bold text-emerald-400">${gameState.cash.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Job Center Modal */}
            {modalType === 'job_center' && (
                <div className="max-w-xl w-full rounded-3xl border border-purple-500/30 bg-neutral-900/95 p-6 shadow-2xl text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-purple-400">BALAI KOTA / JOB CENTER</h3>
                                <div className="text-[11px] text-neutral-400">Pilih Karir dan Profesi Karakter Anda</div>
                            </div>
                        </div>
                        <button onClick={closeModal} className="rounded-full p-1.5 text-neutral-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {jobsList.map(job => {
                            const isCurrent = gameState.job === job.title;
                            return (
                                <div
                                    key={job.title}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                        isCurrent
                                            ? 'bg-purple-950/40 border-purple-400 shadow-md'
                                            : 'bg-black/40 border-white/10 hover:border-white/25'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                            {job.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-xs text-white">{job.title}</h4>
                                                {isCurrent && (
                                                    <span className="rounded bg-purple-500/30 px-1.5 py-0.2 text-[9px] font-bold text-purple-300 border border-purple-500/50">
                                                        Sedang Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-neutral-400 leading-tight mt-0.5 max-w-sm">
                                                {job.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        {isCurrent ? (
                                            <div className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleSelectJob(job.title)}
                                                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow"
                                            >
                                                Pilih
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

