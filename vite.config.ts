import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      // Вказуємо, що файл декларації потрібно помістити в корінь 'dist'
      // і він повинен називатися 'index.d.ts', щоб відповідати точкам входу
      insertTypesEntry: true,
      // rollupTypes: true, // Розкоментуйте, якщо хочете один .d.ts файл
      // Опціонально: вкажіть шлях до tsconfig, якщо він не в корені
      // tsconfigPath: './tsconfig.json'
    }),
  ],
  build: {
    // Режим бібліотеки
    lib: {
      // Точка входу (ваш основний файл TypeScript)
      entry: resolve(__dirname, 'src/index.ts'),
      // Назва бібліотеки (використовується в UMD збірці, якщо вона потрібна)
      name: 'DIContainer', // На основі @sagifire/di-container
      // Формати виводу
      formats: ['es', 'cjs'],
      // Назви файлів для різних форматів
      fileName: (format) => `${format}/index.js`,
    },
    // Опціонально: налаштування Rollup для кращого контролю
    rollupOptions: {
      // Переконайтеся, що зовнішні залежності не включені в бандл
      // external: ['react'], // Приклад: якщо ваша бібліотека залежить від React
      output: {
        // Налаштування для UMD збірки (якщо 'umd' додано до formats)
        // globals: {
        //   react: 'React',
        // },
        // Зберігаємо структуру директорій для CJS/ESM
        preserveModules: false, // Встановлено в false, оскільки ми вказуємо fileName
      },
    },
    // Генерувати sourcemaps
    sourcemap: true,
    // Очищати директорію dist перед збіркою
    emptyOutDir: true,
  },
});
