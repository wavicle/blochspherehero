<template>
  <canvas ref="canvas" class="three-scene" />
  <ControlPlane />
</template>

<style scoped>
.three-scene {
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  display: block;
}
</style>

<script setup lang="ts">
import ControlPlane from './ControlPlane.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Scene3d } from '../lib3d/Scene3d.ts';
import { createArrow, createAxesHelper, createBlochSphereGrid } from '../lib3d/builders.ts';
import { Vector3 } from 'three';

const worldZ = new Vector3(0, 0, 1);
const canvas = ref<HTMLCanvasElement | null>(null)
let scene: Scene3d | null = null;

onMounted(() => {
  scene = new Scene3d({ canvasElement: canvas.value! });

  scene.add(createBlochSphereGrid());
  scene.add(createAxesHelper());

  const arrow = createArrow({
    origin: new Vector3(0, 0, 0),
    direction: new Vector3(1, 1, 1),
    length: 1.5,
    color: 0xFF0000
  });
  scene.add(arrow);
  scene.startAnimation(() => {
    arrow.rotateOnWorldAxis(worldZ, 0.01);
  });
});

onBeforeUnmount(() => {
  scene?.dispose();
});
</script>
