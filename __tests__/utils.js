import utils from '../src/lib/utils';

describe('utils', () => {
  it('should return true when set string to typeDecide', () => {
    const type = utils.typeDecide('test', 'String');
    expect(type).toBe(true);
  });
  it('should return true when set fn to isFunction', () => {
    expect(utils.isFunction(() => {})).toBe(true);
  });
  it('should return true when set string to isString', () => {
    expect(utils.isString('test')).toBe(true);
  });
  it('should return serialize when set obj to serializeObj', () => {
    const result = utils.serializeObj({ test: 'abc' });
    expect(result).toBe('test%3Dabc');
  });
  it('should return serialize when set nesting obj to serializeObj', () => {
    const result = utils.serializeObj({ test: { subTest: 'abc' } });
    expect(result).toBe('test%3D%7B%22subTest%22%3A%22abc%22');
  });
  it('should assign when set diff key obj to assignObject', () => {
    const testA = { testA: 'abc' };
    const testB = { testB: '123' };
    const targetObject = { testA: 'abc', testB: '123' };
    expect(utils.assignObject(testA, testB)).toEqual(targetObject);
  });
  it('should cover when set the same key obj to assignObject', () => {
    const testA = { testA: 'abc' };
    const testB = { testA: '123' };
    const targetObject = { testA: '123' };
    expect(utils.assignObject(testA, testB)).toEqual(targetObject);
  });
  it('should return empty fn', () => {
    expect(utils.noop).toBeInstanceOf(Function);
  });
  it('should return now date', () => {
    expect(utils.now()).toBeDefined;
  });
});
