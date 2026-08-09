export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Serve index.html for all routes (SPA handling)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/.')) {
    return new Response(null, { status: 307, headers: { location: '/' } });
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
