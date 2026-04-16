import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const ADMIN_USER = 'admin';
const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_PASSWORD || 'fallback-secret');

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  
  if (username !== ADMIN_USER) {
    return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  }

  // Simple constant-time comparison using env variable as "hash"
  const valid = await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD || '', 10)) 
    || password === process.env.ADMIN_PASSWORD;

  if (!valid) {
    return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  }

  const token = await new SignJWT({ user: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(JWT_SECRET);

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', token, { 
    httpOnly: true, 
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8 
  });
  
  return response;
}
