'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to your Vendor Center</CardTitle>
                    <CardDescription>
                        This is your central hub for managing your shop. Here you can view orders, manage your products, and track your performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Select an option from the sidebar to get started.</p>
                </CardContent>
            </Card>
        </div>
    )
}
