/**
 * 事件管理器
 */
let Events = (supperclass) => class extends supperclass {
  constructor(options) {
    super(options)
    this.handlers = {};
  }
  /**
   * 事件注册
   * @param {*} event 事件名字
   * @param {*} handlers 执行函数
   */
  on(event, handlers) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
    return this.handlers[event];
  }
  /**
   * 事件注销
   * @param {*} event 事件名字
   */
  off(event) {
    if (this.handlers[event]) {
      delete this.handlers[event];
    }
  }
  /**
   * 触发事件
   * @param {*} event 事件名字
   * @param {*} args 执行参数
   */
  trigger(event, args) {
    let arg = args || [];
    let funcs = this.handlers[event];
    if (funcs) {
      return funcs.every(f => {
        var ret = f.apply(this, arg);
        return ret === false ? false : true;
      });
    }
    return true;
  }
}
export default Events;
