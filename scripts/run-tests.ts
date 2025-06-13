import nodemailer from 'nodemailer';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';
import PDFDocument from 'pdfkit';

const PORT = 3002;

// Configuración de correo
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jeshuanaco7@gmail.com',
    pass: 'homl jcel zxsf zrru'
  }
};

// Obtener el correo del usuario desde las variables de entorno
const USER_EMAIL: string = process.env.TEST_EMAIL || '';

if (!USER_EMAIL) {
  console.error('No se proporcionó un correo electrónico para enviar el reporte');
  process.exit(1);
}

const RECIPIENTS = [
  'jesushm337@gmail.com',

];

async function killProcessOnPort(port: number) {
  try {
    const output = execSync(`netstat -tulpn 2>/dev/null | grep :${port} || true`).toString();
    if (output) {
      const pid = output.split(/\s+/)[6]?.split('/')[0];
      if (pid) {
        execSync(`kill -9 ${pid} 2>/dev/null || true`);
      }
    }
  } catch (error) {
    console.log(`No se pudo matar el proceso en el puerto ${port}`);
  }
}

async function startServer() {
  return new Promise<void>((resolve, reject) => {
    // Primero, intentar matar cualquier proceso usando el puerto
    killProcessOnPort(PORT);

    // Limpiar la caché de Next.js
    try {
      execSync('rm -rf .next');
    } catch (error) {
      console.log('No se pudo limpiar la caché de Next.js');
    }

    const server = spawn('pnpm', ['dev'], {
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        PORT: PORT.toString(),
        NODE_ENV: 'development'
      }
    });

    let isReady = false;
    let hasError = false;
    let errorOutput = '';

    server.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (output.includes('Ready in') && !isReady) {
        isReady = true;
        // Dar un tiempo extra para asegurar que el servidor esté completamente listo
        setTimeout(() => {
          if (!hasError) {
            resolve();
          }
        }, 15000);
      }
    });

    server.stderr?.on('data', (data) => {
      const output = data.toString();
      console.error(output);
      errorOutput += output;
      
      // Verificar si hay errores críticos
      if (output.includes('Error') || output.includes('error')) {
        hasError = true;
        reject(new Error(`Error en el servidor: ${errorOutput}`));
      }
    });

    server.on('error', (error) => {
      console.error('Error al iniciar el servidor:', error);
      hasError = true;
      reject(error);
    });

    // Guardar la referencia del proceso del servidor
    (global as any).serverProcess = server;
  });
}

async function stopServer() {
  const server = (global as any).serverProcess;
  if (server) {
    server.kill();
  }
  // Intentar matar cualquier proceso usando el puerto 3001
  killProcessOnPort(3001);
}

async function waitForServer(url: string, maxAttempts = 10, delay = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.log(`Intento ${i + 1}/${maxAttempts} fallido. Esperando ${delay/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`No se pudo conectar al servidor en ${url} después de ${maxAttempts} intentos`);
}

async function takeScreenshots(shouldFail = false) {
  const screenshots: string[] = [];
  const testResults: { page: string; status: 'success' | 'error'; message: string }[] = [];
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Esperando a que el servidor esté listo...');
    await waitForServer(`http://localhost:${PORT}`);

    // Prueba de inicio de sesión
    console.log('Navegando a la página de inicio de sesión...');
    const response = await page.goto(`http://localhost:${PORT}/sign-in`, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    if (!response) {
      throw new Error('No se pudo cargar la página de inicio de sesión');
    }

    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(4000); // Esperar 4 segundos adicionales
    
    const loginPagePath = 'screenshots/login-page.png';
    await page.screenshot({ path: loginPagePath });
    screenshots.push(loginPagePath);

    console.log('Llenando el formulario de inicio de sesión...');
    
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.waitForSelector('input[type="password"]', { state: 'visible' });
    
    if (shouldFail) {
      // Usar credenciales incorrectas
      await page.fill('input[type="email"]', 'usuario_incorrecto@gmail.com');
      await page.fill('input[type="password"]', 'contraseña_incorrecta');
    } else {
      // Usar credenciales correctas
      await page.fill('input[type="email"]', 'administrador@gmail.com');
      await page.fill('input[type="password"]', 'admin123');
    }
    
    await page.waitForTimeout(2000); // Esperar 2 segundos después de llenar el formulario
    
    const formFilledPath = 'screenshots/login-form-filled.png';
    await page.screenshot({ path: formFilledPath });
    screenshots.push(formFilledPath);

    console.log('Enviando el formulario...');
    await page.click('button[type="submit"]');
    
    // Esperar un tiempo razonable para que se procese el formulario
    await page.waitForTimeout(5000); // Aumentado a 5 segundos

    // Para el caso de inicio de sesión fallido, no esperamos navegación
    if (shouldFail) {
      // Esperar a que aparezca el mensaje de error
      try {
        await page.waitForSelector('.error-message', { timeout: 5000 });
        await page.waitForTimeout(2000); // Reducido a 1 segundo para capturar el toast
        const afterLoginPath = 'screenshots/after-login-failed.png';
        await page.screenshot({ path: afterLoginPath });
        screenshots.push(afterLoginPath);

        testResults.push({
          page: 'Login Fallido',
          status: 'success',
          message: 'Inicio de sesión falló como se esperaba'
        });
      } catch (error) {
        // Si no encontramos el mensaje de error, verificamos que seguimos en la página de login
        const currentUrl = page.url();
        if (currentUrl.includes('/sign-in')) {
          await page.waitForTimeout(1000); // Reducido a 1 segundo para capturar el toast
          const afterLoginPath = 'screenshots/after-login-failed.png';
          await page.screenshot({ path: afterLoginPath });
          screenshots.push(afterLoginPath);

          testResults.push({
            page: 'Login Fallido',
            status: 'success',
            message: 'Inicio de sesión falló como se esperaba (sin mensaje de error)'
          });
        } else {
          testResults.push({
            page: 'Login Fallido',
            status: 'error',
            message: 'El inicio de sesión no falló como se esperaba'
          });
        }
      }
    } else {
      // Para inicio de sesión exitoso, esperamos la navegación
      try {
        await page.waitForNavigation({ 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        await page.waitForTimeout(4000); // Mantener 4 segundos para el caso exitoso
        const afterLoginPath = 'screenshots/after-login.png';
        await page.screenshot({ path: afterLoginPath });
        screenshots.push(afterLoginPath);

        // Verificar que estamos en la página correcta
        const currentUrl = page.url();
        if (currentUrl.includes('/cotizaciones')) {
          testResults.push({
            page: 'Login Exitoso',
            status: 'success',
            message: 'Inicio de sesión exitoso'
          });
        } else {
          testResults.push({
            page: 'Login Exitoso',
            status: 'error',
            message: 'Error en el inicio de sesión'
          });
        }
      } catch (error) {
        testResults.push({
          page: 'Login Exitoso',
          status: 'error',
          message: 'Error al esperar la navegación después del inicio de sesión'
        });
      }
    }

    // Solo continuar con la navegación si el inicio de sesión fue exitoso y no estamos probando el fallo
    if (!shouldFail && page.url().includes('/cotizaciones')) {
      // Navegación por las diferentes páginas
      const pagesToTest = [
        { name: 'Cotizaciones', path: '/cotizaciones' },
        { name: 'Grupos', path: '/grupos' },
        { name: 'Tabla Grupos', path: '/tabla-grupos' },
        { name: 'Tabla Transportes', path: '/transportes' },
      ];

      for (const pageInfo of pagesToTest) {
        try {
          console.log(`Navegando a ${pageInfo.name}...`);
          await page.goto(`http://localhost:${PORT}${pageInfo.path}`, {
            waitUntil: 'networkidle',
            timeout: 30000
          });

          // Esperar a que la página cargue completamente
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(4000); // Esperar 4 segundos adicionales
          
          // Tomar captura de la página
          const screenshotPath = `screenshots/${pageInfo.name.toLowerCase()}.png`;
          await page.screenshot({ path: screenshotPath });
          screenshots.push(screenshotPath);

          // Verificar que estamos en la página correcta
          const currentUrl = page.url();
          if (currentUrl.includes(pageInfo.path)) {
            testResults.push({
              page: pageInfo.name,
              status: 'success',
              message: `Navegación a ${pageInfo.name} exitosa`
            });
          } else {
            testResults.push({
              page: pageInfo.name,
              status: 'error',
              message: `Error al navegar a ${pageInfo.name}`
            });
          }

          // Esperar un momento antes de navegar a la siguiente página
          await page.waitForTimeout(2000);
        } catch (error: any) {
          console.error(`Error al navegar a ${pageInfo.name}:`, error);
          testResults.push({
            page: pageInfo.name,
            status: 'error',
            message: `Error: ${error.message || 'Error desconocido'}`
          });
        }
      }
    }

  } catch (error: any) {
    console.error('Error durante la navegación:', error);
    try {
      await page.waitForTimeout(4000); // Esperar 4 segundos adicionales
      const errorPath = 'screenshots/navigation-error.png';
      await page.screenshot({ path: errorPath });
      screenshots.push(errorPath);
    } catch (screenshotError) {
      console.error('Error al tomar captura del error:', screenshotError);
    }
    throw error;
  } finally {
    await browser.close();
  }

  return { screenshots, testResults };
}

async function generatePDFReport(screenshots: string[], testResults: { page: string; status: 'success' | 'error'; message: string }[], isFailureTest = false) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    autoFirstPage: true
  });
  
  const outputPath = isFailureTest ? 'test-report-failure.pdf' : 'test-report.pdf';
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Configuración de márgenes y dimensiones
  const pageWidth = doc.page.width - 100; // Ancho disponible considerando márgenes
  const pageHeight = doc.page.height - 100; // Alto disponible considerando márgenes
  const imageWidth = pageWidth;
  const imageHeight = 400; // Altura fija para las imágenes

  // Título del reporte
  doc.fontSize(24)
    .text(isFailureTest ? 'Reporte de Prueba de Inicio de Sesión Fallido' : 'Reporte de Pruebas de Navegación', { 
      align: 'center',
      width: pageWidth
    });
  doc.moveDown(2);

  // Resumen de resultados
  doc.fontSize(16)
    .text('Resumen de Resultados', {
      width: pageWidth
    });
  doc.moveDown();

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;
  const successRate = ((successCount / totalTests) * 100).toFixed(2);

  doc.fontSize(12)
    .text(`Total de pruebas: ${totalTests}`, { width: pageWidth })
    .text(`Exitosas: ${successCount}`, { width: pageWidth })
    .text(`Fallidas: ${errorCount}`, { width: pageWidth })
    .text(`Porcentaje de éxito: ${successRate}%`, { width: pageWidth });
  doc.moveDown(2);

  // Detalles de cada prueba
  doc.fontSize(16)
    .text('Detalles de las Pruebas', {
      width: pageWidth
    });
  doc.moveDown();

  for (const result of testResults) {
    // Verificar si necesitamos una nueva página
    if (doc.y + 100 > pageHeight) {
      doc.addPage();
    }

    doc.fontSize(12)
      .text(`Página: ${result.page}`, { width: pageWidth })
      .text(`Estado: ${result.status === 'success' ? '✅ Exitoso' : '❌ Fallido'}`, { width: pageWidth })
      .text(`Mensaje: ${result.message}`, { width: pageWidth })
      .moveDown();
  }

  // Agregar capturas de pantalla
  doc.addPage();
  doc.fontSize(16)
    .text('Capturas de Pantalla', {
      align: 'center',
      width: pageWidth
    });
  doc.moveDown(2);

  for (const screenshot of screenshots) {
    if (fs.existsSync(screenshot)) {
      // Verificar si necesitamos una nueva página
      if (doc.y + imageHeight + 50 > pageHeight) {
        doc.addPage();
      }

      // Agregar título de la captura
      const screenshotName = path.basename(screenshot, '.png')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      doc.fontSize(12)
        .text(screenshotName, {
          align: 'center',
          width: pageWidth
        });
      doc.moveDown();

      // Agregar la imagen
      doc.image(screenshot, {
        fit: [imageWidth, imageHeight],
        align: 'center'
      });
      doc.moveDown(2);
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function sendEmailReport(pdfPath: string, isFailureTest = false) {
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);

  const mailOptions = {
    from: EMAIL_CONFIG.auth.user,
    to: USER_EMAIL, // Usar el correo del usuario
    subject: isFailureTest ? 'Reporte de Prueba de Inicio de Sesión Fallido' : 'Reporte de Pruebas de Navegación',
    text: isFailureTest ? 
      'Adjunto encontrarás el reporte de la prueba de inicio de sesión fallido.' :
      'Adjunto encontrarás el reporte de las pruebas de navegación.',
    attachments: [{
      filename: path.basename(pdfPath),
      path: pdfPath
    }]
  };

  await transporter.sendMail(mailOptions);
}

async function runTestsAndSendEmail(testType: 'login' | 'failed-login') {
  try {
    // Crear directorio para screenshots si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    // Iniciar el servidor de desarrollo
    console.log('Iniciando el servidor de desarrollo...');
    await startServer();

    if (testType === 'login') {
      // Tomar capturas de pantalla del proceso de inicio de sesión exitoso
      console.log('Iniciando pruebas de login exitoso...');
      const { screenshots, testResults } = await takeScreenshots(false);

      // Generar PDF
      console.log('Generando reporte PDF...');
      const pdfPath = await generatePDFReport(screenshots, testResults);

      // Enviar correo con PDF adjunto
      await sendEmailReport(pdfPath);
    } else if (testType === 'failed-login') {
      // Tomar capturas de pantalla del proceso de inicio de sesión fallido
      console.log('Iniciando prueba de inicio de sesión fallido...');
      const { screenshots: failureScreenshots, testResults: failureTestResults } = await takeScreenshots(true);

      // Generar PDF de fallo
      console.log('Generando reporte PDF de fallo...');
      const failurePdfPath = await generatePDFReport(failureScreenshots, failureTestResults, true);

      // Enviar correo con PDF de fallo adjunto
      console.log('Enviando reporte de fallo por correo...');
      await sendEmailReport(failurePdfPath, true);
    }

  } catch (error) {
    console.error('Error al ejecutar las pruebas o enviar el reporte:', error);
    process.exit(1);
  } finally {
    await stopServer();
  }
}

// Obtener el tipo de prueba desde las variables de entorno
const TEST_TYPE = process.env.TEST_TYPE || 'login';

// Ejecutar la prueba correspondiente
runTestsAndSendEmail(TEST_TYPE as 'login' | 'failed-login'); 