import app from '../../src/api/app';

describe('\'guilds\' service', () => {
  it('registered the service', () => {
    const service = app.service('guilds');
    expect(service).toBeTruthy();
  });
});
