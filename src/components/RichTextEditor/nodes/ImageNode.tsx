// src/components/RichTextEditor/nodes/ImageNode.tsx
import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';

export interface ImagePayload {
  src: string;
  altText: string;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.position = 'relative';
    div.style.width = 'auto';
    div.style.maxWidth = '100%';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      src: this.__src,
      altText: this.__altText,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  decorate(): JSX.Element {
    return <img src={this.__src} alt={this.__altText} style={{ maxWidth: '100%', height: 'auto' }} />;
  }
}

function convertImageElement(domNode: Node): null | { node: ImageNode } {
  if (!(domNode instanceof HTMLImageElement)) {
    return null;
  }
  const { src, alt: altText } = domNode;
  return { node: $createImageNode({ src, altText }) };
}

export function $createImageNode({ src, altText, key }: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}