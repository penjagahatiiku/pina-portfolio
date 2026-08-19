import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function getAuthError(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// GET /api/admin/profile
export async function GET(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, bio, profession, social_links, created_at, updated_at')
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

// PUT /api/admin/profile
export async function PUT(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, bio, profession, social_links, email } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: Record<string, unknown> = {};
    if (bio !== undefined) updateData.bio = bio;
    if (profession !== undefined) updateData.profession = profession;
    if (social_links !== undefined) updateData.social_links = social_links;
    if (email !== undefined) updateData.email = email;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, email, bio, profession, social_links, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
