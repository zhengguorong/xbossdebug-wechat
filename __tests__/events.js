import Event from '../src/lib/events';

describe('Event class', () => {
  const event = new Event(null);
  it('构造函数执行正确', () => {
    expect(event.handlers).toEqual({});
  });
  it('加入监听事件成功', () => {
    event.on('test', jest.fn());
    expect(event.handlers.test).toBeInstanceOf(Array);
  });
  it('删除监听事件成功', () => {
    event.off('test');
    expect(event.handlers.test).toBeUndefined;
  });
  it('触发已定义事件', () => {
    const cb = jest.fn();
    event.on('test', cb);
    expect(event.trigger('test')).toBeTruthy;
    expect(cb).toBeCalled();
    event.off('test');
  });
  it('触发事件正确传递参数', () => {
    const cb = jest.fn();
    event.on('test', cb);
    event.trigger('test', ['param']);
    expect(cb.mock.calls[0]).toEqual(['param']);
  });
  it('触发未定义事件', () => {
    expect(event.trigger('adf')).toBeTruthy;
  });
});
