import { useState, useEffect, useRef, useCallback } from 'react';
import { Layout, Button, Typography, Spin, Collapse, Tooltip } from 'antd';
import {
	PlusOutlined,
	EditOutlined,
	FileTextOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import { useNotes } from '@/contexts/NotesContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

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
	const router = useRouter();
	const observerRef = useRef<IntersectionObserver | null>(null);
	const noteRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	// Initialize intersection observer
	useEffect(() => {
		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const noteId =
							entry.target.getAttribute('data-note-id');
						if (noteId) {
							router.prefetch(`/dashboard/notes/${noteId}`);
						}
					}
				});
			},
			{
				root: null,
				rootMargin: '50px',
				threshold: 0.1,
			}
		);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [router]);

	// Handle panel expansion and prefetch notes
	const handlePanelChange = useCallback(
		(keys: string | string[]) => {
			const newKeys = typeof keys === 'string' ? [keys] : keys;
			setOpenPanels(newKeys);

			// Prefetch all notes in newly opened panels
			newKeys.forEach((date) => {
				if (!openPanels.includes(date) && groupedNotes[date]) {
					groupedNotes[date].forEach((note) => {
						router.prefetch(`/dashboard/notes/${note.id}`);
					});
				}
			});
		},
		[openPanels, groupedNotes, router]
	);

	// Register note element refs and observe them
	const registerNoteRef = useCallback(
		(noteId: string, element: HTMLDivElement | null) => {
			if (element && observerRef.current) {
				noteRefs.current.set(noteId, element);
				observerRef.current.observe(element);
			}
		},
		[]
	);

	return (
		<Layout className="min-h-[calc(100vh-64px)]">
			<Sider
				collapsible
				collapsed={collapsed}
				onCollapse={setCollapsed}
				width={300}
				theme={theme}
				className="border-r border-border-color bg-component-background"
				suppressHydrationWarning
			>
				<div className="p-4">
					<Tooltip
						title={collapsed ? 'New Note' : ''}
						placement="right"
					>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							block
							onClick={() => router.push('/dashboard/notes/new')}
						>
							{!collapsed && 'New Note'}
						</Button>
					</Tooltip>
				</div>

				{loading ? (
					<div className="flex justify-center p-4 h-[calc(100vh-180px)]">
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
												<div
													ref={(el) =>
														registerNoteRef(
															note.id,
															el
														)
													}
													data-note-id={note.id}
													role="button"
													tabIndex={0}
													onClick={() =>
														router.push(
															`/dashboard/notes/${note.id}`
														)
													}
													onKeyDown={(e) =>
														e.key === 'Enter' &&
														router.push(
															`/dashboard/notes/${note.id}`
														)
													}
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
