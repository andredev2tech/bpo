import { test, expect } from '@playwright/test'

// Smoke test: páginas críticas respondem sem erro
const paginasPublicas = ['/login']
const paginasProtegidas = ['/', '/tarefas', '/clientes']

test.describe('Smoke — páginas públicas', () => {
    for (const url of paginasPublicas) {
        test(`${url} responde 200`, async ({ page }) => {
            const res = await page.goto(url)
            expect(res?.status()).toBeLessThan(400)
        })
    }
})

test.describe('Smoke — páginas protegidas redirecionam para login', () => {
    for (const url of paginasProtegidas) {
        test(`${url} redireciona para /login sem sessão`, async ({ page }) => {
            await page.goto(url)
            // Aguarda redirect ou URL de login
            await expect(page).toHaveURL(/login/, { timeout: 5000 })
        })
    }
})
