jest.mock('@/lib/db', () => ({ prisma: {
  user: { findFirst: jest.fn().mockResolvedValue({ id: 'u1', email: 'u@example.com', skill_level: 2 }) },
  learningContent: { count: jest.fn().mockResolvedValue(10) },
  userProgress: { count: jest.fn().mockResolvedValue(3) },
  userSkill: { findMany: jest.fn().mockResolvedValue([{ skill_area: 'BPR', level: 1, experiencePoints: 100 }]) },
  bPRProject: { count: jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(0), findMany: jest.fn().mockResolvedValue([{ metrics_text: JSON.stringify({ impactScore: 5 }) }]) },
} }));

const { GET } = require('./route');

describe('/api/dashboard/summary (GET)', () => {
  it('aggregates metrics for current user', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.learningProgress.completedCourses).toBe(3);
    expect(body.data.projectProgress.totalImpactScore).toBe(5);
  });
});

