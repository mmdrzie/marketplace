import tseslint from 'typescript-eslint';
import js from '@eslint/js';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '*.d.ts'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      // R6: Direct getDb() calls are forbidden — use Repository abstraction
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="getDb"]',
          message: 'R6: Direct getDb() calls are forbidden. Use Repository abstraction.',
        },
        {
          selector: 'CallExpression[callee.object.name="eventBus"][callee.property.name="publish"]',
          message: 'R7: Direct eventBus.publish() is forbidden. Use Outbox pattern.',
        },
      ],
    },
  },
);
