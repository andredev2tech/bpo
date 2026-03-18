import { test, expect } from '@playwright/test'

// Credenciais do seed
const EMAIL = 'joao@bpo.com.br'
const SENHA = '123456'

test.describe('Autenticação', () => {
    test('login válido redireciona para dashboard', async ({ page }) => {
        await page.goto('/login')
        await page.fill('input[type="email"]', EMAIL)
        await page.fill('input[type="password"]', SENHA)
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL('/', { timeout: 8000 })
    })

    test('login inválido exibe erro', async ({ page }) => {
        await page.goto('/login')
        await page.fill('input[type="email"]', EMAIL)
        await page.fill('input[type="password"]', 'senhaerrada')
        await page.click('button[type="submit"]')
        await expect(page.locator('text=/inválid|incorret|erro/i')).toBeVisible({ timeout: 5000 })
    })

    test('acesso a / sem sessão redireciona para /login', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' })
        await expect(page).toHaveURL(/login/, { timeout: 5000 })
    })

    test('acesso a /clientes sem sessão redireciona para /login', async ({ page }) => {
        await page.goto('/clientes', { waitUntil: 'networkidle' })
        await expect(page).toHaveURL(/login/, { timeout: 5000 })
    })

    test('acesso direto a /clientes/{slug} sem sessão redireciona para /login', async ({ page }) => {
        await page.goto('/clientes/empresa-teste', { waitUntil: 'networkidle' })
        await expect(page).toHaveURL(/login/, { timeout: 5000 })
    })
})
