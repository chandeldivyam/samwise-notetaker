'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface AuthFormData {
	email: string;
	password: string;
}

export async function login(formData: AuthFormData) {
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email: formData.email,
		password: formData.password,
	});

	if (error) {
		// In a real application, you might want to handle different error cases differently
		console.log('Login error:', error);
		console.error('Login error:', error.message);
		redirect('/error');
	}

	revalidatePath('/dashboard', 'layout');
	redirect('/dashboard');
}

export async function signup(formData: AuthFormData) {
	const supabase = await createClient();

	const { error } = await supabase.auth.signUp({
		email: formData.email,
		password: formData.password,
	});

	if (error) {
		console.error('Signup error:', error.message);
		redirect('/error');
	}

	revalidatePath('/dashboard', 'layout');
	redirect('/dashboard');
}
