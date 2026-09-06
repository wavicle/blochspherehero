<script setup lang="ts">
import { SOLE_ANIMATOR } from '../physics/config.ts';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue'
import { Scene3d } from '../lib3d/Scene3d.ts';
import { type TimeInfo } from '../lib3d/animator.ts';
import { BLOCH_SPHERE_RADIUS, createArrow, createAxesHelper, createBlochSphereGrid } from '../lib3d/builders.ts';
import { Vector3 } from 'three';
import { applyControlSingleQubit, singleQubitStateToBloch, type ControlInstruction, type StaticInstruction } from '../physics/singlequbit.ts';
import { complex } from 'mathjs';
import { keyPresses } from '../physics/keydetector.ts';
import ControlPlane from './ControlPlane.vue';
import { SingleQubitState } from '../physics/single_qubit_state.ts';

const isXPressed = ref(false);
const isYPressed = ref(false);
const isZPressed = ref(false);

const elapsedTime = ref(0);

const isAnimationPaused = ref(true);

const canvas = ref<HTMLCanvasElement | null>(null)
let scene: Scene3d | null = null;

const staticInstr: StaticInstruction = { gamma: 2.675 * (10 ** 8), B0: 2.0 };

const qubitStateRef = shallowRef(new SingleQubitState(complex(1, 0), complex(0, 0)));

const qubitC1Display = computed(() => {
  const value = qubitStateRef.value;
  const c0 = value.c0;
  return `(${c0.re.toFixed(2)} + ${c0.im.toFixed(2)}i) |0>`;
});

const qubitC2Display = computed(() => {
  const value = qubitStateRef.value;
  const c1 = value.c1;
  return `(${c1.re.toFixed(2)} + ${c1.im.toFixed(2)}i) |1>`;
});

onMounted(() => {
  const animationLogic = {
    execute(timeInfo: TimeInfo) {
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
        const newQubitState = applyControlSingleQubit(qubitStateRef.value, staticInstr, ctrlInstr);
        arrow.setDirection(singleQubitStateToBloch(newQubitState));
        qubitStateRef.value = newQubitState;
      }
    }
  };

  scene = new Scene3d({ canvasElement: canvas.value!, animator: SOLE_ANIMATOR, animationLogic });

  scene.add(createBlochSphereGrid());
  scene.add(createAxesHelper());

  const arrow = createArrow({
    origin: new Vector3(0, 0, 0),
    direction: singleQubitStateToBloch(qubitStateRef.value),
    length: BLOCH_SPHERE_RADIUS,
    color: 0xFFA500,
    opacity: 1.0
  });
  scene.add(arrow);

  scene.render();
});

function handleReset() {
  SOLE_ANIMATOR.restart();
  isAnimationPaused.value = false;
}

function handlePause() {
  SOLE_ANIMATOR.pause();
  isAnimationPaused.value = true;
}

function handleResume() {
  SOLE_ANIMATOR.resume();
  isAnimationPaused.value = false;
}

onBeforeUnmount(() => {
  scene?.dispose();
});
</script>

<template>
  <div class="currentState">
    <code>Current State: <br/>
    {{ qubitC1Display }} <br/>
    {{ qubitC2Display }}
    </code>
  </div>
  <ControlPlane :is-x-pressed="isXPressed" :is-y-pressed="isYPressed" :is-z-pressed="isZPressed"
    :elapsed-time="elapsedTime.toFixed(6)" />
  <canvas ref="canvas" class="three-scene" />

  <div class="animationMsg">
    {{ isAnimationPaused ? 'Press start/resume to continue' : '' }}
  </div>

  <div class="btnStart" @click="handleReset">
    (Re)Start
  </div>

  <div class="btnPause" @click="handlePause">
    Pause
  </div>

  <div class="btnResume" @click="handleResume">
    Resume
  </div>
</template>

<style scoped>
.animationMsg {
  position: absolute;
  z-index: 2;
  font-size: 24pt;
  color: red;
  bottom: 100px;
  left: 100px;
}

.btnStart {
  position: absolute;
  z-index: 2;
  font-size: 24pt;
  color: greenyellow;
  bottom: 50px;
  left: 100px;
  text-decoration: underline;
  cursor: pointer;
}

.btnPause {
  position: absolute;
  z-index: 2;
  font-size: 24pt;
  color: greenyellow;
  bottom: 50px;
  left: 240px;
  text-decoration: underline;
  cursor: pointer;
}

.btnResume {
  position: absolute;
  z-index: 2;
  font-size: 24pt;
  color: greenyellow;
  bottom: 50px;
  left: 340px;
  text-decoration: underline;
  cursor: pointer;
}

.floating-h3 {
  position: absolute;
  left: 40px;
  top: 40px;
  width: 500px;
  color: white;
  z-index: 2;
}

.currentState {
  border-color: greenyellow;
  border: 1px solid;
  padding: 5px;
  border-radius: 5px;
  color: greenyellow;
  position: absolute;
  left: 100px;
  top: 60px;
  font-size: 12pt;
  z-index: 2;
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
