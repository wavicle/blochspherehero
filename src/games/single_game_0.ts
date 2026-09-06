import { complex } from 'mathjs';
import type { SingleQubitGame } from './single_qubit_game';

export const game: SingleQubitGame = {
    initial: [complex(1, 0), complex(0, 0)],
    final: [complex(1, 0), complex(0, 0)],
    steps: []
};