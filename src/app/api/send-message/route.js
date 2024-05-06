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

import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { recipient, templateName, languageCode } = req.body;
  console.log("hola");

  const token =
    "EAAKQgg5ZCnWgBOzozEN7CY4Ld1lUogG7dQx1HzHEZBACJnZCXQZA0HIizuo4I3uo2CwZCjZAanK5ICm5MpvbqthZAPCMZBGEh7ar94r2jrDUPOZBoSKdx1A9JU0ZAZBrZByOWZAYABU2aZB8blRnwuhRPWwsqGSZA3MWY89aU1lGzMTZAwGmiPRFt7mFZBJURSE9Czx73pWJZBfnRHDdcYw3jFZCxcVZB3xZC";
  const url = "https://graph.facebook.com/v18.0/294497037073613/messages";

  const data = {
    messaging_product: "whatsapp",
    to: recipient,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // res.status(200).json({ success: true, data: response.data });
    return NextResponse.json("ok", { status: 200 });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
