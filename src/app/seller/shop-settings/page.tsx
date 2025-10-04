
'use client';
import { AccountDetails } from '@/components/seller/account-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ShopSettingsPage() {
  return (
    <div className="space-y-6">
      <AccountDetails />
      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
          <CardDescription>
            Manage your shop on AfriConnect from below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Shop details management form will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
