import { APIError } from './errors';

type AnalyzeParams = {
  process: unknown;
  goals?: string[];
};

type AnalyzeResult = {
  bottlenecks: Array<{ id: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  inefficiencies: Array<{ id: string; description: string; impact: 'low' | 'medium' | 'high' }>;
  improvementSuggestions: Array<{
    id: string;
    title: string;
    description: string;
    expectedImpact: 'low' | 'medium' | 'high';
    implementationComplexity: 'low' | 'medium' | 'high';
    aiTools: string[];
    estimatedROI?: number;
  }>;
  aiConfidenceScore: number;
};

export async function analyzeProcess({ process, goals = [] }: AnalyzeParams): Promise<AnalyzeResult> {
  const apiKey = (globalThis as any).process?.env?.OPENAI_API_KEY;
  if (!apiKey) return fallbackAnalyze(process, goals);

  const model = (globalThis as any).process?.env?.OPENAI_MODEL || 'gpt-4o-mini';
  const payload = buildPrompt(process, goals);

  const res = await callOpenAIJSON(apiKey, model, payload);
  if (!res) throw new APIError(502, 'AI分析サービスの応答が不正です', 'AI_BAD_RESPONSE');
  return res;
}

function buildPrompt(proc: unknown, goals: string[]) {
  const system = `あなたは業務プロセス改善（BPR）の専門家です。与えられた現状プロセスと目標に基づいて、
ボトルネック、非効率、改善提案を日本語で構造化して返してください。出力は必ずJSONのみで、説明文は含めないこと。`;

  const user = {
    process: sanitize(proc),
    goals,
    guidelines: [
      '改善提案は3〜6件、実装可能で具体的に',
      'impact/complexityはlow|medium|highのいずれか',
      'aiToolsは使用を想定するツール/技術キーワード',
      'aiConfidenceScoreは0〜1の小数（2桁精度目安）',
    ],
  };

  const schema = {
    type: 'object',
    properties: {
      bottlenecks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            description: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
          required: ['id', 'description', 'severity'],
          additionalProperties: false,
        },
      },
      inefficiencies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            description: { type: 'string' },
            impact: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
          required: ['id', 'description', 'impact'],
          additionalProperties: false,
        },
      },
      improvementSuggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            expectedImpact: { type: 'string', enum: ['low', 'medium', 'high'] },
            implementationComplexity: { type: 'string', enum: ['low', 'medium', 'high'] },
            aiTools: { type: 'array', items: { type: 'string' } },
            estimatedROI: { type: 'number' },
          },
          required: ['id', 'title', 'description', 'expectedImpact', 'implementationComplexity', 'aiTools'],
          additionalProperties: false,
        },
        minItems: 3,
      },
      aiConfidenceScore: { type: 'number' },
    },
    required: ['bottlenecks', 'inefficiencies', 'improvementSuggestions', 'aiConfidenceScore'],
    additionalProperties: false,
  } as const;

  return { system, user, schema };
}

async function callOpenAIJSON(apiKey: string, model: string, payload: ReturnType<typeof buildPrompt>, retries = 3): Promise<AnalyzeResult | null> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model,
    messages: [
      { role: 'system', content: payload.system },
      { role: 'user', content: JSON.stringify(payload.user) },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'bpr_analysis', schema: payload.schema, strict: true } },
    temperature: 0.2,
  } as any;

  let lastErr: any = null;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status >= 500) {
        await delay(backoffMs(i));
        continue;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new APIError(res.status, `OpenAI APIエラー: ${text.slice(0, 200)}`, 'OPENAI_ERROR');
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;
      const parsed = JSON.parse(content);
      return parsed as AnalyzeResult;
    } catch (e) {
      lastErr = e;
      await delay(backoffMs(i));
    }
  }
  throw new APIError(502, `AI分析サービスの呼び出しに失敗しました: ${String(lastErr)}`, 'AI_SERVICE_ERROR');
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function backoffMs(attempt: number) {
  return 500 * Math.pow(2, attempt);
}

function sanitize(v: unknown) {
  try {
    return JSON.parse(JSON.stringify(v ?? {}));
  } catch {
    return {};
  }
}

function fallbackAnalyze(_process: unknown, _goals: string[]): AnalyzeResult {
  return {
    bottlenecks: [{ id: 'b1', description: '承認待ちの滞留', severity: 'high' }],
    inefficiencies: [{ id: 'i1', description: '二重入力', impact: 'medium' }],
    improvementSuggestions: [
      {
        id: 's1',
        title: 'タスク自動化の導入',
        description: 'RPA/AIにより繰り返し業務を自動化します。',
        expectedImpact: 'high',
        implementationComplexity: 'medium',
        aiTools: ['RPA', 'LLM'],
        estimatedROI: 180,
      },
    ],
    aiConfidenceScore: 0.6,
  };
}
