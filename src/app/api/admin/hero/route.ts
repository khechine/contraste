import { NextRequest, NextResponse } from 'next/server';
import { createHeroAdminSection, getHeroAdminSections } from '@/lib/directus-admin';

export async function GET(_: NextRequest) {
  try {
    const heroes = await getHeroAdminSections();
    return NextResponse.json(heroes);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const hero = await createHeroAdminSection(payload);
    return NextResponse.json(hero, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
