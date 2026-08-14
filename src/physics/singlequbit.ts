import { complex, matrix, multiply, divide, hypot, flatten, abs, conj, type Complex } from "mathjs";
import { Vector3 } from "three";

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
    inputState: [Complex, Complex],
    staticInstr: StaticInstruction,
    ctrlInstr: ControlInstruction
): [Complex, Complex] {
    const inpMatrix = matrix(inputState)
    const U = getUnitaryTransform(staticInstr, ctrlInstr)
    const new_state = flatten(multiply(U, inpMatrix)).valueOf();
    return new_state as ([Complex, Complex])
}

export function singleQubitStateToBloch([c1, c2]: [Complex, Complex]): Vector3 {
    const absC1 = abs(c1) as number;
    const absC2 = abs(c2) as number;

    const norm = hypot(absC1, absC2);
    const a = divide(c1, norm) as math.Complex;
    const b = divide(c2, norm) as math.Complex;

    const product = multiply(conj(a), b) as math.Complex;

    const x = 2 * product.re;
    const y = product.im ? 2 * product.im : 0;
    const z = Math.pow(abs(a), 2) - Math.pow(abs(b), 2);

    return new Vector3(x, y, z);
}