import Config from '../src/lib/config';

describe('Config', () => {
  const config = new Config({ test: 'test' });
  it('should init config', () => {
    expect(config.get('test')).toEqual('test');
  });
  it('should add config when set non-exist config', () => {
    config.set('newKey', 'newKey');
    expect(config.get('newKey')).toEqual('newKey');
  });
  it('should cover config when set exist key', () => {
    config.set('test', 'update');
    expect(config.get('test')).toEqual('update');
  });
});
