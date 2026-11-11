import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Gamepad2, Car, Compass, Shield, Play } from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* GTA 3D Roleplay Launch Card */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/40 p-6 shadow-2xl text-white">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                                <Gamepad2 className="h-4 w-4" />
                                <span>GTA 3D ROLEPLAY SERVER LIVE</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                                Selamat Datang di Dunia GTA 3D Roleplay
                            </h2>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                                Jelajahi kota open-world 3D yang ringan di browser Anda. Kendarai mobil sport, beli makanan di supermarket, lakukan transaksi ATM, ambil misi pengantaran kurir, dan gunakan smartphone dalam game!
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Link
                                href="/game"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3.5 text-sm font-extrabold text-neutral-950 hover:from-amber-400 hover:to-yellow-400 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] group"
                            >
                                <Play className="h-5 w-5 fill-neutral-950 group-hover:scale-110 transition-transform" />
                                <span>Play 3D Roleplay</span>
                            </Link>
                        </div>
                    </div>

                    {/* Features highlight pills */}
                    <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 pt-4 text-xs text-neutral-300">
                        <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-amber-400" />
                            <span>Mobil & Fisika Menyetir [F]</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Compass className="h-4 w-4 text-cyan-400" />
                            <span>MiniMap Radar & Misi Kurir</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4 text-purple-400" />
                            <span>Smartphone & Inventaris [M, TAB]</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-400" />
                            <span>ATM, Toko & Balai Kota [E]</span>
                        </div>
                    </div>
                </div>

                {/* Quick stats / profile preview */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="flex flex-col justify-between rounded-xl border border-sidebar-border/70 p-5 bg-card text-card-foreground">
                        <div className="text-sm font-semibold text-muted-foreground">Mode Game</div>
                        <div className="text-xl font-bold mt-1 text-emerald-500">Single-Player Sandbox</div>
                        <div className="text-xs text-muted-foreground mt-2">Dijalankan full page 3D tanpa frame panel</div>
                    </div>
                    <div className="flex flex-col justify-between rounded-xl border border-sidebar-border/70 p-5 bg-card text-card-foreground">
                        <div className="text-sm font-semibold text-muted-foreground">Status Engine</div>
                        <div className="text-xl font-bold mt-1 text-amber-500">Three.js WebGL (60+ FPS)</div>
                        <div className="text-xs text-muted-foreground mt-2">Optimasi Low-Poly & Web Audio API</div>
                    </div>
                    <div className="flex flex-col justify-between rounded-xl border border-sidebar-border/70 p-5 bg-card text-card-foreground">
                        <div className="text-sm font-semibold text-muted-foreground">Roleplay Features</div>
                        <div className="text-xl font-bold mt-1 text-sky-500">Fase 1 & Fase 2 Aktif</div>
                        <div className="text-xs text-muted-foreground mt-2">Ekonomi, ATM, Misi, Garasi, Inventaris</div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
