export interface InventoryItem {
    id: string;
    name: string;
    icon: string; // Emoji or Lucide icon key
    count: number;
    weight: number; // in kg
    desc: string;
    type: 'food' | 'drink' | 'medical' | 'tool' | 'misc';
}

export interface Mission {
    id: string;
    title: string;
    desc: string;
    target: { x: number; z: number; name: string };
    reward: number;
}

export interface GameState {
    health: number;
    maxHealth: number;
    armor: number;
    cash: number;
    bank: number;
    wantedLevel: number;
    job: string;
    hunger: number;
    thirst: number;
    inVehicle: boolean;
    vehicleSpeed: number; // km/h
    vehicleGear: string;
    vehicleFuel: number; // 0 - 100
    interactionPrompt: string | null;
    currentZone: string;
    playerCoords: { x: number; y: number; z: number; heading: number };
    vehiclesCoords: Array<{ id: string; x: number; z: number; heading: number }>;
    activeMission: Mission | null;
    inventory: InventoryItem[];
    phoneOpen: boolean;
    inventoryOpen: boolean;
    activeModal: 'atm' | 'shop' | 'job_center' | null;
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
        job: 'Warga Sipil',
        hunger: 85,
        thirst: 70,
        inVehicle: false,
        vehicleSpeed: 0,
        vehicleGear: 'N',
        vehicleFuel: 100,
        interactionPrompt: null,
        currentZone: 'Downtown Los Santos',
        playerCoords: { x: 0, y: 0, z: 0, heading: 0 },
        vehiclesCoords: [],
        activeMission: null,
        phoneOpen: false,
        inventoryOpen: false,
        activeModal: null,
        inventory: [
            { id: 'burger', name: 'Burger Bleeder', icon: '🍔', count: 3, weight: 0.3, desc: 'Memulihkan 25% rasa lapar & HP', type: 'food' },
            { id: 'soda', name: 'Sprunk Soda', icon: '🥤', count: 4, weight: 0.25, desc: 'Memulihkan 30% rasa haus', type: 'drink' },
            { id: 'medkit', name: 'First Aid Kit (P3K)', icon: '🩹', count: 1, weight: 1.0, desc: 'Memulihkan HP hingga penuh', type: 'medical' },
            { id: 'repair_kit', name: 'Toolkit Mekanik', icon: '🔧', count: 2, weight: 2.5, desc: 'Memperbaiki bensin & kerusakan mobil', type: 'tool' },
            { id: 'car_key', name: 'Kunci Mobil Sport', icon: '🔑', count: 1, weight: 0.05, desc: 'Kunci kepemilikan mobil sport merah', type: 'misc' },
        ],
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

    // Roleplay Inventory Actions
    useItem(itemId: string) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item || item.count <= 0) return;

        let newHealth = this.state.health;
        let newHunger = this.state.hunger;
        let newThirst = this.state.thirst;
        let used = false;

        if (item.type === 'food') {
            newHunger = Math.min(100, newHunger + 30);
            newHealth = Math.min(this.state.maxHealth, newHealth + 15);
            this.addChatMessage({ sender: 'Status', text: `Anda memakan ${item.name}. Lapar berkurang.`, type: 'system' });
            used = true;
        } else if (item.type === 'drink') {
            newThirst = Math.min(100, newThirst + 35);
            this.addChatMessage({ sender: 'Status', text: `Anda meminum ${item.name}. Haus berkurang segar!`, type: 'system' });
            used = true;
        } else if (item.type === 'medical') {
            newHealth = this.state.maxHealth;
            this.addChatMessage({ sender: 'Status', text: `Menggunakan P3K, darah pulih penuh 100%!`, type: 'system' });
            used = true;
        } else if (item.type === 'tool') {
            if (this.state.inVehicle) {
                this.updateState({ vehicleFuel: 100 });
                this.addChatMessage({ sender: 'Mekanik', text: 'Bensin & mesin mobil berhasil diperbaiki!', type: 'system' });
                used = true;
            } else {
                this.addChatMessage({ sender: 'Info', text: 'Alat ini digunakan saat berada di dalam mobil.', type: 'system' });
            }
        }

        if (used) {
            const updatedInv = this.state.inventory
                .map(i => i.id === itemId ? { ...i, count: i.count - 1 } : i)
                .filter(i => i.count > 0);

            this.updateState({
                health: newHealth,
                hunger: newHunger,
                thirst: newThirst,
                inventory: updatedInv,
            });
        }
    }

    dropItem(itemId: string) {
        const updatedInv = this.state.inventory
            .map(i => i.id === itemId ? { ...i, count: i.count - 1 } : i)
            .filter(i => i.count > 0);

        this.updateState({ inventory: updatedInv });
        this.addChatMessage({ sender: 'Inventory', text: `Membuang 1 item.`, type: 'system' });
    }

    // Roleplay Banking Actions
    depositMoney(amount: number) {
        if (this.state.cash < amount) {
            this.addChatMessage({ sender: 'Maze Bank', text: 'Uang tunai tidak mencukupi untuk setoran.', type: 'system' });
            return;
        }
        this.updateState({
            cash: this.state.cash - amount,
            bank: this.state.bank + amount,
        });
        this.addChatMessage({ sender: 'Maze Bank', text: `Setor tunai $${amount.toLocaleString()} berhasil!`, type: 'system' });
    }

    withdrawMoney(amount: number) {
        if (this.state.bank < amount) {
            this.addChatMessage({ sender: 'Maze Bank', text: 'Saldo rekening bank tidak mencukupi.', type: 'system' });
            return;
        }
        this.updateState({
            cash: this.state.cash + amount,
            bank: this.state.bank - amount,
        });
        this.addChatMessage({ sender: 'Maze Bank', text: `Tarik tunai $${amount.toLocaleString()} berhasil!`, type: 'system' });
    }
}

export const gameEvents = new GameEventBus();
