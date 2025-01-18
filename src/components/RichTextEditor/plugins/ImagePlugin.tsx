// src/components/RichTextEditor/plugins/ImagePlugin.tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, createCommand, LexicalCommand, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { useCallback, useEffect } from 'react';
import { $createImageNode } from '../nodes/ImageNode';
import { generateUploadUrl, getPublicUrl } from '@/lib/actions/s3';
import { uploadFileWithProgress } from '@/utils/upload';
import { useMessage, showError } from '@/utils/message';
import { getCurrentUser } from '@/lib/actions/auth';

export type InsertImagePayload = {
  file: File;
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = 
  createCommand('INSERT_IMAGE_COMMAND');

export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();
  const messageApi = useMessage();

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      // Generate upload URL
      const { user, error } = await getCurrentUser();
      if (error) throw new Error('Failed to get user');
      if (!user) throw new Error('No user found');

      const { url, key } = await generateUploadUrl(user.id, file.type, 'images');
      if (!url || !key) throw new Error('Failed to generate upload URL');

      // Upload file using our utility
      await uploadFileWithProgress(url, file, (progress) => {
        // You can handle progress updates here if needed
        console.log(`Upload progress: ${progress}%`);
      });

      // Get public URL using our new function
      const imageUrl = await getPublicUrl(key);

      // Insert the image node
    //   TODO: Implement a description using llm prompting and image description. We can either keep it in alt text or as description in the image node
      editor.update(() => {
        const imageNode = $createImageNode({
          altText: file.name,
          src: imageUrl,
        });
        $insertNodes([imageNode]);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      showError(messageApi, 'Failed to upload image');
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: InsertImagePayload) => {
        handleImageUpload(payload.file);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, handleImageUpload]);

  return null;
}