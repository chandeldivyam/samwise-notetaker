import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface NewRecordingButtonProps {
	onMouseEnter: () => void;
}

export function NewRecordingButton({ onMouseEnter }: NewRecordingButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		router.push('/dashboard/recordings/new');
	};

	return (
		<Button
			type="primary"
			icon={<PlusOutlined />}
			onClick={handleClick}
			onMouseEnter={onMouseEnter}
		>
			New Recording
		</Button>
	);
}
