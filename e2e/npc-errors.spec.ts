import { echoRephrase, expect, test } from './fixtures';
import { GameApp, ids, texts } from './game-app';

test('збій AI повертає питання й дозволяє повторити', async ({ page }) => {
  let failing = true;
  await page.route('**/api/npc/rephrase', async (route) => {
    if (failing) {
      await route.fulfill({ status: 502, json: { error: { code: 'upstream_failed' } } });
    } else {
      await echoRephrase(route);
    }
  });

  const app = new GameApp(page);
  await app.open();
  await app.startGame();

  await app.ask(ids.andriy, ids.nightDeploy);
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Питання повернуто');
  await expect(app.interrogation).toContainText('Залишилось питань: 8');
  await expect(app.interrogation.getByText('Ти ще нікого не допитав.')).toBeVisible();

  failing = false;
  await app.askButton.click();
  await expect(app.interrogation.getByText(texts.andriyLie)).toBeVisible();
  await expect(alert).toBeHidden();
});