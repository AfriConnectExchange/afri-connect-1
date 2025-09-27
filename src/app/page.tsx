import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Shuffle,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Home() {
  const marketplaceItems = PlaceHolderImages.slice(0, 4);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                  Barter, Trade, and Connect Across Africa
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  AfriConnect Exchange is your secure platform for cashless
                  transactions. Discover a new way to trade goods and services
                  with a trusted community.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="#">Explore Marketplace</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#">Create an Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
              Why Choose AfriConnect?
            </h2>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center p-6">
                <Shuffle className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Seamless Bartering</h3>
                <p className="mt-2 text-muted-foreground">
                  Easily propose and accept trades for goods and services
                  without the need for cash.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Secure Escrow</h3>
                <p className="mt-2 text-muted-foreground">
                  Our built-in escrow system protects both parties, ensuring
                  fair and secure transactions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <Store className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Vibrant Marketplace</h3>
                <p className="mt-2 text-muted-foreground">
                  Browse a diverse marketplace of items and services offered by
                  our growing community.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
              How It Works
            </h2>
            <div className="relative max-w-5xl mx-auto mt-12">
               <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-border hidden md:block" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-4 text-center md:text-left md:pr-12">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">1</div>
                    <h3 className="text-2xl font-bold">Create Profile</h3>
                  </div>
                  <p className="text-muted-foreground">Sign up and build your trading profile in minutes.</p>
                </div>
                <div></div>
                <div></div>
                <div className="space-y-4 text-center md:text-left md:pl-12">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">2</div>
                    <h3 className="text-2xl font-bold">List Items</h3>
                  </div>
                  <p className="text-muted-foreground">Post what you want to trade, from goods to services.</p>
                </div>
                <div className="space-y-4 text-center md:text-left md:pr-12">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">3</div>
                    <h3 className="text-2xl font-bold">Find a Match</h3>
                  </div>
                  <p className="text-muted-foreground">Browse the marketplace and propose a secure trade.</p>
                </div>
                <div></div>
                <div></div>
                <div className="space-y-4 text-center md:text-left md:pl-12">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">4</div>
                    <h3 className="text-2xl font-bold">Trade Securely</h3>
                  </div>
                  <p className="text-muted-foreground">Use our escrow service to complete your trade with confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="marketplace-preview" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">
              Hot on the Marketplace
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketplaceItems.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={item.imageHint}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">
                      {item.description}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Wants to trade for: Art Supplies
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      View Item
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild>
                <Link href="#">View All Items</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Join the Future of Trade in Africa
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Ready to start trading? Create your free account today and
                unlock a world of possibilities.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button type="submit" size="lg" className="w-full">
                Sign Up for Free
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
