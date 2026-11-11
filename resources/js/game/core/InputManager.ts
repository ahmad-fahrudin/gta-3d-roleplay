export interface InputState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
    interact: boolean; // F
    horn: boolean;     // H
    lights: boolean;   // L
    cameraToggle: boolean; // C
    mouseDeltaX: number;
    mouseDeltaY: number;
    isMouseDragging: boolean;
}

export class InputManager {
    public state: InputState = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
        jump: false,
        interact: false,
        horn: false,
        lights: false,
        cameraToggle: false,
        mouseDeltaX: 0,
        mouseDeltaY: 0,
        isMouseDragging: false,
    };

    private isChatActive: boolean = false;
    private domElement: HTMLElement | null = null;
    private onKeyActionCallbacks: Map<string, Array<() => void>> = new Map();

    init(domElement: HTMLElement) {
        this.domElement = domElement;

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        domElement.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);

        // Touch events for mobile support
        domElement.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd);
    }

    setChatActive(active: boolean) {
        this.isChatActive = active;
        if (active) {
            this.resetMovement();
        }
    }

    private resetMovement() {
        this.state.forward = false;
        this.state.backward = false;
        this.state.left = false;
        this.state.right = false;
        this.state.sprint = false;
        this.state.jump = false;
    }

    onAction(action: 'interact' | 'horn' | 'lights' | 'cameraToggle' | 'useMarker' | 'togglePhone' | 'toggleInventory', cb: () => void): () => void {
        if (!this.onKeyActionCallbacks.has(action)) {
            this.onKeyActionCallbacks.set(action, []);
        }
        this.onKeyActionCallbacks.get(action)!.push(cb);
        return () => {
            const list = this.onKeyActionCallbacks.get(action) || [];
            this.onKeyActionCallbacks.set(action, list.filter(fn => fn !== cb));
        };
    }

    private triggerAction(action: string) {
        const list = this.onKeyActionCallbacks.get(action);
        if (list) {
            list.forEach(fn => fn());
        }
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (this.isChatActive) return;

        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.state.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.state.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.state.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.state.right = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.state.sprint = true;
                break;
            case 'Space':
                this.state.jump = true;
                break;
            case 'KeyF':
                if (!e.repeat) {
                    this.state.interact = true;
                    this.triggerAction('interact');
                }
                break;
            case 'KeyE':
                if (!e.repeat) {
                    this.triggerAction('useMarker');
                }
                break;
            case 'KeyM':
                if (!e.repeat) {
                    this.triggerAction('togglePhone');
                }
                break;
            case 'Tab':
            case 'KeyI':
                e.preventDefault();
                if (!e.repeat) {
                    this.triggerAction('toggleInventory');
                }
                break;
            case 'KeyH':
                this.state.horn = true;
                if (!e.repeat) this.triggerAction('horn');
                break;
            case 'KeyL':
                if (!e.repeat) {
                    this.state.lights = !this.state.lights;
                    this.triggerAction('lights');
                }
                break;
            case 'KeyC':
                if (!e.repeat) {
                    this.triggerAction('cameraToggle');
                }
                break;
        }
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.state.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.state.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.state.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.state.right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.state.sprint = false;
                break;
            case 'Space':
                this.state.jump = false;
                break;
            case 'KeyF':
            case 'KeyE':
                this.state.interact = false;
                break;
            case 'KeyH':
                this.state.horn = false;
                break;
        }
    };

    private lastMouseX = 0;
    private lastMouseY = 0;

    private handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0 || e.button === 2) { // Left or right click
            this.state.isMouseDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    };

    private handleMouseUp = () => {
        this.state.isMouseDragging = false;
    };

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.state.isMouseDragging) return;
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.state.mouseDeltaX += dx;
        this.state.mouseDeltaY += dy;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    };

    // Mobile touch controls
    private touchStartX = 0;
    private touchStartY = 0;

    private handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            this.state.isMouseDragging = true;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    };

    private handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            const dx = e.touches[0].clientX - this.touchStartX;
            const dy = e.touches[0].clientY - this.touchStartY;
            this.state.mouseDeltaX += dx;
            this.state.mouseDeltaY += dy;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    };

    private handleTouchEnd = () => {
        this.state.isMouseDragging = false;
    };

    consumeMouseDelta(): { x: number; y: number } {
        const delta = { x: this.state.mouseDeltaX, y: this.state.mouseDeltaY };
        this.state.mouseDeltaX = 0;
        this.state.mouseDeltaY = 0;
        return delta;
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        if (this.domElement) {
            this.domElement.removeEventListener('mousedown', this.handleMouseDown);
            this.domElement.removeEventListener('touchstart', this.handleTouchStart);
        }
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }
}

