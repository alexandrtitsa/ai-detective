import { expect, test } from './fixtures';
import { GameApp, ids, texts } from './game-app';

test.describe('збереження сесії', () => {
  test('перезавантаження зберігає розслідування', async ({ page }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame();

    await app.ask(ids.andriy, ids.nightDeploy);
    await expect(app.interrogation.getByText(texts.andriyLie)).toBeVisible();
    await app.ask(ids.marina, ids.nightDeploy);
    await expect(app.journal.getByText(texts.deployClue)).toBeVisible();

    await page.reload();

    await expect(app.interrogation).toBeVisible();
    await expect(app.interrogation.getByRole('listitem')).toHaveCount(2);
    await expect(app.journal.getByText(texts.deployClue)).toBeVisible();
    await expect(app.interrogation).toContainText('Залишилось питань: 6');
  });

  test('завершена гра відновлюється, а перехід до результатів очищує збереження', async ({
    page,
  }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame();
    await app.accuse(/Марина/);
    await expect(page.getByRole('heading', { name: 'Звинувачення хибне' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Звинувачення хибне' })).toBeVisible();

    await page.getByRole('button', { name: 'До результатів' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Результат' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Зникнення у офісі' })).toBeVisible();
  });

  test('вихід із гри видаляє прогрес', async ({ page }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame();

    await page.getByRole('button', { name: 'Вийти з гри' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Так, вийти' }).click();
    await expect(page.getByRole('button', { name: 'Почати розслідування' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Почати розслідування' })).toBeVisible();
  });

  test('пошкоджені збереження не ламають застосунок', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ai-detective:session:v1', '{broken');
      localStorage.setItem('ai-detective:game:v1', '{"x":1}');
    });

    const app = new GameApp(page);
    await app.open();
    await expect(page.getByRole('heading', { level: 1, name: 'Зникнення у офісі' })).toBeVisible();
  });
});