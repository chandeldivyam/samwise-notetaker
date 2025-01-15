// src/app/dashboard/recordings/layout.tsx
import { RecordingsProvider } from '@/contexts/RecordingsContext';

export default function RecordingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <RecordingsProvider>{children}</RecordingsProvider>;
}
