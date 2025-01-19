import { Select, Typography, Spin } from 'antd';
import { useState, useMemo, useEffect, ReactNode } from 'react';
import debounce from 'lodash/debounce';
import { Speaker } from '@/types/transcription';
import {
	PersonSearchResult,
	searchPeople,
	getMultiplePeople,
} from '@/lib/actions/people';

const { Text } = Typography;

/**
 * If you’re storing in your DB that a speaker is "unassigned",
 * we can represent that in the Select by using this special string.
 */
const UNASSIGNED_VALUE = '-unassigned-';

interface SpeakerManagementProps {
	speakers: Speaker[];
	onSpeakerUpdate: (
		originalSpeakerNumber: number,
		personId: string | null,
		speakerLabel: string
	) => Promise<void>;
}

interface PersonOption {
	label: ReactNode;
	value: string; // We'll no longer allow null in value to satisfy AntD
}

export function SpeakerManagement({
	speakers,
	onSpeakerUpdate,
}: SpeakerManagementProps) {
	const [searchResults, setSearchResults] = useState<
		Record<number, PersonSearchResult[]>
	>({});
	const [assignedPeople, setAssignedPeople] = useState<
		Record<string, PersonSearchResult>
	>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const [searching, setSearching] = useState<Record<number, boolean>>({});

	/**
	 * Fetch assigned people by ID to fill in the assignedPeople object,
	 * ensuring we have details about each assigned person if not in search results.
	 */
	useEffect(() => {
		const fetchAssignedPeople = async () => {
			const assignedIds = speakers
				.map((sp) => sp.person_id)
				.filter((id): id is string => id !== null);

			// No assigned IDs at all? Then we're done.
			if (assignedIds.length === 0) return;

			// Only fetch data for IDs we do NOT already have in assignedPeople.
			const missingIds = assignedIds.filter((id) => !assignedPeople[id]);
			if (missingIds.length === 0) return;

			const { data } = await getMultiplePeople(missingIds);
			if (data) {
				const newAssigned: Record<string, PersonSearchResult> = {};
				data.forEach((person) => {
					newAssigned[person.id] = {
						id: person.id,
						name: person.name,
						email: person.email,
					};
				});

				setAssignedPeople((prev) => ({ ...prev, ...newAssigned }));
			}
		};

		fetchAssignedPeople();
	}, [speakers]);

	/**
	 * Debounced search to reduce calls to the server.
	 */
	const debouncedSearch = useMemo(
		() =>
			debounce(async (query: string, speakerNumber: number) => {
				if (!query) {
					setSearchResults((prev) => ({
						...prev,
						[speakerNumber]: [],
					}));
					setSearching((prev) => ({
						...prev,
						[speakerNumber]: false,
					}));
					return;
				}

				setSearching((prev) => ({ ...prev, [speakerNumber]: true }));
				const { data } = await searchPeople({ query });
				setSearchResults((prev) => ({
					...prev,
					[speakerNumber]: data || [],
				}));
				setSearching((prev) => ({ ...prev, [speakerNumber]: false }));
			}, 300),
		[]
	);

	const handleSearch = (value: string, speakerNumber: number) => {
		debouncedSearch(value, speakerNumber);
	};

	/**
	 * Called when a user changes the select value for a given speaker,
	 * passing either a person ID or our UNASSIGNED_VALUE.
	 */
	const handleSpeakerChange = async (
		originalSpeakerNumber: number,
		selectedValue: string,
		speaker: Speaker
	) => {
		setLoading((prev) => ({ ...prev, [originalSpeakerNumber]: true }));

		// Convert the special unassigned value to null
		const personId =
			selectedValue === UNASSIGNED_VALUE ? null : selectedValue;
		let speakerLabel = `Speaker ${originalSpeakerNumber}`;
		if (selectedValue !== UNASSIGNED_VALUE) {
			// Try looking it up from assignedPeople...
			const fromAssigned = assignedPeople[selectedValue];
			// If not found there, look in any existing search results
			const fromSearch = (
				searchResults[speaker.original_speaker_number] || []
			).find((p) => p.id === selectedValue);
			if (fromAssigned) {
				speakerLabel = fromAssigned.name;
			} else if (fromSearch) {
				speakerLabel = fromSearch.name;
			}
		}
		try {
			await onSpeakerUpdate(
				originalSpeakerNumber,
				personId,
				speakerLabel
			);
		} catch (e) {
			console.error(e);
			// If onSpeakerUpdate throws, handle error or fallback
		}

		setLoading((prev) => ({ ...prev, [originalSpeakerNumber]: false }));
	};

	/**
	 * Builds the <Select> options for a given speaker.
	 * We always show an "Unassigned" option, plus the assigned speaker (if any),
	 * plus the search results (minus duplicates).
	 */
	const getOptionsForSpeaker = (speaker: Speaker): PersonOption[] => {
		const speakerSearchResults =
			searchResults[speaker.original_speaker_number] || [];

		// 1. Always include an "unassigned" option
		const options: PersonOption[] = [
			{
				label: (
					<span className="text-sm text-text-secondary">
						{`Speaker ${speaker.original_speaker_number}`}
					</span>
				),
				value: UNASSIGNED_VALUE,
			},
		];

		// 2. If there's a person assigned, add that as an option
		//    (only if it’s not already in search results below).
		if (speaker.person_id && assignedPeople[speaker.person_id]) {
			const assignedPerson = assignedPeople[speaker.person_id];

			// Check if assigned is in search results
			const alreadyInSearchResults = speakerSearchResults.some(
				(result) => result.id === assignedPerson.id
			);

			if (!alreadyInSearchResults) {
				options.push({
					label: (
						<div className="flex flex-col">
							<div>{assignedPerson.name}</div>
							<div className="text-xs text-text-secondary">
								{assignedPerson.email}
							</div>
						</div>
					),
					value: assignedPerson.id,
				});
			}
		}

		// 3. Add the search results
		speakerSearchResults.forEach((person) => {
			options.push({
				label: (
					<div className="flex flex-col">
						<div>{person.name}</div>
						<div className="text-xs text-text-secondary">
							{person.email}
						</div>
					</div>
				),
				value: person.id,
			});
		});

		return options;
	};

	return (
		<div className="p-4 border-b border-border-primary">
			<Text strong className="block mb-3">
				Assign Speakers
			</Text>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{speakers.map((speaker) => {
					const valueForSelect =
						speaker.person_id || UNASSIGNED_VALUE;

					return (
						<div
							key={speaker.original_speaker_number}
							className="flex flex-col gap-1"
						>
							<Select<string, PersonOption>
								showSearch
								className="w-full"
								placeholder="Search for a person..."
								value={valueForSelect}
								onChange={(newValue) =>
									handleSpeakerChange(
										speaker.original_speaker_number,
										newValue,
										speaker
									)
								}
								onSearch={(val) =>
									handleSearch(
										val,
										speaker.original_speaker_number
									)
								}
								loading={
									loading[speaker.original_speaker_number] ||
									searching[speaker.original_speaker_number]
								}
								filterOption={false}
								defaultActiveFirstOption={false}
								options={getOptionsForSpeaker(speaker)}
								notFoundContent={
									searching[
										speaker.original_speaker_number
									] ? (
										<Spin size="small" />
									) : null
								}
								optionLabelProp="label"
								style={{
									height:
										valueForSelect === UNASSIGNED_VALUE
											? undefined
											: '48px',
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
