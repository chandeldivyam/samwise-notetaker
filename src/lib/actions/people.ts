// ./src/lib/actions/people.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface PersonData {
	name: string;
	email: string;
	tags: string[];
	description: string;
}

interface SearchPeopleParams {
	query: string;
	limit?: number;
}

export async function createPerson(data: PersonData) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase.from('people').insert([
			{
				...data,
				user_id: user.id,
			},
		]);

		if (error) throw error;

		revalidatePath('/dashboard/people');
		return { success: true };
	} catch (error) {
		console.error('Error creating person:', error);
		return {
			error: 'Failed to create person',
		};
	}
}

export async function updatePerson(id: string, data: PersonData) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase
			.from('people')
			.update(data)
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) throw error;

		revalidatePath('/dashboard/people');
		return { success: true };
	} catch (error) {
		console.error('Error updating person:', error);
		return {
			error: 'Failed to update person',
		};
	}
}

export async function deletePerson(id: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { error } = await supabase
			.from('people')
			.delete()
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) throw error;

		revalidatePath('/dashboard/people');
		return { success: true };
	} catch (error) {
		console.error('Error deleting person:', error);
		return {
			error: 'Failed to delete person',
		};
	}
}

export async function getPeople() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { data, error } = await supabase
			.from('people')
			.select('*')
			.eq('user_id', user.id)
			.order('updated_at', { ascending: false });

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching people:', error);
		return { error: 'Failed to fetch people' };
	}
}

export async function getPerson(id: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { data, error } = await supabase
			.from('people')
			.select('*')
			.eq('id', id)
			.eq('user_id', user.id)
			.single();

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching person:', error);
		return { error: 'Failed to fetch person' };
	}
}

export async function searchPeople({ query, limit = 5 }: SearchPeopleParams) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		// Search across name and email fields
		const { data, error } = await supabase
			.from('people')
			.select('id, name, email')
			.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
			.eq('user_id', user.id)
			.limit(limit)
			.order('name');

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error searching people:', error);
		return { error: 'Failed to search people' };
	}
}

// Type for search results
export interface PersonSearchResult {
	id: string;
	name: string;
	email: string;
}

export async function getMultiplePeople(ids: string[]) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { data, error } = await supabase
			.from('people')
			.select('id, name, email')
			.in('id', ids)
			.eq('user_id', user.id);

		if (error) throw error;

		return { data };
	} catch (error) {
		console.error('Error fetching multiple people:', error);
		return { error: 'Failed to fetch multiple people' };
	}
}
