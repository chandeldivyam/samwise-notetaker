// src/app/dashboard/recordings/[id]/SpeakerManagement.tsx
import { Select, Typography } from 'antd';
import { Speaker } from '@/types/transcription';
import { Person } from '@/types/person';

const { Text } = Typography;

interface SpeakerManagementProps {
	speakers: Speaker[];
	people: Person[];
	onSpeakerUpdate: (
		originalSpeakerNumber: number,
		personId: string | null
	) => Promise<void>;
}

export function SpeakerManagement({
	speakers,
	people,
	onSpeakerUpdate,
}: SpeakerManagementProps) {
	return (
		<div className="p-4 border-b border-gray-200">
			<Text strong className="block mb-3">
				Assign Speakers
			</Text>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{speakers.map((speaker) => (
					<div
						key={speaker.original_speaker_number}
						className="flex flex-col gap-1"
					>
						<Select
							className="w-full"
							placeholder="Select speaker"
							value={speaker.person_id}
							onChange={(personId) =>
								onSpeakerUpdate(
									speaker.original_speaker_number,
									personId
								)
							}
							options={[
								{ label: speaker.speaker_label, value: null },
								...people.map((person) => ({
									label: person.name,
									value: person.id,
								})),
							]}
							style={{
								borderLeft: `3px solid hsl(${speaker.original_speaker_number * 137.508}deg 70% 45%)`,
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
