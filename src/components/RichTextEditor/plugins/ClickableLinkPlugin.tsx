import * as React from 'react';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';

export default function MyClickableLinkPlugin() {
	// By default, Lexical tries to disable clickable links if the editor is “editable,”
	// in order to let you select and edit text. If you always want to open on single-click,
	// set disabled={false} here:
	return <ClickableLinkPlugin disabled={false} />;
}
