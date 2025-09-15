import { GET } from './route';

jest.mock('@/lib/session', () => ({ requireCurrentUser: jest.fn().mockResolvedValue({ id: 'u1' }) }));

const bp = { findMany: jest.fn().mockResolvedValue([]), count: jest.fn() };
const up = { findMany: jest.fn().mockResolvedValue([]) };
jest.mock('@/lib/db', () => ({ prisma: { bPRProject: { findMany: jest.fn().mockResolvedValue([]) }, userProgress: { findMany: jest.fn().mockResolvedValue([]) } } }));
const { prisma } = require('@/lib/db');

describe('dashboard timeline', () => {
  it('returns series for last 6 months', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.data.series.length).toBe(6);
  });
});
