// src/components/RichTextEditor/plugins/MarkdownTransformers/index.ts

import {
	ELEMENT_TRANSFORMERS,
	TextMatchTransformer,
	TEXT_FORMAT_TRANSFORMERS,
	TEXT_MATCH_TRANSFORMERS,
} from '@lexical/markdown';
import { $createEmojiNode, $isEmojiNode } from '../../nodes/EmojiNode';
import { $isImageNode, ImageNode } from '../../nodes/ImageNode';
import EMOJI_LIST from '../../../../constants/emoji-list';

// Function to find an emoji by its name
function findEmojiByName(name: string): string | null {
	const found = EMOJI_LIST.find((emojiData) =>
		emojiData.aliases.includes(name)
	);
	return found ? found.emoji : null;
}

// Custom transformer for Emoji nodes
export const EMOJI: TextMatchTransformer = {
	dependencies: [],
	export: (node) => {
		if (!$isEmojiNode(node)) {
			return null;
		}
		return `:${node.getClassName().split(' ')[1]}:`; // Assuming className format is "emoji emojiname"
	},
	importRegExp: /:([a-z0-9_]+):/,
	regExp: /:([a-z0-9_]+):$/,
	replace: (textNode, match) => {
		const [, name] = match;
		const emoji = findEmojiByName(name);
		if (emoji) {
			const emojiNode = $createEmojiNode(`emoji ${name}`, emoji);
			textNode.replace(emojiNode);
		}
	},
	trigger: ':',
	type: 'text-match',
};

// Custom transformer for Image nodes
export const IMAGE: TextMatchTransformer = {
  dependencies: [],
    export: (node) => {
        if (!$isImageNode(node)) {
          return null;
        }
        return `![${node.__altText}](${node.__src})\n<!--description: ${node.__description}-->\n`;
    },
  importRegExp: /!\[([^\]]*)\]\(([^)]+)\)/,
  regExp: /!\[([^\]]*)\]\(([^)]+)\)$/,
	replace: (textNode, match) => {
		const [, altText, src] = match;
    const imageNode = new ImageNode(src, altText);
    textNode.replace(imageNode)
	},
  trigger: '!',
	type: 'text-match',
};

export const TRANSFORMERS = [
  EMOJI,
  IMAGE,
	...ELEMENT_TRANSFORMERS,
	...TEXT_FORMAT_TRANSFORMERS,
	...TEXT_MATCH_TRANSFORMERS,
];
