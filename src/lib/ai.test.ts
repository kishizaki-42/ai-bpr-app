import { analyzeProcess } from './ai';

describe('ai.analyzeProcess', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns fallback when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const res = await analyzeProcess({ process: { steps: [] } });
    expect(res.improvementSuggestions.length).toBeGreaterThan(0);
  });

  it('parses OpenAI JSON response when key present', async () => {
    process.env.OPENAI_API_KEY = 'test';
    const spy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: JSON.stringify({
        bottlenecks: [{ id: 'b', description: 'x', severity: 'low' }],
        inefficiencies: [{ id: 'i', description: 'y', impact: 'low' }],
        improvementSuggestions: [{ id: 's', title: 'z', description: 'd', expectedImpact: 'low', implementationComplexity: 'low', aiTools: [] }],
        aiConfidenceScore: 0.5,
      }) } }] })
    } as any);

    const res = await analyzeProcess({ process: { steps: [] } });
    expect(res.aiConfidenceScore).toBeGreaterThan(0);
    spy.mockRestore();
  });
});

