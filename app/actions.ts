'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function publishProfile(id: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'published' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function rejectProfile(id: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function deleteProfile(id: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin');
}