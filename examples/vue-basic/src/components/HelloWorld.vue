<script setup lang="ts">
import { ref, computed } from 'vue'

// Intentional errors for testing
const unusedConst = 'unused variable warning'

interface Props {
  msg: string
}

const props = defineProps<Props>()

const count = ref(0)

// Intentional error: unused computed
const unusedComputed = computed(() => {
  return count.value * 2
})
</script>

<template>
  <div class="hello">
    <h2>{{ props.msg }}</h2>

    <div class="counter">
      <p>Count: {{ count }}</p>
      <button @click="count++">Increment</button>
    </div>

    <!-- Intentional error: duplicate key in v-for -->
    <div v-for="i in [1, 2, 3]" :key="i">
      Item {{ i }}
    </div>
  </div>
</template>

<style scoped>
.hello {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 20px;
}

.counter {
  margin: 20px 0;
}

button {
  padding: 8px 16px;
  cursor: pointer;
}
</style>
