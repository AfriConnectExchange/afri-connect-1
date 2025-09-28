'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { helpCategories } from '@/data/help-data';

interface CategoryGridProps {
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {helpCategories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full group"
            onClick={() => onSelectCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${category.color}`}
                >
                  <category.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {category.articleCount} articles
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
