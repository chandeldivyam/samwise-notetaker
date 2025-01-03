'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface AuthFormData {
	email: string;
	password: string;
}

interface AuthResponse {
	error?: string;
	success?: boolean;
	message?: string;
}

export async function login(formData: AuthFormData): Promise<AuthResponse> {
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email: formData.email,
		password: formData.password,
	});

	if (error) {
		if (error.message.includes('Invalid login credentials')) {
			return { error: 'Incorrect email or password' };
		}
		if (error.message.includes('Email not confirmed')) {
			return { error: 'Please verify your email address' };
		}
		return { error: 'An error occurred during login. Please try again.' };
	}

	revalidatePath('/dashboard', 'layout');
	redirect('/dashboard');
}

export async function signup(formData: AuthFormData): Promise<AuthResponse> {
	const supabase = await createClient();

	const { error, data } = await supabase.auth.signUp({
		email: formData.email,
		password: formData.password,
	});

	if (error) {
		if (error.message.includes('User already registered')) {
			return { error: 'An account with this email already exists' };
		}
		return { error: 'An error occurred during signup. Please try again.' };
	}

	// If email confirmation is required
	if (data?.user?.identities?.length === 0) {
		return {
			success: true,
			message: 'Please check your email to verify your account',
		};
	}

	revalidatePath('/dashboard', 'layout');
	redirect('/dashboard');
}
