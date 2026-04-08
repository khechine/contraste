import { NextRequest, NextResponse } from 'next/server';
import { deleteHeroAdminSection, updateHeroAdminSection } from '@/lib/directus-admin';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    const payload = await request.json();
    const hero = await updateHeroAdminSection(Number(resolved.id), payload);
    return NextResponse.json(hero);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const resolved = await params;
    await deleteHeroAdminSection(Number(resolved.id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
