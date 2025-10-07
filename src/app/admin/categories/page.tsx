
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Sparkles, DatabaseZap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
  parentId?: string | null;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.categories);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!currentCategory || !currentCategory.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name is required.' });
      return;
    }

    const url = currentCategory.id ? `/api/admin/categories/${currentCategory.id}` : '/api/admin/categories';
    const method = currentCategory.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCategory),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      toast({ title: 'Success', description: `Category ${currentCategory.id ? 'updated' : 'created'}.` });
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      toast({ title: 'Success', description: 'Category deleted.' });
      setIsConfirmOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleSeedCategories = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-categories', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to seed categories');
      }
      toast({ title: 'Success', description: `${result.count} categories have been seeded into the database.` });
      fetchCategories();
    } catch (err: any) {
       toast({ variant: 'destructive', title: 'Seeding Failed', description: err.message });
    } finally {
        setIsSeeding(false);
    }
  }


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeedCategories} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
            Seed Initial Categories
          </Button>
          <Button onClick={() => { setCurrentCategory({ name: '', description: '' }); setIsModalOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>View, edit, or delete product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Loader2 className="animate-spin" /> : categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No categories found. Use the seed button to add initial categories.</div>
          ) : (
            <div className="divide-y">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.productCount} products</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentCategory(cat); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { setCategoryToDelete(cat); setIsConfirmOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Category Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? 'Edit' : 'Add'} Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input id="cat-name" value={currentCategory?.name || ''} onChange={(e) => setCurrentCategory(prev => ({...prev, name: e.target.value}))} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <Input id="cat-desc" value={currentCategory?.description || ''} onChange={(e) => setCurrentCategory(prev => ({...prev, description: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {categoryToDelete && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title={`Delete "${categoryToDelete.name}"?`}
          description="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          type="destructive"
          icon={<AlertCircle className="w-6 h-6 text-destructive" />}
        />
      )}
    </div>
  );
}
