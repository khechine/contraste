import { HeroSection } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN;

async function directusAdminRequest<T>(endpoint: string, init?: RequestInit): Promise<T> {
  if (!TOKEN) {
    throw new Error('DIRECTUS_TOKEN is required for admin Directus operations.');
  }

  const url = `${BASE_URL}/items/${endpoint}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Directus admin request failed: ${response.status} ${body}`);
  }

  const json = await response.json();
  return json.data;
}

export async function getHeroAdminSections(): Promise<HeroSection[]> {
  return directusAdminRequest<HeroSection[]>('hero_sections?sort=order');
}

export async function createHeroAdminSection(data: Partial<HeroSection>): Promise<HeroSection> {
  return directusAdminRequest<HeroSection>('hero_sections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHeroAdminSection(id: number, data: Partial<HeroSection>): Promise<HeroSection> {
  return directusAdminRequest<HeroSection>(`hero_sections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteHeroAdminSection(id: number): Promise<void> {
  await directusAdminRequest<null>(`hero_sections/${id}`, {
    method: 'DELETE',
  });
}

