jest.mock('@/lib/session', () => ({ requireCurrentUser: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@example.com' }) }));
jest.mock('@/lib/db', () => ({ prisma: { userProgress: { upsert: jest.fn().mockResolvedValue({ id: 'p1', user_id: 'u1', content_id: 'c1', status: 'in-progress', completion_rate: 10, skill_points: 0 }) } } }));
const { POST } = require('./route');
const db = require('@/lib/db');

describe('POST /api/learning/progress', () => {
  it('upserts progress with valid payload', async () => {
    const req = new Request('http://localhost/api/learning/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: '11111111-1111-1111-1111-111111111111', status: 'in-progress', completionRate: 10 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(db.prisma.userProgress.upsert).toHaveBeenCalled();
  });
});
