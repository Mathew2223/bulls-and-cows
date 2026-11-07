import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      // Игровая логика — чистые функции, классы запрещены
      'no-restricted-syntax': [
        'error',
        { selector: 'ClassDeclaration', message: 'Классы не используются: пишем чистые функции.' },
      ],
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Без innerHTML.' },
        { property: 'insertAdjacentHTML', message: 'Без insertAdjacentHTML.' },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
);
