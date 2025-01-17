// src/app/dashboard/recordings/page.tsx
import { getRecordings } from '@/lib/actions/recordings';
import RecordingsList from './components/RecordingsList';

export default async function RecordingsPage() {
	const { data: recordings, error } = await getRecordings();

	if (error) {
		// You might want to handle this error differently
		console.error('Error fetching recordings:', error);
	}

	return <RecordingsList initialRecordings={recordings || []} />;
}
