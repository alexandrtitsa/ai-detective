import { expect, test as base, type Route } from '@playwright/test';
import { npcRephraseRequestSchema } from '../src/shared/api/contracts/npc-contract';

/**
 * Відповідає ехом: перефразування «не змінює» репліку, тож тести детерміновані
 * й не ходять до реального AI. Заодно перевіряє контракт запиту клієнта.
 */
export async function echoRephrase(route: Route): Promise<void> {
  const body: unknown = route.request().postDataJSON();
  const request = npcRephraseRequestSchema.parse(body);
  await route.fulfill({ json: { statement: request.statement } });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    // Немокований запит до API це помилка тесту, а не тиха залежність від мережі.
    // Пізніше зареєстровані маршрути мають пріоритет.
    await page.route('**/api/**', (route) =>
      route.fulfill({ status: 500, json: { error: { code: 'unmocked' } } }),
    );
    await page.route('**/api/npc/rephrase', echoRephrase);

    await use(page);

    expect(pageErrors).toEqual([]);
  },
});

export { expect };