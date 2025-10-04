import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { loadDB, saveDB, generateId, Assignment } from '@/lib/db';
import { toast } from 'sonner';

interface AssignmentsTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function AssignmentsTab({ classId, onRefresh }: AssignmentsTabProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [points, setPoints] = useState('100');
  const [dueDate, setDueDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const db = loadDB();
  const assignments = db.assignments.filter(a => a.classId === classId);
  const categories = db.categories.filter(c => c.classId === classId);

  const handleAddAssignment = () => {
    if (!title || !categoryId) {
      toast.error('Please fill all required fields');
      return;
    }

    const db = loadDB();
    const newAssignment: Assignment = {
      id: generateId('asg'),
      classId,
      categoryId,
      title,
      points: parseFloat(points),
      dueDate,
    };

    db.assignments.push(newAssignment);
    saveDB(db);
    setTitle('');
    setCategoryId('');
    setPoints('100');
    setDueDate('');
    setIsDialogOpen(false);
    onRefresh();
    toast.success('Assignment added');
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    const db = loadDB();
    db.assignments = db.assignments.filter(a => a.id !== assignmentId);
    db.grades = db.grades.filter(g => g.assignmentId !== assignmentId);
    saveDB(db);
    onRefresh();
    toast.success('Assignment deleted');
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Assignments</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-title">Title</Label>
                <Input
                  id="assignment-title"
                  placeholder="e.g., Homework 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="assignment-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-points">Points</Label>
                <Input
                  id="assignment-points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-due">Due Date</Label>
                <Input
                  id="assignment-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <Button onClick={handleAddAssignment} className="w-full">
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map(asg => {
              const category = categories.find(c => c.id === asg.categoryId);
              return (
                <TableRow key={asg.id}>
                  <TableCell className="font-medium">{asg.title}</TableCell>
                  <TableCell>{category?.name}</TableCell>
                  <TableCell className="text-right">{asg.points}</TableCell>
                  <TableCell>{asg.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteAssignment(asg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
