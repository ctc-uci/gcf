import { describe, expect, it } from 'vitest';

import { app } from '../app';

describe('app', () => {
  it('exports an Express application', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
