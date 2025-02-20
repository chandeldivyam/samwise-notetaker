'use client';

import {
	Button,
	Card,
	Form,
	Input,
	Space,
	Typography,
	Tabs,
	message,
	ConfigProvider,
	theme as antTheme,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login, signup } from './actions';
import styles from './login.module.css';
import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';
import './styles.css';

const { Title } = Typography;
type TabKey = 'login' | 'signup';

export default function LoginPage() {
	const [loginForm] = Form.useForm();
	const [signupForm] = Form.useForm();
	const [isLoginLoading, setIsLoginLoading] = useState(false);
	const [isSignupLoading, setIsSignupLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<TabKey>('login');
	const [messageApi, contextHolder] = message.useMessage();
	const { theme } = useTheme();

	const handleLogin = async () => {
		try {
			const values = await loginForm.validateFields();
			setIsLoginLoading(true);
			const response = await login(values);

			if (response?.error) {
				messageApi.error({
					content: response.error,
					duration: 3,
				});
			}
		} catch (error) {
			console.error('Login failed:', error);
		} finally {
			setIsLoginLoading(false);
		}
	};

	const handleSignup = async () => {
		try {
			const values = await signupForm.validateFields();
			setIsSignupLoading(true);
			const response = await signup(values);

			if (response?.error) {
				messageApi.error({
					content: response.error,
					duration: 3,
				});
			} else if (response?.success) {
				messageApi.success({
					content:
						'Account created! Please check your email to verify your account.',
					duration: 4,
				});
			}
		} catch (error) {
			console.error('Signup failed:', error);
		} finally {
			setIsSignupLoading(false);
		}
	};

	const LoginForm = () => (
		<Form
			form={loginForm}
			layout="vertical"
			size="large"
			requiredMark={false}
		>
			<Form.Item
				name="email"
				rules={[
					{ required: true, message: 'Please input your email!' },
					{ type: 'email', message: 'Please enter a valid email!' },
				]}
			>
				<Input
					prefix={<UserOutlined />}
					placeholder="Email"
					type="email"
					style={{
						background: 'var(--component-background)',
						borderColor: 'var(--border-color)',
					}}
				/>
			</Form.Item>

			<Form.Item
				name="password"
				rules={[
					{ required: true, message: 'Please input your password!' },
					{
						min: 6,
						message: 'Password must be at least 6 characters!',
					},
				]}
			>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Password"
					style={{
						background: 'var(--component-background)',
						borderColor: 'var(--border-color)',
					}}
				/>
			</Form.Item>

			<Form.Item>
				<Button
					type="primary"
					block
					onClick={handleLogin}
					disabled={isLoginLoading}
				>
					{isLoginLoading ? (
						<Space>
							<LoadingSpinner size={16} />
							Logging in
						</Space>
					) : (
						'Log in'
					)}
				</Button>
			</Form.Item>
		</Form>
	);

	const SignupForm = () => (
		<Form
			form={signupForm}
			layout="vertical"
			size="large"
			requiredMark={false}
		>
			<Form.Item
				name="email"
				rules={[
					{ required: true, message: 'Please input your email!' },
					{ type: 'email', message: 'Please enter a valid email!' },
				]}
			>
				<Input
					prefix={<UserOutlined />}
					placeholder="Email"
					type="email"
					style={{
						background: 'var(--component-background)',
						borderColor: 'var(--border-color)',
					}}
				/>
			</Form.Item>

			<Form.Item
				name="password"
				rules={[
					{ required: true, message: 'Please input your password!' },
					{
						min: 6,
						message: 'Password must be at least 6 characters!',
					},
				]}
			>
				<Input.Password
					prefix={<LockOutlined />}
					placeholder="Password"
					style={{
						background: 'var(--component-background)',
						borderColor: 'var(--border-color)',
					}}
				/>
			</Form.Item>

			<Form.Item>
				<Button
					type="primary"
					block
					onClick={handleSignup}
					disabled={isSignupLoading}
				>
					{isSignupLoading ? (
						<Space>
							<LoadingSpinner size={16} />
							Creating account
						</Space>
					) : (
						'Create account'
					)}
				</Button>
			</Form.Item>
		</Form>
	);

	const items = [
		{ key: 'login', label: 'Login', children: <LoginForm /> },
		{ key: 'signup', label: 'Sign up', children: <SignupForm /> },
	];

	return (
		<ConfigProvider
			theme={{
				algorithm:
					theme === 'dark'
						? antTheme.darkAlgorithm
						: antTheme.defaultAlgorithm,
				components: {
					Tabs: {
						itemHoverColor: 'var(--text-primary)',
						itemSelectedColor: 'var(--text-primary)',
						inkBarColor: 'var(--text-primary)',
					},
					Card: {
						colorBgContainer: 'var(--component-background)',
						colorBorderSecondary: 'var(--border-color)',
					},
					Input: {
						colorBgContainer: 'var(--component-background)',
						colorBorder: 'var(--border-color)',
						colorText: 'var(--text-primary)',
						colorTextPlaceholder: 'var(--text-secondary)',
					},
					Button: {
						primaryColor: 'var(--text-primary)',
					},
				},
			}}
		>
			<div className={styles.container}>
				{contextHolder}
				<Card className={styles.loginCard}>
					<Title level={2} className={styles.title}>
						Welcome to Samwise
					</Title>
					<Tabs
						activeKey={activeTab}
						items={items}
						onChange={(key) => setActiveTab(key as TabKey)}
						centered
						className={styles.tabsNav}
					/>
				</Card>
			</div>
		</ConfigProvider>
	);
}
