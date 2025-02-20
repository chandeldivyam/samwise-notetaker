import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import ExampleTheme from './theme';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ParagraphNode, TextNode } from 'lexical';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { EmojiNode } from './nodes/EmojiNode';
import { ImageNode } from './nodes/ImageNode';

export const editorConfig: InitialConfigType = {
	namespace: 'NotesEditor',
	theme: ExampleTheme,
	nodes: [
		HeadingNode,
		QuoteNode,
		ListItemNode,
		ListNode,
		LinkNode,
		ParagraphNode,
		TextNode,
		HorizontalRuleNode,
		CodeNode,
		CodeHighlightNode,
		AutoLinkNode,
		EmojiNode,
		ImageNode,
	],
	onError: (error: Error) => {
		console.error(error);
	},
};

export const BLOCK_TYPE_TO_BLOCKTYPE = {
	paragraph: 'Paragraph',
	h1: 'Heading 1',
	h2: 'Heading 2',
	h3: 'Heading 3',
	bullet: 'Bullet List',
	number: 'Numbered List',
} as const;
