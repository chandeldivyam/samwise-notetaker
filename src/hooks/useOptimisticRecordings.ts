import { useState, useCallback, useTransition } from 'react';
import { Recording } from '@/types/recording';
import { deleteRecording } from '@/lib/actions/recordings';
import { useMessage } from '@/utils/message';
import { useRouter } from 'next/navigation';

export function useOptimisticRecordings(initialRecordings: Recording[]) {
	const [recordings, setRecordings] = useState(initialRecordings);
	const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(
		new Set()
	);
	const [, startTransition] = useTransition();
	const message = useMessage();
	const router = useRouter();

	const deleteRecordingOptimistic = useCallback(
		async (id: string) => {
			// Set loading state first
			setPendingDeletions((prev) => new Set(prev).add(id));

			try {
				// Wait a short moment to show loading state
				await new Promise((resolve) => setTimeout(resolve, 300));

				// Start the actual deletion process
				const { error } = await deleteRecording(id);
				if (error) throw error;

				// If successful, update the UI optimistically
				setRecordings((prev) => prev.filter((rec) => rec.id !== id));
				message.success('Recording deleted successfully');

				// Refresh the server component
				startTransition(() => {
					router.refresh();
				});
			} catch (error) {
				console.error('Error:', error);
				message.error('Failed to delete recording');
			} finally {
				// Clear loading state
				setPendingDeletions((prev) => {
					const next = new Set(prev);
					next.delete(id);
					return next;
				});
			}
		},
		[initialRecordings, message, router]
	);

	return {
		recordings,
		pendingDeletions,
		deleteRecordingOptimistic,
	};
}
