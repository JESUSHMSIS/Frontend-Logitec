import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import nodemailer from "nodemailer";
import fs from "fs";

// Configuración del transporter de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jeshuanaco7@gmail.com',
    pass: 'homl jcel zxsf zrru'
  }
});

export async function POST(req: Request) {
  try {
    const { type, email, testType } = await req.json();
    console.log("Recibida solicitud:", { type, email, testType });

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email y tipo de prueba son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de correo electrónico inválido" },
        { status: 400 }
      );
    }

    // Configurar el comando según el tipo de prueba
    let command;
    let reportPath;
    switch (type) {
      case "functional":
        command = "pnpm test:all";
        reportPath = path.join(process.cwd(), "test-results", "functional-test-report.pdf");
        break;
      case "performance":
        command = "pnpm test:non-functional";
        reportPath = path.join(process.cwd(), "test-results", "non-functional-test-report.pdf");
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de prueba no válido" },
          { status: 400 }
        );
    }

    console.log("Ejecutando comando:", command);
    console.log("Ruta del reporte:", reportPath);

    // Crear directorio para reportes si no existe
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      console.log("Creando directorio para reportes:", reportDir);
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Ejecutar el comando
    const child = spawn(command, {
      shell: true,
      env: {
        ...process.env,
        TEST_EMAIL: email,
        TEST_TYPE: testType || 'login' // Agregar el tipo de prueba como variable de entorno
      },
      cwd: process.cwd(),
    });

    let output = "";
    let error = "";

    child.stdout.on("data", (data) => {
      const message = data.toString();
      output += message;
      console.log(`Test output: ${message}`);
    });

    child.stderr.on("data", (data) => {
      const message = data.toString();
      error += message;
      console.error(`Test error: ${message}`);
    });

    return new Promise((resolve) => {
      child.on("close", async (code) => {
        console.log("Proceso terminado con código:", code);
        console.log("Verificando archivo de reporte en:", reportPath);
        
        if (code === 0) {
          try {
            // Verificar si el archivo PDF existe
            if (!fs.existsSync(reportPath)) {
              console.error("No se encontró el archivo de reporte");
              console.log("Continuando sin el archivo PDF...");
              
              // Enviar correo sin PDF adjunto
              const mailOptions = {
                from: 'jeshuanaco7@gmail.com',
                to: email,
                subject: `Reporte de Pruebas ${type === 'functional' ? 'Funcionales' : 'de Rendimiento'}`,
                text: `Se han completado las pruebas ${type === 'functional' ? 'funcionales' : 'de rendimiento'}.\n\nLas pruebas se completaron correctamente pero no se pudo generar el reporte PDF.`,
                html: `
                  <h2>Reporte de Pruebas ${type === 'functional' ? 'Funcionales' : 'de Rendimiento'}</h2>
                  <p>Se han completado las pruebas exitosamente.</p>
                  <p>Las pruebas se completaron correctamente pero no se pudo generar el reporte PDF.</p>
                `
              };

              console.log("Enviando correo sin PDF adjunto a:", email);
              await transporter.sendMail(mailOptions);
              console.log('Correo enviado correctamente');

              resolve(
                NextResponse.json({
                  success: true,
                  message: "Pruebas ejecutadas correctamente. No se pudo generar el reporte PDF.",
                  output,
                })
              );
              return;
            }

            console.log("Archivo de reporte encontrado, preparando envío de correo");

            // Enviar correo con el reporte PDF
            const mailOptions = {
              from: 'jeshuanaco7@gmail.com',
              to: email,
              subject: `Reporte de Pruebas ${type === 'functional' ? 'Funcionales' : 'de Rendimiento'}`,
              text: `Se han completado las pruebas ${type === 'functional' ? 'funcionales' : 'de rendimiento'}.\n\nAdjunto encontrarás el reporte detallado en formato PDF.`,
              html: `
                <h2>Reporte de Pruebas ${type === 'functional' ? 'Funcionales' : 'de Rendimiento'}</h2>
                <p>Se han completado las pruebas exitosamente.</p>
                <p>Adjunto encontrarás el reporte detallado en formato PDF.</p>
              `,
              attachments: [
                {
                  filename: path.basename(reportPath),
                  path: reportPath
                }
              ]
            };

            console.log("Enviando correo a:", email);
            await transporter.sendMail(mailOptions);
            console.log('Correo con PDF enviado correctamente');

            resolve(
              NextResponse.json({
                success: true,
                message: "Pruebas ejecutadas correctamente y reporte PDF enviado",
                output,
              })
            );
          } catch (emailError) {
            console.error('Error al enviar el correo:', emailError);
            resolve(
              NextResponse.json(
                {
                  success: false,
                  message: "Error al enviar el reporte por correo",
                  error: emailError,
                },
                { status: 500 }
              )
            );
          }
        } else {
          console.error("Error en la ejecución de las pruebas:", error);
          resolve(
            NextResponse.json(
              {
                success: false,
                message: "Error al ejecutar las pruebas",
                error,
              },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error("Error en el endpoint:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 