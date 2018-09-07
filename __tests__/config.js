import Config from '../src/lib/config';

describe('Config', () => {
  const config = new Config({ testConfig: 'test' });
  it('初始化配置正确', () => {
    expect(config.get('testConfig')).toEqual('test');
  });
});
