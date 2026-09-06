<template>
  <div class="control-plane-container">
    <svg width="180" height="600" viewBox="0 0 180 600">
      <line x1="30" y1="0" x2="30" y2="600" stroke="grey" stroke-width="2" stroke-dasharray="2 6"
        stroke-linecap="round" />
      <line x1="90" y1="0" x2="90" y2="600" stroke="grey" stroke-width="2" stroke-dasharray="2 6"
        stroke-linecap="round" />
      <line x1="150" y1="0" x2="150" y2="600" stroke="grey" stroke-width="2" stroke-dasharray="2 6"
        stroke-linecap="round" />

      <circle cx="30" cy="550" r="20" stroke="#FF0000" :fill="isXPressed? '#FF0000': 'none'" />
      <circle cx="90" cy="550" r="20" stroke="#00FF00" :fill="isYPressed? '#00FF00': 'none'" />
      <circle cx="150" cy="550" r="20" stroke="#0000FF" :fill="isZPressed? '#0000FF': 'none'" />

      <circle cx="30" cy="0" r="20" fill="#FF0000" fill-opacity="0.5" stroke="#FFFFFF"/>
      <circle cx="90" cy="0" r="20" fill="#00FF00" fill-opacity="0.5" stroke="#FFFFFF"/>
      <circle cx="150" cy="0" r="20" fill="#0000FF" fill-opacity="0.5" stroke="#FFFFFF"/>
    </svg>
  </div>
  <div class="elapsedTime">
    Time(s): {{ elapsedTime }}
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
  height: 600px;
  background-color: rgba(255, 255, 255, 0.048);
  z-index: 2;
}

.control-plane-container svg {
  position: relative;
  left: 10px;
}

.elapsedTime {
  top: 670px;
  z-index: 2;
  position: absolute;
  color: white;
  right: 100px;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({
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
    type: String,
    default: "0"
  }
});

onMounted(() => {

});

onBeforeUnmount(() => {
});
</script>
