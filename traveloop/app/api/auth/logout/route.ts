import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const isSecure = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ success: true, message: "Logged out successfully." }, { status: 200 });

  // Clear the authentication cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0, // Immediately expire
    path: '/',
  });

  return response;
}
