import { useState } from 'react';
import { Layout, Button, Typography, Spin, Collapse, Tooltip } from 'antd';
import {
	PlusOutlined,
	EditOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotes } from '@/contexts/NotesContext';
import { useTheme } from '@/contexts/ThemeContext';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;

interface NotesLayoutProps {
	children: React.ReactNode;
}

const formatDate = (dateString: string, collapsed: boolean) => {
	if (!collapsed) return dateString;

	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: '2-digit',
		day: '2-digit',
		year: '2-digit',
	});
};

export default function NotesLayout({ children }: NotesLayoutProps) {
	const [collapsed, setCollapsed] = useState(false);
	const [openPanels, setOpenPanels] = useState<string[]>([]);
	const pathname = usePathname();
	const { groupedNotes, loading } = useNotes();
	const { theme } = useTheme();

	const handlePanelChange = (keys: string | string[]) => {
		setOpenPanels(typeof keys === 'string' ? [keys] : keys);
	};

	return (
		<Layout className="min-h-[calc(100vh-64px)]">
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={setCollapsed}
				width={300}
				theme={theme}
				className="border-r border-border-color bg-component-background"
			>
				<div className="p-4">
					<Tooltip
						title={collapsed ? 'New Note' : ''}
						placement="right"
					>
						<Link href="/dashboard/notes/new">
							<Button
								type="primary"
								icon={<PlusOutlined />}
								block
							>
								{!collapsed && 'New Note'}
							</Button>
						</Link>
					</Tooltip>
				</div>

				{loading ? (
					<div className="flex justify-center p-4">
						<Spin />
					</div>
				) : (
					<div className="overflow-y-auto h-[calc(100vh-180px)]">
						<Collapse
							activeKey={openPanels}
							onChange={handlePanelChange}
							ghost
							expandIconPosition="end"
							className={
								collapsed ? 'ant-collapse-collapsed' : ''
							}
						>
							{Object.entries(groupedNotes)
								.sort(
									([dateA], [dateB]) =>
										new Date(dateB).getTime() -
										new Date(dateA).getTime()
								)
								.map(([date, dateNotes]) => (
									<Panel
										header={
											collapsed ? (
												<Tooltip
													title={date}
													placement="right"
												>
													<Text
														strong
														className="text-xs"
													>
														{formatDate(
															date,
															collapsed
														)}
													</Text>
												</Tooltip>
											) : (
												<Text
													strong
													className="text-sm"
												>
													{date}
												</Text>
											)
										}
										key={date}
										className={
											collapsed ? 'collapsed-panel' : ''
										}
									>
										{dateNotes.map((note) => (
											<Tooltip
												key={note.id}
												title={
													collapsed
														? note.title ||
															'Untitled'
														: ''
												}
												placement="right"
											>
												<Link
													href={`/dashboard/notes/${note.id}`}
												>
													<div
														className={`
                              px-2 py-2 mb-1 cursor-pointer
                              hover:bg-editor-button-hover rounded-md
                              transition-colors duration-200
                              flex items-center gap-2
                              ${pathname === `/dashboard/notes/${note.id}` ? 'bg-editor-button-hover' : ''}
                              ${collapsed ? 'justify-center' : ''}
                            `}
													>
														{collapsed ? (
															<FileTextOutlined className="text-text-secondary" />
														) : (
															<>
																<EditOutlined className="text-text-secondary" />
																<Text
																	className={`
                                    truncate flex-1
                                    ${pathname === `/dashboard/notes/${note.id}` ? 'font-medium' : ''}
                                  `}
																>
																	{note.title ||
																		'Untitled'}
																</Text>
															</>
														)}
													</div>
												</Link>
											</Tooltip>
										))}
									</Panel>
								))}
						</Collapse>
					</div>
				)}
			</Sider>
			<Content className="bg-component-background">{children}</Content>
		</Layout>
	);
}
