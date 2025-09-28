'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  MessageSquare,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { helpCategories, helpArticles } from '@/data/help-data';
import type { HelpArticle } from '@/data/help-data';
import { ArticleView } from './article-view';
import { CategoryGrid } from './category-grid';
import { ArticleList } from './article-list';
import { QuickActions } from './quick-actions';

interface HelpCenterPageProps {
  onNavigate: (page: string) => void;
}

export function HelpCenterPage({ onNavigate }: HelpCenterPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  );

  const filteredArticles = useMemo(() => {
    let filtered = helpArticles;
    if (selectedCategory) {
      filtered = filtered.filter(
        (article) => article.category === selectedCategory
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [searchQuery, selectedCategory]);
  
  const handleSetCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // This is a way to programmatically switch tabs
    document.querySelector('[data-radix-collection-item][value="articles"]')?.click();
  };

  if (selectedArticle) {
    return (
      <ArticleView
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/marketplace')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 md:mb-12"
          >
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    How can we help you?
                  </h1>
                  <p className="text-muted-foreground">
                    Search our knowledge base or browse categories below
                  </p>
                </div>
                <div className="relative max-w-lg mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <QuickActions onNavigate={onNavigate} />

          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse by Category</TabsTrigger>
              <TabsTrigger value="articles">
                {searchQuery || selectedCategory
                  ? 'Search Results'
                  : 'Featured Articles'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="mt-8">
              <CategoryGrid onSelectCategory={handleSetCategory} />
            </TabsContent>
            <TabsContent value="articles" className="mt-8 space-y-6">
              {selectedCategory && (
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Showing articles in:{' '}
                      <strong>
                        {helpCategories.find((c) => c.id === selectedCategory)
                          ?.name}
                      </strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear Filter
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              <ArticleList
                articles={filteredArticles}
                onSelectArticle={setSelectedArticle}
                searchQuery={searchQuery}
                onNavigate={onNavigate}
                onClearSearch={() => setSearchQuery('')}
              />
            </TabsContent>
          </Tabs>
          
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Still need help?</h2>
              <p className="text-muted-foreground mt-2">Our support team is here for you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card
                className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => onNavigate('support')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Open a support ticket and get a response within 24 hours.
                  </p>
                  <Button>Open a Ticket</Button>
                </CardContent>
              </Card>
              <a href="mailto:support@africonnect.com" className="block">
                <Card className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Send us an email directly with your questions or concerns.
                    </p>
                    <Button variant="outline">Send Email</Button>
                  </CardContent>
                </Card>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
