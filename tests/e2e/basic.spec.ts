import { test, expect } from '@playwright/test';

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@example.com';
const DEMO_PASS = process.env.DEMO_PASS || 'demo1234';

test.describe('Basic user flow', () => {
  test('sign in, learning progress, project create and analyze', async ({ page }) => {
    // Sign in
    await page.goto('/signin');
    await page.getByLabel('メールアドレス').fill(DEMO_EMAIL);
    await page.getByLabel('パスワード').fill(DEMO_PASS);
    await page.getByRole('button', { name: 'サインイン' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Learning
    await page.goto('/learning');
    const startButtons = page.getByRole('button', { name: '始める' });
    if (await startButtons.count()) {
      await startButtons.first().click();
    }
    const completeButtons = page.getByRole('button', { name: '完了' });
    if (await completeButtons.count()) {
      await completeButtons.first().click();
    }

    // Project create
    await page.goto('/projects');
    await page.getByLabel('タイトル').fill('E2E プロジェクト');
    await page.getByRole('button', { name: '作成' }).click();
    await expect(page.getByText('E2E プロジェクト')).toBeVisible();
    await page.getByRole('link', { name: 'E2E プロジェクト' }).click();

    // Analyze
    await page.getByRole('button', { name: 'AI分析を実行' }).click();
    await expect(page.getByText('分析結果')).toBeVisible();
  });
});

