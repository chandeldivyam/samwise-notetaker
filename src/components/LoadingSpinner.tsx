import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = ({ size = 16 }: { size?: number }) => {
	const antIcon = <LoadingOutlined style={{ fontSize: size }} spin />;
	return <Spin indicator={antIcon} />;
};

export default LoadingSpinner;
