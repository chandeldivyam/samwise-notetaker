import { type NextRequest } from 'next/server';
import {
	updateSession,
	protectDashboardRoute,
} from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
	// First update the session
	const sessionResponse = await updateSession(request);

	// Then check if it's a dashboard route that needs protection
	if (request.nextUrl.pathname.startsWith('/dashboard')) {
		const protectionResponse = await protectDashboardRoute(request);
		if (protectionResponse) {
			return protectionResponse; // Return the redirect if user is not authenticated
		}
	}

	return sessionResponse;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
