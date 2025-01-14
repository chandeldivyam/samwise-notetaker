// src/lib/actions/auth.ts
'use server';

import { createClient } from '@/utils/supabase/server';

export async function getCurrentUser() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) return { error: error.message };
		return { user };
	} catch (error) {
		console.error('Error getting user:', error);
		return { error: 'Failed to get user' };
	}
}

export async function signOut() {
	try {
		const supabase = await createClient();
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Error signing out:', error);
		return { error: 'Failed to sign out' };
	}
}
