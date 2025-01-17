import { Suspense } from 'react';
import { NewRecordingForm } from './NewRecordingForm';
import { NewRecordingPageSkeleton } from './NewRecordingPageSkeleton';
import { getCurrentUser } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function NewRecordingPage() {
	const { user, error } = await getCurrentUser();

	if (error || !user) {
		redirect('/login');
	}

	return (
		<div className="min-h-[calc(100vh-48px)] bg-component-background">
			<div className="max-w-3xl mx-auto p-8">
				<Suspense fallback={<NewRecordingPageSkeleton />}>
					<NewRecordingForm userId={user.id} />
				</Suspense>
			</div>
		</div>
	);
}
