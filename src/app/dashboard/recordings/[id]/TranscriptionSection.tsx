import { useMemo, useState, useEffect } from 'react';
import { Typography, Card, Select, Tooltip } from 'antd';
import { TranscriptionSegment, Speaker } from '@/types/transcription';
import { TranscriptionSentence } from './TranscriptionSentence';
import { Person } from '@/types/person';
import { getPeople } from '@/lib/actions/people';
import { updateAllSegmentsByOriginalSpeaker } from '@/lib/actions/transcription-segments';
import { useMessage } from '@/utils/message';

const { Title, Paragraph } = Typography;

interface TranscriptionSectionProps {
  segments?: TranscriptionSegment[];
  recordingId: string;
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>;
  onRefreshSegments: () => Promise<void>;
}

// Helper function to format time in MM:SS format
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function TranscriptionSection({
  segments,
  recordingId,
  mediaRef,
  onRefreshSegments,
}: TranscriptionSectionProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const messageApi = useMessage();

  useEffect(() => {
    getPeople().then(({ data }) => {
      if (data) setPeople(data);
    });
  }, []);

  // Sort segments chronologically and identify unique speakers
  const { sortedSegments, uniqueSpeakers } = useMemo(() => {
    if (!segments?.length) return { sortedSegments: [], uniqueSpeakers: new Map() };

    // Sort segments by start time
    const sorted = [...segments].sort((a, b) => a.start_time - b.start_time);
    
    // Create map of unique speakers
    const speakers = new Map<string, Speaker>();
    segments.forEach(segment => {
      const key = `${segment.original_speaker_number}`;
      if (!speakers.has(key)) {
        speakers.set(key, {
          original_speaker_number: segment.original_speaker_number,
          person_id: segment.person_id,
          speaker_label: segment.speaker_label
        });
      }
    });

    return { sortedSegments: sorted, uniqueSpeakers: speakers };
  }, [segments]);

  // Group consecutive segments by the same speaker
  const groupedSegments = useMemo(() => {
    const groups: TranscriptionSegment[][] = [];
    let currentGroup: TranscriptionSegment[] = [];

    sortedSegments.forEach((segment, index) => {
      if (index === 0) {
        currentGroup = [segment];
      } else {
        const previousSegment = sortedSegments[index - 1];
        const timeDifference = segment.start_time - previousSegment.end_time;
        const sameSpeaker = segment.original_speaker_number === previousSegment.original_speaker_number;

        // Start a new group if:
        // 1. Different speaker, or
        // 2. Same speaker but gap is more than 2 seconds
        if (!sameSpeaker || timeDifference > 2) {
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          currentGroup = [segment];
        } else {
          currentGroup.push(segment);
        }
      }

      // Push the last group
      if (index === sortedSegments.length - 1 && currentGroup.length > 0) {
        groups.push(currentGroup);
      }
    });

    return groups;
  }, [sortedSegments]);

  const handleSpeakerUpdate = async (originalSpeakerNumber: number, personId: string | null) => {
    try {
      const person = people.find(p => p.id === personId);
      const speakerLabel = person ? person.name : `Speaker ${originalSpeakerNumber}`;
      
      await updateAllSegmentsByOriginalSpeaker(recordingId, originalSpeakerNumber, personId, speakerLabel);
      await onRefreshSegments();
      messageApi.success('Speaker updated successfully');
    } catch (error) {
		console.error(error);
      messageApi.error('Failed to update speaker');
    }
  };

  if (!segments?.length) return null;

  return (
    <Card className="mt-8">
      <Title level={3}>Transcription</Title>
      
      {/* Speaker Management Section */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(uniqueSpeakers.values()).map((speaker) => (
            <Select
              key={speaker.original_speaker_number}
              className="w-full"
              placeholder="Select speaker"
              value={speaker.person_id}
              onChange={(personId) => handleSpeakerUpdate(speaker.original_speaker_number, personId)}
              options={[
                { label: speaker.speaker_label, value: null },
                ...people.map((person) => ({
                  label: person.name,
                  value: person.id,
                }))
              ]}
            />
          ))}
        </div>
      </div>

      {/* Transcription Content */}
      <div className="overflow-y-auto max-h-[600px] space-y-4">
        {groupedSegments.map((group, groupIndex) => {
          const firstSegment = group[0];
          const startTime = formatTime(firstSegment.start_time);
          const endTime = formatTime(group[group.length - 1].end_time);
          
          return (
            <div key={groupIndex} className="border-l-4 pl-4" style={{ borderColor: `hsl(${firstSegment.original_speaker_number * 137.508}deg 70% 45%)` }}>
              <div className="flex items-center gap-2 mb-2">
                <Tooltip title={`${startTime} - ${endTime}`}>
                  <span className="text-sm text-text-secondary">
                    {startTime}
                  </span>
                </Tooltip>
                <span className="font-semibold text-text-primary">
                  {firstSegment.speaker_label}
                </span>
              </div>
              <Paragraph className="mb-0">
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
              </Paragraph>
            </div>
          );
        })}
      </div>
    </Card>
  );
}