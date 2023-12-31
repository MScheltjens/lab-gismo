import { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import createIntlMiddleware from 'next-intl/middleware';

const locales = ['en', 'fr', 'nl', 'de'];
const publicPages = ['/', '/login', '/register'];

const intlMiddleware = createIntlMiddleware({
  defaultLocale: 'en',
  locales,
});

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  (req) => intlMiddleware(req),
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(`^(/(${locales.join('|')}))?(${publicPages.join('|')})?/?$`, 'i');
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
