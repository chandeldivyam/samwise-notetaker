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
    // Create a placeholder URL for the loading state
    const placeholderNode = $createImageNode({
      altText: file.name,
      src: '', // Empty src since we're showing a loading state
      isLoading: true,
      uploadProgress: 0,
    });

    // Insert the placeholder immediately
    editor.update(() => {
      $insertNodes([placeholderNode]);
    });

    try {
      const { user, error } = await getCurrentUser();
      if (error) throw new Error('Failed to get user');
      if (!user) throw new Error('No user found');

      const { url, key } = await generateUploadUrl(user.id, file.type, 'images');
      if (!url || !key) throw new Error('Failed to generate upload URL');

      // Upload file with progress updates
      await uploadFileWithProgress(url, file, (progress) => {
        editor.update(() => {
          placeholderNode.setUploadProgress(progress);
        });
      });

      // Get public URL
      const imageUrl = await getPublicUrl(key);

      // Update the placeholder with the actual image
      editor.update(() => {
        placeholderNode.setLoading(false);
        placeholderNode.setSrc(imageUrl);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      showError(messageApi, 'Failed to upload image');
      
      // Remove the placeholder on error
      editor.update(() => {
        placeholderNode.remove();
      });
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