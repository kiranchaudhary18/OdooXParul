import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, serializeDocument } from "@/lib/mongodb";
import { comparePasswords, createJwtToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || body.pass || "");

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const passwordHash = (user as any).passwordHash;
    const isMatch = await comparePasswords(password, passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    const { passwordHash: removed, ...safeUser } = user as any;
    const token = createJwtToken({ userId: String(user._id), email });

    const isSecure = process.env.NODE_ENV === "production";

    // Set secure cookie using next/headers
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return NextResponse.json(
      { success: true, data: serializeDocument(safeUser), message: "Logged in successfully." }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unable to login." }, { status: 500 });
  }
}
