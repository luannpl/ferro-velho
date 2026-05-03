import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const protectedRoutes = ['/dashboard', '/caixa', '/clientes', '/produtos', '/compras', '/vendas', '/transferencia'];
  const isDashboardPath = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // We should protect all dashboard routes. Looking at the previous context, there are routes like /dashboard, /clientes, /produtos, /caixa inside (home) folder.
  // Actually, any route inside (home) needs protection.
  
  if (isDashboardPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_secret_key_for_development'
      );
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // Se estiver na página de login e tiver token válido, redireciona pro dashboard
  if (request.nextUrl.pathname === '/') {
      if (token) {
          try {
              const secret = new TextEncoder().encode(
                  process.env.JWT_SECRET || 'fallback_secret_key_for_development'
              );
              await jwtVerify(token, secret);
              return NextResponse.redirect(new URL('/dashboard', request.url));
          } catch (error) {
              // Token inválido, deixa continuar pro login
          }
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
