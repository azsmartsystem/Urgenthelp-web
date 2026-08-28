// Route protection — Technical Implementation Spec §23/§3.3.
// Refreshes the Supabase session on every request and guards
// customer/helper/admin route groups. Real page-level RBAC (mode +
// verification checks) additionally happens in each route's server
// component / API handler — middleware is the coarse first gate.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPrefixes = ['/dashboard', '/helper', '/bookings', '/wallet', '/messages', '/settings'];
  const isProtected = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login' && request.nextUrl.pathname !== '/admin/setup') {
    const adminSession = request.cookies.get('uh_admin_session');
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/helper/:path*', '/bookings/:path*', '/wallet/:path*', '/messages/:path*', '/settings/:path*', '/admin/:path*'],
};
