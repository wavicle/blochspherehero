<script setup lang="ts">
const laneLength = ref(LANE_LENGTH_PX);

import { onBeforeUnmount, onMounted, ref, type PropType } from 'vue'
import { LANE_LENGTH as LANE_LENGTH_PX, LANE_SPEED_PX_PER_COMPUTER_S, TIME_MULTIPLIER } from '../physics/config';
import type { Dumbbell } from '../physics/singlequbit';

const props = defineProps({
  isXPressed: {
    type: Boolean,
    default: false
  },
  isYPressed: {
    type: Boolean,
    default: false
  },
  isZPressed: {
    type: Boolean,
    default: false
  },
  elapsedTime: {
    type: Number,
    default: 0
  },
  dumbbellsByAxis: {
    type: Object as PropType<{ [key: string]: Dumbbell[] }>,
    default: { 'x': [], 'y': [], 'z': [] }
  }
});

onMounted(() => {

});

onBeforeUnmount(() => {
});

interface DumbbellGraphics {
  cy1: number, cy2: number
}

function computeDumbbellGraphics(dumbbells: Dumbbell[], elapsedS: number) {
  const dumbbellGraphics: DumbbellGraphics[] = []
  for (const dumbbell of dumbbells) {
    dumbbellGraphics.push({
      cy1: calcY1(dumbbell, elapsedS),
      cy2: calcY2(dumbbell, elapsedS)
    })
  }
  return dumbbellGraphics;
}

function calcY1(dumbbell: Dumbbell, elapsedS: number) {
  const computerTimeS = (dumbbell.startTimeS - elapsedS) / TIME_MULTIPLIER;
  return LANE_LENGTH_PX - LANE_SPEED_PX_PER_COMPUTER_S * computerTimeS;
}

function calcY2(dumbbell: Dumbbell, elapsedS: number) {
  const computerTimeS = (dumbbell.endTimeS - elapsedS) / TIME_MULTIPLIER;
  return LANE_LENGTH_PX - LANE_SPEED_PX_PER_COMPUTER_S * computerTimeS;
}
</script>

<template>
  <div class="control-plane-container">
    <svg width="180" height="550" viewBox="0 0 180 550">
      <line x1="30" y1="0" x2="30" y2="550" stroke="grey" stroke-width="2" stroke-dasharray="2 6"
        stroke-linecap="round" />
      <line x1="90" y1="0" x2="90" y2="550" stroke="grey" stroke-width="2" stroke-dasharray="2 6"
        stroke-linecap="round" />
      <line x1="150" y1="0" x2="150" y2="550" stroke="grey" stroke-width="2" stroke-dasharray="2 6"
        stroke-linecap="round" />

      <circle cx="30" :cy="laneLength" r="20" stroke="#FF0000" :fill="isXPressed ? '#FF0000' : 'none'" />
      <circle cx="90" :cy="laneLength" r="20" stroke="#00FF00" :fill="isYPressed ? '#00FF00' : 'none'" />
      <circle cx="150" :cy="laneLength" r="20" stroke="#0000FF" :fill="isZPressed ? '#0000FF' : 'none'" />

      <template v-for="(dumbbell, index) in computeDumbbellGraphics(dumbbellsByAxis['x'], props.elapsedTime)"
        :key="index">
        <line x1="30" x2="30" :y1="dumbbell.cy1" :y2="dumbbell.cy2" stroke="white" stroke-width="5"
          stroke-linecap="round" opacity="0.5" />
        <circle cx="30" :cy="dumbbell.cy1" r="20" fill="#FF0000" fill-opacity="0.5" stroke="#FFFFFF" />
        <circle cx="30" :cy="dumbbell.cy2" r="20" fill="#FF0000" fill-opacity="0.5" stroke="#FFFFFF" />
      </template>
      <template v-for="(dumbbell, index) in computeDumbbellGraphics(dumbbellsByAxis['y'], props.elapsedTime)"
        :key="index">
        <line x1="90" x2="90" :y1="dumbbell.cy1" :y2="dumbbell.cy2" stroke="white" stroke-width="5"
          stroke-linecap="round" opacity="0.5" />
        <circle cx="90" :cy="dumbbell.cy1" r="20" fill="#00FF00" fill-opacity="0.5" stroke="#FFFFFF" />
        <circle cx="90" :cy="dumbbell.cy2" r="20" fill="#00FF00" fill-opacity="0.5" stroke="#FFFFFF" />
      </template>
      <template v-for="(dumbbell, index) in computeDumbbellGraphics(dumbbellsByAxis['z'], props.elapsedTime)"
        :key="index">
        <line x1="150" x2="150" :y1="dumbbell.cy1" :y2="dumbbell.cy2" stroke="white" stroke-width="5"
          stroke-linecap="round" opacity="0.5" />
        <circle cx="150" :cy="dumbbell.cy1" r="20" fill="#0000FF" fill-opacity="0.5" stroke="#FFFFFF" />
        <circle cx="150" :cy="dumbbell.cy2" r="20" fill="#0000FF" fill-opacity="0.5" stroke="#FFFFFF" />
      </template>

    </svg>
  </div>
  <div class="elapsedTime">
    Physical Time(s): {{ elapsedTime.toFixed(6) }} <br>
  </div>
</template>

<style scoped>
.control-plane-container {
  position: absolute;
  top: 60px;
  right: 40px;

  border-radius: 10px;
  border: 1px solid greenyellow;

  width: 200px;
  height: 550px;
  background-color: rgba(255, 255, 255, 0.048);
  z-index: 2;
}

.control-plane-container svg {
  position: relative;
  left: 10px;
}

.elapsedTime {
  z-index: 2;
  font-size: 20pt;
  position: absolute;
  color: white;
  top: 60px;
  right: 300px;
}
</style>
