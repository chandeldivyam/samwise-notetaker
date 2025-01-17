import { ColumnsType } from 'antd/es/table';
import { Recording } from '@/types/recording';
import { RecordingTitle } from './RecordingTitle';
import { RecordingActions } from './RecordingActions';
import { formatFileSize } from '@/utils/format';

interface TableColumnsProps {
	onDelete: (id: string) => Promise<void>;
	onMouseEnter: (path: string) => void;
	pendingDeletions: Set<string>;
}

export const TableColumns = ({
	onDelete,
	onMouseEnter,
	pendingDeletions,
}: TableColumnsProps): ColumnsType<Recording> => [
	{
		title: 'Title',
		key: 'title',
		render: (_, record) => (
			<RecordingTitle record={record} onMouseEnter={onMouseEnter} />
		),
	},
	{
		title: 'File Size',
		key: 'file_size',
		render: (_, record) => formatFileSize(record.file_size),
	},
	{
		title: 'Date',
		key: 'created_at',
		render: (_, record) =>
			new Date(record.created_at).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}),
	},
	{
		title: 'Actions',
		key: 'actions',
		render: (_, record) => (
			<RecordingActions
				recording={record}
				onDelete={onDelete}
				isPending={pendingDeletions.has(record.id)}
			/>
		),
	},
];
