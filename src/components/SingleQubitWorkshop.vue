<script setup lang="ts">
import { RESTART_DELAY_S, SOLE_ANIMATOR, TIME_MULTIPLIER } from '../physics/config.ts';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Scene3d } from '../lib3d/Scene3d.ts';
import { type TimeInfo } from '../lib3d/animator.ts';
import { BLOCH_SPHERE_RADIUS, createArrow, createAxesHelper, createBlochSphereGrid } from '../lib3d/builders.ts';
import { Vector3 } from 'three';
import { applyControlSingleQubit, calcFidelity, singleQubitStateToBloch, type ControlInstruction, type Dumbbell, type StaticInstruction } from '../physics/singlequbit.ts';
import { complex } from 'mathjs';
import { keyPresses } from '../physics/keydetector.ts';
import ControlPlane from './ControlPlane.vue';
import { SingleQubitState } from '../physics/single_qubit_state.ts';

const animationDelayed = ref(false);
const isXPressed = ref(false);
const isYPressed = ref(false);
const isZPressed = ref(false);

const resetDelayMs = ref(1000 * RESTART_DELAY_S);
const elapsedTime = ref(0);
const fidelity = ref("0.00");

const isAnimationPaused = ref(false);

const canvas = ref<HTMLCanvasElement | null>(null)
let scene: Scene3d | null = null;

const staticInstr: StaticInstruction = { gamma: 2.675 * (10 ** 8), B0: 2.0 };

const initialState = new SingleQubitState(complex(1, 0), complex(0, 0));
const actualStateRef = shallowRef(initialState);
const actualArrow = createArrow({
  origin: new Vector3(0, 0, 0),
  direction: singleQubitStateToBloch(actualStateRef.value),
  length: BLOCH_SPHERE_RADIUS,
  color: 0xFFA500,
  opacity: 1.0
});

const showTargetArrowRef = ref(false);

const actualC1Display = computed(() => {
  const value = actualStateRef.value;
  const c0 = value.c0;
  return `(${c0.re.toFixed(2)} + ${c0.im.toFixed(2)}i) |0>`;
});

const actualC2Display = computed(() => {
  const value = actualStateRef.value;
  const c1 = value.c1;
  return `(${c1.re.toFixed(2)} + ${c1.im.toFixed(2)}i) |1>`;
});

const targetState = new SingleQubitState(complex(0.5, 0.5), complex(0.5, 0.5));

const targetC1Display = computed(() => {
  const value = targetState;
  const c0 = value.c0;
  return `(${c0.re.toFixed(2)} + ${c0.im.toFixed(2)}i) |0>`;
});

const targetC2Display = computed(() => {
  const value = targetState;
  const c1 = value.c1;
  return `(${c1.re.toFixed(2)} + ${c1.im.toFixed(2)}i) |1>`;
});

const dumbbellsByAxis = ref<{ [key: string]: Dumbbell[] }>({
  'x': [
    { startTimeS: 2.0 * TIME_MULTIPLIER, endTimeS: (2 + 2.348) * TIME_MULTIPLIER },
  ],
  'y': [

  ],
  'z': [
    { startTimeS: 8 * TIME_MULTIPLIER, endTimeS: (8 + 2.348) * TIME_MULTIPLIER },
  ]
});

onMounted(() => {
  const defaultLogic = {
    execute(_: TimeInfo) {
      targetArrow.visible = showTargetArrowRef.value;
    }
  };

  const animationLogic = {
    execute(timeInfo: TimeInfo) {
      animateBlochSphere(timeInfo);
    }
  };

  scene = new Scene3d({
    canvasElement: canvas.value!,
    animator: SOLE_ANIMATOR,
    animationLogicSuite: {
      onReset: {
        execute(_) {
          handleReset();
        },
      },
      whenRunning: animationLogic,
      whenPaused: {
        execute(_) {
        },
      },
      alwaysAfter: {
        execute(_) {
          targetArrow.visible = showTargetArrowRef.value;
        },
      }
    }
  });

  scene.add(createBlochSphereGrid());
  scene.add(createAxesHelper());
  scene.add(actualArrow);

  const targetArrow = createArrow({
    origin: new Vector3(0, 0, 0),
    direction: singleQubitStateToBloch(targetState),
    length: BLOCH_SPHERE_RADIUS,
    color: 0xFFFFFF,
    opacity: 1.0
  });
  targetArrow.visible = showTargetArrowRef.value;
  scene.add(targetArrow);

  scene.render();

  handleReset();
});

function animateBlochSphere(timeInfo: TimeInfo) {
  elapsedTime.value = timeInfo.elapsed;

  const xPressed = keyPresses['KeyX'];
  const yPressed = keyPresses['KeyY'];
  const zPressed = keyPresses['KeyZ'];
  const anyKeyPressed = xPressed || yPressed || zPressed;

  isXPressed.value = xPressed;
  isYPressed.value = yPressed;
  isZPressed.value = zPressed;

  const Bx = xPressed ? 2.5 * (10 ** (-5)) : 0;
  const By = yPressed ? 2.5 * (10 ** (-5)) : 0;
  const Bz = zPressed ? 2.5 * (10 ** (-5)) : 0;

  if (anyKeyPressed) {
    const ctrlInstr: ControlInstruction = {
      t: timeInfo.delta,
      wRF: staticInstr.gamma * staticInstr.B0,
      Bx: Bx,
      By: By,
      Bz: Bz,
    };
    const newQubitState = applyControlSingleQubit(actualStateRef.value, staticInstr, ctrlInstr);
    actualArrow.setDirection(singleQubitStateToBloch(newQubitState));
    actualStateRef.value = newQubitState;
    fidelity.value = calcFidelity(actualStateRef.value, targetState);
  }
}

function handleReset() {
  if (!animationDelayed.value) {
    animationDelayed.value = true;
    isAnimationPaused.value = false;
    actualStateRef.value = initialState;
    actualArrow.setDirection(singleQubitStateToBloch(actualStateRef.value));
    fidelity.value = calcFidelity(actualStateRef.value, targetState);
    SOLE_ANIMATOR.cancel();
    scene?.render();

    resetDelayMs.value = 1000 * RESTART_DELAY_S;
    const intervalId = setInterval(() => {
      resetDelayMs.value = resetDelayMs.value - 500;
    }, 500);
    setTimeout(() => {
      clearInterval(intervalId);
      SOLE_ANIMATOR.restart();
      animationDelayed.value = false;
    }, RESTART_DELAY_S * 1000);
  }
}

function handlePause() {
  SOLE_ANIMATOR.pause();
  isAnimationPaused.value = true;
}

function handleResume() {
  SOLE_ANIMATOR.resume();
  isAnimationPaused.value = false;
}

window.addEventListener('keydown', (event) => {
  if (event.code == 'KeyS') {
    handleReset();
  } else if (event.code == 'KeyP') {
    handlePause();
  } else if (event.code == 'KeyR') {
    handleResume();
  }
});

onBeforeUnmount(() => {
  scene?.dispose();
});
</script>

<template>
  <div class="stateDisplay currentState">
    <code>Current State: <br/>
    {{ actualC1Display }} <br/>
    {{ actualC2Display }}
    </code>
  </div>
  <div class="stateDisplay targetState">
    <code>Target State: <br/>
    {{ targetC1Display }} <br/>
    {{ targetC2Display }}
    </code>
  </div>

  <div class="fidelity">
    Fidelity: {{ fidelity }} %
  </div>

  <div class="showTargetArrow">
    <label>
      <input type="checkbox" v-model="showTargetArrowRef">
      Show Target Vector
    </label>
  </div>

  <ControlPlane :is-x-pressed="isXPressed" :is-y-pressed="isYPressed" :is-z-pressed="isZPressed"
    :elapsed-time="elapsedTime" :dumbbells-by-axis="dumbbellsByAxis" />
  <canvas ref="canvas" class="three-scene" />

  <div class="animationMsg">
    <div v-if="animationDelayed">
      Starting game in {{ resetDelayMs / 1000 }} seconds.
    </div>
    {{ isAnimationPaused ? 'Game Paused' : '' }}
  </div>

  <div class="shortcuts">
    S = (Re)Start, P = Pause, R = Resume
  </div>
</template>

<style scoped>
.animationMsg {
  position: absolute;
  z-index: 2;
  font-size: 24pt;
  color: red;
  bottom: 100px;
  left: 40px;
}

.shortcuts {
  position: absolute;
  z-index: 2;
  font-size: 16pt;
  color: greenyellow;
  bottom: 50px;
  left: 40px;
}

.floating-h3 {
  position: absolute;
  left: 40px;
  top: 40px;
  width: 500px;
  color: white;
  z-index: 2;
}

.stateDisplay {
  border-color: greenyellow;
  border: 1px solid;
  padding: 5px;
  border-radius: 5px;
  color: greenyellow;
  position: absolute;
  font-size: 12pt;
  z-index: 2;
}

.currentState {
  left: 220px;
  top: 60px;
}

.targetState {
  left: 40px;
  top: 60px;
}

.fidelity {
  color: greenyellow;
  position: absolute;
  font-size: 20pt;
  z-index: 2;
  left: 40px;
  top: 150px;
}

.showTargetArrow {
  position: absolute;
  z-index: 2;
  left: 40px;
  top: 200px;
  color: white;
}

.show .three-scene {
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  display: block;
  z-index: 1;
}
</style>
