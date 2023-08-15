<script setup lang="ts">
import HelloWorld from './components/hello-world.vue';

defineOptions({
  name: 'App',
});
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" class="mx-auto" />
  <hello-world msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
