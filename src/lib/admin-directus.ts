import { createDirectus, rest, authentication } from '@directus/sdk';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus.contraste.tn';

// We use the 'json' strategy for browser-based authentication
// It will automatically manage the access/refresh tokens in localStorage if available
export const adminDirectus = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication('json'));

/**
 * Utility to check if the current user is authenticated
 */
export async function isAuthenticated() {
  try {
    const user = await adminDirectus.request(() => ({
      path: '/users/me',
      method: 'GET',
    }));
    return !!user;
  } catch (error) {
    return false;
  }
}
