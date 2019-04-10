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
      <p>
        <span v-for="cp in components" :key="cp.name">
          <input type="checkbox" :id="cp.name" v-model="cp.cont.on" />
          <label :for="cp.name">{{ cp.name }}</label>
        </span>
        |
        Accum_interval: <input type="text" v-model="components[0].cont.interval">
        Accum_amp_log: <input type="checkbox" v-model="components[0].cont.f_amp_log">
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
import SpectrumBar from "./lib/spectrum_bar";
import SpectrumCircle from "./lib/spectrum_circle"
import SpectrumAccum from "./lib/spectrum_accum"

export default {
  name: 'Visualizer',
  data () {
    const components = [
      {name: "Accum",  cont: new SpectrumAccum()},
      {name: "Bar",    cont: new SpectrumBar()},
      {name: "Circle", cont: new SpectrumCircle()},
    ];
    return {
      ist: new Main(),
      filtering: false,
      filter: {
        center: 1200,
        amp: 500,
        lfreq: 50,
      },
      components,
      accum_idx: components.findIndex(({name}) => name === "Accum")
      // audio_src: require("../assets/test.wav"),
    }
  },
  mounted () {
    const cv    = document.getElementById("canvas");
    const audio = document.getElementById("audiosource");
    audio.addEventListener("play", () => {
      this.ist.init ({
        width:  cv.width,
        height: cv.height,
        ctx: cv.getContext("2d"),
        components: this.components.map(({cont}) => cont),
        audio
      })
    }, {once: true});
  },
  watch: {
    filter: {
      handler: function() {
        this.ist.update_filter(
          this.filter.center,this.filter.amp,this.filter.lfreq
        );
      },
      deep: true
    }
  },
  methods: {
    loadAudio (ev) {
      const reader = new FileReader();
      const file = ev.target.files[0];
      if(!file || !file.type.match("audio.*")) return;
      reader.onload = function(ev) {
        const content = ev.target.result;
        document.getElementById("audiosource").src = content;
      };
      reader.readAsDataURL(file);
    },
    toggle () {
      this.filtering = this.ist.toggle_filter(
        this.filter.center,this.filter.amp,this.filter.lfreq
      );
    },
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


