'use client';

import { useState } from 'react';
import { Layout, List, Button, Typography, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotes } from '@/contexts/NotesContext';

const { Sider, Content } = Layout;
const { Text } = Typography;

interface NotesLayoutProps {
  children: React.ReactNode;
}

export default function NotesLayout({ children }: NotesLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { notes, loading } = useNotes();

  return (
    <Layout className="min-h-[calc(100vh-64px)]">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={300}
        className="border-r border-gray-200"
      >
        <div className="p-4">
          <Link href="/dashboard/notes/new">
            <Button type="primary" icon={<PlusOutlined />} block>
              {!collapsed && 'New Note'}
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-4">
            <Spin />
          </div>
        ) : (
          <List
            className="overflow-y-auto h-[calc(100vh-180px)]"
            dataSource={notes}
            renderItem={(note) => (
              <Link href={`/dashboard/notes/${note.id}`}>
                <div
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    pathname === `/dashboard/notes/${note.id}` ? 'bg-gray-100' : ''
                  }`}
                >
                  <Text strong className="block truncate">
                    {note.title}
                  </Text>
                  {!collapsed && (
                    <>
                      <Text className="block text-xs text-gray-500 truncate">
                        {note.content}
                      </Text>
                      <Text className="block text-xs text-gray-400">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </Text>
                    </>
                  )}
                </div>
              </Link>
            )}
          />
        )}
      </Sider>
      <Content className="bg-white">{children}</Content>
    </Layout>
  );
} 