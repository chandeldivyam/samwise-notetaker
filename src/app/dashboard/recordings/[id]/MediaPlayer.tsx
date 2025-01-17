import { useInView } from 'react-intersection-observer';

interface MediaPlayerProps {
	mediaUrl: string | null;
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
	fileType: string;
}

export function MediaPlayer({
	mediaUrl,
	mediaRef,
	fileType,
}: MediaPlayerProps) {
	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: true,
	});

	const isVideo = fileType.startsWith('video');

	if (!mediaUrl) return null;

	return (
		<div ref={ref}>
			{isVideo ? (
				<video
					ref={mediaRef as React.RefObject<HTMLVideoElement>}
					controls
					className="w-full rounded-lg"
					src={inView ? mediaUrl : undefined}
					preload="metadata"
				/>
			) : (
				<audio
					ref={mediaRef as React.RefObject<HTMLAudioElement>}
					controls
					className="w-full"
					src={inView ? mediaUrl : undefined}
					preload="metadata"
				/>
			)}
		</div>
	);
}
