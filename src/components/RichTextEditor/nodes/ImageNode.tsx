import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { $applyNodeReplacement, DecoratorNode, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Input } from 'antd';
const { TextArea } = Input;
export interface ImagePayload {
  src: string;
  altText: string;
  description?: string;
  key?: NodeKey;
  isLoading?: boolean;
  uploadProgress?: number;
  width?: number;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    description?: string;
    isLoading?: boolean;
    uploadProgress?: number;
    width?: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __description: string;
  __isLoading: boolean;
  __uploadProgress: number;
  __width: number;

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
      node.__key,
      node.__width
    );
  }

  constructor(src: string, altText: string, description: string = '', isLoading: boolean = false, uploadProgress: number = 0, key?: NodeKey, width: number = 400) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__description = description;
    this.__isLoading = isLoading;
    this.__uploadProgress = uploadProgress;
    this.__width = width;
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

  setWidth(width: number): void {
    const writable = this.getWritable();
    writable.__width = width;
  }


  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      src: this.__src,
      altText: this.__altText,
      description: this.__description,
      isLoading: this.__isLoading,
      uploadProgress: this.__uploadProgress,
      width: this.__width,
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
    width={this.__width}
  />;
  }
}

function ImageComponent({
  src,
  altText,
  description,
  nodeKey,
  width: initialWidth = 400,
}: {
  src: string;
  altText: string;
  description: string;
  nodeKey: string;
  width?: number;
}) {
  const [editor] = useLexicalComposerContext();
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const [showCaption, setShowCaption] = useState(false);
  const [captionText, setCaptionText] = useState(description);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Handle resize
  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      setIsResizing(true);
    },
    [],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    // Update node width in editor
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        node.setWidth(width);
      }
    });
  }, [editor, nodeKey, width]);

  const handleResize = useCallback((event: MouseEvent) => {
    if (isResizing && imageRef.current) {
      event.preventDefault();
      const newWidth = Math.max(100, Math.min(1000, event.clientX - imageRef.current.getBoundingClientRect().left));
      setWidth(newWidth);
    }
  }, [isResizing]);

  const handleCaptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCaption = event.target.value;
    setCaptionText(newCaption);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        node.setDescription(newCaption);
      }
    });
  }, [editor, nodeKey]);

  const handleCaptionBlur = useCallback(() => {
    setIsEditingCaption(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  return (
    <div className="relative group" style={{ width: width }}>
      {/* Image and Resize Section */}
      <div 
        className={`relative ${isResizing ? 'select-none' : ''}`}
        style={{ width: '100%' }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={altText}
          className="max-w-full h-auto rounded-lg"
          draggable="false"
          style={{ width: '100%' }}
        />
        
        {/* Resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-500/20"
          onMouseDown={handleResizeStart}
        />
        
        {/* Image size indicator while resizing */}
        {isResizing && (
          <div className="absolute top-0 right-0 bg-black/75 text-white px-2 py-1 text-sm rounded-bl">
            {Math.round(width)}px
          </div>
        )}
      </div>
  
      {/* Caption Section */}
      <div className="mt-2 relative">
        {captionText ? (
          // Show caption text with edit/remove options
          <div 
            className="group/caption relative text-sm text-text-primary"
            onDoubleClick={() => setIsEditingCaption(true)}
          >
            <p className="py-1">{captionText}</p>
          </div>
        ) : (
          // Show add caption button
          <button
            className="text-sm text-text-secondary hover:text-primary-color opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              setShowCaption(true);
              setIsEditingCaption(true);
            }}
            type='button'
          >
            Add Description
          </button>
        )}
  
        {/* Caption Editor */}
        {isEditingCaption && (
  <div className="absolute inset-0 z-10">
    <TextArea
      className="w-full rounded border border-primary-color"
      placeholder="Describe this image..."
      value={captionText}
      onChange={handleCaptionChange}
      onBlur={handleCaptionBlur}
      autoSize={{ minRows: 1, maxRows: 6 }} // This enables auto-expanding
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleCaptionBlur();
        }
        if (e.key === 'Escape') {
          handleCaptionBlur();
        }
      }}
      autoFocus
      style={{
        fontSize: '14px',
        padding: '8px 12px',
        resize: 'vertical', // Allows manual resizing
        minHeight: '30px',
        maxHeight: '200px'
      }}
    />
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