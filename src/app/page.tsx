'use client';

import { Button, Typography, Space, Row, Col } from 'antd';
import { EditOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

export default function Home() {
	const router = useRouter();

	const handleNavigation = () => {
		router.push('/dashboard');
	};

	return (
		<div className="min-h-screen bg-component-background p-8">
			<Row justify="center" align="middle" className="min-h-screen">
				<Col xs={24} sm={20} md={16} lg={12} className="text-center">
					<Space direction="vertical" size="large" className="w-full">
						<Title level={1}>Welcome to NoteTaker</Title>

						<Paragraph className="text-lg text-text-secondary">
							A simple and powerful note-taking application that
							helps you organize your thoughts, ideas, and tasks
							in one place. Start writing and organizing your
							notes today!
						</Paragraph>

						<Space size="middle">
							<Button
								type="primary"
								size="large"
								icon={<EditOutlined />}
								onClick={handleNavigation}
							>
								Go to Dashboard
							</Button>

							<Button
								size="large"
								icon={<LoginOutlined />}
								onClick={handleNavigation}
							>
								Sign Up / Login
							</Button>
						</Space>
					</Space>
				</Col>
			</Row>
		</div>
	);
}
