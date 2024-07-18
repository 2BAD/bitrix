import { Options } from 'got';
import { describe, expect, it } from 'vitest';
import addAccessToken from './addAccessToken.js';

const createMockOptions = (search = '') => (({
  url: new URL(`https://example.com${search}`)
}) as const);

describe('Client `addAccessToken` hook', () => {
  it('should not modify the URL if accessToken is not provided', () => {
    const options = createMockOptions();

    addAccessToken()(options as Options);

    expect(options.url.search).toBe('');
  });

  it('should not modify the URL if options.url is not defined', () => {
    const options = {};

    addAccessToken('test-token')(options as Options);

    expect(options).not.toHaveProperty('url');
  });

  it('should append access_token if accessToken is provided', () => {
    const options = createMockOptions();

    addAccessToken('test-token')(options as Options)

    expect(options.url.search).toBe('?access_token=test-token');
  });

  it('should append access_token to existing query string', () => {
    const options = createMockOptions('?existing_param=value');

    addAccessToken('test-token')(options as Options)

    expect(options.url.search).toBe('?existing_param=value&access_token=test-token');
  });

  it('should handle URLs with no initial search params correctly', () => {
    const options = createMockOptions();

    addAccessToken('test-token')(options as Options)

    expect(options.url.search).toBe('?access_token=test-token');
  });
})
