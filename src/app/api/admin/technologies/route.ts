import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function getAuthError(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// GET /api/admin/technologies
export async function GET(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('technologies')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ technologies: data });
}

// POST /api/admin/technologies
export async function POST(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { name, icon_url, category } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('technologies')
      .insert({ name, icon_url: icon_url || null, category: category || null })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ technology: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT /api/admin/technologies
export async function PUT(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { id, name, icon_url, category } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('technologies')
      .update({ name, icon_url: icon_url || null, category: category || null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ technology: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/admin/technologies
export async function DELETE(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('technologies').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Technology deleted' });
}
