// src/app/dashboard/recordings/[id]/TranscriptionSentence.tsx
import { useEffect, useState } from 'react';

interface TranscriptionSentenceProps {
	sentence: {
		text: string;
		start: number;
	};
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
}

export function TranscriptionSentence({
	sentence,
	mediaRef,
}: TranscriptionSentenceProps) {
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		const media = mediaRef.current;
		if (!media) return;

		const handleTimeUpdate = () => {
			const currentTime = media.currentTime;
			const isNearTime = Math.abs(currentTime - sentence.start) < 0.5;
			setIsActive(isNearTime);
		};

		media.addEventListener('timeupdate', handleTimeUpdate);
		return () => media.removeEventListener('timeupdate', handleTimeUpdate);
	}, [mediaRef, sentence.start]);

	const handleClick = () => {
		if (mediaRef.current) {
			mediaRef.current.currentTime = sentence.start;
			mediaRef.current.play();
		}
	};

	return (
		<span
			className={`cursor-pointer transition-colors px-1 rounded ${
				isActive ? 'bg-primary-color' : 'hover:bg-primary-hover'
			}`}
			onClick={handleClick}
		>
			{sentence.text}
		</span>
	);
}
