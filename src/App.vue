<template>
  <div id="app">
    <visualizer></visualizer>
  </div>
</template>

<script>
import Visualizer from './components/Visualizer.vue'

export default {
  name: 'app',
  components: {
    Visualizer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
