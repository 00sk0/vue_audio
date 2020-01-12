import Component from "./component"
export default class extends Component {
  constructor () {
    super(...arguments);
    this.idx = 0;
    this.count = 0;
    this.cells = 64; // # of histories
    this.histories = []; // ring buffer of length this.cells
    this.span = 3;
    this.processing = []; // data to be added to this.histories every this.span frames
    // config
    this.amp_kind = "linear";
    this.log_coeff = 32;
    this.exp_base = 1.01;
  }
  init(args) {
    super.init(args);
    this.processing = [...Array(this.length)].map(_ => 0);
  }
  get interval () { return this.span; }
  set interval (v) {
    this.span = v;
    // discard data currently being processed
    this.processing = [...Array(this.length)].map(_ => 0);
    this.count = 0;
  }
  draw_internal ({buf_freq_log}) {
    // processing...
    this.processing = this.processing.map((v,i) => v + buf_freq_log[i]);
    // add this.processing to this.histories
    if(this.count++ >= this.span) {
      this.processing = this.processing.map((v) => v / this.count);
      if(this.processing.findIndex(v => v < 0 || v > 1) >= 0) {
        throw new Error(`invalid value: [${this.processing}]`);
      }
      this.histories[this.idx] = this.processing.map(v => v);
      this.idx ++;
      if(this.idx === this.cells) { // ring buffer
        this.idx = 0;
      }
      this.processing = [...Array(this.length)].map(_ => 0);
      this.count = 0;
    }
    for(let cnt=0; cnt<this.cells; cnt++) {
      const ih = (cnt + this.idx) % this.cells;  // visual index of the data
      const h  = cnt * this.height / this.cells; // actual y coord in the canvas
      if(
        this.histories[ih]
        && typeof this.histories[ih].find(v => v>0) !== "undefined"
      ) {
        // render each freq components
        for(let i=0; i<this.length; i++) {
          const [p,q] = [this.pos[i],this.pos[i+1]];
          const volume = (() => {
            const w = this.histories[ih][i];
            console.assert(0 <= w && w <= 1);
            switch (this.amp_kind) {
              case "linear": { return w; }
              case "log": {
                const p = Math.pow(1.1, this.log_coeff);
                return Math.log(w*255/p + 1) / Math.log(255/p + 1);
              }
              case "exp": {
                const base = this.exp_base;
                return Math.pow(base, (w-1)*255);
              }
            }
          })();
          console.assert(0 <= volume && volume <= 1);
          this.ctx.fillStyle=`hsla(${205 + volume * 60},60%,60%,${volume})`;
          this.ctx.fillRect(p,h,q-p,(this.height/this.cells));
        }
      }
    }
  }
}