// ./src/app/dashboard/people/page.tsx
import { getPeople } from '@/lib/actions/people';
import PeopleList from './PeopleList';
import { redirect } from 'next/navigation';

export default async function PeoplePage() {
	const { data: people, error } = await getPeople();

	if (error) {
		redirect('/dashboard');
	}

	return <PeopleList initialPeople={people || []} />;
}
