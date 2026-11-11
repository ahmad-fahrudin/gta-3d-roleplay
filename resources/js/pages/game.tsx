import React, { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { GameEngine } from '../game/core/GameEngine';
import { HUD } from '../components/game/HUD';
import { home } from '../routes';
import { ArrowLeft, Maximize2 } from 'lucide-react';

export default function GamePage() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [engineReady, setEngineReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize 3D Engine
        const engine = new GameEngine(containerRef.current);
        engineRef.current = engine;
        setEngineReady(true);

        return () => {
            engine.destroy();
            engineRef.current = null;
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-neutral-950 font-sans select-none">
            <Head title="GTA 3D Roleplay - Live Game" />

            {/* Top Header Floating Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md text-xs text-white shadow-xl">
                <Link
                    href={home()}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Keluar</span>
                </Link>
                <div className="h-3 w-px bg-white/20" />
                <span className="font-semibold text-amber-400">GTA 3D Roleplay</span>
                <div className="h-3 w-px bg-white/20" />
                <button
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen"
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* 3D Canvas Container */}
            <div ref={containerRef} className="absolute inset-0 h-full w-full" />

            {/* React HUD Overlay */}
            {engineReady && <HUD inputManager={engineRef.current?.inputManager || null} />}
        </div>
    );
}

