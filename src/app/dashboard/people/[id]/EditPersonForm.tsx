// ./src/app/dashboard/people/[id]/EditPersonForm.tsx
'use client';

import { updatePerson } from '@/lib/actions/people';
import PersonForm from '../PersonForm';
import { Person } from '@/types/person';

interface EditPersonFormProps {
    initialPerson: Person;
}

export default function EditPersonForm({ initialPerson }: EditPersonFormProps) {
    return (
        <PersonForm
            initialPerson={initialPerson}
            onSubmit={(values) => updatePerson(initialPerson.id, values)}
            submitButtonText="Save Changes"
        />
    );
}