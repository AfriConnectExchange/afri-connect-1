'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface EmptyStateProps {
  searchQuery: string;
  activeTab: string;
}

export function EmptyState({ searchQuery, activeTab }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {searchQuery
          ? 'No notifications match your search query.'
          : `You have no ${
              activeTab !== 'all' ? activeTab : ''
            } notifications.`}
      </p>
    </motion.div>
  );
}
