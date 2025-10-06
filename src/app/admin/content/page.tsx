"use client";

import { PageLoader } from '@/components/ui/loader';

export default function AdminContentPage() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Content Moderation</h2>
      <p className="text-sm text-muted-foreground">This area will contain tools to review flagged content, remove listings, and manage community standards.</p>
    </div>
  );
}
