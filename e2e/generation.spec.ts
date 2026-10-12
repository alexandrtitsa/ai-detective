import { officeDisappearanceBlueprint } from '../src/entities/case/lib/blueprint.fixture';
import { caseGenerationRequestSchema } from '../src/shared/api/contracts/case-contract';
import { expect, test } from './fixtures';
import { GameApp } from './game-app';

const generated = { ...officeDisappearanceBlueprint, title: 'Зникла кава' };

test.describe('генерація справи', () => {
  test('згенерована справа замінює вбудовану й переживає перезавантаження', async ({ page }) => {
    let requestBody: unknown;
    await page.route('**/api/case/generate', async (route) => {
      requestBody = route.request().postDataJSON();
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.fulfill({ json: { blueprint: generated } });
    });

    const app = new GameApp(page);
    await app.open();
    await page.getByLabel(/Тема/).fill('зникла кава в офісі');
    await page.getByRole('button', { name: 'Згенерувати справу' }).click();

    await expect(page.getByText(/Генеруємо справу…/)).toBeVisible();
    const title = page.getByRole('heading', { level: 1, name: 'Зникла кава' });
    await expect(title).toBeVisible();
    expect(caseGenerationRequestSchema.parse(requestBody)).toEqual({
      castSize: 4,
      theme: 'зникла кава в офісі',
    });

    await page.reload();
    await expect(title).toBeVisible();

    await app.startGame();
    await expect(title).toBeVisible();
  });

  test('помилка генерації показується й не ламає поточну справу', async ({ page }) => {
    await page.route('**/api/case/generate', (route) =>
      route.fulfill({ status: 502, json: { error: { code: 'invalid_output' } } }),
    );

    const app = new GameApp(page);
    await app.open();
    await page.getByRole('button', { name: 'Згенерувати справу' }).click();

    await expect(page.getByRole('alert')).toContainText('не зміг скласти коректну справу');
    await expect(page.getByRole('heading', { level: 1, name: 'Зникнення у офісі' })).toBeVisible();
  });
});