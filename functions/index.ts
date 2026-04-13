/**
 * Cloudflare Pages Function: root URL language redirect.
 * Reads Accept-Language header and redirects to /de/ or /en/.
 * Runs at the edge, zero client-side flash.
 */

function parseAcceptLanguage(header: string): 'de' | 'en' {
  const parts = header.split(',').map((part) => {
    const [lang, q] = part.trim().split(';q=');
    return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1.0 };
  });
  parts.sort((a, b) => b.q - a.q);

  for (const { lang } of parts) {
    if (lang.startsWith('en')) return 'en';
    // de, fr, it all route to /de/ (Swiss default)
    if (lang.startsWith('de') || lang.startsWith('fr') || lang.startsWith('it')) return 'de';
  }

  return 'de';
}

export const onRequest: PagesFunction = async (context) => {
  const acceptLanguage = context.request.headers.get('Accept-Language') ?? '';
  const lang = parseAcceptLanguage(acceptLanguage);

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${lang}/`,
      Vary: 'Accept-Language',
    },
  });
};
