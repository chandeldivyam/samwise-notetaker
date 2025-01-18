'use client';

import './editor.css';
import { useRef, useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { editorConfig } from './config';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import MyAutoLinkPlugin from './plugins/AutoLinkPlugin';
import MyLinkPlugin from './plugins/LinkPlugin';
import MyClickableLinkPlugin from './plugins/ClickableLinkPlugin';
import EmojisPlugin from './plugins/EmojisPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import { ImagePlugin } from './plugins/ImagePlugin';
import DragDropPlugin from './plugins/DragDropPlugin';

interface RichTextEditorProps {
	content?: string;
	onChange?: (content: string) => void;
	placeholder?: string;
	value?: string;
}

export default function RichTextEditor({
	content,
	onChange,
	placeholder = 'Start writing...',
	value,
}: RichTextEditorProps) {
	const editorContainerRef = useRef<HTMLDivElement>(null);
	const [isEditorReady, setIsEditorReady] = useState(false);

	const initialConfig = {
		...editorConfig,
		editorState: value || content,
		onError: (error: Error) => {
			console.error(error);
		},
	};

	useEffect(() => {
		if (editorContainerRef.current) {
			setIsEditorReady(true);
		}
	}, []);

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div
				className="editor-container"
				ref={editorContainerRef}
				style={{ position: 'relative' }}
			>
				<ToolbarPlugin />
				<div className="editor-inner">
					<RichTextPlugin
						contentEditable={
							<ContentEditable className="editor-input" />
						}
						placeholder={
							<div className="editor-placeholder">
								{placeholder}
							</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<ListPlugin />
					<MarkdownShortcutPlugin />
					<TabIndentationPlugin />
					<EmojisPlugin />
					<EmojiPickerPlugin />
					{isEditorReady && editorContainerRef.current && (
						<DraggableBlockPlugin
							anchorElem={editorContainerRef.current}
						/>
					)}
					<ImagePlugin />
					<OnChangePlugin
						onChange={(editorState) => {
							if (onChange) {
								onChange(JSON.stringify(editorState));
							}
						}}
					/>
					<HistoryPlugin />
					<MyAutoLinkPlugin />
					<MyLinkPlugin />
					<MyClickableLinkPlugin />
					<AutoFocusPlugin />
					<DragDropPlugin />
				</div>
			</div>
		</LexicalComposer>
	);
}
