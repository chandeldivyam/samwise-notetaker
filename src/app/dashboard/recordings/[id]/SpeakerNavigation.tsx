// src/app/dashboard/recordings/[id]/SpeakerNavigation.tsx
import { Button, Tooltip } from 'antd';
import { Speaker } from '@/types/transcription';

interface SpeakerNavigationProps {
	speakers: Speaker[];
	currentSpeaker?: number | undefined;
	onSpeakerClick: (speakerNumber: number) => void;
}

export function SpeakerNavigation({
	speakers,
	currentSpeaker,
	onSpeakerClick,
}: SpeakerNavigationProps) {
	return (
		<div className="flex flex-col gap-2 min-w-[120px] p-4 border-r border-border-color">
			<h3 className="text-sm font-semibold text-text-secondary mb-2">
				Speakers
			</h3>
			{speakers.map((speaker) => (
				<Tooltip
					key={speaker.original_speaker_number}
					title={speaker.speaker_label}
					placement="right"
				>
					<Button
						type={
							currentSpeaker === speaker.original_speaker_number
								? 'primary'
								: 'default'
						}
						className="text-left"
						onClick={() =>
							onSpeakerClick(speaker.original_speaker_number)
						}
						style={{
							borderLeft: `3px solid hsl(${speaker.original_speaker_number * 137.508}deg 70% 45%)`,
							transition: 'all 0.2s',
						}}
					>
						{speaker.speaker_label}
					</Button>
				</Tooltip>
			))}
		</div>
	);
}
