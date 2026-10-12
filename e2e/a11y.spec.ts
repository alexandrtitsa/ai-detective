import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { GameApp, ids } from './game-app';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Чекає завершення анімацій: напівпрозорий елемент дав би хибні спрацювання color-contrast */
async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

async function expectNoViolations(page: Page): Promise<void> {
  await settle(page);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const report = violations.map(
    (violation) =>
      `${violation.id}: ${violation.help}\n` +
      violation.nodes.map((node) => `  ${node.target.join(' ')}`).join('\n'),
  );
  expect(report, 'axe: порушення доступності').toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`a11y, тема: ${theme}`, () => {
    // Тема вмикається атрибутом на <html> (за замовчуванням темна), а не prefers-color-scheme
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
    });

    test('стартовий екран', async ({ page }) => {
      await new GameApp(page).open();
      await expectNoViolations(page);
    });

    test('екран гри з відповіддю та доказом', async ({ page }) => {
      const app = new GameApp(page);
      await app.open();
      await app.startGame();
      await app.ask(ids.marina, ids.nightDeploy);
      await expect(app.journal.getByRole('listitem').first()).toBeVisible();

      await expectNoViolations(page);
    });

    test('діалог підтвердження звинувачення', async ({ page }) => {
      const app = new GameApp(page);
      await app.open();
      await app.startGame();
      await app.accusation.getByRole('radio', { name: /Андрій/ }).check();
      await app.accuseButton.click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await expectNoViolations(page);
    });

    test('результат гри', async ({ page }) => {
      const app = new GameApp(page);
      await app.open();
      await app.startGame();
      await app.accuse(/Андрій/);
      await expect(page.getByRole('heading', { name: 'Справу розкрито!' })).toBeVisible();

      await expectNoViolations(page);
    });
  });
}