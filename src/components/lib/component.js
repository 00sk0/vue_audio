export default class {
  constructor({width,height,length,pos,ctx}) {
    this.width = width;
    this.height = height;
    this.length = length;
    this.pos = pos;
    this.ctx = ctx;

    this.on = true;
  }
  draw (obj) {
    this.ctx.save();
    if(this.on) this.draw_internal(obj);
    this.ctx.restore();
  }
  draw_internal() {
    console.error("to be implemented");
  }
  toggle () {
    this.on = !this.on;
  }
}