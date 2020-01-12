import Component from "./component"
const circle = (r,t,x=0,y=0) => [
  x + r * Math.cos(t * 2 * Math.PI - Math.PI / 2),
  y + r * Math.sin(t * 2 * Math.PI - Math.PI / 2),
];
export default class extends Component {
  draw_internal ({buf_freq_log}) {
    const
      cx = this.width/2,
      cy = this.height/2;
    const
      rd  = this.height * 3 / 16,
      amp = this.height * 1 / 4;
    this.ctx.fillStyle="hsla(120,60%,60%,0.8)";

    for(let i=0; i<this.length; i++) {
      const v = buf_freq_log[i];
      let [p,q] = [
        this.pos[i]   / this.width,
        this.pos[i+1] / this.width];
      const rot = 0;
      const
        [px,py] = circle(rd,p-rot,cx,cy),
        [qx,qy] = circle(rd,q-rot,cx,cy),
        [wx,wy] = circle(v*amp,(p+q)/2-rot);
      this.ctx.beginPath();
      this.ctx.moveTo(qx,qy);
      this.ctx.lineTo(px,py);
      this.ctx.lineTo(px+wx,py+wy);
      this.ctx.lineTo(qx+wx,qy+wy);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
}