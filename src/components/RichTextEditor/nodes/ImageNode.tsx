import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';

export interface ImagePayload {
  src: string;
  altText: string;
  key?: NodeKey;
  isLoading?: boolean;
  uploadProgress?: number;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    isLoading?: boolean;
    uploadProgress?: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __isLoading: boolean;
  __uploadProgress: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__isLoading, node.__uploadProgress, node.__key);
  }

  constructor(src: string, altText: string, isLoading: boolean = false, uploadProgress: number = 0, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__isLoading = isLoading;
    this.__uploadProgress = uploadProgress;
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

  setLoading(isLoading: boolean): void {
    const self = this.getWritable();
    self.__isLoading = isLoading;
  }

  setUploadProgress(progress: number): void {
    const self = this.getWritable();
    self.__uploadProgress = progress;
  }

  setSrc(src: string): void {
    const self = this.getWritable();
    self.__src = src;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      src: this.__src,
      altText: this.__altText,
      isLoading: this.__isLoading,
      uploadProgress: this.__uploadProgress,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      isLoading: serializedNode.isLoading,
      uploadProgress: serializedNode.uploadProgress,
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
    if (this.__isLoading) {
      return (
        <div className="relative w-64 h-48 overflow-hidden rounded-lg" style={{ 
          backgroundColor: 'var(--component-background)'
        }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-12 h-12 rounded-full animate-spin"
              style={{
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                borderTopColor: 'var(--primary-color)',
              }}
            />
          </div>
          <div 
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: 'var(--border-color)' }}
          >
            <div 
              className="h-full transition-all duration-300 ease-out"
              style={{ 
                backgroundColor: 'var(--primary-color)',
                width: `${this.__uploadProgress}%`
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <img 
        src={this.__src} 
        alt={this.__altText} 
        style={{ maxWidth: '100%', height: 'auto' }}
        draggable="false"
      />
    );
  }
}

function convertImageElement(domNode: Node): null | { node: ImageNode } {
  if (!(domNode instanceof HTMLImageElement)) {
    return null;
  }
  const { src, alt: altText } = domNode;
  return { node: $createImageNode({ src, altText }) };
}

export function $createImageNode({ 
  src, 
  altText, 
  key, 
  isLoading,
  uploadProgress = 0 
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, isLoading, uploadProgress, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}