import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, gameEvents } from '../../game/state/gameEvents';
import { InputManager } from '../../game/core/InputManager';
import { MessageSquare, Send } from 'lucide-react';

interface TextChatProps {
    inputManager: InputManager | null;
}

export const TextChat: React.FC<TextChatProps> = ({ inputManager }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'Server',
            text: 'Selamat datang di GTA 3D Roleplay! Tekan [T] untuk membuka chat, ketik /help untuk melihat panduan.',
            type: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
            id: '2',
            sender: 'Petunjuk',
            text: 'Gunakan tombol WASD untuk bergerak, Shift sprint, Spasi lompat. Dekati mobil dan tekan [F] untuk masuk!',
            type: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // Subscribe to incoming messages
    useEffect(() => {
        return gameEvents.subscribeChat(msg => {
            setMessages(prev => [...prev.slice(-40), msg]);
        });
    }, []);

    // Scroll to bottom when message arrives
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Handle keypress 'T' or 'Enter' to open chat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen && (e.code === 'KeyT' || e.code === 'Enter') && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                setIsOpen(true);
                inputManager?.setChatActive(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            } else if (isOpen && e.code === 'Escape') {
                setIsOpen(false);
                inputManager?.setChatActive(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, inputManager]);

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = inputValue.trim();
        if (!text) {
            setIsOpen(false);
            inputManager?.setChatActive(false);
            return;
        }

        // Process RP Slash Commands
        if (text.startsWith('/')) {
            const parts = text.split(' ');
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1).join(' ');

            if (cmd === '/help') {
                gameEvents.addChatMessage({
                    sender: 'Bantuan',
                    text: 'Perintah: /me [aksi], /do [keadaan], /car (spawn mobil), /coords (posisi), /clear (hapus chat). Kontrol: [WASD] Gerak, [Shift] Lari, [Spasi] Lompat/Rem, [F] Mobil, [H] Klakson, [L] Lampu, [C] Kamera.',
                    type: 'system',
                });
            } else if (cmd === '/me') {
                if (args) {
                    gameEvents.addChatMessage({
                        sender: 'Aksi',
                        text: `* Player ${args} *`,
                        type: 'me',
                    });
                }
            } else if (cmd === '/do') {
                if (args) {
                    gameEvents.addChatMessage({
                        sender: 'Keadaan',
                        text: `[!] ${args} (( Player ))`,
                        type: 'do',
                    });
                }
            } else if (cmd === '/car') {
                gameEvents.emitCommand('spawn_car');
            } else if (cmd === '/clear') {
                setMessages([]);
            } else if (cmd === '/coords') {
                const coords = gameEvents.getState().playerCoords;
                gameEvents.addChatMessage({
                    sender: 'GPS',
                    text: `X: ${coords.x.toFixed(1)}, Y: ${coords.y.toFixed(1)}, Z: ${coords.z.toFixed(1)}, Heading: ${(coords.heading * 180 / Math.PI).toFixed(0)}°`,
                    type: 'system',
                });
            } else {
                gameEvents.addChatMessage({
                    sender: 'Error',
                    text: `Perintah '${cmd}' tidak dikenali. Ketik /help untuk daftar perintah.`,
                    type: 'system',
                });
            }
        } else {
            // Normal Local Speech
            gameEvents.addChatMessage({
                sender: 'Warga',
                text,
                type: 'local',
            });
        }

        setInputValue('');
        setIsOpen(false);
        inputManager?.setChatActive(false);
    };

    return (
        <div className="flex w-96 flex-col pointer-events-auto">
            {/* Messages box */}
            <div
                className={`flex max-h-56 flex-col overflow-y-auto rounded-lg p-2.5 transition-all duration-300 ${
                    isOpen ? 'bg-black/80 backdrop-blur-md shadow-2xl border border-white/10' : 'bg-black/30 hover:bg-black/60'
                }`}
            >
                <div className="flex flex-col gap-1 text-xs">
                    {messages.map(msg => (
                        <div key={msg.id} className="leading-relaxed drop-shadow-sm">
                            <span className="text-[10px] text-neutral-400 mr-1.5">[{msg.timestamp}]</span>
                            {msg.type === 'system' && (
                                <span className="font-semibold text-amber-400">
                                    [{msg.sender}] <span className="text-amber-200">{msg.text}</span>
                                </span>
                            )}
                            {msg.type === 'local' && (
                                <span>
                                    <span className="font-semibold text-emerald-400">{msg.sender}: </span>
                                    <span className="text-white">{msg.text}</span>
                                </span>
                            )}
                            {msg.type === 'me' && (
                                <span className="italic text-purple-300 font-medium">
                                    {msg.text}
                                </span>
                            )}
                            {msg.type === 'do' && (
                                <span className="text-sky-300 font-medium">
                                    {msg.text}
                                </span>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>

            {/* Input row (only visible when chat opened) */}
            {isOpen && (
                <form onSubmit={handleSendMessage} className="mt-1 flex gap-1.5 animate-in fade-in duration-200">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Ketik pesan atau /help..."
                        className="flex-1 rounded-md border border-white/20 bg-black/80 px-3 py-1.5 text-xs text-white placeholder-neutral-400 outline-none focus:border-emerald-500 backdrop-blur-md"
                    />
                    <button
                        type="submit"
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </form>
            )}

            {!isOpen && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-white/60">
                    <MessageSquare className="h-3 w-3" />
                    <span>Tekan <kbd className="rounded bg-black/60 px-1 py-0.5 font-mono text-[10px] border border-white/20">T</kbd> untuk chat</span>
                </div>
            )}
        </div>
    );
};

