'use client';

import { useState, useMemo } from 'react';
import { Layout, Dropdown, Button } from 'antd';
import {
	MenuOutlined,
	UserOutlined,
	HomeOutlined,
	SettingOutlined,
	LogoutOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

const { Header } = Layout;
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardNav() {
	const router = useRouter();
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const supabase = createClient();
	const { theme, toggleTheme } = useTheme();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push('/login');
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
						type="text"
						icon={<MenuOutlined className="text-text-primary" />}
						className="mr-4"
					/>
				</Dropdown>
				<span className="text-xl font-semibold text-text-primary">
					{currentPageLabel}
				</span>
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="text"
					icon={theme === 'light' ? <BulbOutlined /> : <BulbFilled />}
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
