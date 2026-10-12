import { echoRephrase, expect, test } from './fixtures';
import { GameApp, ids } from './game-app';

test.describe('клавіатура та фокус', () => {
  test('після переходу на екран гри фокус на головній області', async ({ page }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame();

    await expect(page.locator('main')).toBeFocused();
  });

  test('кнопка питання лишається у фокусі, поки чекаємо відповідь', async ({ page }) => {
    await page.route('**/api/npc/rephrase', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await echoRephrase(route);
    });

    const app = new GameApp(page);
    await app.open();
    await app.startGame();
    await app.ask(ids.andriy, ids.nightDeploy);

    await expect(app.interrogation.getByText('Формулює відповідь', { exact: true })).toBeVisible();
    await expect(app.askButton).toBeFocused();
    await expect(app.askButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('діалог звинувачення: фокус на «Скасувати», Esc повертає фокус на кнопку', async ({
    page,
  }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame();

    await app.accusation.getByRole('radio', { name: /Андрій/ }).focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await expect(app.accuseButton).toBeFocused();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: 'Підтвердити звинувачення' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Скасувати' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(app.accuseButton).toBeFocused();
  });
});