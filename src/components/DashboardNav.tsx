'use client';

import { useState, useMemo } from 'react';
import { Layout, Menu, Dropdown, Button, Space } from 'antd';
import { 
  MenuOutlined, 
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { useRouter, usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const { Header } = Layout;

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

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
      path: '/dashboard'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        router.push('/dashboard/settings');
      },
      path: '/dashboard/settings'
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
    const currentMenuItem = menuItems.find(item => pathname === item.path);
    return currentMenuItem?.label || 'Dashboard';
  }, [pathname]);

  return (
    <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          open={isMenuOpen}
          onOpenChange={setIsMenuOpen}
        >
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ color: 'white' }} />}
            className="mr-4"
          />
        </Dropdown>
        <span className="text-xl font-semibold text-white">{currentPageLabel}</span>
      </div>

      <div className="flex items-center">
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<UserOutlined style={{ color: 'white' }} />}
            className="flex items-center justify-center"
          />
        </Dropdown>
      </div>
    </Header>
  );
} 