import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

// Intentional ESLint error: unused variable
const unusedVar = 'this should trigger a warning'

// Intentional ESLint error: console statement
console.log('This should trigger a console warning')
