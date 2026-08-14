export const keyPresses: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
    keyPresses[event.code] = true; // e.g., 'KeyW', 'ArrowUp', 'Space'
});

window.addEventListener('keyup', (event) => {
    keyPresses[event.code] = false;
});
