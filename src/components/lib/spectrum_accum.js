import Component from "./component"
export default class extends Component {
  constructor () {
    super(...arguments);
    this.idx = 0;
    this.count = 0;
    this.cells = 64;
    this.accum = [];

    this.span = 3;
    this.amp_kind = "linear";
    this.log_coeff = 32;
    this.exp_base = 1.01;
  }
  init(args) {
    super.init(args);
    this.tmp = [...Array(this.length)].map(_ => 0);
  }
  get interval () { return this.span; }
  set interval (v) {
    this.span = v;
    this.tmp = [...Array(this.length)].map(_ => 0);
    this.count = 0;
  }
  draw_internal ({buf_freq_log}) {
    if(this.count++ >= this.span) {
      for(let i=0; i<this.length; i++) {
        this.tmp[i] += buf_freq_log[i];
        if(this.span >= 1) {
          this.tmp[i] /= this.count;
        }
      }
      if(this.tmp.findIndex(v => v < 0 || v > 1) >= 0) {
        throw new Error(`invalid value: [${this.tmp}]`);
      }
      this.accum[this.idx] = this.tmp.map(v => v);
      this.idx ++;
      if(this.idx === this.cells) {
        this.idx = 0;
      }
      this.tmp = [...Array(this.length)].map(_ => 0);
      this.count = 0;
    } else {
      for(let i=0; i<this.length; i++) {
        this.tmp[i] += buf_freq_log[i];
      }
    }
    for(let cnt=0; cnt<this.cells; cnt++) {
      const ih = (cnt+this.idx) % this.cells;
      const h  = cnt * this.height / this.cells;
      if(
        this.accum[ih]
        && typeof this.accum[ih].find(v => v>0) !== "undefined"
      ) {
        for(let i=0; i<this.length; i++) {
          const [p,q] = [this.pos[i],this.pos[i+1]];
          const volume = (() => {
            const w = this.accum[ih][i];
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