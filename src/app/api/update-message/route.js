import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req) {
  try {
    const { message } = await req.json();

    const filePath = path.join(process.cwd(), "public", "message.json");

    let error = false;

    fs.writeFile(filePath, JSON.stringify({ message }), "utf8", (err) => {
      if (err) {
        error = true;
      }
    });
    
    if (error) {
      return NextResponse.json(
        {
          message: "Error al actualizar el mensaje",
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Mensaje actualizado correctamente",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Ocurrio un error", error },
      { status: 500 }
    );
  }
}
