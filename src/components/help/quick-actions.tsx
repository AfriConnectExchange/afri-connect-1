'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { quickActions } from '@/data/help-data';

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-10 md:mb-12"
    >
      <h3 className="font-semibold mb-4 text-lg">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
              onClick={() => onNavigate(action.action)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-medium text-sm mb-1">{action.title}</h4>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
