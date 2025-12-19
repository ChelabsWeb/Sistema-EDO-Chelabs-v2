import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login')

    // Check page title or heading
    await expect(page.locator('h1, h2')).toContainText(/iniciar sesión|login/i)

    // Check form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=/error|inválid|incorrect/i')).toBeVisible({ timeout: 5000 })
  })

  test('redirects unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/login/)
  })
})
