'use client';

import { useState, useMemo, useRef } from 'react';
import { Layout, Dropdown, Button } from 'antd';
import {
	MenuOutlined,
	UserOutlined,
	HomeOutlined,
	SettingOutlined,
	LogoutOutlined,
	FileTextOutlined,
	VideoCameraOutlined,
	SmileOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { MoonOutlined, SunFilled } from '@ant-design/icons';
import { signOut } from '@/lib/actions/auth';

const { Header } = Layout;
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardNav() {
	const router = useRouter();
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const { theme, toggleTheme } = useTheme();
	const [hasPrefetched, setHasPrefetched] = useState(false);

	const routes = useMemo(
		() => [
			'/dashboard',
			'/dashboard/notes',
			'/dashboard/recordings',
			'/dashboard/settings',
			'/dashboard/people',
		],
		[]
	);

	const handleLogout = async () => {
		const { error } = await signOut();
		if (!error) {
			router.push('/login');
		}
	};

	const handleMenuMouseEnter = () => {
		if (hasPrefetched) return;
		routes.forEach((route) => {
			router.prefetch(route);
		});
		setHasPrefetched(true);
	};

	const handleMenuMouseLeave = () => {
		setHasPrefetched(false);
	};

	const menuItems = [
		{
			key: 'home',
			icon: <HomeOutlined />,
			label: 'Home',
			onClick: () => {
				router.push('/dashboard');
			},
			path: '/dashboard',
		},
		{
			key: 'notes',
			icon: <FileTextOutlined />,
			label: 'Notes',
			onClick: () => {
				router.push('/dashboard/notes');
			},
			path: '/dashboard/notes',
		},
		{
			key: 'recordings',
			icon: <VideoCameraOutlined />,
			label: 'Recordings',
			onClick: () => {
				router.push('/dashboard/recordings');
			},
			path: '/dashboard/recordings',
		},
		{
			key: 'people',
			icon: <SmileOutlined />,
			label: 'People',
			onClick: () => {
				router.push('/dashboard/people');
			},
			path: '/dashboard/people',
		},
		{
			key: 'settings',
			icon: <SettingOutlined />,
			label: 'Settings',
			onClick: () => {
				router.push('/dashboard/settings');
			},
			path: '/dashboard/settings',
		},
	];

	const userMenuItems = [
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Logout',
			onClick: handleLogout,
		},
	];

	const currentPageLabel = useMemo(() => {
		const currentMenuItem = menuItems.find((item) => {
			// Check if the pathname exactly matches the menu item's path
			return pathname === item.path;
		});

		// If no exact match, find the menu item with the longest matching path
		if (!currentMenuItem) {
			const matchingMenuItems = menuItems.filter((item) =>
				pathname.startsWith(item.path)
			);
			if (matchingMenuItems.length > 0) {
				return matchingMenuItems.reduce((prev, curr) =>
					prev.path.length > curr.path.length ? prev : curr
				).label;
			}
		}

		return currentMenuItem?.label || 'Dashboard';
	}, [pathname]);

	return (
		<Header className="bg-component-background border-b border-border-color px-4 flex items-center justify-between">
			<div className="flex items-center">
				<Dropdown
					menu={{ items: menuItems }}
					trigger={['click']}
					open={isMenuOpen}
					onOpenChange={setIsMenuOpen}
				>
					<Button
						ref={menuButtonRef}
						type="text"
						icon={<MenuOutlined className="text-text-primary" />}
						className="mr-4"
						onMouseEnter={handleMenuMouseEnter}
						onMouseLeave={handleMenuMouseLeave}
					/>
				</Dropdown>
				<span className="text-xl font-semibold text-text-primary">
					{currentPageLabel}
				</span>
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="text"
					icon={theme === 'light' ? <MoonOutlined /> : <SunFilled />}
					onClick={toggleTheme}
					className="flex items-center justify-center"
				/>
				<Dropdown
					menu={{ items: userMenuItems }}
					trigger={['click']}
					placement="bottomRight"
				>
					<Button
						type="text"
						icon={<UserOutlined className="text-text-primary" />}
						className="flex items-center justify-center"
					/>
				</Dropdown>
			</div>
		</Header>
	);
}
