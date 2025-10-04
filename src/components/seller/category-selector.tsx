
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Industrial & Scientific', sub: ['Abrasive & Finishing', 'Additive Manufacturing', 'Cutting Tools'] },
  { name: 'Electronics', sub: ['Computers & Accessories', 'Headphones', 'Camera & Photo'] },
  { name: 'Home & Kitchen', sub: ['Furniture', 'Bedding', 'Appliances'] },
  { name: 'Fashion', sub: ['Womens', 'Mens', 'Kids'] },
];

interface CategorySelectorProps {
    selectedCategory: string | null;
    onSelectCategory: (category: string) => void;
}

export function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for a category"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {filteredCategories.map(category => (
            <div key={category.name}>
              <button
                className="w-full text-left p-2 rounded-md hover:bg-gray-100 flex justify-between items-center"
                onClick={() => onSelectCategory(category.name)}
              >
                <span>{category.name}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
