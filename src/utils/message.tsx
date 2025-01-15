'use client';

import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { createContext, useContext, useRef } from 'react';

const MessageContext = createContext<{ message: MessageInstance | null }>({
	message: null,
});

export const useMessage = () => {
	const { message } = useContext(MessageContext);
	if (!message)
		throw new Error('useMessage must be used within a MessageProvider');
	return message;
};

export const MessageProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [messageApi, contextHolder] = message.useMessage();
	const messageRef = useRef(messageApi);

	return (
		<MessageContext.Provider value={{ message: messageRef.current }}>
			{contextHolder}
			{children}
		</MessageContext.Provider>
	);
};

// Utility functions for common message types
export const showSuccess = (message: MessageInstance, content: string) => {
	message.open({
		type: 'success',
		content,
	});
};

export const showError = (message: MessageInstance, content: string) => {
	message.open({
		type: 'error',
		content,
	});
};

export const showWarning = (message: MessageInstance, content: string) => {
	message.open({
		type: 'warning',
		content,
	});
};
