// src/app/dashboard/recordings/[id]/page.tsx
import { getRecording } from '@/lib/actions/recordings';
import RecordingDetail from './RecordingDetail';
import { redirect } from 'next/navigation';

export default async function RecordingPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const { data: recording, error } = await getRecording(resolvedParams.id);

	if (error || !recording) {
		redirect('/dashboard/recordings');
	}

	return <RecordingDetail initialRecording={recording} />;
}
