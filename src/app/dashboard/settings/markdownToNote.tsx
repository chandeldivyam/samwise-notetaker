'use client'
import { useState } from 'react';
import { Button } from 'antd';
import { createNote } from '@/lib/actions/notes';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { $getRoot, createEditor } from 'lexical';
import { TRANSFORMERS } from '@/components/RichTextEditor/plugins/MarkdownTransformers';
import { editorConfig } from '@/components/RichTextEditor/config';

export default function Settings() {
  const [isCreating, setIsCreating] = useState(false);

  const markdown = `
# This is a test markdown

## This is a subheading

This is a paragraph with some **bold** and *italic* text.

- This is a list
- With some items
- And some more items

![Screenshot 2025-01-11 at 3.23.28 PM.png](https://samwise-notetaker-demo.s3.us-west-2.amazonaws.com/10b5e972-b5e6-4129-a8ed-a7d4c87253ef/images/f240c2ed-080c-4d23-8401-a496172c6f20.png)[image_description: adding a description here.]

# Edited

good to know!
`;

async function createTestNote(markdown: string) {
	try {
	  setIsCreating(true);
  
	  // 1. Create a new editor instance
	  const editor = createEditor({
		namespace: 'TestNote',
		nodes: editorConfig.nodes,
		onError: (error) => {
		  console.error('Editor Error:', error);
		},
	  });
  
	  // 2. Use parseEditorState() to build a new EditorState synchronously
	  await new Promise<void>((resolve) => {
		// Register an update listener that resolves the promise on the next update
		const removeListener = editor.registerUpdateListener(() => {
		  removeListener(); // Unsubscribe so we only resolve once.
		  resolve();
		});
	  
		// Run the update to convert the markdown
		editor.update(() => {
		  const root = $getRoot();
		  root.clear();
		  $convertFromMarkdownString(markdown, TRANSFORMERS);
		});
	  });
  
	  // 3. Set that state on the editor
	  const editorState = editor.getEditorState();
	  const serializedState = JSON.stringify(editorState.toJSON());
    
	  // 5. Send to your backend
	  const result = await createNote({
		title: 'Test Markdown Note 4',
		content: serializedState,
	  });
  
	  if (result.error) {
		throw new Error(result.error);
	  }
  
	  alert('Test note created successfully!');
	} catch (error) {
	  console.error('Error creating test note:', error);
	  alert('Failed to create test note');
	} finally {
	  setIsCreating(false);
	}
}

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <p>Welcome to your settings page!</p>
        <div className="mt-8">
          <Button 
            onClick={() => createTestNote(markdown)} 
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? 'Creating Test Note...' : 'Create Test Note'}
          </Button>
        </div>
      </div>
    </div>
  );
}