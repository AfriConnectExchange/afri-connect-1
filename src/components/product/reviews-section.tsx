
'use client';

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No reviews yet for this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 mb-2">
                  <span className="font-medium text-sm sm:text-base">{review.user}</span>
                  {review.verified && (
                    <Badge variant="secondary" className="text-[10px] w-fit">Verified Purchase</Badge>
                  )}
                  <span className="text-xs sm:text-sm text-muted-foreground sm:ml-auto">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
