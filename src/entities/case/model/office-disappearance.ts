import type { DetectiveCase } from './types';

export const officeDisappearanceCase: DetectiveCase = {
  id: 'office-disappearance',
  title: 'Зникнення у офісі',
  premise:
    'У ніч на п’ятницю розробник Олег зник з офісу разом зі своїм ноутбуком. З’ясуй, хто за цим стоїть.',
  maxQuestions: 8,
  culpritId: 'char-andriy',
  entities: [
    {
      kind: 'character',
      id: 'char-marina',
      name: 'Марина',
      role: 'Проєктна менеджерка',
      description: 'Відповідає за терміни релізу.',
      knownClueIds: ['clue-badge', 'clue-deploy'],
      lies: {},
    },
    {
      kind: 'character',
      id: 'char-andriy',
      name: 'Андрій',
      role: 'DevOps-інженер',
      description: 'Керує інфраструктурою та деплоями.',
      knownClueIds: ['clue-deploy'],
      lies: { 'clue-deploy': 'Я був удома і нічого не деплоїв.' },
    },
    {
      kind: 'character',
      id: 'char-iryna',
      name: 'Ірина',
      role: 'Дизайнерка',
      description: 'Працює допізна, бачить усіх у коридорі.',
      knownClueIds: ['clue-alibi', 'clue-laptop'],
      lies: {},
    },
    {
      kind: 'location',
      id: 'loc-server-room',
      name: 'Серверна',
      description: 'Кімната з обладнанням, вхід за бейджем.',
    },
    {
      kind: 'location',
      id: 'loc-kitchen',
      name: 'Кухня',
      description: 'Місце нічних розмов.',
    },
    {
      kind: 'object',
      id: 'obj-badge',
      name: 'Бейдж Олега',
      description: 'Електронний пропуск.',
    },
    {
      kind: 'object',
      id: 'obj-laptop',
      name: 'Ноутбук Олега',
      description: 'Зник разом із власником.',
    },
    {
      kind: 'event',
      id: 'evt-night-deploy',
      name: 'Нічний деплой',
      description: 'Позапланове розгортання о 02:10.',
    },
  ],
  clues: [
    {
      id: 'clue-badge',
      text: 'Бейдж Олега востаннє відмітився в серверній о 02:14.',
      relatedEntityIds: ['obj-badge', 'loc-server-room'],
    },
    {
      id: 'clue-deploy',
      text: 'О 02:10 хтось запустив деплой з акаунта Андрія.',
      relatedEntityIds: ['evt-night-deploy', 'char-andriy'],
    },
    {
      id: 'clue-laptop',
      text: 'Ірина бачила Андрія з ноутбуком Олега біля серверної.',
      relatedEntityIds: ['char-andriy', 'obj-laptop', 'loc-server-room'],
    },
    {
      id: 'clue-alibi',
      text: 'Марина була на відеодзвінку до 03:00.',
      relatedEntityIds: ['char-marina'],
    },
  ],
};
