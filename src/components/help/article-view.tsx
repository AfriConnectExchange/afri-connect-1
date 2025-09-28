'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type HelpArticle } from '@/data/help-data';

interface ArticleViewProps {
  article: HelpArticle;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function ArticleView({
  article,
  onBack,
  onNavigate,
}: ArticleViewProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleFeedback = (vote: 'up' | 'down') => {
    setFeedback((prev) => (prev === vote ? null : vote));
  };

  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Check for headings
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h3
            key={index}
            className="font-semibold text-foreground text-lg mt-6 mb-3"
          >
            {paragraph.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      // Check for numbered lists
      if (/^\d+\./.test(paragraph)) {
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 my-4 pl-4">
            {paragraph.split('\n').map((item, i) => (
              <li key={i} className="text-muted-foreground leading-relaxed">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      
      // Check for bulleted lists
      if (paragraph.startsWith('- ')) {
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 pl-4">
            {paragraph.split('\n').map((item, i) => (
              <li key={i} className="text-muted-foreground leading-relaxed">
                {item.replace(/^- \s*/, '')}
              </li>
            ))}
          </ul>
        );
      }

      // Check for bold text within a paragraph
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);

      return (
        <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-medium text-foreground">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {article.title}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Last updated:{' '}
                  {new Date(article.lastUpdated).toLocaleDateString()}
                </p>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {renderContent(article.content)}
                </div>

                <Separator className="my-8" />

                <div className="text-center">
                  <h4 className="font-medium mb-4">Was this article helpful?</h4>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={feedback === 'up' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFeedback('up')}
                      className="gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Yes ({article.helpful + (feedback === 'up' ? 1 : 0)})
                    </Button>
                    <Button
                      variant={feedback === 'down' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleFeedback('down')}
                      className="gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No ({article.notHelpful + (feedback === 'down' ? 1 : 0)})
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Still need help?{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => onNavigate('support')}
                    >
                      Contact our support team
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
