// src/contexts/RecordingsContext.tsx
'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useMemo,
} from 'react';
import { getRecordings } from '@/lib/actions/recordings';
import { Recording } from '@/types/recording';
import { useMessage, showError } from '@/utils/message';

interface GroupedRecordings {
	[key: string]: Recording[];
}

interface RecordingsContextType {
	recordings: Recording[];
	groupedRecordings: GroupedRecordings;
	setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
	loading: boolean;
	refreshRecordings: () => Promise<void>;
}

const RecordingsContext = createContext<RecordingsContextType | undefined>(
	undefined
);

export function RecordingsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [recordings, setRecordings] = useState<Recording[]>([]);
	const [loading, setLoading] = useState(true);
	const messageApi = useMessage();

	const groupedRecordings = useMemo(() => {
		return recordings.reduce((groups: GroupedRecordings, recording) => {
			const date = new Date(recording.created_at).toLocaleDateString(
				'en-US',
				{
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}
			);

			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(recording);
			return groups;
		}, {});
	}, [recordings]);

	const refreshRecordings = async () => {
		try {
			const { data, error } = await getRecordings();
			if (error) throw error;
			setRecordings(data || []);
		} catch (error) {
			showError(messageApi, 'Failed to fetch recordings');
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refreshRecordings();
	}, []);

	return (
		<RecordingsContext.Provider
			value={{
				recordings,
				setRecordings,
				groupedRecordings,
				loading,
				refreshRecordings,
			}}
		>
			{children}
		</RecordingsContext.Provider>
	);
}

export function useRecordings() {
	const context = useContext(RecordingsContext);
	if (context === undefined) {
		throw new Error(
			'useRecordings must be used within a RecordingsProvider'
		);
	}
	return context;
}
