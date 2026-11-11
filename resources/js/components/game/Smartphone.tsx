import React, { useState } from 'react';
import { GameState, gameEvents } from '../../game/state/gameEvents';
import { soundManager } from '../../game/audio/SoundManager';
import {
    Wifi,
    Battery,
    X,
    Building2,
    Car,
    Briefcase,
    PhoneCall,
    ArrowLeft,
    CheckCircle,
    Navigation,
    ShieldAlert
} from 'lucide-react';

interface SmartphoneProps {
    gameState: GameState;
}

type PhoneApp = 'home' | 'bank' | 'garage' | 'jobs' | 'services';

export const Smartphone: React.FC<SmartphoneProps> = ({ gameState }) => {
    const [activeApp, setActiveApp] = useState<PhoneApp>('home');
    const [atmAmount, setAtmAmount] = useState<number>(1000);

    if (!gameState.phoneOpen) return null;

    const closePhone = () => {
        gameEvents.updateState({ phoneOpen: false });
    };

    const handleValetDelivery = () => {
        const p = gameState.playerCoords;
        const newCar = {
            id: `valet_${Date.now()}`,
            x: p.x + 3,
            z: p.z + 3,
            heading: p.heading,
        };
        gameEvents.emitCommand('spawn_car');
        soundManager.playDoorSound();
        gameEvents.addChatMessage({
            sender: 'Valet Service',
            text: 'Mobil Anda telah diantar oleh layanan valet di dekat Anda!',
            type: 'system',
        });
    };

    const startCourierMission = () => {
        // Random delivery destination in the city
        const destinations = [
            { x: -90, z: -30, name: 'Toko Elektronik Del Perro' },
            { x: 60, z: -90, name: 'Restoran Vinewood Hills' },
            { x: -60, z: 90, name: 'Bengkel Little Seoul' },
            { x: 90, z: 60, name: 'Kantor Pos Downtown' },
            { x: 0, z: -120, name: 'Dermaga Puerto Del Sol' },
        ];
        const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
        const reward = 850 + Math.floor(Math.random() * 600);

        gameEvents.updateState({
            activeMission: {
                id: `mission_${Date.now()}`,
                title: `Antar Paket ke ${randomDest.name}`,
                desc: `Bawa paket pesanan ke titik waypoint bertanda cahaya biru di ${randomDest.name}.`,
                target: randomDest,
                reward,
            },
        });

        soundManager.playNotification();
        gameEvents.addChatMessage({
            sender: 'Misi Baru',
            text: `Pesanan baru masuk! Antar ke ${randomDest.name} (Upah: $${reward.toLocaleString()}). Titik tujuan ditandai di GPS!`,
            type: 'system',
        });
        setActiveApp('home');
    };

    return (
        <div className="fixed right-6 bottom-6 z-40 w-72 h-[520px] rounded-[38px] bg-neutral-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-neutral-800 flex flex-col pointer-events-auto animate-in slide-in-from-bottom-8 duration-300">
            {/* Phone Screen Container */}
            <div className="relative flex-1 rounded-[28px] bg-gradient-to-br from-indigo-950 via-slate-900 to-neutral-900 overflow-hidden flex flex-col text-white shadow-inner border border-white/5">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[11px] font-semibold text-white/80 select-none">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {/* Notch / Dynamic Island */}
                    <div className="h-3 w-16 rounded-full bg-black/80" />
                    <div className="flex items-center gap-1.5">
                        <Wifi className="h-3 w-3" />
                        <Battery className="h-3 w-3" />
                    </div>
                </div>

                {/* Main Screen Content */}
                <div className="flex-1 flex flex-col overflow-y-auto px-4 py-2">
                    {activeApp === 'home' && (
                        <div className="flex flex-col flex-1 justify-between py-2">
                            {/* App Grid */}
                            <div className="grid grid-cols-3 gap-y-5 gap-x-3 pt-4">
                                {/* Maze Bank App */}
                                <button
                                    onClick={() => setActiveApp('bank')}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90">Maze Bank</span>
                                </button>

                                {/* Garage App */}
                                <button
                                    onClick={() => setActiveApp('garage')}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Car className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90">Garasi</span>
                                </button>

                                {/* Jobs / Missions App */}
                                <button
                                    onClick={() => setActiveApp('jobs')}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <Briefcase className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90">Misi / Kerja</span>
                                </button>

                                {/* Emergency 911 App */}
                                <button
                                    onClick={() => setActiveApp('services')}
                                    className="flex flex-col items-center gap-1.5 group"
                                >
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <ShieldAlert className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/90">911 Layanan</span>
                                </button>
                            </div>

                            {/* Active Mission Card on Home */}
                            {gameState.activeMission && (
                                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3 shadow-md backdrop-blur-sm">
                                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                                        <Navigation className="h-3.5 w-3.5 animate-pulse" />
                                        <span>Misi Aktif</span>
                                    </div>
                                    <p className="mt-1 text-[11px] font-semibold text-white">
                                        {gameState.activeMission.title}
                                    </p>
                                    <p className="text-[10px] text-neutral-300">
                                        Hadiah: ${gameState.activeMission.reward.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Widget on bottom */}
                            <div className="mt-auto rounded-xl bg-black/40 p-3 backdrop-blur-sm border border-white/5">
                                <div className="text-[11px] text-neutral-400">Pekerjaan Saat Ini:</div>
                                <div className="font-bold text-sm text-amber-400">{gameState.job}</div>
                            </div>
                        </div>
                    )}

                    {/* Maze Bank App Screen */}
                    {activeApp === 'bank' && (
                        <div className="flex flex-col flex-1 py-1">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                                <button onClick={() => setActiveApp('home')} className="p-1 hover:text-red-400">
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-xs text-red-500 tracking-wider">MAZE BANK</span>
                                <div className="w-4" />
                            </div>

                            <div className="rounded-xl bg-gradient-to-br from-neutral-900 to-black p-3.5 border border-red-500/30 shadow-md">
                                <div className="text-[10px] text-neutral-400">Saldo Rekening</div>
                                <div className="font-mono text-xl font-extrabold text-white">
                                    ${gameState.bank.toLocaleString()}
                                </div>
                                <div className="mt-2 text-[10px] text-neutral-400">Uang Tunai (Cash)</div>
                                <div className="font-mono text-sm font-bold text-emerald-400">
                                    ${gameState.cash.toLocaleString()}
                                </div>
                            </div>

                            {/* Transfer / Fast Amount */}
                            <div className="mt-4 flex flex-col gap-2">
                                <label className="text-[11px] font-medium text-neutral-300">Nominal Transaksi</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[500, 1000, 5000].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setAtmAmount(amt)}
                                            className={`rounded-lg py-1.5 text-xs font-mono font-bold border transition-colors ${
                                                atmAmount === amt
                                                    ? 'bg-red-600 border-red-500 text-white'
                                                    : 'bg-black/40 border-white/10 text-neutral-300 hover:bg-white/10'
                                            }`}
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            gameEvents.depositMoney(atmAmount);
                                            soundManager.playMoney();
                                        }}
                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-colors shadow"
                                    >
                                        Setor Tunai
                                    </button>
                                    <button
                                        onClick={() => {
                                            gameEvents.withdrawMoney(atmAmount);
                                            soundManager.playMoney();
                                        }}
                                        className="rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white transition-colors shadow"
                                    >
                                        Tarik Tunai
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Garage App Screen */}
                    {activeApp === 'garage' && (
                        <div className="flex flex-col flex-1 py-1">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                                <button onClick={() => setActiveApp('home')} className="p-1 hover:text-amber-400">
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-xs text-amber-500">PANGGIL VALET</span>
                                <div className="w-4" />
                            </div>

                            <p className="text-[11px] text-neutral-300 mb-3 leading-relaxed">
                                Butuh kendaraan di lokasi Anda? Panggil petugas valet untuk mengantar mobil Anda ke koordinat saat ini.
                            </p>

                            <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-white">Banshee GT Sports</span>
                                    <span className="text-[10px] text-emerald-400 font-medium">Tersedia</span>
                                </div>
                                <div className="text-[10px] text-neutral-400">Plat: GTA-777RP</div>
                                <button
                                    onClick={handleValetDelivery}
                                    className="mt-2 w-full rounded-lg bg-amber-500 hover:bg-amber-400 py-2 text-xs font-bold text-black transition-colors shadow flex items-center justify-center gap-1.5"
                                >
                                    <Car className="h-3.5 w-3.5" />
                                    <span>Kirim ke Lokasi Saya</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Jobs & Missions App */}
                    {activeApp === 'jobs' && (
                        <div className="flex flex-col flex-1 py-1">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                                <button onClick={() => setActiveApp('home')} className="p-1 hover:text-emerald-400">
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-xs text-emerald-500">JOB & MISI</span>
                                <div className="w-4" />
                            </div>

                            <div className="mb-3 rounded-lg bg-black/40 p-2.5 border border-white/10">
                                <div className="text-[10px] text-neutral-400">Profesi Saat Ini:</div>
                                <div className="text-xs font-bold text-emerald-400">{gameState.job}</div>
                            </div>

                            <button
                                onClick={startCourierMission}
                                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 p-3 text-left shadow-lg transition-all"
                            >
                                <div className="flex items-center justify-between font-bold text-xs text-white">
                                    <span>Misi Antar Paket</span>
                                    <span className="text-amber-300 font-mono">+$850 - $1.400</span>
                                </div>
                                <p className="mt-1 text-[10px] text-emerald-100">
                                    Ambil order pengiriman barang dan antarkan ke pelanggan di kota untuk mendapatkan uang tunai.
                                </p>
                            </button>
                        </div>
                    )}

                    {/* 911 Emergency Services App */}
                    {activeApp === 'services' && (
                        <div className="flex flex-col flex-1 py-1">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                                <button onClick={() => setActiveApp('home')} className="p-1 hover:text-blue-400">
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <span className="font-bold text-xs text-blue-500">911 DARURAT</span>
                                <div className="w-4" />
                            </div>

                            <div className="space-y-2.5">
                                <button
                                    onClick={() => {
                                        soundManager.playNotification();
                                        gameEvents.addChatMessage({
                                            sender: '911 Dispatch',
                                            text: 'Panggilan darurat diterima! Patroli kepolisian sedang memantau area Anda.',
                                            type: 'system',
                                        });
                                    }}
                                    className="w-full rounded-xl bg-blue-700 hover:bg-blue-600 p-3 text-left text-xs font-bold text-white shadow transition-colors flex items-center gap-2"
                                >
                                    <PhoneCall className="h-4 w-4 text-blue-200" />
                                    <span>Panggil Polisi (Lapor Kriminal)</span>
                                </button>

                                <button
                                    onClick={() => {
                                        soundManager.playNotification();
                                        gameEvents.addChatMessage({
                                            sender: '911 Medis',
                                            text: 'Ambulans dan paramedis sedang siaga. Silakan kunjungi Pillbox Hospital bila butuh rawat inap.',
                                            type: 'system',
                                        });
                                    }}
                                    className="w-full rounded-xl bg-rose-700 hover:bg-rose-600 p-3 text-left text-xs font-bold text-white shadow transition-colors flex items-center gap-2"
                                >
                                    <PhoneCall className="h-4 w-4 text-rose-200" />
                                    <span>Panggil Ambulans (Medis)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Home Indicator Bar */}
                <div className="flex justify-center pb-2 pt-1">
                    <button
                        onClick={() => {
                            if (activeApp !== 'home') setActiveApp('home');
                            else closePhone();
                        }}
                        className="h-1 w-24 rounded-full bg-white/40 hover:bg-white/80 transition-colors"
                    />
                </div>
            </div>
        </div>
    );
};

