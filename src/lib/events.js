/**
 * 事件管理器
 */
class Events {
  constructor() {
    this.handlers = {};
  }

  /**
   * 事件注册
   * @param {*} event 事件名字
   * @param {*} handlers 执行函数
   */
  on(event, handlers) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handlers);
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
    const arg = args || [];
    const funcs = this.handlers[event];
    if (funcs) {
      return funcs.every((f) => {
        const ret = f.apply(this, arg);
        return ret !== false;
      });
    }
    return true;
  }
}
export default Events;
