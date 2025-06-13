import { test, expect } from '@playwright/test';

test.describe('Proceso de Autenticación', () => {
  test('inicio de sesión exitoso', async ({ page }) => {
    // Ir a la página de inicio de sesión
    await page.goto('/sign-in');
    
    // Tomar captura antes de ingresar credenciales
    await page.screenshot({ path: 'screenshots/login-before.png', fullPage: true });

    // Llenar el formulario
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || '');
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || '');
    
    // Tomar captura después de ingresar credenciales
    await page.screenshot({ path: 'screenshots/login-credentials.png', fullPage: true });

    // Hacer clic en el botón de inicio de sesión
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Esperar a que la redirección se complete
    await page.waitForURL('**/grupos');

    // Tomar captura después del inicio de sesión exitoso
    await page.screenshot({ path: 'screenshots/login-success.png', fullPage: true });

    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*grupos/);
  });

  test('inicio de sesión fallido', async ({ page }) => {
    // Ir a la página de inicio de sesión
    await page.goto('/sign-in');
    
    // Llenar el formulario con credenciales incorrectas
    await page.getByLabel('Email').fill('usuario_incorrecto@ejemplo.com');
    await page.getByLabel('Password').fill('contraseña_incorrecta');
    
    // Tomar captura con credenciales incorrectas
    await page.screenshot({ path: 'screenshots/login-failed-credentials.png', fullPage: true });

    // Hacer clic en el botón de inicio de sesión
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Esperar y verificar el mensaje de error
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();

    // Tomar captura del mensaje de error
    await page.screenshot({ path: 'screenshots/login-error.png', fullPage: true });
  });
}); 