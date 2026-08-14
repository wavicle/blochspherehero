<template>
  <h3 class="floating-h3">
    Press the x, y, z keys to change the state of the qubit.
  </h3>
  <canvas ref="canvas" class="three-scene" />
</template>

<style scoped>
.floating-h3 {
  position: absolute;
  left: 40px;
  top:40px;
  width: 500px;
  color: white;
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

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Scene3d, type TimeInfo } from '../lib3d/Scene3d.ts';
import { createArrow, createAxesHelper, createBlochSphereGrid } from '../lib3d/builders.ts';
import { Vector3 } from 'three';
import { applyControlSingleQubit, singleQubitStateToBloch, type ControlInstruction, type StaticInstruction } from '../physics/singlequbit.ts';
import { complex, type Complex } from 'mathjs';
import { keyPresses } from '../physics/keydetector.ts';

const canvas = ref<HTMLCanvasElement | null>(null)
let scene: Scene3d | null = null;

const staticInstr: StaticInstruction = { gamma: 2.675 * (10 ** 8), B0: 2.0 };

onMounted(() => {
  scene = new Scene3d({ canvasElement: canvas.value!, timeMultiplier: 1e-4 });

  scene.add(createBlochSphereGrid());
  scene.add(createAxesHelper());

  let qubit_state: [Complex, Complex] = [complex(1, 0), complex(0, 0)];
  const arrow = createArrow({
    origin: new Vector3(0, 0, 0),
    direction: singleQubitStateToBloch(qubit_state),
    length: 1.5,
    color: 0xFF0000
  });
  scene.add(arrow);

  scene.startAnimation((time: TimeInfo) => {
    const Bx = keyPresses['KeyX'] ? 2.5 * (10 ** (-5)) : 0;
    const By = keyPresses['KeyY'] ? 2.5 * (10 ** (-5)) : 0;
    const Bz = keyPresses['KeyZ'] ? 2.5 * (10 ** (-5)) : 0;

    if (Bx > 0 || By > 0 || Bz > 0) {
      const ctrlInstr: ControlInstruction = {
        t: time.delta,
        wRF: staticInstr.gamma * staticInstr.B0,
        Bx: Bx,
        By: By,
        Bz: Bz,
      };
      qubit_state = applyControlSingleQubit(qubit_state, staticInstr, ctrlInstr);
      arrow.setDirection(singleQubitStateToBloch(qubit_state));
    }
  });
});

onBeforeUnmount(() => {
  scene?.dispose();
});
</script>
