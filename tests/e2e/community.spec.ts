import { test, expect } from '@playwright/test';

test.describe('Community flow', () => {
  test('create case and question, then view detail', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel('メールアドレス').fill(process.env.DEMO_EMAIL || 'demo@example.com');
    await page.getByLabel('パスワード').fill(process.env.DEMO_PASS || 'demo1234');
    await page.getByRole('button', { name: 'サインイン' }).click();
    await page.waitForURL('**/dashboard');

    await page.goto('/community');
    // Post case
    await page.getByPlaceholder('タイトル').first().fill('E2E事例');
    await page.getByPlaceholder('内容').first().fill('E2Eの本文');
    await page.getByPlaceholder('タグ（カンマ区切り）').first().fill('bpr, ai');
    await page.getByRole('button', { name: '投稿' }).first().click();
    await expect(page.getByText('E2E事例')).toBeVisible();

    // Post question
    await page.getByPlaceholder('タイトル').nth(1).fill('E2E質問');
    await page.getByPlaceholder('本文').fill('E2Eの質問本文');
    await page.getByPlaceholder('タグ（カンマ区切り）').nth(1).fill('bpr');
    await page.getByRole('button', { name: '投稿' }).nth(1).click();
    await expect(page.getByText('E2E質問')).toBeVisible();

    // Open question detail and post answer
    await page.getByRole('link', { name: 'E2E質問' }).click();
    await expect(page.getByText('おすすめ回答者')).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder('本文').fill('E2Eの回答');
    await page.getByRole('button', { name: '投稿' }).click();
    await expect(page.getByText('E2Eの回答')).toBeVisible();
  });
});
