<template>
  <div class="control-plane-container">
    <div class="control-plane">
      This is a new DIV
    </div>
  </div>
</template>

<style scoped>
.control-plane-container {
  position: absolute;
  top: 20px;
  right: 40px;

  border-radius: 10px;

  width: 200px;
  height: calc(100vh - 40px);

  display: block;

  border: 1px solid;
  background-color: white;
  z-index: 2;
}

.control-plane {
  padding:10px;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
onMounted(() => {

});

onBeforeUnmount(() => {
});
</script>
