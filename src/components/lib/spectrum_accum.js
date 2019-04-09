import Component from "./component"
export default class extends Component {
  constructor () {
    super(...arguments);
    this.accum = [];
    this.idx = 0;
    this.count = 0;
    this.cells = 64;

    this.span = 4;
  }
  draw_internal ({buf_freq_log}) {
    if(this.count++ >= this.span) {
      this.count = 0;
      this.accum[this.idx] = [];
      for(let i=0; i<this.length; i++) {
        this.accum[this.idx][i] = buf_freq_log[i];
      }
      this.idx ++;
      if(this.idx === this.cells) {
        this.idx = 0;
      }
    }
    for(let cnt=0; cnt<this.cells; cnt++) {
      const ih = (cnt+this.idx) % this.cells;
      const h = cnt * this.height / this.cells;
      if(this.accum[ih] && typeof this.accum[ih].find(v => v>0) !== "undefined") {
        for(let i=0; i<this.length; i++) {
          const [p,q] = [this.pos[i],this.pos[i+1]];
          const pw_linear = this.accum[ih][i] / 255;
          this.ctx.fillStyle=`hsla(240,60%,60%,${pw_linear})`;
          this.ctx.fillRect(p,h,q-p,(this.height/this.cells));
        }
      }

    }
  }
}