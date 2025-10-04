'use client';
import { useState } from 'react';
import { Mail, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const VendorCenterLogo = () => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-2xl">VC</span>
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-800">AfriConnect</h1>
            <p className="text-sm text-orange-500 font-semibold">Vendor Center</p>
        </div>
    </div>
)

export default function SellerAuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The layout effect will handle redirection to dashboard
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <VendorCenterLogo />
                    <p className="text-gray-600 mb-8 mt-4">Welcome back! Please sign in to manage your shop.</p>
                    
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                             <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <AnimatedButton
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            isLoading={isLoading}
                        >
                            <Briefcase />
                            Sign in to Vendor Center
                        </AnimatedButton>
                    </form>
                    
                    <div className="text-center mt-4">
                         <a href="#" className="text-sm text-orange-500 hover:underline">Forgot password?</a>
                    </div>
                </div>
                
                <div className="hidden md:flex items-center justify-center bg-orange-50 p-8 relative">
                     <Image 
                        src="https://picsum.photos/seed/seller-login/600/600" 
                        alt="E-commerce illustration"
                        data-ai-hint="ecommerce logistics"
                        width={400}
                        height={400}
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
