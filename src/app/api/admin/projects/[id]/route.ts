import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function getAuthError(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// PUT /api/admin/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, description, thumbnail_url, images_gallery, live_demo_url, github_url, is_featured, completion_date, technology_ids } = body;

    const supabase = createAdminClient();

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        thumbnail_url: thumbnail_url || null,
        images_gallery: images_gallery || [],
        live_demo_url: live_demo_url || null,
        github_url: github_url || null,
        is_featured: is_featured || false,
        completion_date: completion_date || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update technologies
    if (technology_ids !== undefined) {
      await supabase.from('project_technologies').delete().eq('project_id', id);

      if (technology_ids.length > 0) {
        const techLinks = technology_ids.map((tid: string) => ({
          project_id: id,
          technology_id: tid,
        }));
        await supabase.from('project_technologies').insert(techLinks);
      }
    }

    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Project deleted' });
}
