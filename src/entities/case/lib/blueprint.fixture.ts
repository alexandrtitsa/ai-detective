import type { CaseBlueprint } from '../../../shared/api/contracts/case-contract';

export const officeDisappearanceBlueprint: CaseBlueprint = {
  title: 'Зникнення у офісі',
  premise:
    'У ніч на п’ятницю розробник Олег зник з офісу разом зі своїм ноутбуком. З’ясуй, хто за цим стоїть.',
  characters: [
    {
      key: 'marina',
      name: 'Марина',
      role: 'Проєктна менеджерка',
      description: 'Відповідає за терміни релізу.',
    },
    {
      key: 'andriy',
      name: 'Андрій',
      role: 'DevOps-інженер',
      description: 'Керує інфраструктурою та деплоями.',
    },
    {
      key: 'iryna',
      name: 'Ірина',
      role: 'Дизайнерка',
      description: 'Працює допізна, бачить усіх у коридорі.',
    },
  ],
  locations: [
    {
      key: 'server-room',
      name: 'Серверна',
      description: 'Кімната з обладнанням, вхід за бейджем.',
    },
    { key: 'kitchen', name: 'Кухня', description: 'Місце нічних розмов.' },
  ],
  objects: [
    { key: 'badge', name: 'Бейдж Олега', description: 'Електронний пропуск.' },
    { key: 'laptop', name: 'Ноутбук Олега', description: 'Зник разом із власником.' },
  ],
  events: [
    {
      key: 'night-deploy',
      name: 'Нічний деплой',
      description: 'Позапланове розгортання о 02:10.',
    },
  ],
  clues: [
    {
      key: 'badge',
      text: 'Бейдж Олега востаннє відмітився в серверній о 02:14.',
      relatedKeys: ['badge', 'server-room'],
    },
    {
      key: 'deploy',
      text: 'О 02:10 хтось запустив деплой з акаунта Андрія.',
      relatedKeys: ['night-deploy', 'andriy'],
    },
    {
      key: 'laptop',
      text: 'Ірина бачила Андрія з ноутбуком Олега біля серверної.',
      relatedKeys: ['andriy', 'laptop', 'server-room'],
    },
    {
      key: 'alibi',
      text: 'Марина була на відеодзвінку до 03:00.',
      relatedKeys: ['marina'],
    },
  ],
  knowledge: [
    { characterKey: 'marina', clueKey: 'badge', lie: '' },
    { characterKey: 'marina', clueKey: 'deploy', lie: '' },
    { characterKey: 'andriy', clueKey: 'deploy', lie: 'Я був удома і нічого не деплоїв.' },
    { characterKey: 'iryna', clueKey: 'alibi', lie: '' },
    { characterKey: 'iryna', clueKey: 'laptop', lie: '' },
  ],
  culpritKey: 'andriy',
};
