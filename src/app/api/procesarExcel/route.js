// import twilio from "twilio";
// import * as xlsx from "xlsx";
// const fs = require("fs");

// import { Client } from 'whatsapp-web.js';
// import QRCode from 'qrcode-terminal';

// import { NextResponse } from "next/server";
// import { numberToHour } from "@/utils/numberToHour";

// export async function POST(req) {
//   try {
//     const body = await req.formData();
//     const { file } = Object.fromEntries(body.entries());
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     const workbook = xlsx.read(buffer, { type: "buffer" });

//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     console.log(data, "data");

//       // Inicializa el cliente de WhatsApp Web JS
//       const client = new Client();
//       client.on('qr', qr => {
//           QRCode.generate(qr, {small: true});
//       });
      
//       client.on('ready', async () => {
//           console.log('Client is ready!');
          
//           // Dentro de la función handler, después de extraer los datos
//           for (const { Hora, Nombre, Numero } of data) {
//             const hour = numberToHour(Hora);
//             try {
//               // Asegúrate de que el número tenga el formato correcto, incluyendo el código de país
//               await client.sendMessage(`${Numero}@c.us`, `Hola ${Nombre}, este es un mensaje de prueba, la hora es ${hour}.`);
//             } catch (error) {
//               console.error(error); // Captura y loguea cualquier error
//             }
//           }
  
//           client.destroy(); // Cierra la sesión del cliente después de enviar los mensajes
//       });
  
//       await client.initialize();

//     return NextResponse.json(
//       { message: "Procesado correctamente" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Ocurrio un error", error },
//       { status: 500 }
//     );
//   }
// }
