import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useState, useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export interface ImagePayload {
  src: string;
  altText: string;
  description?: string;
  key?: NodeKey;
  isLoading?: boolean;
  uploadProgress?: number;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    description?: string;
    isLoading?: boolean;
    uploadProgress?: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __description: string;
  __isLoading: boolean;
  __uploadProgress: number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src, 
      node.__altText, 
      node.__description,
      node.__isLoading, 
      node.__uploadProgress, 
      node.__key
    );
  }

  constructor(src: string, altText: string, description: string = '', isLoading: boolean = false, uploadProgress: number = 0, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__description = description;
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

  setDescription(description: string): void {
    const self = this.getWritable();
    self.__description = description;
  }

  getDescription(): string {
    return this.__description;
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
      description: this.__description,
      isLoading: this.__isLoading,
      uploadProgress: this.__uploadProgress,
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode({
      src: serializedNode.src,
      altText: serializedNode.altText,
      description: serializedNode.description,
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

    return <ImageComponent 
    src={this.__src} 
    altText={this.__altText} 
    description={this.__description}
    nodeKey={this.__key}
  />;
  }
}

function ImageComponent({ 
  src, 
  altText, 
  description, 
  nodeKey 
}: { 
  src: string; 
  altText: string; 
  description: string;
  nodeKey: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleDescriptionSave = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        node.setDescription(editedDescription);
      }
    });
    setIsEditing(false);
  }, [editor, editedDescription, nodeKey]);

  const handleCancel = useCallback(() => {
    setEditedDescription(description);
    setIsEditing(false);
  }, [description]);

  return (
    <div>
      <img 
        src={src} 
        alt={altText} 
        className="max-w-[80%] h-auto rounded-lg"
        draggable="false"
      />
      <div className="mt-5 max-w-[80%]">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="flex-1 px-2 py-1 rounded text-sm bg-component-background"
              placeholder="Add a description..."
              // Prevent form submission when pressing enter
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleDescriptionSave();
                }
              }}
            />
            <button
            type="button"
              onClick={handleDescriptionSave}
              className="px-3 py-1 text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div 
            className="flex justify-between items-center text-sm text-text-primary cursor-pointer rounded"
            onClick={() => setIsEditing(true)}
          >
            <span>{description || 'Add a description...'}</span>
            <button type="button" className="text-blue-500 hover:text-blue-600">
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
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
  description = '',
  key, 
  isLoading,
  uploadProgress = 0 
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, description, isLoading, uploadProgress, key)
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}