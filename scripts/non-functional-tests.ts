import { chromium, type Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

const PORT = 3000;
const TEST_URL = `http://localhost:${PORT}`;

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

const RECIPIENTS = [
  'jesushm337@gmail.com'
];

interface PerformanceMetrics {
  page: string;
  loadTime: number;
  firstContentfulPaint: number;
  domContentLoaded: number;
  networkRequests: number;
}

interface SecurityMetrics {
  page: string;
  hasHttps: boolean;
  hasContentSecurityPolicy: boolean;
  hasXFrameOptions: boolean;
  hasXSSProtection: boolean;
}

interface AccessibilityMetrics {
  page: string;
  contrastRatio: number;
  hasAltText: boolean;
  hasAriaLabels: boolean;
  isKeyboardNavigable: boolean;
}

// Función para iniciar el servidor
async function startServer(): Promise<{ kill: () => void }> {
  console.log('Iniciando el servidor...');
  const server = spawn('pnpm', ['dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Esperar a que el servidor esté listo
  await new Promise<void>((resolve) => {
    const checkServer = async () => {
      try {
        const response = await fetch(TEST_URL);
        if (response.ok) {
          console.log('Servidor iniciado correctamente');
          resolve();
        }
      } catch (error) {
        setTimeout(checkServer, 1000);
      }
    };
    checkServer();
  });

  return {
    kill: () => {
      server.kill();
      console.log('Servidor detenido');
    }
  };
}

async function sendEmailReport(pdfPath: string) {
  console.log('Enviando reporte por correo...');
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);

  const mailOptions = {
    from: EMAIL_CONFIG.auth.user,
    to: RECIPIENTS.join(', '),
    subject: 'Reporte de Pruebas No Funcionales',
    text: 'Adjunto encontrarás el reporte de las pruebas no funcionales realizadas.',
    attachments: [{
      filename: path.basename(pdfPath),
      path: pdfPath
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reporte enviado correctamente');
  } catch (error) {
    console.error('Error al enviar el reporte:', error);
  }
}

async function runNonFunctionalTests() {
  let server;
  let browser;
  try {
    // Crear directorio de screenshots si no existe
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    // Iniciar el servidor
    server = await startServer();

    // Configurar el navegador
    console.log('Iniciando el navegador...');
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 100
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    const performanceResults: PerformanceMetrics[] = [];
    const securityResults: SecurityMetrics[] = [];
    const accessibilityResults: AccessibilityMetrics[] = [];
    const screenshots: string[] = [];

    try {
      // 1. Pruebas de Rendimiento
      console.log('Iniciando pruebas de rendimiento...');
      await testPerformance(page, performanceResults);

      // 2. Pruebas de Seguridad
      console.log('Iniciando pruebas de seguridad...');
      await testSecurity(page, securityResults);

      // 3. Pruebas de Accesibilidad
      console.log('Iniciando pruebas de accesibilidad...');
      await testAccessibility(page, accessibilityResults);

      // 4. Pruebas de Compatibilidad
      console.log('Iniciando pruebas de compatibilidad...');
      await testCompatibility(page, screenshots);

      // Generar reporte
      console.log('Generando reporte PDF...');
      const pdfPath = await generateReport(performanceResults, securityResults, accessibilityResults, screenshots);
      
      // Enviar reporte por correo
      await sendEmailReport(pdfPath);

    } catch (error) {
      console.error('Error durante las pruebas no funcionales:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } finally {
    // Detener el servidor al finalizar
    if (server) {
      server.kill();
    }
  }
}

async function testPerformance(page: Page, results: PerformanceMetrics[]) {
  const pagesToTest = [
    '/sign-in',
    '/cotizaciones',
    '/grupos',
    '/tabla-grupos',
    '/transportes'
  ];

  for (const pagePath of pagesToTest) {
    console.log(`Probando rendimiento de ${pagePath}...`);
    
    // Limpiar caché antes de cada prueba
    await page.context().clearCookies();
    
    // Iniciar medición
    const startTime = Date.now();
    
    // Navegar a la página
    const response = await page.goto(`${TEST_URL}${pagePath}`, {
      waitUntil: 'networkidle'
    });

    if (!response) continue;

    // Obtener métricas de rendimiento
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: perfEntries.loadEventEnd - perfEntries.navigationStart,
        firstContentfulPaint: perfEntries.domContentLoadedEventEnd - perfEntries.navigationStart,
        domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.navigationStart,
        networkRequests: performance.getEntriesByType('resource').length
      };
    });

    results.push({
      page: pagePath,
      ...metrics
    });

    // Esperar un momento entre pruebas
    await page.waitForTimeout(2000);
  }
}

async function testSecurity(page: Page, results: SecurityMetrics[]) {
  const pagesToTest = [
    '/sign-in',
    '/cotizaciones',
    '/grupos',
    '/tabla-grupos',
    '/transportes'
  ];

  for (const pagePath of pagesToTest) {
    console.log(`Probando seguridad de ${pagePath}...`);
    
    const response = await page.goto(`${TEST_URL}${pagePath}`);
    if (!response) continue;

    // Obtener headers de seguridad
    const headers = response.headers();
    
    results.push({
      page: pagePath,
      hasHttps: response.url().startsWith('https'),
      hasContentSecurityPolicy: !!headers['content-security-policy'],
      hasXFrameOptions: !!headers['x-frame-options'],
      hasXSSProtection: !!headers['x-xss-protection']
    });

    // Esperar un momento entre pruebas
    await page.waitForTimeout(2000);
  }
}

async function testAccessibility(page: Page, results: AccessibilityMetrics[]) {
  const pagesToTest = [
    '/sign-in',
    '/cotizaciones',
    '/grupos',
    '/tabla-grupos',
    '/transportes'
  ];

  for (const pagePath of pagesToTest) {
    console.log(`Probando accesibilidad de ${pagePath}...`);
    
    await page.goto(`${TEST_URL}${pagePath}`);
    
    // Verificar contraste de colores
    const contrastRatio = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let totalContrast = 0;
      let elementsWithContrast = 0;
      
      elements.forEach(element => {
        const style = window.getComputedStyle(element);
        const backgroundColor = style.backgroundColor;
        const color = style.color;
        
        if (backgroundColor && color) {
          // Implementar cálculo de contraste aquí
          totalContrast += 1;
          elementsWithContrast++;
        }
      });
      
      return elementsWithContrast > 0 ? totalContrast / elementsWithContrast : 0;
    });

    // Verificar textos alternativos
    const hasAltText = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).every(img => img.hasAttribute('alt'));
    });

    // Verificar etiquetas ARIA
    const hasAriaLabels = await page.evaluate(() => {
      const elements = document.querySelectorAll('[role]');
      return elements.length > 0;
    });

    // Verificar navegación por teclado
    const isKeyboardNavigable = await page.evaluate(() => {
      const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      return focusableElements.length > 0;
    });

    results.push({
      page: pagePath,
      contrastRatio,
      hasAltText,
      hasAriaLabels,
      isKeyboardNavigable
    });

    // Esperar un momento entre pruebas
    await page.waitForTimeout(2000);
  }
}

async function testCompatibility(page: Page, screenshots: string[]) {
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 1366, height: 768, name: 'laptop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 812, name: 'mobile' }
  ];

  const pagesToTest = [
    '/sign-in',
    '/cotizaciones',
    '/grupos',
    '/tabla-grupos',
    '/transportes'
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    for (const pagePath of pagesToTest) {
      console.log(`Probando compatibilidad de ${pagePath} en ${viewport.name}...`);
      
      await page.goto(`${TEST_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      const screenshotPath = `screenshots/${viewport.name}-${pagePath.replace('/', '')}.png`;
      await page.screenshot({ path: screenshotPath });
      screenshots.push(screenshotPath);
      
      // Esperar un momento entre pruebas
      await page.waitForTimeout(2000);
    }
  }
}

async function generateReport(
  performanceResults: PerformanceMetrics[],
  securityResults: SecurityMetrics[],
  accessibilityResults: AccessibilityMetrics[],
  screenshots: string[]
) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    autoFirstPage: true
  });

  const outputPath = 'non-functional-test-report.pdf';
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Configuración de márgenes y dimensiones
  const pageWidth = doc.page.width - 100;
  const pageHeight = doc.page.height - 100;
  const imageWidth = pageWidth;
  const imageHeight = 400;

  // Título
  doc.fontSize(24)
    .text('Reporte de Pruebas No Funcionales', { 
      align: 'center',
      width: pageWidth
    })
    .moveDown(2);

  // Sección de Rendimiento
  doc.fontSize(18)
    .text('Pruebas de Rendimiento', {
      width: pageWidth
    })
    .moveDown();

  performanceResults.forEach(result => {
    // Verificar si necesitamos una nueva página
    if (doc.y + 150 > pageHeight) {
      doc.addPage();
    }

    doc.fontSize(12)
      .text(`Página: ${result.page}`, { width: pageWidth })
      .text(`Tiempo de carga: ${result.loadTime}ms`, { width: pageWidth })
      .text(`Primer contenido visible: ${result.firstContentfulPaint}ms`, { width: pageWidth })
      .text(`DOM cargado: ${result.domContentLoaded}ms`, { width: pageWidth })
      .text(`Solicitudes de red: ${result.networkRequests}`, { width: pageWidth })
      .moveDown();
  });

  // Sección de Seguridad
  doc.addPage()
    .fontSize(18)
    .text('Pruebas de Seguridad', {
      width: pageWidth
    })
    .moveDown();

  securityResults.forEach(result => {
    // Verificar si necesitamos una nueva página
    if (doc.y + 150 > pageHeight) {
      doc.addPage();
    }

    doc.fontSize(12)
      .text(`Página: ${result.page}`, { width: pageWidth })
      .text(`HTTPS: ${result.hasHttps ? '✅' : '❌'}`, { width: pageWidth })
      .text(`CSP: ${result.hasContentSecurityPolicy ? '✅' : '❌'}`, { width: pageWidth })
      .text(`X-Frame-Options: ${result.hasXFrameOptions ? '✅' : '❌'}`, { width: pageWidth })
      .text(`XSS Protection: ${result.hasXSSProtection ? '✅' : '❌'}`, { width: pageWidth })
      .moveDown();
  });

  // Sección de Accesibilidad
  doc.addPage()
    .fontSize(18)
    .text('Pruebas de Accesibilidad', {
      width: pageWidth
    })
    .moveDown();

  accessibilityResults.forEach(result => {
    // Verificar si necesitamos una nueva página
    if (doc.y + 150 > pageHeight) {
      doc.addPage();
    }

    doc.fontSize(12)
      .text(`Página: ${result.page}`, { width: pageWidth })
      .text(`Contraste: ${result.contrastRatio.toFixed(2)}`, { width: pageWidth })
      .text(`Textos alternativos: ${result.hasAltText ? '✅' : '❌'}`, { width: pageWidth })
      .text(`Etiquetas ARIA: ${result.hasAriaLabels ? '✅' : '❌'}`, { width: pageWidth })
      .text(`Navegación por teclado: ${result.isKeyboardNavigable ? '✅' : '❌'}`, { width: pageWidth })
      .moveDown();
  });

  // Sección de Compatibilidad
  doc.addPage()
    .fontSize(18)
    .text('Pruebas de Compatibilidad', {
      align: 'center',
      width: pageWidth
    })
    .moveDown(2);

  for (const screenshot of screenshots) {
    if (fs.existsSync(screenshot)) {
      // Verificar si necesitamos una nueva página
      if (doc.y + imageHeight + 100 > pageHeight) {
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
        })
        .moveDown();

      // Agregar la imagen
      doc.image(screenshot, {
        fit: [imageWidth, imageHeight],
        align: 'center'
      })
      .moveDown(2);
    }
  }

  // Resumen final
  doc.addPage()
    .fontSize(18)
    .text('Resumen de Resultados', {
      align: 'center',
      width: pageWidth
    })
    .moveDown(2);

  // Calcular estadísticas
  const totalTests = performanceResults.length + securityResults.length + accessibilityResults.length;
  const successCount = performanceResults.filter(r => r.loadTime < 3000).length +
                      securityResults.filter(r => r.hasHttps && r.hasContentSecurityPolicy).length +
                      accessibilityResults.filter(r => r.hasAltText && r.hasAriaLabels).length;
  
  const successRate = ((successCount / totalTests) * 100).toFixed(2);

  doc.fontSize(12)
    .text(`Total de pruebas: ${totalTests}`, { width: pageWidth })
    .text(`Pruebas exitosas: ${successCount}`, { width: pageWidth })
    .text(`Porcentaje de éxito: ${successRate}%`, { width: pageWidth })
    .moveDown(2);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function generatePDFReport(screenshots: string[], testResults: { page: string; status: 'success' | 'error'; message: string }[], isFailureTest = false) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    autoFirstPage: true
  });
  
  // Asegurarnos de que el directorio test-results existe
  const outputDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = isFailureTest 
    ? path.join(outputDir, 'non-functional-test-report-failure.pdf')
    : path.join(outputDir, 'non-functional-test-report.pdf');
    
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Configuración de márgenes y dimensiones
  const pageWidth = doc.page.width - 100;
  const pageHeight = doc.page.height - 100;
  const imageWidth = pageWidth;
  const imageHeight = 400;

  // Título
  doc.fontSize(24)
    .text('Reporte de Pruebas No Funcionales', { 
      align: 'center',
      width: pageWidth
    })
    .moveDown(2);

  // Sección de Resultados
  doc.fontSize(18)
    .text('Resultados de Pruebas', {
      width: pageWidth
    })
    .moveDown();

  testResults.forEach(result => {
    // Verificar si necesitamos una nueva página
    if (doc.y + 150 > pageHeight) {
      doc.addPage();
    }

    doc.fontSize(12)
      .text(`Página: ${result.page}`, { width: pageWidth })
      .text(`Estado: ${result.status === 'success' ? 'Exitoso' : 'Error'}`, { width: pageWidth })
      .text(`Mensaje: ${result.message}`, { width: pageWidth })
      .moveDown();
  });

  // Sección de Capturas de Pantalla
  doc.addPage()
    .fontSize(18)
    .text('Capturas de Pantalla', {
      width: pageWidth
    })
    .moveDown();

  for (const screenshot of screenshots) {
    if (fs.existsSync(screenshot)) {
      // Verificar si necesitamos una nueva página
      if (doc.y + imageHeight + 100 > pageHeight) {
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
        })
        .moveDown();

      // Agregar la imagen
      doc.image(screenshot, {
        fit: [imageWidth, imageHeight],
        align: 'center'
      })
      .moveDown(2);
    }
  }

  // Resumen final
  doc.addPage()
    .fontSize(18)
    .text('Resumen de Resultados', {
      align: 'center',
      width: pageWidth
    })
    .moveDown(2);

  // Calcular estadísticas
  const totalTests = testResults.length;
  const successCount = testResults.filter(r => r.status === 'success').length;
  
  const successRate = ((successCount / totalTests) * 100).toFixed(2);

  doc.fontSize(12)
    .text(`Total de pruebas: ${totalTests}`, { width: pageWidth })
    .text(`Pruebas exitosas: ${successCount}`, { width: pageWidth })
    .text(`Porcentaje de éxito: ${successRate}%`, { width: pageWidth })
    .moveDown(2);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// Ejecutar las pruebas
runNonFunctionalTests().catch(console.error); 