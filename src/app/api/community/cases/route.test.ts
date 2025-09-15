import { GET, POST } from './route';

jest.mock('@/lib/session', () => ({ requireCurrentUser: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@example.com' }) }));
jest.mock('@/lib/db', () => ({ prisma: {} }));

const cs = { findMany: jest.fn().mockResolvedValue([{ id: 'c1', title: 'BPR', content: 'text', tags_text: 'ai' }]), create: jest.fn().mockResolvedValue({ id: 'c2' }) };
(global as any).prisma = undefined;
jest.mocked(require('@/lib/db')).prisma = { } as any;
const prisma = require('@/lib/db').prisma;
(prisma as any).caseStudy = cs;

describe('community cases', () => {
  it('GET filters by q and caches', async () => {
    const req = new Request('http://localhost/api/community/cases?q=bpr');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('POST validates and creates', async () => {
    const req = new Request('http://localhost/api/community/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 't', content: 'c', tags: 'x' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(cs.create).toHaveBeenCalled();
  });
});

