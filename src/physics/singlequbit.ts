import { complex, matrix, multiply, divide, hypot, flatten, abs, conj, type Complex } from "mathjs";
import { Vector3 } from "three";
import { SingleQubitState } from "./single_qubit_state";
import { dot } from "mathjs";

export interface StaticInstruction {
    gamma: number;
    B0: number;
}

export interface ControlInstruction {
    t: number
    wRF: number
    Bx: number
    By: number
    Bz: number
}

export function calcFidelity(actual: SingleQubitState, target: SingleQubitState) {
    return (100*abs(dot([actual.c0, actual.c1], [target.c0, target.c1]))).toFixed(2);
}

export function getUnitaryTransform(
    staticInstr: StaticInstruction, ctrlInstr: ControlInstruction
) {
    const B0 = staticInstr.B0
    const gamma = staticInstr.gamma
    const wRF = ctrlInstr.wRF
    const Bx = ctrlInstr.Bx
    const By = ctrlInstr.By
    const Bz = ctrlInstr.Bz
    const t = ctrlInstr.t

    const wX = gamma * Bx
    const wY = gamma * By
    const wZ = (gamma * (B0 + Bz)) - wRF
    const w = Math.sqrt((wX * wX) + (wY * wY) + (wZ * wZ))

    const C = Math.cos((w * t) / 2)
    const S = Math.sin((w * t) / 2)
    return matrix(
        [
            [complex(C, wZ * S / w), complex(wY * S / w, wX * S / w)],
            [complex(-wY * S / w, wX * S / w), complex(C, -wZ * S / w)],
        ]
    )
}

export function applyControlSingleQubit(
    inputState: SingleQubitState,
    staticInstr: StaticInstruction,
    ctrlInstr: ControlInstruction
): SingleQubitState {
    const inpMatrix = matrix([
        inputState.c0, inputState.c1
    ]);
    const U = getUnitaryTransform(staticInstr, ctrlInstr)
    const new_state = flatten(multiply(U, inpMatrix)).valueOf();
    return new SingleQubitState(new_state[0] as Complex, new_state[1] as Complex);
}

export function singleQubitStateToBloch(state: SingleQubitState): Vector3 {
    const c0 = state.c0;
    const c1 = state.c1;
    const absC0 = abs(c0) as number;
    const absC1 = abs(c1) as number;

    const norm = hypot(absC0, absC1);
    const a = divide(c0, norm) as math.Complex;
    const b = divide(c1, norm) as math.Complex;

    const product = multiply(conj(a), b) as math.Complex;

    const x = 2 * product.re;
    const y = product.im ? 2 * product.im : 0;
    const z = Math.pow(abs(a), 2) - Math.pow(abs(b), 2);

    return new Vector3(x, y, z);
}