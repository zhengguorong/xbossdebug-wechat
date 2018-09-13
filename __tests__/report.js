import Report from '../src/lib/report';
import Config from '../src/lib/config';

global.wx = {
  request: jest.fn(({ success }) => {
    success && success();
  }),
};

const report = new Report();
const { config } = new Config();
describe('Report constructor', () => {
  it('should init errorQueue', () => {
    expect(report.errorQueue).toEqual([]);
  });
  it('should init repeatList', () => {
    expect(report.repeatList).toEqual({});
  });
  it('should init config', () => {
    expect(report.config).toEqual(config);
  });
  it('should init log debug info warn error method', () => {
    expect(report).toHaveProperty('log');
    expect(report).toHaveProperty('debug');
    expect(report).toHaveProperty('info');
    expect(report).toHaveProperty('warn');
    expect(report).toHaveProperty('error');
  });
});

describe('repeat method', () => {
  it('should return false when not over config.repeat', () => {
    expect(report.repeat(new Error('test'))).toBe(false);
  });
  it('should return true when over config.repeat', () => {
    report.config.repeat = 1;
    report.repeat(new Error('test'));
    expect(report.repeat(new Error('test'))).toBe(true);
  });
});

describe('except method', () => {
  it('should return false when error not in config.execpt', () => {
    expect(report.except(new Error('test'))).toBe(false);
  });
  it('should return true when error defined in config.expect', () => {
    expect(report.except({ msg: 'Script error' })).toBe(true);
  });
});

describe('request method', () => {
  it('should throw Error when key in undefined', () => {
    report.config.key = '';
    try {
      report.request();
    } catch (err) {
      expect(err.message).toBe('please set key in xbossdebug.config.key');
    }
    report.config.key = 'test';
  });
  it('should excute wx.request', () => {
    const cb = jest.fn();
    report.request('url', {}, cb);
    expect(wx.request).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });
  it('should callback when wx.request success', () => {
    const cb = jest.fn();
    report.request('url', {}, cb);
    expect(cb).toHaveBeenCalled();
  });
});


describe('report method', () => {
  it('should return config.url when errorQueue.length equal 0', () => {
    expect(report.report()).toBe(report.config.url);
  });
  it('should callback when after request', () => {
    const cb = jest.fn();
    report.report(cb);
    expect(cb).toHaveBeenCalled();
  });
});
