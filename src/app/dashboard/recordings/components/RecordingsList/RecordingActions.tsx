import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Recording } from '@/types/recording';

interface RecordingActionsProps {
	recording: Recording;
	onDelete: (id: string) => Promise<void>;
	isPending: boolean;
}

export function RecordingActions({
	recording,
	onDelete,
	isPending,
}: RecordingActionsProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent row click
	};

	return (
		<div onClick={handleClick}>
			<Popconfirm
				title="Delete the recording"
				description="Are you sure you want to delete this recording?"
				onConfirm={() => onDelete(recording.id)}
				okText="Yes"
				cancelText="No"
				disabled={isPending}
			>
				<Button
					icon={<DeleteOutlined />}
					type="text"
					danger
					loading={isPending}
					disabled={isPending}
				/>
			</Popconfirm>
		</div>
	);
}
