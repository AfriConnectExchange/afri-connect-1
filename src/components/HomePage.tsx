'use client';
import { ArrowRight, Star, Shield, Truck, Users, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface HomePageProps {
  onNavigate: (page: string, productId?: number) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const featuredProducts = [
    {
      id: 1,
      name: "Traditional Kente Cloth",
      price: "£45.00",
      rating: 4.8,
      reviews: 124,
      seller: "Accra Crafts",
      image: "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 2,
      name: "Handcrafted Wooden Sculpture",
      price: "£28.50",
      rating: 4.9,
      reviews: 89,
      seller: "Lagos Artisans",
      image: "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwY3JhZnRzJTIwaGFuZG1hZGUlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NTgxMjE0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 3,
      name: "African Print Dress",
      price: "£15.20",
      rating: 4.7,
      reviews: 156,
      seller: "Ankara Fashion",
      image: "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 4,
      name: "Organic Shea Butter",
      price: "£8.50",
      rating: 4.6,
      reviews: 203,
      seller: "Natural Beauty Co",
      image: "https://images.unsplash.com/photo-1692689383138-c2df3476072c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0cGxhY2UlMjBjb2xvcmZ1bCUyMHByb2R1Y3RzfGVufDF8fHx8MTc1ODEyMTQ3NXww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const featuredCourses = [
    {
      id: 1,
      title: "Digital Marketing for African Businesses",
      instructor: "Adaora Okafor",
      price: "₦25,000",
      rating: 4.9,
      students: 1240,
      duration: "8 weeks"
    },
    {
      id: 2,
      title: "Traditional Craft Business Setup",
      instructor: "Kwame Asante",
      price: "₦18,000",
      rating: 4.8,
      students: 856,
      duration: "6 weeks"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Connect, Trade & Thrive Across Africa
              </h1>
              <p className="mb-6 md:mb-8 text-base md:text-lg opacity-90 leading-relaxed">
                Your trusted marketplace for authentic African products, skills training, 
                and seamless money transfers. Built by Africans, for Africa.
              </p>
              <div className="flex flex-row gap-3 md:gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => onNavigate('marketplace')}
                  className="text-primary flex-1"
                >
                  Explore
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground bg-primary/80 hover:bg-primary-foreground hover:text-primary transition-colors duration-200 flex-1"
                  onClick={() => onNavigate('auth')}
                >
                  Sell
                </Button>
              </div>
            </motion.div>
            <motion.div 
              className="relative order-first lg:order-last"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1655720357872-ce227e4164ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbnRyZXByZW5ldXIlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTgxMjE0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="African entrepreneur"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl w-full h-auto max-h-[400px] object-cover"
              />
              {/* Video play button overlay for demo */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-primary shadow-lg"
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="text-sm md:text-base mb-2">Secure Escrow</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Your money is protected until you receive your order
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Users className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="text-sm md:text-base mb-2">Verified Sellers</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                All sellers go through KYC verification for your safety
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Truck className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="text-sm md:text-base mb-2">Fast Delivery</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Reliable delivery across all African countries
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Star className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
              <h3 className="text-sm md:text-base mb-2">Quality Assured</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Only authentic, high-quality African products
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Featured Products</h2>
            <Button 
              variant="outline"
              onClick={() => onNavigate('marketplace')}
              size="sm"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => onNavigate('product', product.id)}>
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                        Featured
                      </Badge>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="mb-2 line-clamp-2 text-sm md:text-base font-medium">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs md:text-sm font-medium">{product.rating}</span>
                        <span className="text-xs md:text-sm text-muted-foreground">({product.reviews})</span>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">by {product.seller}</p>
                      <p className="text-base md:text-lg font-semibold text-primary">{product.price}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
            <h2 className="text-xl md:text-2xl font-semibold">Popular Courses</h2>
            <Button 
              variant="outline"
              onClick={() => onNavigate('courses')}
              size="sm"
            >
              View All Courses
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => onNavigate('courses')}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="text-xs">{course.duration}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs md:text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="mb-2 text-sm md:text-base font-medium line-clamp-2">{course.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4">by {course.instructor}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-muted-foreground">{course.students} students</span>
                      <span className="text-base md:text-lg font-semibold text-primary">{course.price}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-xl md:text-2xl lg:text-3xl font-bold">Ready to Join AfriConnect?</h2>
            <p className="mb-6 md:mb-8 text-sm md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              Whether you're looking to buy authentic African products, sell your crafts, 
              or learn new skills, we've got you covered.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onNavigate('auth')}
              className="text-primary"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
