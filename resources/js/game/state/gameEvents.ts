export interface GameState {
    health: number;
    maxHealth: number;
    armor: number;
    cash: number;
    bank: number;
    wantedLevel: number;
    inVehicle: boolean;
    vehicleSpeed: number; // km/h
    vehicleGear: string;
    vehicleFuel: number; // 0 - 100
    interactionPrompt: string | null;
    currentZone: string;
    playerCoords: { x: number; y: number; z: number; heading: number };
    vehiclesCoords: Array<{ id: string; x: number; z: number; heading: number }>;
}

export interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    type: 'global' | 'local' | 'me' | 'do' | 'system';
    timestamp: string;
}

type Listener<T> = (data: T) => void;

class GameEventBus {
    private state: GameState = {
        health: 100,
        maxHealth: 100,
        armor: 50,
        cash: 12500,
        bank: 85000,
        wantedLevel: 0,
        inVehicle: false,
        vehicleSpeed: 0,
        vehicleGear: 'N',
        vehicleFuel: 100,
        interactionPrompt: null,
        currentZone: 'Downtown Los Santos',
        playerCoords: { x: 0, y: 0, z: 0, heading: 0 },
        vehiclesCoords: [],
    };

    private stateListeners: Set<Listener<GameState>> = new Set();
    private chatListeners: Set<Listener<ChatMessage>> = new Set();
    private commandListeners: Map<string, Array<() => void>> = new Map();

    getState(): GameState {
        return this.state;
    }

    updateState(partial: Partial<GameState>) {
        this.state = { ...this.state, ...partial };
        for (const listener of this.stateListeners) {
            listener(this.state);
        }
    }

    subscribeState(listener: Listener<GameState>): () => void {
        this.stateListeners.add(listener);
        listener(this.state);
        return () => this.stateListeners.delete(listener);
    }

    addChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
        const fullMsg: ChatMessage = {
            ...msg,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        for (const listener of this.chatListeners) {
            listener(fullMsg);
        }
    }

    subscribeChat(listener: Listener<ChatMessage>): () => void {
        this.chatListeners.add(listener);
        return () => this.chatListeners.delete(listener);
    }

    onCommand(command: string, cb: () => void): () => void {
        if (!this.commandListeners.has(command)) {
            this.commandListeners.set(command, []);
        }
        this.commandListeners.get(command)!.push(cb);
        return () => {
            const list = this.commandListeners.get(command) || [];
            this.commandListeners.set(command, list.filter(fn => fn !== cb));
        };
    }

    emitCommand(command: string) {
        const list = this.commandListeners.get(command);
        if (list) {
            list.forEach(fn => fn());
        }
    }
}

export const gameEvents = new GameEventBus();

