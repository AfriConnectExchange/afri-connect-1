'use client';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WriteReviewForm } from './write-review-form';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  created_at: string;
  comment: string;
  verified_purchase: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
  productId: string;
  sellerId: string;
  onReviewSubmit: () => void;
}

export function ReviewsSection({ reviews, productId, sellerId, onReviewSubmit }: ReviewsSectionProps) {
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    const checkPurchaseAndReviewStatus = async () => {
      if (!user || !firestore) return;
      
      try {
        // Check if user has purchased this product
        // This is a simplified check. A real implementation would need more robust logic,
        // potentially querying a dedicated 'orders' collection where buyer_id is indexed.
        const ordersQuery = query(
            collection(firestore, 'orders'), 
            where('buyer_id', '==', user.uid),
        );
        const orderSnapshots = await getDocs(ordersQuery);
        let purchasedOrderId: string | null = null;

        for (const orderDoc of orderSnapshots.docs) {
             const itemsQuery = query(
                collection(firestore, `orders/${orderDoc.id}/order_items`), 
                where('product_id', '==', productId)
            );
            const itemsSnapshot = await getDocs(itemsQuery);
            if (!itemsSnapshot.empty) {
                purchasedOrderId = orderDoc.id;
                break;
            }
        }

        if (!purchasedOrderId) {
            setCanReview(false);
            return;
        }
        
        setOrderId(purchasedOrderId);

        // Check if user has already reviewed this product for this order
        const reviewsQuery = query(
            collection(firestore, 'reviews'),
            where('product_id', '==', productId),
            where('reviewer_id', '==', user.uid),
            where('order_id', '==', purchasedOrderId)
        );
        const reviewSnapshot = await getDocs(reviewsQuery);
        
        if (!reviewSnapshot.empty) {
            setHasReviewed(true);
        } else {
            setCanReview(true);
        }

      } catch(error) {
        console.error("Error checking review status:", error);
      }
    };
    checkPurchaseAndReviewStatus();
  }, [productId, user, firestore]);


  return (
    <div className="space-y-6">
      {canReview && !hasReviewed && orderId && (
        <WriteReviewForm 
            productId={productId} 
            orderId={orderId}
            sellerId={sellerId}
            onReviewSubmitted={() => {
                setHasReviewed(true);
                onReviewSubmit(); // This will re-fetch product data
            }}
        />
      )}
      {hasReviewed && (
          <div className="bg-green-50 text-green-700 text-sm p-4 rounded-md border border-green-200">
              You've already reviewed this product. Thank you for your feedback!
          </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No reviews yet for this product.</p>
        </div>
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{review.reviewer_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-1 mb-2">
                    <div className='flex items-center gap-2'>
                      <span className="font-medium text-sm">{review.reviewer_name}</span>
                      {review.verified_purchase && (
                        <Badge variant="secondary" className="text-[10px]">Verified Purchase</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
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
                  <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
