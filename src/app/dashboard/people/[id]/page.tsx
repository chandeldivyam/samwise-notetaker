// ./src/app/dashboard/people/[id]/page.tsx
import { getPerson } from '@/lib/actions/people';
import EditPersonForm from './EditPersonForm';
import { redirect } from 'next/navigation';

export default async function EditPersonPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const { data: person, error } = await getPerson(resolvedParams.id);

    if (error || !person) {
        redirect('/dashboard/people');
    }

    return <EditPersonForm initialPerson={person} />;
}