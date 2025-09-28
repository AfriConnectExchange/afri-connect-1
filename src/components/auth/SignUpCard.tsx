'use client';
import React from 'react';
import { Mail, Eye, EyeOff, User } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { AnimatedButton } from '../ui/animated-button';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type Props = any;

export default function SignUpCard({
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  handleEmailRegistration,
  handleGoogleLogin,
  onSwitch,
  handlePhoneRegistration
}: Props) {
  return (
    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">AE</span>
          </div>
          <span className="text-2xl font-bold">AfriConnect Exchange</span>
        </div>
        <h1 className="text-xl font-semibold mb-2">Join AfriConnect Exchange</h1>
        <p className="text-sm text-muted-foreground">
          Connect, trade, and thrive
        </p>
      </div>
      <div className="p-8">
        <Button variant="outline" className="w-full mb-6" onClick={handleGoogleLogin} disabled={isLoading}>
            <Image src="/google-logo.svg" alt="Google" width={20} height={20} className="mr-2"/>
            Sign Up with Google
        </Button>
        
        <div className="flex items-center my-6">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">OR SIGN UP WITH</span>
            <Separator className="flex-1" />
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailRegistration();
              }}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                 <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev: any) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev: any) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v: boolean) => !v)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v: boolean) => !v)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      acceptTerms: Boolean(checked),
                    }))
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
              <AnimatedButton
                type="submit"
                size="lg"
                className="w-full mt-6"
                isLoading={isLoading}
                animationType="glow"
              >
                Create Account
              </AnimatedButton>
            </form>
          </TabsContent>
          <TabsContent value="phone">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handlePhoneRegistration();
                }}
                className="space-y-4 pt-4"
            >
                <div className="space-y-2">
                    <Label htmlFor="phone-reg-name">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="phone-reg-name"
                            placeholder="Enter your full name"
                            className="pl-10"
                            value={formData.name}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone-reg">Phone Number</Label>
                    <PhoneInput
                        id="phone-reg"
                        placeholder="Enter phone number"
                        international
                        defaultCountry="GB"
                        value={formData.phone}
                        onChange={(value) => setFormData((prev: any) => ({ ...prev, phone: value }))}
                    />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms-phone"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      acceptTerms: Boolean(checked),
                    }))
                  }
                />
                <Label
                  htmlFor="terms-phone"
                  className="text-sm text-muted-foreground"
                >
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
                <AnimatedButton size="lg" className="w-full" type="submit" isLoading={isLoading}>
                    Send Code
                </AnimatedButton>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm mt-4">
            Already have an account?{' '}
            <button
              onClick={onSwitch}
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
