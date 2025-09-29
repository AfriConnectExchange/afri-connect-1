import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }

  // Map to the frontend Notification interface
  const mappedData = data.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    timestamp: n.created_at,
    read: n.is_read,
    priority: 'medium', // Mock priority for now
    action: n.link_url ? { label: 'View Details', onClick: () => {} } : undefined // OnClick handled on client
  }));


  return NextResponse.json(mappedData);
}
