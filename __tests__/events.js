import Event from '../src/lib/events';

describe('Event class', () => {
  const event = new Event();
  it('should create Event instanse', () => {
    expect(event.handlers).toEqual({});
  });
  it('should add event', () => {
    event.on('test', jest.fn());
    expect(event.handlers.test).toBeInstanceOf(Array);
  });
  it('should remove event', () => {
    event.off('test');
    expect(event.handlers.test).toBeUndefined;
  });
  it('should trigger event', () => {
    const cb = jest.fn();
    event.on('test', cb);
    expect(event.trigger('test')).toBeTruthy;
    expect(cb).toBeCalled();
    event.off('test');
  });
  it('should trigger event with param', () => {
    const cb = jest.fn();
    event.on('test', cb);
    event.trigger('test', ['param']);
    expect(cb.mock.calls[0]).toEqual(['param']);
  });
  it('should return true when trigger undefined event', () => {
    expect(event.trigger('adf')).toBeTruthy;
  });
});
