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

export interface AnimationLogicSuite {
    onReset: AnimationLogic,
    whenRunning: AnimationLogic,
    whenPaused: AnimationLogic
    alwaysAfter: AnimationLogic
}

export class Animator {
    private _timer = new THREE.Timer();
    private _timeMultiplier: number;
    private _animationFrameId: number | null = null;

    private _animationLogicSuitesById = new Map<string, AnimationLogicSuite>();

    private _paused: boolean = false;
    private _machineElapsedTimeS = 0;

    constructor(params: AnimatorParams) {
        this._timeMultiplier = params.timeMultiplier;
    }

    addLogic(suite: AnimationLogicSuite) {
        const suiteId = crypto.randomUUID();
        this._animationLogicSuitesById.set(suiteId, suite);
        return suiteId;
    }

    removeLogic(suiteId: string) {
        this._animationLogicSuitesById.delete(suiteId);
    }

    restart() {
        this.cancel();
        this.resume();
        this._timer = new THREE.Timer();
        const callback = () => {
            this._timer.update();
            const deltaScaled = this._timer.getDelta();
            if (this._paused) {
                for (const suite of this._animationLogicSuitesById.values()) {
                    suite.whenPaused.execute({ delta: -1, elapsed: -1 });
                }
            } else {
                this._machineElapsedTimeS += deltaScaled;
                const delta = deltaScaled * this._timeMultiplier;
                const elapsed = this._machineElapsedTimeS * this._timeMultiplier;
                for (const suite of this._animationLogicSuitesById.values()) {
                    suite.whenRunning.execute({ delta, elapsed });
                }
            }
            for (const suite of this._animationLogicSuitesById.values()) {
                suite.alwaysAfter.execute({ delta: -1, elapsed: -1 });
            }
            this._animationFrameId = requestAnimationFrame(callback)
        };
        this._animationFrameId = requestAnimationFrame(callback);
    }

    pause() {
        this._paused = true;
        /* timer's reset actually means pause :( */
        this._timer.reset();
    }

    resume() {
        this._paused = false;
    }

    cancel() {
        this.pause();
        this._machineElapsedTimeS = 0;
        for (const suite of this._animationLogicSuitesById.values()) {
            suite.onReset.execute({ delta: -1, elapsed: -1 });
            suite.alwaysAfter.execute({ delta: -1, elapsed: -1 });
        }
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
        }
    }

    get isPaused() {
        return this._paused;
    }

}
