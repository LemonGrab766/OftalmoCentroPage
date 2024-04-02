/** @format */

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // const secretKey = process?.env?.SECRET_KEY;
    const { ID, EMAIL, PASSWORD, SECRET_KEY } = process.env;
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Faltan campos por llenar" },
        { status: 400 }
      );
    }

    if (email !== EMAIL || password !== PASSWORD) {
      return NextResponse.json(
        { message: "Los datos no son correctos" },
        { status: 400 }
      );
    }

    const user = { id: ID, email };
    const token = jwt.sign(user, SECRET_KEY, {
      expiresIn: 2592000,
    });

    const response = NextResponse.json(
      { message: "Se inicio sesion" },
      { status: 200 }
    );

    response.cookies.set("auth_cookie", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 604800,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Ha ocurrido un error", error },
      { status: 500 }
    );
  }
}
