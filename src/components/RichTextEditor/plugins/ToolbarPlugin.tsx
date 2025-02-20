'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { $createParagraphNode } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useCallback, useEffect, useState } from 'react';
import { Button, Space, Select } from 'antd';
import {
	BoldOutlined,
	ItalicOutlined,
	UnderlineOutlined,
	StrikethroughOutlined,
	CopyOutlined,
	PictureOutlined,
} from '@ant-design/icons';
import { BLOCK_TYPE_TO_BLOCKTYPE } from '../config';
import { exportMarkdown } from '../utils/markdownUtils';
import { useMessage, showError, showSuccess } from '@/utils/message';

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const [blockType, setBlockType] = useState<string>('paragraph');
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const messageApi = useMessage();

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat('bold'));
			setIsItalic(selection.hasFormat('italic'));
			setIsUnderline(selection.hasFormat('underline'));
			setIsStrikethrough(selection.hasFormat('strikethrough'));

			// Get selected block type
			const anchorNode = selection.anchor.getNode();
			const element =
				anchorNode.getKey() === 'root'
					? anchorNode
					: anchorNode.getTopLevelElement();

			if (element) {
				const elementKey = element.getKey();
				const elementDOM = editor.getElementByKey(elementKey);

				if (elementDOM) {
					if (elementDOM.tagName === 'P') {
						setBlockType('paragraph');
					} else if (elementDOM.tagName === 'H1') {
						setBlockType('h1');
					} else if (elementDOM.tagName === 'H2') {
						setBlockType('h2');
					} else if (elementDOM.tagName === 'H3') {
						setBlockType('h3');
					} else if (elementDOM.tagName === 'UL') {
						setBlockType('bullet');
					} else if (elementDOM.tagName === 'OL') {
						setBlockType('number');
					}
				}
			}
		}
	}, [editor]);

	const formatBlock = (blockType: string) => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				switch (blockType) {
					case 'h1':
					case 'h2':
					case 'h3':
						$setBlocksType(selection, () =>
							$createHeadingNode(blockType)
						);
						break;
					case 'bullet':
						editor.dispatchCommand(
							INSERT_UNORDERED_LIST_COMMAND,
							undefined
						);
						break;
					case 'number':
						editor.dispatchCommand(
							INSERT_ORDERED_LIST_COMMAND,
							undefined
						);
						break;
					default:
						$setBlocksType(selection, () => $createParagraphNode());
				}
			}
		});
	};

	const copyToClipboard = () => {
		const markdown = exportMarkdown(editor);
		navigator.clipboard
			.writeText(markdown)
			.then(() => {
				showSuccess(messageApi, 'Markdown copied to clipboard!');
			})
			.catch((err) => {
				showError(messageApi, 'Failed to copy markdown to clipboard');
				console.error(err);
			});
	};

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	return (
		<div className="toolbar">
			<Space>
				<Select
					value={blockType}
					style={{ width: 160 }}
					onChange={(value) => {
						setBlockType(value);
						formatBlock(value);
					}}
					options={Object.entries(BLOCK_TYPE_TO_BLOCKTYPE).map(
						([value, label]) => ({
							value,
							label,
						})
					)}
				/>
				<Button
					type={isBold ? 'primary' : 'text'}
					icon={<BoldOutlined />}
					onClick={() => {
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
					}}
				/>
				<Button
					type={isItalic ? 'primary' : 'text'}
					icon={<ItalicOutlined />}
					onClick={() => {
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
					}}
				/>
				<Button
					type={isUnderline ? 'primary' : 'text'}
					icon={<UnderlineOutlined />}
					onClick={() => {
						editor.dispatchCommand(
							FORMAT_TEXT_COMMAND,
							'underline'
						);
					}}
				/>
				<Button
					type={isStrikethrough ? 'primary' : 'text'}
					icon={<StrikethroughOutlined />}
					onClick={() => {
						editor.dispatchCommand(
							FORMAT_TEXT_COMMAND,
							'strikethrough'
						);
					}}
				/>
				<Button
					type="text"
					icon={<CopyOutlined />}
					onClick={copyToClipboard}
				/>
				<Button
					type="text"
					icon={<PictureOutlined />}
					onClick={() => {
						const input = document.createElement('input');
						input.type = 'file';
						input.accept = 'image/*';
						input.onchange = async () => {
							const file = input.files?.[0];
							if (file) {
								editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
									file,
								});
							}
						};
						input.click();
					}}
				/>
			</Space>
		</div>
	);
}
