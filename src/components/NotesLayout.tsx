'use client';

import { useState } from 'react';
import { Layout, List, Button, Typography, Spin, Collapse } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotes } from '@/contexts/NotesContext';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;

interface NotesLayoutProps {
  children: React.ReactNode;
}

export default function NotesLayout({ children }: NotesLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { groupedNotes, loading } = useNotes();

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
          <div className="overflow-y-auto h-[calc(100vh-180px)]">
            <Collapse 
              defaultActiveKey={Object.keys(groupedNotes)} 
              ghost
              expandIconPosition="end"
            >
              {Object.entries(groupedNotes)
                .sort(([dateA], [dateB]) => 
                  new Date(dateB).getTime() - new Date(dateA).getTime()
                )
                .map(([date, dateNotes]) => (
                  <Panel 
                    header={
                      <Text strong className="text-sm">
                        {date}
                      </Text>
                    } 
                    key={date}
                  >
                    {dateNotes.map((note) => (
                      <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
                        <div
                          className={`
                            px-4 py-2 mb-1 cursor-pointer
                            hover:bg-gray-100 rounded-md
                            transition-colors duration-200
                            flex items-center gap-2
                            ${pathname === `/dashboard/notes/${note.id}` ? 'bg-gray-100' : ''}
                          `}
                        >
                          <EditOutlined className="text-gray-400" />
                          <Text 
                            className={`
                              truncate flex-1
                              ${pathname === `/dashboard/notes/${note.id}` ? 'font-medium' : ''}
                            `}
                          >
                            {note.title || 'Untitled'}
                          </Text>
                        </div>
                      </Link>
                    ))}
                  </Panel>
                ))}
            </Collapse>
          </div>
        )}
      </Sider>
      <Content className="bg-white">{children}</Content>
    </Layout>
  );
} 