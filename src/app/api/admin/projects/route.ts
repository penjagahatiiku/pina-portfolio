import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Simple token-based auth check for admin routes
function getAuthError(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// GET /api/admin/projects - List all projects
export async function GET(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_technologies(technology_id, technologies(*))')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const projects = data?.map((p) => ({
    ...p,
    technologies: p.project_technologies?.map(
      (pt: { technologies: unknown }) => pt.technologies
    ).filter(Boolean) || [],
    project_technologies: undefined,
  }));

  return NextResponse.json({ projects });
}

// POST /api/admin/projects - Create a new project
export async function POST(request: NextRequest) {
  const authErr = getAuthError(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { title, description, thumbnail_url, images_gallery, live_demo_url, github_url, is_featured, completion_date, technology_ids, user_id } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        thumbnail_url: thumbnail_url || null,
        images_gallery: images_gallery || [],
        live_demo_url: live_demo_url || null,
        github_url: github_url || null,
        is_featured: is_featured || false,
        completion_date: completion_date || null,
        user_id: user_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Link technologies
    if (technology_ids && technology_ids.length > 0 && project) {
      const techLinks = technology_ids.map((tid: string) => ({
        project_id: project.id,
        technology_id: tid,
      }));

      await supabase.from('project_technologies').insert(techLinks);
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
