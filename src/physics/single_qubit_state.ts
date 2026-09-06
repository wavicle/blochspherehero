import type { Complex } from "mathjs";

export class SingleQubitState {
    private readonly _c0: Complex;
    private readonly _c1: Complex;

    constructor(c0: Complex, c1: Complex) {
        this._c0 = c0;
        this._c1 = c1;
    }

    get c0() {
        return this._c0;
    }

    get c1() {
        return this._c1;
    }
}