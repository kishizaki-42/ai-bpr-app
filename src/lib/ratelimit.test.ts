import { allow } from './ratelimit';

describe('ratelimit token bucket', () => {
  it('allows up to limit then blocks', () => {
    const key = 'test:rate';
    const results = Array.from({ length: 6 }, () => allow(key, 5, 60000));
    expect(results.filter(Boolean).length).toBe(5);
    expect(results[5]).toBe(false);
  });
});

