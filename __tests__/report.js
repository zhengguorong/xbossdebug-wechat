import Report from '../src/lib/report';

const report = new Report();
report.config.key = 'test';
report.trigger = jest.fn();

describe('report', () => {
  it('should add log debug info warn error method when constructor', () => {
    expect(report).toHaveProperty('log');
    expect(report).toHaveProperty('debug');
    expect(report).toHaveProperty('info');
    expect(report).toHaveProperty('warn');
    expect(report).toHaveProperty('error');
  });
  it('should call handleMsg when call log', () => {
    jest.spyOn(report, 'handleMsg');
    report.log('error');
    expect(report.handleMsg).toBeCalled();
  });
  describe('setOptions method', () => {
    it('should return true ', () => {
      report.setOptions({
        version: '1.0.2'
      });
      expect(report.config.version).toEqual('1.0.2')
    });
  });
  describe('repeat method', () => {
    const error = new Error('test');
    it('should return false when not over config.repeat count', () => {
      expect(report.repeat(error)).toBeFalsy();
    });
    it('should return true when over config.repeat count', () => {
      report.config.repeat = 1;
      report.repeat(error);
      expect(report.repeat(error)).toBeTruthy();
    });
  });

  describe('except method', () => {
    it('should return false when config.except is not array', () => {
      const { except } = report.config;
      report.config.except = 'test';
      expect(report.except({ msg: 'test' })).toBeFalsy();
      report.config.except = except;
    });
    it('should return false when error not in config.except', () => {
      expect(report.except({ msg: 'test' })).toBeFalsy();
    });
    it('should return true when error defined in config.except', () => {
      expect(report.except({ msg: 'Script error' })).toBeTruthy();
    });
  });

  describe('request method', () => {
    it('should throw Error when key in undefined', () => {
      report.config.key = '';
      expect(() => {
        report.request();
      }).toThrowError('please set key in xbossdebug.config.key');
      report.config.key = 'test';
    });
    it('should callback when wx.request success', () => {
      const cb = jest.fn();
      wx.request.mockImplementationOnce(({ success }) => {
        success();
      });
      report.request('url', {}, cb);
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('report method', () => {
    it('should return config.url when errorQueue.length equal 0', () => {
      expect(report.report()).toBe(report.config.url);
    });
    it('should send first errorQueue element when mergeReport is false ', () => {
      jest.spyOn(report, 'request');
      report.config.mergeReport = false;
      report.errorQueue = ['ele1', 'ele2'];
      report.report();
      expect(report.request.mock.calls[0][1].error).toEqual(['ele1']);
      report.config.mergeReport = true;
    });
    it('should callback when request', () => {
      report.errorQueue = ['mockError'];
      const cb = jest.fn();
      wx.request.mockImplementationOnce(({ success }) => {
        success();
      });
      report.report(cb);
      expect(cb).toHaveBeenCalled();
    });
    it('should trigger afterReport event request ', () => {
      report.errorQueue = ['mockError'];
      wx.request.mockImplementationOnce(({ success }) => {
        success();
      });
      report.report();
      expect(report.trigger).toBeCalledWith('afterReport');
    });
  });
  describe('send method', () => {
    beforeAll(() => {
      jest.spyOn(report, 'report');
    });
    afterAll(() => {
      report.config.mergeReport = true;
      report.report.mockClear();
    });
    it('should return when beforReport event return false', () => {
      report.trigger.mockImplementationOnce(() => false);
      expect(report.send()).toBeUndefined();
    });
    it('should report when config mergeReport is true', (done) => {
      report.trigger.mockImplementationOnce(() => true);
      report.send();
      setTimeout(() => {
        expect(report.report).toBeCalled();
        done();
      }, report.config.delay);
    });
    it('should report when config mergeReport is false', (done) => {
      report.trigger.mockImplementationOnce(() => true);
      report.config.mergeReport = false;
      report.send();
      setTimeout(() => {
        expect(report.report).toBeCalled();
        done();
      }, 0);
    });
  });
  describe('catchError method', () => {
    it('should push erro to errorQueue', () => {
      report.catchError({ msg: 'test' });
      expect(report.errorQueue.length).toEqual(1);
      report.errorQueue = [];
    });
    it('should return false when random 0', () => {
      report.config.random = 0;
      const result = report.catchError({ msg: 'test' });
      expect(result).toBeFalsy();
      report.config.random = 1;
    });
    it('should return false when repeat', () => {
      jest.spyOn(report, 'repeat');
      report.repeat.mockImplementationOnce(() => true);
      const result = report.catchError({ msg: 'test' });
      expect(result).toBeFalsy();
    });
    it('should return false when except', () => {
      jest.spyOn(report, 'except');
      report.repeat.mockImplementationOnce(() => false);
      report.except.mockImplementationOnce(() => true);
      const result = report.catchError({ msg: 'test' });
      expect(result).toBeFalsy();
    });
  });
  describe('handleMsg', () => {
    it('should return false when msg is undefined', () => {
      const result = report.handleMsg();
      expect(result).toBeFalsy();
    });
    it('should send object msg', () => {
      const reuslt = report.handleMsg({ msg: 'test' }, 'error', 1);
      expect(reuslt.msg).toEqual('test');
    });
    it('should send string msg', () => {
      jest.spyOn(report, 'catchError');
      jest.spyOn(report, 'send');
      report.catchError.mockImplementationOnce(() => true);
      report.handleMsg('test', 'error', 1);
      expect(report.send).toBeCalled();
    });
  });
});
