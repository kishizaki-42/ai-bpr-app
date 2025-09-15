jest.mock('@/lib/session', () => ({ requireCurrentUser: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@example.com' }) }));
jest.mock('@/lib/ai', () => ({ analyzeProcess: jest.fn().mockResolvedValue({
  bottlenecks: [{ id: 'b', description: 'x', severity: 'low' }],
  inefficiencies: [{ id: 'i', description: 'y', impact: 'low' }],
  improvementSuggestions: [{ id: 's', title: 'z', description: 'd', expectedImpact: 'low', implementationComplexity: 'low', aiTools: [] }],
  aiConfidenceScore: 0.5,
}) }));
jest.mock('@/lib/db', () => ({ prisma: { bPRProject: { findUnique: jest.fn().mockResolvedValue({ id: 'p1', user_id: 'u1', title: 't' }) }, processAnalysis: { create: jest.fn().mockResolvedValue({ id: 'a1' }) }, suggestionFeedback: { findMany: jest.fn().mockResolvedValue([]) } } }));
const { POST } = require('./route');
const db = require('@/lib/db');

describe('POST /api/process/analyze', () => {
  it('rate limits after 5 requests', async () => {
    const makeReq = () => new Request('http://localhost/api/process/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: '22222222-2222-2222-2222-222222222222', process: { steps: [] } }),
    });
    const results: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await POST(makeReq());
      results.push(res.status);
    }
    expect(results.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(results[5]).toBe(429);
    expect(db.prisma.bPRProject.findUnique).toHaveBeenCalled();
    expect(db.prisma.processAnalysis.create).toHaveBeenCalled();
  });
});
