import type { Dumbbell } from './singlequbit';
import type { SingleQubitState } from './single_qubit_state';

export interface SingleQubitGame {
    title: string,
    initial: SingleQubitState,
    target: SingleQubitState,
    gamma: number,
    B0: number,
    Bx: number,
    By: number,
    Bz: number,
    steps: { [key: string]: Dumbbell[] },
}
