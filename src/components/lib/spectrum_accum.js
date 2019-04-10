import Component from "./component"
export default class extends Component {
  constructor () {
    super(...arguments);
    this.idx = 0;
    this.count = 0;
    this.cells = 64;
    this.accum = [];

    this.span = 3;
    this.f_amp_log = false;
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
      if(this.tmp.findIndex(v => v < 0 || v > 255) >= 0) {
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
          const pw = (() => {
            const w = this.accum[ih][i];
            if(this.f_amp_log) {
              const p = 5;
              return Math.log(w/p + 1) / Math.log(255/p + 1);
            } else { return w / 255; }
          })();
          this.ctx.fillStyle=`hsla(${220 + pw * 60},60%,60%,${pw})`;
          this.ctx.fillRect(p,h,q-p,(this.height/this.cells));
        }
      }
    }
  }
}