export function TranscriptionSentence({
	sentence,
	mediaRef,
}: {
	sentence: { text: string; start: number };
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
}) {
	const handleClick = () => {
		if (mediaRef.current) {
			mediaRef.current.currentTime = sentence.start;
			mediaRef.current.play();
		}
	};

	return (
		<span
			className="cursor-pointer hover:bg-text-secondary transition-colors px-1 rounded"
			onClick={handleClick}
		>
			{sentence.text}{' '}
		</span>
	);
}
