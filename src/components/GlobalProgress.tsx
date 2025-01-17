// src/components/GlobalProgress.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
	minimum: 0.3,
	easing: 'ease',
	speed: 500,
	showSpinner: false,
});

let timeout: NodeJS.Timeout;

export function GlobalProgress() {
	const pathname = usePathname();

	useEffect(() => {
		// Start progress bar
		NProgress.start();

		// Clear any existing timeout to avoid multiple timeouts running
		clearTimeout(timeout);

		// Add a small delay before completing to ensure the progress bar is visible
		timeout = setTimeout(() => {
			NProgress.done();
		}, 300);

		// Cleanup timeout on unmount
		return () => {
			clearTimeout(timeout);
			NProgress.remove();
		};
	}, [pathname]); // Track both pathname and search params changes

	return null;
}
