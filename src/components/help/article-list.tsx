'use client';

import { motion } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  ThumbsUp,
  HelpCircle,
  Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { helpCategories, type HelpArticle } from '@/data/help-data';

interface ArticleListProps {
  articles: HelpArticle[];
  onSelectArticle: (article: HelpArticle) => void;
  searchQuery: string;
  onNavigate: (page: string) => void;
  onClearSearch: () => void;
}

export function ArticleList({
  articles,
  onSelectArticle,
  searchQuery,
  onNavigate,
  onClearSearch,
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No articles match "${searchQuery}". Try different keywords or browse by category.`
              : 'No articles available in this category.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {searchQuery && (
              <Button variant="outline" onClick={onClearSearch}>
                Clear Search
              </Button>
            )}
            <Button onClick={() => onNavigate('support')}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
            onClick={() => onSelectArticle(article)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {article.featured && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                     <Badge variant="outline" className="text-xs">
                      {helpCategories.find((c) => c.id === article.category)
                        ?.name}
                    </Badge>
                  </div>
                   <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {article.content.split('\n')[0]}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated{' '}
                      {new Date(article.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {article.helpful} helpful
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
