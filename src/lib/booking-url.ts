/**
 * Build the public booking URL for a given token.
 *
 * Production:  https://client.kraftalis.com/booking/{token}
 * Development: {current origin}/booking/{token}   (fallback when env is empty)
 *
 * Set NEXT_PUBLIC_CLIENT_URL=https://client.kraftalis.com in production.
 */
export function getBookingUrl(token: string): string {
  const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

  if (clientUrl) {
    // Production — full URL on client subdomain
    return `${clientUrl}/booking/${token}`;
  }

  // Dev fallback — use current browser origin
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/booking/${token}`;
}
