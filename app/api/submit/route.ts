import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const occupation = formData.get('occupation') as string;
    const website = formData.get('website') as string;
    const photoFile = formData.get('photo') as File | null;
    const questionAnswers = JSON.parse(formData.get('question_answers') as string);
    const clothingPicks = JSON.parse(formData.get('clothing_picks') as string);

    if (!name || !email || !bio || !location || !occupation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let photoUrl = '';

    if (photoFile && photoFile.size > 0) {
      const fileExt = photoFile.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const buffer = Buffer.from(await photoFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('profile-photos')
        .upload(fileName, buffer, {
          contentType: photoFile.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: `Photo upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('profile-photos')
        .getPublicUrl(uploadData.path);

      photoUrl = publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        name,
        email,
        bio,
        location,
        occupation,
        website: website || null,
        photo_url: photoUrl,
        status: 'pending',
        question_answers: questionAnswers,
        clothing_picks: clothingPicks,
      })
      .select('id, slug')
      .single();

    if (error) {
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}