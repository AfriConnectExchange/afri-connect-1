
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
// NOTE: generate-categories-flow is a server-only AI flow. Do NOT import it into a client component.
// Call the server API endpoint below instead: /api/admin/categories/generate
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  description?: string;
  productCount: number;
  parentId?: string | null;
}

interface AISuggestion {
  name: string;
  subcategories: { name: string }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
  
  useEffect(() => {
    if (isAIOpen && aiSuggestions.length === 0) {
        handleGenerateCategories();
    }
  }, [isAIOpen]);

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

  const handleGenerateCategories = async () => {
    setIsGenerating(true);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/admin/categories/generate');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate categories');
      }
      const result = await res.json();
      setAiSuggestions(result.categories || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'AI Generation Failed', description: error.message });
    }
    setIsGenerating(false);
  };

  const handleSaveSuggestion = async (suggestion: AISuggestion) => {
    try {
      // Save parent category
      const parentRes = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: suggestion.name, description: `AI generated category` }),
      });
      if (!parentRes.ok) throw new Error(`Failed to save category: ${suggestion.name}`);
      const parentData = await parentRes.json();
      
      // Save subcategories
      for (const sub of suggestion.subcategories) {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: sub.name, parentId: parentData.id }),
        });
      }
      toast({ title: 'Success', description: `Category "${suggestion.name}" and its subcategories have been saved.` });
      fetchCategories();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error Saving Suggestion', description: err.message });
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAIOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
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
            <div className="text-center text-muted-foreground py-8">No categories found.</div>
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
      
      {/* AI Generation Modal */}
      <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>AI Generated Categories</DialogTitle>
            <DialogDescription>Review the categories suggested by AI and save them to your marketplace.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] border rounded-md p-4 mt-4">
            {isGenerating && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}
            {!isGenerating && aiSuggestions.length === 0 && <p className="text-center text-muted-foreground">No suggestions available. Try generating again.</p>}
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row justify-between items-center p-4">
                    <CardTitle className="text-base">{suggestion.name}</CardTitle>
                    <Button size="sm" onClick={() => handleSaveSuggestion(suggestion)}>Save</Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground mb-2">Sub-categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.subcategories.map((sub, i) => (
                        <Badge key={i} variant="secondary">{sub.name}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
           <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAIOpen(false)}>Close</Button>
            <Button onClick={handleGenerateCategories} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="animate-spin" /> : 'Regenerate'}
            </Button>
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
