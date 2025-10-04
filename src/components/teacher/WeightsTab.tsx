import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { loadDB, saveDB, generateId, Category } from '@/lib/db';
import { toast } from 'sonner';

interface WeightsTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function WeightsTab({ classId, onRefresh }: WeightsTabProps) {
  const [categoryName, setCategoryName] = useState('');
  const [weight, setWeight] = useState('0.3');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const db = loadDB();
  const categories = db.categories.filter(c => c.classId === classId);
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  const handleAddCategory = () => {
    if (!categoryName) {
      toast.error('Category name is required');
      return;
    }

    const db = loadDB();
    const newCategory: Category = {
      id: generateId('cat'),
      classId,
      name: categoryName,
      weight: parseFloat(weight),
    };

    db.categories.push(newCategory);
    saveDB(db);
    setCategoryName('');
    setWeight('0.3');
    setIsDialogOpen(false);
    onRefresh();
    toast.success('Category added');
  };

  const handleDeleteCategory = (categoryId: string) => {
    const db = loadDB();
    const hasAssignments = db.assignments.some(a => a.categoryId === categoryId);
    
    if (hasAssignments) {
      toast.error('Cannot delete category with existing assignments');
      return;
    }

    db.categories = db.categories.filter(c => c.id !== categoryId);
    saveDB(db);
    onRefresh();
    toast.success('Category deleted');
  };

  const handleWeightChange = (categoryId: string, newWeight: string) => {
    const db = loadDB();
    const category = db.categories.find(c => c.id === categoryId);
    if (category) {
      category.weight = parseFloat(newWeight) || 0;
      saveDB(db);
      onRefresh();
      toast.success('Weight updated');
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Grade Categories & Weights</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Homework"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-weight">Weight (0-1)</Label>
                <Input
                  id="category-weight"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter as decimal (e.g., 0.3 for 30%)
                </p>
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={cat.weight}
                    onChange={(e) => handleWeightChange(cat.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>{(cat.weight * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-bold">Total</TableCell>
              <TableCell className="font-bold">{totalWeight.toFixed(2)}</TableCell>
              <TableCell className="font-bold">
                {(totalWeight * 100).toFixed(0)}%
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
        {Math.abs(totalWeight - 1.0) > 0.01 && (
          <p className="text-sm text-warning mt-4">
            Warning: Total weight should equal 1.00 (100%)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
