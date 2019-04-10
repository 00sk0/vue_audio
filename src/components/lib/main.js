export default class {
  constructor () {
    this.fft_size = 2048;
  }
  init ({width,height,ctx,audio,components}) {
    this.width = width;
    this.height = height;
    this.cctx = ctx;
    this.init_nodes(audio);
    const LEN = this.anlz.frequencyBinCount;
    this.length = LEN;
    const [LOGLEN,xs] = this.calc_log();
    this.length_log = LOGLEN;
    this.buf_time = new Uint8Array(LEN);
    this.buf_freq = new Uint8Array(LEN);
    this.buf_freq_log = new Uint8Array(LOGLEN);
    this.components = this.init_components(xs, components);

    this.filtering = false;
    this.loop ();
  }
  init_nodes (elm_audio) {
    const actx = new AudioContext();
    const out  = actx.createGain();
    out.connect(actx.destination);

    const filter = actx.createBiquadFilter();
    filter.type = "highshelf";
    filter.connect(out);

    const anlz = actx.createAnalyser();
    anlz.fftSize = this.fft_size;
    out.connect(anlz);

    const audio = actx.createMediaElementSource(elm_audio);
    audio.connect(filter);

    this.actx = actx;
    this.anlz = anlz;
    this.out  = out;
    this.filter = filter;
    this.filter_count = 0;
    this.filter_center = 0;
    this.filter_amp = 0;
    this.filter_lfreq = 0;
    this.audio = audio;
  }
  init_components (pos_log, comp_init) {
    const [LEN,LOGLEN] = [this.length,this.length_log];
    const pos_linear = Array.from({length:LEN}, (_,i) => i*this.width/LEN);
    pos_linear.push(this.width);
    const arg_linear = {
      width: this.width,
      height: this.height,
      length: LEN,
      pos: pos_linear,
      ctx: this.cctx
    };
    const arg_log = {
      width: this.width,
      height: this.height,
      length: LOGLEN,
      pos: pos_log,
      ctx: this.cctx
    };
    const args = {arg_linear, arg_log};
    return comp_init.map(cp => {cp.init(args); return cp});
  }
  update_filter (freq_center,freq_amp,freq_freq) {
    this.filter_center = freq_center;
    this.filter_amp = freq_amp;
    this.filter_lfreq = freq_freq;
  }
  toggle_filter (freq_center,freq_amp,freq_freq) {
    const actx = this.actx;
    if(this.filtering) {
      this.filtering = false;
      this.filter.frequency.cancelScheduledValues(actx.currentTime);
      this.filter.gain.cancelScheduledValues(actx.currentTime);
      this.filter.Q.cancelScheduledValues(actx.currentTime);
      this.filter.type = "highshelf";
      this.filter.frequency.setValueAtTime(0,actx.currentTime);
      this.filter.gain.setValueAtTime(0,actx.currentTime);
    } else {
      this.filtering = true;
      this.filter.Q.setValueAtTime(4,actx.currentTime);
      this.filter_center = freq_center;
      this.filter_amp = freq_amp;
      this.filter_lfreq = freq_freq;
      this.filter.type = "lowpass";
    }
    return this.filtering;
  }
  loop () {
    if(
      this.filtering && this.filter.type === "lowpass"
      && this.filter_lfreq >= 1
    ) {
      const actx = this.actx;
      this.filter.frequency.cancelScheduledValues(actx.currentTime);
      this.filter.gain.cancelScheduledValues(actx.currentTime);
      this.filter.Q.cancelScheduledValues(actx.currentTime);
      const freq =
        (this.filter_center * 1.0)
        + (this.filter_amp * 1.0)
        * Math.sin(this.filter_count / this.filter_lfreq * 2 * Math.PI);
      this.filter.frequency.setValueAtTime(
        freq,
        this.actx.currentTime
      );
    }
    if(this.filter_count++ >= this.filter_lfreq) {
      this.filter_count = 0;
    }
    this.anlz.getByteTimeDomainData(this.buf_time);
    this.anlz.getByteFrequencyData(this.buf_freq);
    this.update_buf_freq_log();

    const dat = {
      buf_time: this.buf_time,
      buf_freq: this.buf_freq,
      buf_freq_log: this.buf_freq_log
    };
    this.cctx.clearRect(0,0,this.width,this.height);
    this.components.forEach(c => c.draw(dat));

    requestAnimationFrame(this.loop.bind(this));
  }

  x_calc (i) {
    if (i===0) {return 0}
    else {
      return Math.log(i) * this.width / Math.log(this.length)
    }
  }
  update_buf_freq_log () {
    let prev = 0;
    let sum_amp = 0;
    let sum_len = 0;
    let idx = 0;
    for(let i=0; i<this.buf_freq.length; i++) {
      const v = this.buf_freq[i];
      const x = this.x_calc(i);
      const w = this.x_calc(i+1) - x;
      if (x+w - prev < 4) {
        sum_len ++;
        sum_amp += v;
      } else {
        this.buf_freq_log[idx] = (sum_amp + v) / (sum_len + 1);
        idx ++;
        prev = x+w;
        sum_len = 0;
        sum_amp = 0;
      }
    }
  }
  calc_log () {
    let prev = 0;
    // eslint-disable-next-line
    let sum_len = 0;
    let xs = [];
    let idx = 0;
    for(let i=0; i<this.length; i++) {
      const x = this.x_calc(i);
      const w = this.x_calc(i+1) - x;
      if (x+w - prev < 4) {
        sum_len ++;
      } else {
        idx ++;
        xs.push(prev);
        prev = x+w;
        sum_len = 0;
      }
    }
    xs.push(this.width);
    return [idx, xs];
  }
}