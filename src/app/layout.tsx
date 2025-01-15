// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import AntdRegistry from '@/components/AntdRegistry';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MessageProvider } from '@/utils/message';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
	title: 'Samwise - Organize Your Thoughts',
	description: 'A simple and powerful note-taking application',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeProvider>
					<MessageProvider>
						<AntdRegistry>{children}</AntdRegistry>
					</MessageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
