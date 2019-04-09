import Component from "./component"
export default class extends Component {
  draw_internal ({buf_freq_log}) {
    this.ctx.fillStyle="hsla(0,60%,60%,0.8)";
    for(let i=0; i<this.length; i++) {
      const [l,r] = [
        this.pos[i],
        this.pos[i+1]];
      const v = buf_freq_log[i] * this.height / 255;
      this.ctx.fillRect(l,this.height - v,r-l,v);
    }
  }
}