import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {

    const { pathname } = req.nextUrl;

    /*
     * PUBLIC ROUTES
     */

    const publicPages = [
        "/",
        "/authenticate",
        "/authenticate/login",
        "/authenticate/signup",
    ];

    const isPublicPage =
        publicPages.includes(pathname);

    /*
     * NEXTAUTH ROUTES MUST REMAIN PUBLIC
     *
     * NextAuth itself needs these endpoints
     * to perform login/session handling.
     */

    const isAuthApi =
        pathname.startsWith("/api/auth");

    /*
     * PUBLIC STATIC / NEXT INTERNAL FILES
     *
     * These normally aren't matched because of
     * the matcher below, but keeping the checks
     * makes the middleware safer.
     */

    const isNextInternal =
        pathname.startsWith("/_next");

    const isStaticFile =
        pathname.includes(".");

    /*
     * Allow public pages.
     */

    if (
        isPublicPage ||
        isAuthApi ||
        isNextInternal ||
        isStaticFile
    ) {
        return NextResponse.next();
    }

    /*
     * GET USER TOKEN
     *
     * NextAuth stores the JWT in the session cookie.
     */

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    /*
     * NOT LOGGED IN
     */

    if (!token) {

        /*
         * API REQUEST
         *
         * Don't redirect an API request to
         * the login page because Axios would
         * receive HTML instead of JSON.
         */

        if (pathname.startsWith("/api/")) {

            return NextResponse.json(
                {
                    error: "Authentication required",
                    message:
                        "Please login to access this API.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * NORMAL WEBSITE PAGE
         *
         * Send the user to login.
         */

        const loginUrl =
            new URL(
                "/authenticate/login",
                req.url
            );

        /*
         * Remember where the user wanted to go.
         */

        loginUrl.searchParams.set(
            "callbackUrl",
            pathname
        );

        return NextResponse.redirect(
            loginUrl
        );
    }

    /*
     * USER IS AUTHENTICATED
     */

    return NextResponse.next();
}

/*
 * IMPORTANT:
 *
 * Middleware runs on:
 *
 * - Pages
 * - API routes
 *
 * But not on Next.js internals/static files.
 */

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};