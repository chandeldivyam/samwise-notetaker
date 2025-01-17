'use client';

import { useRouter } from 'next/navigation';
import { Table } from 'antd';
import { Recording } from '@/types/recording';
import { useOptimisticRecordings } from '@/hooks/useOptimisticRecordings';
import { TableColumns } from './TableColumns';
import { NewRecordingButton } from './NewRecordingButton';

interface RecordingsListProps {
	initialRecordings: Recording[];
}

export default function RecordingsList({
	initialRecordings,
}: RecordingsListProps) {
	const router = useRouter();
	const { recordings, pendingDeletions, deleteRecordingOptimistic } =
		useOptimisticRecordings(initialRecordings);

	const handleRowClick = (record: Recording) => {
		router.push(`/dashboard/recordings/${record.id}`);
	};

	const handleMouseEnter = (path: string) => {
		router.prefetch(path);
	};

	return (
		<div className="min-h-[calc(100vh-64px)] bg-component-background p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-end items-center mb-8">
					<NewRecordingButton
						onMouseEnter={() =>
							handleMouseEnter('/dashboard/recordings/new')
						}
					/>
				</div>

				<Table
					columns={TableColumns({
						onDelete: deleteRecordingOptimistic,
						onMouseEnter: handleMouseEnter,
						pendingDeletions,
					})}
					dataSource={recordings.map((rec) => ({
						...rec,
						key: rec.id,
					}))}
					onRow={(record) => ({
						onClick: () => handleRowClick(record),
						onMouseEnter: () =>
							handleMouseEnter(
								`/dashboard/recordings/${record.id}`
							),
						className: 'cursor-pointer hover:bg-gray-50',
					})}
					locale={{ emptyText: 'No recordings yet' }}
				/>
			</div>
		</div>
	);
}
