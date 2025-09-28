'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Shield, Handshake, Truck, Download, Share, Home } from 'lucide-react';
import Image from 'next/image';

interface PaymentConfirmationProps {
  paymentData: any;
  orderItems: any[];
  orderTotal: number;
  onNavigate: (page: string) => void;
}

export function PaymentConfirmation({ paymentData, orderItems, orderTotal, onNavigate }: PaymentConfirmationProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusInfo = () => {
    switch (paymentData.paymentMethod) {
      case 'cash_on_delivery':
        return {
          icon: <Truck className="w-8 h-8 text-orange-600" />,
          title: 'Order Confirmed - Cash on Delivery',
          status: 'Cash Pending',
          description: 'Your order has been confirmed. Payment will be collected upon delivery.',
          nextSteps: [
            'Seller will prepare your order',
            'You will receive delivery updates via SMS',
            'Have exact cash amount ready for delivery',
            'Payment will be collected by our delivery partner'
          ]
        };
      case 'online_card':
      case 'online_wallet':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: 'Payment Successful',
          status: 'Paid',
          description: 'Your payment has been processed successfully. Order is being prepared.',
          nextSteps: [
            'Payment confirmation sent to your email',
            'Seller will prepare and ship your order',
            'You will receive tracking information',
            'Delivery expected within 3-5 business days'
          ]
        };
      case 'escrow':
        return {
          icon: <Shield className="w-8 h-8 text-blue-600" />,
          title: 'Payment Secured in Escrow',
          status: 'Escrowed',
          description: 'Your payment is safely held in escrow until delivery is confirmed.',
          nextSteps: [
            'Funds are securely held in escrow account',
            'Seller will prepare and ship your order',
            'Confirm receipt when order arrives',
            'Funds will be released to seller automatically'
          ]
        };
      case 'barter_proposal':
        return {
          icon: <Handshake className="w-8 h-8 text-purple-600" />,
          title: 'Barter Proposal Sent',
          status: 'Pending',
          description: 'Your barter proposal has been sent to the seller for review.',
          nextSteps: [
            'Seller will review your proposal',
            'You will be notified of their response',
            'If accepted, coordinate exchange details',
            'Complete the trade as agreed'
          ]
        };
      default:
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
          title: 'Order Confirmed',
          status: 'Confirmed',
          description: 'Your order has been successfully placed.',
          nextSteps: []
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card>
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            {statusInfo.icon}
          </div>
          <h1 className="text-2xl font-semibold mb-2">{statusInfo.title}</h1>
          <p className="text-muted-foreground mb-4">{statusInfo.description}</p>
          
          <div className="flex justify-center items-center space-x-4 mb-4">
            <Badge 
              variant={paymentData.status === 'Paid' || paymentData.status === 'Escrowed' ? 'default' : 'secondary'}
              className="text-sm py-1 px-3"
            >
              {statusInfo.status}
            </Badge>
            {paymentData.transactionId && (
              <span className="text-sm text-muted-foreground">
                ID: {paymentData.transactionId}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => onNavigate('marketplace')} className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Button>
            <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide Details' : 'View Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Order Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                       <Image src={item.image} alt={item.name} width={48} height={48} className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Payment Summary */}
            <div className="space-y-2">
              <h4 className="font-medium">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Order Total:</span>
                  <span>£{orderTotal.toFixed(2)}</span>
                </div>
                {paymentData.escrowFee && (
                  <div className="flex justify-between">
                    <span>Escrow Protection Fee:</span>
                    <span>£{paymentData.escrowFee.toFixed(2)}</span>
                  </div>
                )}
                {paymentData.totalPaid && (
                  <div className="flex justify-between font-medium">
                    <span>Total Paid:</span>
                    <span>£{paymentData.totalPaid.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Details */}
            {paymentData.paymentDetails &&
                <div className="space-y-2">
                <h4 className="font-medium">Payment Method</h4>
                <div className="text-sm space-y-1">
                        <>
                            {paymentData.paymentDetails.last4 && (
                            <p>Card ending in **** {paymentData.paymentDetails.last4}</p>
                            )}
                            {paymentData.paymentDetails.provider && (
                            <p>Wallet: {paymentData.paymentDetails.provider}</p>
                            )}
                            {paymentData.paymentDetails.escrowId && (
                            <p>Escrow ID: {paymentData.paymentDetails.escrowId}</p>
                            )}
                        </>
                </div>
                </div>
            }


            {/* Delivery Address (for cash on delivery) */}
            {paymentData.deliveryAddress && (
              <div className="space-y-2">
                <h4 className="font-medium">Delivery Address</h4>
                <div className="text-sm">
                  <p>{paymentData.deliveryAddress.street}</p>
                  <p>{paymentData.deliveryAddress.city}, {paymentData.deliveryAddress.postcode}</p>
                  <p>{paymentData.deliveryAddress.phone}</p>
                </div>
              </div>
            )}

            {/* Barter Details */}
            {paymentData.offer && (
              <div className="space-y-2">
                <h4 className="font-medium">Your Barter Offer</h4>
                <div className="text-sm">
                  <p><strong>{paymentData.offer.name}</strong></p>
                  <p>{paymentData.offer.description}</p>
                  <p>Estimated Value: £{paymentData.offer.estimatedValue}</p>
                  <p>Expires: {new Date(paymentData.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>What Happens Next?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {statusInfo.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5 shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm flex-1">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4" />
          <span>Download Receipt</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 flex items-center justify-center space-x-2"
          onClick={() => navigator.share && navigator.share({ title: 'My AfriConnect Order', text: `I just placed an order on AfriConnect! Transaction ID: ${paymentData.transactionId}`})}
        >
          <Share className="w-4 h-4" />
          <span>Share Order</span>
        </Button>
        <Button 
          className="flex-1"
          onClick={() => onNavigate('profile')}
        >
          View Order History
        </Button>
      </div>
    </div>
  );
}
