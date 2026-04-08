import { NextRequest, NextResponse } from 'next/server';

const LOCAL_IMAGES = [
  '/images/books-with-colorful-covers-arrangement.jpg',
  '/images/unrecognizable-woman-reading-book-from-stack.jpg',
]; 


const CACHE_DURATION = 86400000; // 24 heures en millisecondes

// Cache simple en mémoire (en production, utiliser Redis)
const imageCache = new Map<string, { url: string; timestamp: number }>();

function getLocalImage(): string {
  // Retourner une image locale aléatoire
  const randomIndex = Math.floor(Math.random() * LOCAL_IMAGES.length);
  return LOCAL_IMAGES[randomIndex];
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, sectionType } = await request.json();

    if (!title && !description) {
      return NextResponse.json(
        { error: 'Either title or description is required' },
        { status: 400 }
      );
    }

    // Créer une clé de cache
    const cacheKey = `hero_${title || description}`.toLowerCase();

    // Vérifier le cache
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ url: cached.url, cached: true });
    }

    // Obtenir une image locale
    const imageUrl = getLocalImage();

    // Mettre en cache
    imageCache.set(cacheKey, {
      url: imageUrl,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      url: imageUrl,
      cached: false,
      title,
      sectionType,
      source: 'local',
    });
  } catch (error: unknown) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get image',
      },
      { status: 500 }
    );
  }
}
