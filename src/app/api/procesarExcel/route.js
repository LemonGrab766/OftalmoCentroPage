import twilio from "twilio";
import * as xlsx from "xlsx";
const fs = require("fs");

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.formData();
    const { file } = Object.fromEntries(body.entries());
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(data, "data");

    const accountSid = process.env.ACCOUNT_SID;
    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;
    const fromWhatsAppNumber = process.env.NUMBER;
    const client = twilio(apiKey, apiSecret, { accountSid: accountSid });

    // Dentro de la función handler, después de extraer los datos
    // data.forEach(async ({ Nombre, Telefono }) => {
    //   await client.messages.create({
    //     body: `Hola ${Nombre}, este es un mensaje de prueba.`,
    //     from: fromWhatsAppNumber,
    //     to: `whatsapp:${Telefono}`,
    //   });
    // });
    return NextResponse.json(
      { message: "Procesado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Ocurrio un error", error },
      { status: 500 }
    );
  }
}
