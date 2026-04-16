import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  const content = await prisma.content.findFirst() || {
    text: "Dear Friend,\n\nEvery moment we shared sparkles in my memory like stars in a gentle night sky...",
    signature: "Your Name",
    theme: "cherry-blossom",
    images: [],
    musicUrl: null
  };
  return NextResponse.json(content);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  
  const content = await prisma.content.upsert({
    where: { id: '1' },
    update: body,
    create: { id: '1', ...body }
  });
  
  return NextResponse.json(content);
}
