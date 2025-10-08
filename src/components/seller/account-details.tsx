
'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function AccountDetails() {
  const { user } = useUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>Your seller account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Account Email</Label>
            <Input id="email" readOnly value={user?.email || ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Account Phone</Label>
             <div className="flex items-center gap-2">
              <Input className="w-16" readOnly value="+234" />
              <Input id="phone" readOnly value={user?.phoneNumber || '9030049952'} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country of Registration</Label>
            <Input id="country" readOnly value="Nigeria" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Input id="accountType" readOnly value="Individual" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
