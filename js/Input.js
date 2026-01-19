// js/Input.js
export class InputHandler {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            this.keys[e.key] = true; // Backup for specific browser naming
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            this.keys[e.key] = false;
        });
    }
    isPressed(keyName) {
        return this.keys[keyName] === true;
    }
}
