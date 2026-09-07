import * as THREE from 'three'

export interface AnimatorParams {
    timeMultiplier: number;
}

export interface TimeInfo {
    delta: number;
    elapsed: number;
}

export interface AnimationLogic {
    execute: (time: TimeInfo) => void
}

export class Animator {
    private timer = new THREE.Timer();
    private timeMultiplier: number;
    private _animationFrameId: number | null = null;
    private _logicsById = new Map<string, AnimationLogic>();
    private _pausedTimelogicsById = new Map<string, AnimationLogic>();

    private _paused: boolean = false;

    constructor(params: AnimatorParams) {
        this.timeMultiplier = params.timeMultiplier;
    }

    addLogic(mainLogic: AnimationLogic, pausedTimeLogic: AnimationLogic) {
        const logicId = crypto.randomUUID();
        this._logicsById.set(logicId, mainLogic);
        this._pausedTimelogicsById.set(logicId, pausedTimeLogic);
        return logicId;
    }

    removeLogic(logicId: string) {
        this._logicsById.delete(logicId);
        this._pausedTimelogicsById.delete(logicId);
    }

    restart() {
        this.cancel();
        this.resume();
        this.timer = new THREE.Timer();
        const callback = () => {
            if(this._paused) {
                for (const logic of this._pausedTimelogicsById.values()) {
                    logic.execute({ delta: -1, elapsed: -1 });
                }
            } else {
                this.timer.update();
                const deltaScaled = this.timer.getDelta();
                const elapsedScaled = this.timer.getElapsed();

                const delta = deltaScaled * this.timeMultiplier;
                const elapsed = elapsedScaled * this.timeMultiplier;

                for (const logic of this._logicsById.values()) {
                    logic.execute({ delta, elapsed });
                }
            }
            this._animationFrameId = requestAnimationFrame(callback)
        };
        this._animationFrameId = requestAnimationFrame(callback);
    }

    pause() {
        this._paused = true;
    }

    resume() {
        this._paused = false;
    }

    cancel() {
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
        }
    }

    isPaused() {
        return this._paused;
    }

}
