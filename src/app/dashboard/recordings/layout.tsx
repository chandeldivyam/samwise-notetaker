'use client';

import { RecordingsProvider } from '@/contexts/RecordingsContext';

export default function RecordingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <RecordingsProvider>{children}</RecordingsProvider>;
}
