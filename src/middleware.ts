import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// In-memory rate limiting map for API endpoints
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Permitir pre-flight OPTIONS
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // 2. Rate Limiting em rotas de API
  if (pathname.startsWith('/api/')) {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp?.trim()) || '127.0.0.1';

    const now = Date.now();
    const rateRecord = ipRateMap.get(ip);

    if (!rateRecord || now >= rateRecord.resetAt) {
      ipRateMap.set(ip, { count: 1, resetAt: now + 60000 });
    } else {
      rateRecord.count++;
      if (rateRecord.count > 60) {
        return NextResponse.json(
          {
            success: false,
            error: 'Taxa limite de requisições excedida. Aguarde 1 minuto.',
            code: 'TOOLS_RATE_LIMIT_EXCEEDED',
          },
          {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-Shield': 'v5-tools-rate-shield-v1',
            },
          }
        );
      }
    }
  }

  // 3. Injeção de Cabeçalhos de Segurança Soberana (OWASP)
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Shield', 'v5-apollo-tools-edge-guard-v1');

  return response;
}
