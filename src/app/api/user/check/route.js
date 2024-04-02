import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // const secretKey = process?.env?.SECRET_KEY;
    const { ID, EMAIL, SECRET_KEY } = process.env;
    const headersList = headers();
    const token = headersList.get("token");

    const isTokenValid = jwt.verify(token, SECRET_KEY);

    if (isTokenValid.id !== ID || isTokenValid.email !== EMAIL) {
      NextResponse.json(
        { message: "Los datos no son correctos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "El usuario es correcto" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Ha ocurrido un error", error },
      { status: 500 }
    );
  }
}
