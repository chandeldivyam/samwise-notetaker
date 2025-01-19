// src/app/dashboard/recordings/[id]/TranscriptionSection.tsx
import { useMemo, useState, useEffect } from 'react';
import { Typography, Input, Button, Tooltip } from 'antd';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { TranscriptionSegment, Speaker } from '@/types/transcription';
import { TranscriptionSentence } from './TranscriptionSentence';
import { Person } from '@/types/person';
import { getPeople } from '@/lib/actions/people';
import { updateAllSegmentsByOriginalSpeaker } from '@/lib/actions/transcription-segments';
import { useMessage } from '@/utils/message';
import { formatTime } from '@/utils/format';
import { SpeakerNavigation } from './SpeakerNavigation';
import { SpeakerManagement } from './SpeakerManagement';

const { Title } = Typography;

interface TranscriptionSectionProps {
	segments?: TranscriptionSegment[];
	recordingId: string;
	mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
	onRefreshSegments: () => Promise<void>;
}

export function TranscriptionSection({
	segments,
	recordingId,
	mediaRef,
	onRefreshSegments,
}: TranscriptionSectionProps) {
	const [people, setPeople] = useState<Person[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentSpeaker, setCurrentSpeaker] = useState<number>();
	const messageApi = useMessage();

	useEffect(() => {
		getPeople().then(({ data }) => {
			if (data) setPeople(data);
		});
	}, []);

	const { sortedSegments, uniqueSpeakers } = useMemo(() => {
		if (!segments?.length)
			return { sortedSegments: [], uniqueSpeakers: new Map() };

		const sorted = [...segments].sort(
			(a, b) => a.start_time - b.start_time
		);
		const speakers = new Map<string, Speaker>();

		segments.forEach((segment) => {
			const key = `${segment.original_speaker_number}`;
			if (!speakers.has(key)) {
				speakers.set(key, {
					original_speaker_number: segment.original_speaker_number,
					person_id: segment.person_id,
					speaker_label: segment.speaker_label,
				});
			}
		});

		return { sortedSegments: sorted, uniqueSpeakers: speakers };
	}, [segments]);

	const filteredSegments = useMemo(() => {
		return sortedSegments.filter((segment) => {
			const matchesSearch = searchQuery
				? segment.text.toLowerCase().includes(searchQuery.toLowerCase())
				: true;
			const matchesSpeaker =
				currentSpeaker !== undefined
					? segment.original_speaker_number === currentSpeaker
					: true;
			return matchesSearch && matchesSpeaker;
		});
	}, [sortedSegments, searchQuery, currentSpeaker]);

	const groupedSegments = useMemo(() => {
		const groups: TranscriptionSegment[][] = [];
		let currentGroup: TranscriptionSegment[] = [];

		filteredSegments.forEach((segment, index) => {
			if (index === 0) {
				currentGroup = [segment];
			} else {
				const previousSegment = filteredSegments[index - 1];
				const timeDifference =
					segment.start_time - previousSegment.end_time;
				const sameSpeaker =
					segment.original_speaker_number ===
					previousSegment.original_speaker_number;

				if (!sameSpeaker || timeDifference > 2) {
					if (currentGroup.length > 0) {
						groups.push(currentGroup);
					}
					currentGroup = [segment];
				} else {
					currentGroup.push(segment);
				}
			}

			if (
				index === filteredSegments.length - 1 &&
				currentGroup.length > 0
			) {
				groups.push(currentGroup);
			}
		});

		return groups;
	}, [filteredSegments]);

	const handleSpeakerUpdate = async (
		originalSpeakerNumber: number,
		personId: string | null
	) => {
		try {
			const person = people.find((p) => p.id === personId);
			const speakerLabel = person
				? person.name
				: `Speaker ${originalSpeakerNumber}`;

			await updateAllSegmentsByOriginalSpeaker(
				recordingId,
				originalSpeakerNumber,
				personId,
				speakerLabel
			);
			await onRefreshSegments();
			messageApi.success('Speaker updated successfully');
		} catch (error) {
			console.error(error);
			messageApi.error('Failed to update speaker');
		}
	};

	const handleCopyTranscript = () => {
		const transcript = groupedSegments
			.map((group) => {
				const speaker = group[0].speaker_label;
				const text = group.map((segment) => segment.text).join(' ');
				return `${speaker}: ${text}`;
			})
			.join('\n\n');

		navigator.clipboard.writeText(transcript);
		messageApi.success('Transcript copied to clipboard');
	};

	if (!segments?.length) return null;

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center mb-4">
				<Title level={3} className="mb-0">
					Transcription
				</Title>
				<Button icon={<CopyOutlined />} onClick={handleCopyTranscript}>
					Copy Transcript
				</Button>
			</div>

			<SpeakerManagement
				speakers={Array.from(uniqueSpeakers.values())}
				people={people}
				onSpeakerUpdate={handleSpeakerUpdate}
			/>

			<div className="px-4 py-3 border-t border-border-color">
				<Input
					prefix={<SearchOutlined />}
					placeholder="Search transcription..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					allowClear
				/>
			</div>

			<div className="flex flex-1 overflow-hidden">
				<SpeakerNavigation
					speakers={Array.from(uniqueSpeakers.values())}
					currentSpeaker={currentSpeaker}
					onSpeakerClick={(speakerNumber) =>
						setCurrentSpeaker(
							currentSpeaker === speakerNumber
								? undefined
								: speakerNumber
						)
					}
				/>

				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{groupedSegments.map((group, groupIndex) => {
						const firstSegment = group[0];
						const startTime = firstSegment.start_time;
						const endTime = group[group.length - 1].end_time;

						return (
							<div
								key={groupIndex}
								className="border-l-4 pl-4"
								style={{
									borderColor: `hsl(${firstSegment.original_speaker_number * 137.508}deg 70% 45%)`,
								}}
							>
								<div className="flex items-center gap-2 mb-2">
									<Tooltip
										title={`${formatTime(startTime)} - ${formatTime(endTime)}`}
									>
										<span className="text-sm text-text-secondary">
											{formatTime(startTime)}
										</span>
									</Tooltip>
									<span className="font-semibold text-text-primary">
										{firstSegment.speaker_label}
									</span>
								</div>
								<div className="text-text-primary">
									{group.map((segment) => (
										<TranscriptionSentence
											key={segment.id}
											sentence={{
												text: segment.text,
												start: segment.start_time,
											}}
											mediaRef={mediaRef}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
