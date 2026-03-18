import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['__tests__/setup.ts'],
        // Inclui apenas arquivos em subdiretórios (api/, etc.) — exclui helpers e seed
        include: ['__tests__/**/*.test.ts'],
        exclude: [
            '__tests__/seed.test.ts',      // é só re-export, sem suites
            '__tests__/helpers/**',        // arquivos auxiliares
            'node_modules/**',
            'e2e/**',
        ],
        // CRÍTICO: desabilita paralelismo para evitar conflito de FK no banco compartilhado
        fileParallelism: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['app/api/**/*.ts'],
        },
    },
})
