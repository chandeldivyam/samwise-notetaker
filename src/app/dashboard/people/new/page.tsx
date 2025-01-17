// ./src/app/dashboard/people/new/page.tsx
'use client';

import { createPerson } from '@/lib/actions/people';
import PersonForm from '../PersonForm';

export default function NewPersonPage() {
    return (
        <PersonForm
            onSubmit={createPerson}
            submitButtonText="Create Person"
        />
    );
}