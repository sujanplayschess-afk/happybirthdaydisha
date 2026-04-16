import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_PASSWORD || '');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
