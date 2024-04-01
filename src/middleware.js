import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = process?.env?.NEXT_PUBLIC_URL;
  try {
    const token = req.cookies.get("auth_cookie");
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const res = await fetch(url + "/check", {
      method: "GET",
      headers: {
        token: token.value,
      },
    });

    if (res.status !== 200) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/"],
};
