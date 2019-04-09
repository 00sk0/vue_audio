export default class {
  constructor() {
    this.inited = false;
    this.on = true;
  }
  init_log ({arg_log:{width,height,length,pos,ctx}}) {
    this.inited = true;
    this.width = width;
    this.height = height;
    this.length = length;
    this.pos = pos;
    this.ctx = ctx;
  }
  init_linear ({arg_linear:{width,height,length,pos,ctx}}) {
    this.inited = true;
    this.width = width;
    this.height = height;
    this.length = length;
    this.pos = pos;
    this.ctx = ctx;
  }
  init (args) {
    this.init_log(args);
  }
  draw (obj) {
    this.ctx.save();
    if(this.inited && this.on) this.draw_internal(obj);
    this.ctx.restore();
  }
  draw_internal() {
    throw new Error("to be implemented");
  }
  toggle () {
    this.on = !this.on;
  }
}