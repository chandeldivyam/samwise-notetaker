import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import ExampleTheme from './theme';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { ParagraphNode, TextNode } from 'lexical';

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
  ],
  onError: (error: Error) => {
    console.error(error);
  },
}; 