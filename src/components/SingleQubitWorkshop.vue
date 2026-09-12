<script setup lang="ts">
import { RESTART_DELAY_S, SOLE_ANIMATOR } from '../physics/config.ts';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Scene3d } from '../lib3d/Scene3d.ts';
import { type TimeInfo } from '../lib3d/animator.ts';
import { BLOCH_SPHERE_RADIUS, createArrow, createAxesHelper, createBlochSphereGrid } from '../lib3d/builders.ts';
import { Vector3 } from 'three';
import { applyControlSingleQubit, calcFidelity, singleQubitStateToBloch, type ControlInstruction, type StaticInstruction } from '../physics/singlequbit.ts';
import { keyPresses } from '../physics/keydetector.ts';
import ControlPlane from './ControlPlane.vue';
import { game_0 as defaultGame } from '../games/single_qubit/single_game_0.ts';
import { single_qubit_games } from '../games/single_qubit/single_qubit_game_suite.ts';
import type { SingleQubitState } from '../physics/single_qubit_state.ts';
import type { SingleQubitGame } from '../physics/single_qubit_game.ts';

const controlPlaneRef = ref<typeof ControlPlane | null>(null);
const loadedGameRef = ref(defaultGame);

const gameTitle = ref(defaultGame.title);
let initialState: SingleQubitState = defaultGame.initial;
const targetStateRef = ref(defaultGame.target);
let dumbbellsByAxis = ref(defaultGame.steps);
let staticInstr: StaticInstruction = { gamma: defaultGame.gamma, B0: defaultGame.B0 };
let Bx = defaultGame.Bx;
let By = defaultGame.By;
let Bz = defaultGame.Bz;

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

const targetC1Display = computed(() => {
  const value = targetStateRef.value;
  const c0 = value.c0;
  return `(${c0.re.toFixed(2)} + ${c0.im.toFixed(2)}i) |0>`;
});

const targetC2Display = computed(() => {
  const value = targetStateRef.value;
  const c1 = value.c1;
  return `(${c1.re.toFixed(2)} + ${c1.im.toFixed(2)}i) |1>`;
});

const targetArrow = createArrow({
  origin: new Vector3(0, 0, 0),
  direction: singleQubitStateToBloch(targetStateRef.value as SingleQubitState),
  length: BLOCH_SPHERE_RADIUS,
  color: 0xFFFFFF,
  opacity: 1.0
});
targetArrow.visible = showTargetArrowRef.value;

onMounted(() => {
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

  scene.add(targetArrow);

  scene.render();

  handleReset();
});

function animateBlochSphere(timeInfo: TimeInfo) {
  elapsedTime.value = timeInfo.elapsed;

  const xPressed = keyPresses['KeyX'] == true;
  const yPressed = keyPresses['KeyY'] == true;
  const zPressed = keyPresses['KeyZ'] == true;
  const anyKeyPressed = xPressed || yPressed || zPressed;

  isXPressed.value = xPressed;
  isYPressed.value = yPressed;
  isZPressed.value = zPressed;

  const Bx_effective = xPressed ? Bx : 0;
  const By_effective = yPressed ? By : 0;
  const Bz_effective = zPressed ? Bz : 0;

  if (anyKeyPressed) {
    const ctrlInstr: ControlInstruction = {
      t: timeInfo.delta,
      wRF: staticInstr.gamma * staticInstr.B0,
      Bx: Bx_effective,
      By: By_effective,
      Bz: Bz_effective,
    };
    const newQubitState = applyControlSingleQubit(actualStateRef.value, staticInstr, ctrlInstr);
    actualArrow.setDirection(singleQubitStateToBloch(newQubitState));
    actualStateRef.value = newQubitState;
    fidelity.value = calcFidelity(actualStateRef.value, targetStateRef.value as SingleQubitState);
  }
}

function handleReset() {
  controlPlaneRef?.value?.resetFidelity();

  if (!animationDelayed.value) {
    animationDelayed.value = true;
    isAnimationPaused.value = false;
    actualStateRef.value = initialState;
    actualArrow.setDirection(singleQubitStateToBloch(actualStateRef.value));
    fidelity.value = calcFidelity(actualStateRef.value, targetStateRef.value as SingleQubitState);
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

function loadGame() {
  const loadedGame = loadedGameRef.value as SingleQubitGame;
  gameTitle.value = loadedGame.title;
  initialState = loadedGame.initial;
  targetStateRef.value = loadedGame.target;
  dumbbellsByAxis.value = loadedGame.steps;
  staticInstr = { gamma: loadedGame.gamma, B0: loadedGame.B0 };
  Bx = loadedGame.Bx;
  By = loadedGame.By;
  Bz = loadedGame.Bz;
  actualStateRef.value = initialState;
  targetArrow.setDirection(singleQubitStateToBloch(loadedGame.target));

  handleReset();
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
  <h2 class="big_title">Bloch Sphere Hero ({{ gameTitle }})</h2>
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
    Target Fidelity: {{ fidelity }} %
  </div>

  <div class="showTargetArrow">
    <label>
      <input type="checkbox" v-model="showTargetArrowRef">
      Show Target Vector
    </label>
  </div>

  <ControlPlane ref="controlPlaneRef" :is-x-pressed="isXPressed" :is-y-pressed="isYPressed" :is-z-pressed="isZPressed"
    :elapsed-time="elapsedTime" :dumbbells-by-axis="dumbbellsByAxis" />
  <canvas ref="canvas" class="three-scene" />

  <div class="animationMsg">
    <div v-if="animationDelayed">
      Starting game in {{ resetDelayMs / 1000 }} seconds.
    </div>
    {{ isAnimationPaused ? 'Game Paused' : '' }}
  </div>

  <div class="gameLoader">
    Load Game:
    <select v-model="loadedGameRef" @change="loadGame">
      <template v-for="game in single_qubit_games">
        <option :value="game">{{ game.title }}</option>
      </template>
    </select>
  </div>

  <div class="shortcuts">
    S = (Re)Start, P = Pause, R = Resume
  </div>
</template>

<style scoped>
.big_title {
  position: absolute;
  top: 0px;
  width: 100%;
  text-align: center;
  z-index: 2;
  color: white;
}

.animationMsg {
  position: absolute;
  z-index: 2;
  font-size: 24pt;
  color: red;
  bottom: 200px;
  left: 40px;
}

.gameLoader {
  position: absolute;
  font-size: 20pt;
  color: white;
  z-index: 2;
  bottom: 100px;
  left: 40px;
}

.gameLoader select {
  font-size: 20pt;
}

.gameLoader select option {
  font-size: 20pt;
}

.shortcuts {
  position: absolute;
  z-index: 2;
  font-size: 16pt;
  color: greenyellow;
  bottom: 50px;
  left: 40px;
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

.three-scene {
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  display: block;
  z-index: 1;
}
</style>
