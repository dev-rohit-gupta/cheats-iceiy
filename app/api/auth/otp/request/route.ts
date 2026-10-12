import { NextResponse } from "next/server";

// OTP login has been retired. Never send email from this endpoint.
export async function POST() {
  return NextResponse.json({ error: "OTP login is no longer available. Sign in with your password." }, { status: 410 });
}
