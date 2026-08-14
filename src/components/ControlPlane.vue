<template>
  <div class="control-plane">
    Hello
  </div>
</template>

<style scoped>
.control-plane {
  position: absolute;
  top: 20px;
  right: 40px;

  width: 200px;
  height: calc(100vh - 40px);

  display: block;

  border: 1px solid;
  background-color: white;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
onMounted(() => {

});

onBeforeUnmount(() => {
});
</script>
