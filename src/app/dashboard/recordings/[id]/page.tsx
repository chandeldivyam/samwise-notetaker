// src/app/dashboard/recordings/[id]/page.tsx
import { Suspense } from 'react';
import { getRecording } from '@/lib/actions/recordings';
import RecordingDetailPage from './RecordingDetailPage';
import { RecordingDetailLoading } from './RecordingDetailLoading';
import { notFound } from 'next/navigation';

// Generate metadata for the page
export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const { data: recording } = await getRecording(resolvedParams.id);

	if (!recording) {
		return {
			title: 'Recording Not Found',
		};
	}

	return {
		title: `${recording.title} - Recording`,
		description: recording.description || 'Recording detail page',
	};
}

export default async function RecordingPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const { data: recording, error } = await getRecording(resolvedParams.id);

	if (error || !recording) {
		notFound();
	}

	return (
		<Suspense fallback={<RecordingDetailLoading />}>
			<RecordingDetailPage initialRecording={recording} />
		</Suspense>
	);
}
