'use client';
import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ConfirmationModal,
} from '@/components/ui/confirmation-modal';
import Image from 'next/image';
import type { Product } from '@/app/marketplace/page';
import type { CartItem } from '@/context/cart-context';

// --- INTERFACES ---
interface CartPageProps {
  cartItems: CartItem[];
  subtotal: number;
  onNavigate: (page: string) => void;
  onUpdateCart: (items: CartItem[]) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

// --- MAIN COMPONENT ---
export function CartPageComponent({
  cartItems,
  subtotal,
  onNavigate,
  onUpdateCart,
  updateQuantity,
  removeFromCart,
  clearCart
}: CartPageProps) {
  // --- STATE AND LOGIC ---
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
  }>({
    isOpen: false,
    itemId: '',
    itemName: '',
  });
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => `£${price.toFixed(2)}`;

  const handleRemoveItem = (itemId: string, itemName: string) => {
    setShowRemoveConfirm({ isOpen: true, itemId, itemName });
  };

  const confirmRemoveItem = () => {
    removeFromCart(showRemoveConfirm.itemId);
    setShowRemoveConfirm({ isOpen: false, itemId: '', itemName: '' });
  };

  const handleClearCart = () => {
    setShowClearCartConfirm(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearCartConfirm(false);
  };

  const applyPromoCode = () => {
    setPromoError('');
    const validCodes = {
      WELCOME10: 0.1,
      AFRICONNECT15: 0.15,
      FIRSTBUY20: 0.2,
    };
    if (validCodes[promoCode.toUpperCase() as keyof typeof validCodes]) {
      setPromoDiscount(validCodes[promoCode.toUpperCase() as keyof typeof validCodes]);
    } else if (promoCode.trim()) {
      setPromoError('Invalid promo code');
    }
  };

  const calculateShipping = () => {
     // For simplicity, using a flat rate. This can be complex logic.
    const baseShipping = 5.99;
    const shippingMultiplier =
      selectedShipping === 'express'
        ? 1.5
        : selectedShipping === 'overnight'
        ? 2.5
        : 1;
    return baseShipping * shippingMultiplier;
  };

  const calculateDiscount = () => subtotal * promoDiscount;

  const calculateTotal = () =>
    subtotal + calculateShipping() - calculateDiscount();

  const getSellerName = (seller: any) => {
    if (!seller) return 'Unknown Seller';
    if (typeof seller === 'string') return seller;
    if (typeof seller === 'object')
      return seller.name || seller.username || 'Unknown Seller';
    return String(seller);
  };

  const handleProceedToCheckout = () => {
    if (!agreeToTerms) {
      alert('Please accept the terms and conditions to proceed');
      return;
    }
    if (cartItems.some((item) => item.stockCount < item.quantity)) {
      alert(
        'Some items in your cart are out of stock. Please remove them to continue.'
      );
      return;
    }
    setShowCheckoutConfirm(true);
  };

  const confirmProceedToCheckout = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowCheckoutConfirm(false);
    setIsProcessing(false);
    onNavigate('checkout');
  };

  const QuantityStepper = ({ item }: { item: CartItem }) => (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-r-none"
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
      >
        <Minus className="w-3 h-3" />
      </Button>
      <div className="w-10 h-7 text-center border-y flex items-center justify-center text-sm font-medium">
        {item.quantity}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-l-none"
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );

  const StickyMobileFooter = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-10 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-xl font-bold">{formatPrice(calculateTotal())}</span>
      </div>
      <Button
        className="w-full font-semibold"
        size="lg"
        onClick={handleProceedToCheckout}
        disabled={!agreeToTerms || cartItems.some((item) => item.stockCount < item.quantity)}
      >
        Proceed to Checkout
      </Button>
    </div>
  );

  // Empty Cart View
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('marketplace')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <h1 className="text-xl font-bold">Shopping Cart</h1>
          </div>
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button
                onClick={() => onNavigate('marketplace')}
                className="w-full"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Cart View
  return (
    <>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6 pb-28 lg:pb-6">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('marketplace')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <h1 className="text-xl font-bold">Shopping Cart</h1>
            <Badge variant="secondary">{cartItems.length} items</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Cart Items
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </Button>
                </CardHeader>
                <CardContent className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium line-clamp-2 pr-2">
                                {item.name}
                              </h4>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {formatPrice(item.price)}
                                </div>
                                {item.originalPrice && (
                                  <div className="text-xs text-muted-foreground line-through">
                                    {formatPrice(item.originalPrice)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Sold by {getSellerName(item.seller)}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {item.category}
                            </Badge>
                             {item.stockCount < item.quantity && (
                                <p className="text-xs text-destructive font-semibold mt-1">Out of Stock</p>
                            )}
                          </div>

                          <div className="flex items-end justify-between mt-2">
                            <QuantityStepper item={item} />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              className="text-muted-foreground hover:text-destructive h-7 w-7"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(calculateShipping())}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount ({promoDiscount * 100}%)</span>
                      <span>- {formatPrice(calculateDiscount())}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                  <Separator />
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  {promoError && (
                    <Alert variant="destructive">
                      <AlertDescription>{promoError}</AlertDescription>
                    </Alert>
                  )}
                  <Button className="w-full mt-2" onClick={applyPromoCode}>
                    Apply Code
                  </Button>
                  <Separator />

                  <Select onValueChange={setSelectedShipping} defaultValue={selectedShipping}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select shipping option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard Shipping
                      </SelectItem>
                      <SelectItem value="express">
                        Express Shipping (+50%)
                      </SelectItem>
                      <SelectItem value="overnight">
                        Overnight Shipping (+150%)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(Boolean(checked))}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{' '}
                      <a href="#" className="underline underline-offset-2">
                        terms and conditions
                      </a>
                    </Label>
                  </div>

                  <Button
                    className="w-full font-semibold hidden lg:block"
                    size="lg"
                    onClick={handleProceedToCheckout}
                    disabled={
                      !agreeToTerms || cartItems.some((item) => item.stockCount < item.quantity)
                    }
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <StickyMobileFooter />

      <ConfirmationModal
        isOpen={showRemoveConfirm.isOpen}
        onClose={() =>
          setShowRemoveConfirm({ isOpen: false, itemId: '', itemName: '' })
        }
        title="Remove Item"
        description={`Are you sure you want to remove "${showRemoveConfirm.itemName}" from your cart?`}
        onConfirm={confirmRemoveItem}
        type="destructive"
      />

      <ConfirmationModal
        isOpen={showClearCartConfirm}
        onClose={() => setShowClearCartConfirm(false)}
        title="Clear Cart"
        description="Are you sure you want to remove all items from your cart?"
        onConfirm={confirmClearCart}
        type="destructive"

      />

      <ConfirmationModal
        isOpen={showCheckoutConfirm}
        onClose={() => setShowCheckoutConfirm(false)}
        title="Proceed to Checkout?"
        description="Are you sure you want to proceed to checkout?"
        onConfirm={confirmProceedToCheckout}
        isLoading={isProcessing}
      />
    </>
  );
}
