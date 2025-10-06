
'use client';

import { Star, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SellerInfoCardProps {
  sellerDetails: {
    name: string;
    avatar: string;
    location: string;
    verified: boolean;
    rating?: number;
    totalSales?: number;
    memberSince: string;
  };
}

export function SellerInfoCard({ sellerDetails }: SellerInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Seller Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={sellerDetails.avatar} />
            <AvatarFallback>{sellerDetails.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{sellerDetails.name}</span>
              {sellerDetails.verified && (
                <Badge variant="secondary" className="text-[10px]">Verified</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{sellerDetails.location}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Rating</span>
              <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{sellerDetails.rating ?? '—'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sales</span>
            <span>{sellerDetails.totalSales ?? '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Joined</span>
            <span>{sellerDetails.memberSince}</span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Seller
        </Button>
      </CardContent>
    </Card>
  );
}
