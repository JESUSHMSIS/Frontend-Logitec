import { test, expect } from '@playwright/test';

test.describe('Página de Grupos', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de inicio de sesión
    await page.goto('/sign-in');
    
    // Iniciar sesión
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Esperar a que la redirección se complete
    await page.waitForURL('**/grupos');
  });

  test('grupos page loads correctly', async ({ page }) => {
    // Verificar que estamos en la página de grupos
    await expect(page).toHaveURL(/.*grupos/);
    
    // Tomar captura de la página de grupos
    await page.screenshot({ path: 'screenshots/grupos-page.png', fullPage: true });

    // Verificar y hacer clic en la pestaña de Transportes
    await expect(page.getByRole('tab', { name: 'Transportes' })).toBeVisible();
    await page.getByRole('tab', { name: 'Transportes' }).click();
    
    // Tomar captura después de hacer clic en la pestaña
    await page.screenshot({ path: 'screenshots/grupos-transportes-tab.png', fullPage: true });

    // Verificar que la tabla está visible
    await expect(page.getByRole('table')).toBeVisible();
    
    // Tomar captura de la tabla
    await page.screenshot({ path: 'screenshots/grupos-transportes-table.png', fullPage: true });
  });
}); 