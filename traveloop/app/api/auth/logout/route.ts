import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const isSecure = process.env.NODE_ENV === "production";

  // Clear the authentication cookie using next/headers
  const cookieStore = await cookies();
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0, // Immediately expire
    path: '/',
  });

  return NextResponse.json({ success: true, message: "Logged out successfully." }, { status: 200 });
}
