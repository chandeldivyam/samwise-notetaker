'use client';

import './editor.css';
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
	const initialConfig = {
		...editorConfig,
		editorState: value || content,
		onError: (error: Error) => {
			console.error(error);
		},
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div className="editor-container">
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
					<OnChangePlugin
						onChange={(editorState) => {
							if (onChange) {
								onChange(JSON.stringify(editorState));
							}
						}}
					/>
					<HistoryPlugin />
					<AutoFocusPlugin />
				</div>
			</div>
		</LexicalComposer>
	);
}
