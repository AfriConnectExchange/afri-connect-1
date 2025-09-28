'use client';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Category } from '@/app/marketplace/page';


interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, selected: boolean) => void;
  onClearFilters: () => void;
  allowMultiple?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onCategoryChange,
  onClearFilters,
  allowMultiple = false,
}: CategoryFilterProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (allowMultiple) {
      const isSelected = selectedCategories.includes(categoryId);
      onCategoryChange(categoryId, !isSelected);
    } else {
      // Single selection mode
      if (selectedCategories.includes(categoryId)) {
        onCategoryChange(categoryId, false);
      } else {
        // Clear all others and select this one
        selectedCategories.forEach((id) => {
          if (id !== categoryId) {
            onCategoryChange(id, false);
          }
        });
        onCategoryChange(categoryId, true);
      }
    }
  };

  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Categories</Label>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          const isAllCategory = category.id === 'all';

          return (
            <div
              key={category.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                isSelected
                  ? 'bg-accent border border-primary/20'
                  : 'hover:bg-accent'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${isSelected ? 'font-medium' : ''}`}
                >
                  {category.name}
                </span>
                {isSelected && !isAllCategory && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                ({category.count.toLocaleString()})
              </span>
            </div>
          );
        })}
      </div>

      {hasActiveFilters && !allowMultiple && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            Filtering by:{' '}
            {selectedCategories
              .map((id) => categories.find((cat) => cat.id === id)?.name)
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
