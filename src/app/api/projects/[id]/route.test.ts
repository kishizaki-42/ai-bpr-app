jest.mock('@/lib/session', () => ({ requireCurrentUser: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@example.com' }) }));
const findUnique = jest.fn();
const update = jest.fn().mockResolvedValue({ id: 'p1', user_id: 'u1', title: 'U' });
const delAnalysis = jest.fn().mockResolvedValue({ count: 1 });
const delProject = jest.fn().mockResolvedValue({});

jest.mock('@/lib/db', () => ({ prisma: { bPRProject: { findUnique, update, delete: delProject }, processAnalysis: { deleteMany: delAnalysis } } }));

const { GET, PUT, DELETE: DEL } = require('./route');

describe('/api/projects/[id] (GET/PUT/DELETE)', () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it('GET returns 200 for owner', async () => {
    findUnique.mockResolvedValueOnce({ id: 'p1', user_id: 'u1', title: 'T' });
    const res = await GET({} as any, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
  });

  it('GET returns 404 for non-owner', async () => {
    findUnique.mockResolvedValueOnce({ id: 'p1', user_id: 'u2', title: 'T' });
    const res = await GET({} as any, { params: { id: 'p1' } });
    expect(res.status).toBe(404);
  });

  it('PUT updates when owner', async () => {
    findUnique.mockResolvedValueOnce({ id: 'p1', user_id: 'u1', title: 'T' });
    const req = new Request('http://localhost/api/projects/p1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'U' }) });
    const res = await PUT(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
  });

  it('DELETE removes project and analyses', async () => {
    findUnique.mockResolvedValueOnce({ id: 'p1', user_id: 'u1', title: 'T' });
    const res = await DEL({} as any, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    expect(delAnalysis).toHaveBeenCalled();
    expect(delProject).toHaveBeenCalled();
  });
});

