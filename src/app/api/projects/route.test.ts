jest.mock('@/lib/session', () => ({ requireCurrentUser: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@example.com' }) }));
jest.mock('@/lib/db', () => ({ prisma: { bPRProject: { findMany: jest.fn().mockResolvedValue([{ id: 'p1', user_id: 'u1', title: 'T', status: 'planning' }]), create: jest.fn().mockResolvedValue({ id: 'p2', user_id: 'u1', title: 'N', status: 'planning' }) } } }));

const { GET, POST } = require('./route');
const db = require('@/lib/db');

describe('/api/projects (GET, POST)', () => {
  it('GET returns user projects', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data[0].id).toBe('p1');
    expect(db.prisma.bPRProject.findMany).toHaveBeenCalled();
  });

  it('POST creates project', async () => {
    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'N' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(db.prisma.bPRProject.create).toHaveBeenCalled();
  });
});

