import { complex } from 'mathjs';
import type { SingleQubitGame } from '../../physics/single_qubit_game';
import { TIME_MULTIPLIER } from '../../physics/config';
import { SingleQubitState } from '../../physics/single_qubit_state';

export const game_0: SingleQubitGame = {
    title: "Basic X/Z flips",
    initial: new SingleQubitState(complex(1, 0), complex(0, 0)),
    target: new SingleQubitState(complex(0.5, 0.5), complex(0.5, 0.5)),
    gamma: 2.675 * (10 ** 8),
    B0: 2.0,
    Bx: 2.5 * (10 ** (-5)),
    By: 2.5 * (10 ** (-5)),
    Bz: 2.5 * (10 ** (-5)),
    steps: {
        'x': [
            { startTimeS: 2.0 * TIME_MULTIPLIER, endTimeS: (2 + 2.348) * TIME_MULTIPLIER },
        ],
        'y': [
        ],
        'z': [
            { startTimeS: 8 * TIME_MULTIPLIER, endTimeS: (8 + 2.348) * TIME_MULTIPLIER },
        ]
    }
}
