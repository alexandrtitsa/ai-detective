import { expect, type Locator, type Page } from '@playwright/test';

export const ids = {
  andriy: 'char-andriy',
  marina: 'char-marina',
  iryna: 'char-iryna',
  nightDeploy: 'evt-night-deploy',
} as const;

export const texts = {
  andriyLie: 'Я був удома і нічого не деплоїв.',
  deployClue: 'О 02:10 хтось запустив деплой з акаунта Андрія.',
} as const;

type Level = 'Новачок' | 'Детектив' | 'Інспектор';

export class GameApp {
  readonly page: Page;
  readonly interrogation: Locator;
  readonly journal: Locator;
  readonly accusation: Locator;
  readonly askButton: Locator;
  readonly accuseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.interrogation = page.getByRole('region', { name: 'Допит', exact: true });
    this.journal = page.getByRole('region', { name: 'Журнал доказів', exact: true });
    this.accusation = page.getByRole('region', { name: 'Звинувачення', exact: true });
    this.askButton = page.getByRole('button', { name: 'Запитати' });
    this.accuseButton = page.getByRole('button', { name: 'Звинуватити', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async startGame(level: Level = 'Детектив'): Promise<void> {
    await this.page.getByRole('radio', { name: new RegExp(level) }).check();
    await this.page.getByRole('button', { name: 'Почати розслідування' }).click();
    await expect(this.interrogation).toBeVisible();
  }

  async ask(npcId: string, topicId: string): Promise<void> {
    await this.page.getByLabel('Кого допитуємо').selectOption(npcId);
    await this.page.getByLabel('Про що питаємо').selectOption(topicId);
    await this.askButton.click();
  }

  async accuse(suspect: RegExp): Promise<void> {
    await this.accusation.getByRole('radio', { name: suspect }).check();
    await this.accuseButton.click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Так, звинуватити' }).click();
  }
}