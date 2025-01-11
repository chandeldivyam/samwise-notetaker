import { Spin } from 'antd';

export default function DashboardLoading() {
	return (
		<div className="flex items-center justify-center h-[calc(100vh-64px)]">
			<Spin size="large" />
		</div>
	);
}
