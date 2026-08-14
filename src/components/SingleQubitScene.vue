<template>
  <canvas ref="canvas" class="three-scene" />
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Scene3d } from '../lib3d/Scene3d';
import { createAxesHelper, createCube } from '../lib3d/builders';

const canvas = ref<HTMLCanvasElement | null>(null)
let scene: Scene3d | null = null;

onMounted(() => {
  scene = new Scene3d({ canvasElement: canvas.value! });
  const cube = createCube({ width: 1.5, height: 1.5, depth: 1.5 });
  scene.add(cube);
  scene.add(createAxesHelper());
  scene.startAnimation(() => {
    cube.rotation.z += 0.01;
  });
});

onBeforeUnmount(() => {
  scene?.dispose();
});
</script>
