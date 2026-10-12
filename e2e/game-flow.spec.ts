import { expect, test } from './fixtures';
import { GameApp, ids, texts } from './game-app';

test.describe('ігровий сценарій', () => {
  test('перехресна перевірка викриває брехуна, і гравець перемагає', async ({ page }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame('Детектив');
    await expect(page).toHaveTitle(/Розслідування/);

    await app.ask(ids.andriy, ids.nightDeploy);
    await expect(app.interrogation.getByText(texts.andriyLie)).toBeVisible();
    await expect(app.journal.getByText('Доказів поки немає')).toBeVisible();

    await app.ask(ids.marina, ids.nightDeploy);
    await expect(app.journal.getByText(texts.deployClue)).toBeVisible();

    // Під тиском доказу Андрій зізнається (політика cracks)
    await app.ask(ids.andriy, ids.nightDeploy);
    await expect(app.interrogation.getByText(texts.deployClue)).toHaveCount(2);

    await app.accuse(/Андрій/);
    const outcome = page.getByRole('heading', { name: 'Справу розкрито!' });
    await expect(outcome).toBeVisible();
    await expect(outcome).toBeFocused();
  });

  test('повторне питання без нових доказів заблоковане з поясненням', async ({ page }) => {
    const app = new GameApp(page);
    await app.open();
    await app.startGame('Детектив');

    await app.ask(ids.andriy, ids.nightDeploy);
    await expect(app.interrogation.getByText(texts.andriyLie)).toBeVisible();

    await expect(app.askButton).toHaveAttribute('aria-disabled', 'true');
    await expect(app.interrogation.getByText(/Повторити можна/)).toBeVisible();

    await app.askButton.click();
    await expect(app.interrogation.getByRole('listitem')).toHaveCount(1);
  });
});