'use client';

import { Typography } from 'antd';
import NotesLayout from '@/components/NotesLayout';

const { Title } = Typography;

export default function NotesPage() {
	return (
		<NotesLayout>
			<div className="flex items-center justify-center h-full">
				<div className="text-center text-gray-500">
					<Title level={3}>Select a note or create a new one</Title>
					<p>Your notes will appear here</p>
				</div>
			</div>
		</NotesLayout>
	);
}
