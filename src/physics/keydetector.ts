export const keyPresses: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
    keyPresses[event.code] = true;
});

window.addEventListener('keyup', (event) => {
    keyPresses[event.code] = false;
});
