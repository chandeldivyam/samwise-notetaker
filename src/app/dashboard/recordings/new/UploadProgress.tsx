'use client';

import { Progress } from 'antd';

interface UploadProgressProps {
	progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
	return (
		<div className="mt-4">
			<Progress percent={progress} status="active" />
		</div>
	);
}
