<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

// Intentional error: unused variable
const unusedVar = 1

// Intentional error: any type
const anyTypeVar: any = 'test'

const count = ref(0)
</script>

<template>
  <div>
    <h1>Vite + Vue ESLint Overlay Example</h1>
    <p>This example demonstrates ESLint overlay functionality</p>

    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
      <p>
        Edit
        <code>src/App.vue</code>
        to test hot module replacement.
      </p>
    </div>

    <HelloWorld msg="ESLint Overlay Test" />
  </div>
</template>

<style scoped>
.card {
  padding: 2em;
}
</style>
