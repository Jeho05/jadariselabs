import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware — Session refresh + Route protection
 *
 * Protected routes: /dashboard, /studio, /gallery
 * Auth routes: /login, /signup (redirect to /dashboard if already logged in)
 */

const PROTECTED_ROUTES = ['/dashboard', '/studio', '/gallery'];
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // --- Route Protection ---

    // If user is NOT authenticated and tries to access a protected route → redirect to /login
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (!user && isProtected) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user IS authenticated and tries to access auth routes → redirect to /dashboard
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
    if (user && isAuthRoute) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
