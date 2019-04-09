<template>
  <div id="main">
    <canvas id="canvas" width="640px" height="360px"></canvas>
    <div id="ctrls">
      <p>
        <audio controls id="audiosource"
        ></audio>
          <!-- :src="audio_src" -->
        <input type="file" id="audiofile" accept="audio/*" v-on:change="loadAudio">
      </p>
      <p>filter: {{filtering ? "on" : "off"}}.
        <button v-on:click="toggle">toggle</button></p>
      <p>
        filter_lfo_center=<input type="text" v-model="filter.center">[Hz],
        filter_lfo_amp=<input type="text" v-model="filter.amp">[Hz],
        filter_lfo_freq=<input type="text" v-model="filter.lfreq">[count].
      </p>
    </div>
  </div>
</template>

<script>
import Main from './lib/main'

export default {
  name: 'Visualizer',
  data () {
    return {
      ist: new Main(),
      filtering: false,
      filter: {
        center: 1200,
        amp: 500,
        lfreq: 50,
      },
      // audio_src: require("../assets/test.wav"),
    }
  },
  mounted () {
    const cv = document.getElementById("canvas");
    this.ist.init ({
      width: cv.width,
      height: cv.height,
      ctx: cv.getContext("2d"),
      audio: document.getElementById("audiosource")
    });
  },
  watch: {
    filter: {
      handler: function() {
        this.ist.update_filter(this.filter.center,this.filter.amp,this.filter.lfreq);
      },
      deep: true
    }
  },
  methods: {
    loadAudio (event_newfile) {
      const reader = new FileReader();
      reader.onload = function(event_readfile) {
        const file = event_readfile.target.result;
        document.getElementById("audiosource").src = file;
      };
      reader.readAsDataURL(event_newfile.target.files[0]);
    },
    toggle () {
      this.filtering = this.ist.toggle_filter(this.filter.center,this.filter.amp,this.filter.lfreq);
    }
  }
}
</script>

<style scoped>
input[type="text"] {
  width: 3rem;
}
#canvas {
  margin: 0 auto 0;
}
</style>


