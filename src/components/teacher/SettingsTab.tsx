import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';
import { loadDB, saveDB, createDemoData } from '@/lib/db';
import { toast } from 'sonner';

interface SettingsTabProps {
  classId: string;
  onRefresh: () => void;
  onDelete: () => void;
}

export default function SettingsTab({ classId, onRefresh, onDelete }: SettingsTabProps) {
  const db = loadDB();
  const classData = db.classes.find(c => c.id === classId);
  const [className, setClassName] = useState(classData?.name || '');
  const [classSection, setClassSection] = useState(classData?.section || '');

  const handleUpdateClass = () => {
    const db = loadDB();
    const cls = db.classes.find(c => c.id === classId);
    if (cls) {
      cls.name = className;
      cls.section = classSection;
      saveDB(db);
      onRefresh();
      toast.success('Class updated');
    }
  };

  const handleExport = () => {
    const db = loadDB();
    const dataStr = JSON.stringify(db, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gradebook-backup-${Date.now()}.json`;
    link.click();
    toast.success('Data exported');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        localStorage.setItem('gradebook_db', JSON.stringify(data));
        onRefresh();
        toast.success('Data imported successfully');
      } catch (error) {
        toast.error('Failed to import data');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const demoData = createDemoData();
    saveDB(demoData);
    onRefresh();
    toast.success('Data reset to demo');
  };

  const handleDeleteClass = () => {
    const db = loadDB();
    db.classes = db.classes.filter(c => c.id !== classId);
    db.enrollments = db.enrollments.filter(e => e.classId !== classId);
    db.categories = db.categories.filter(c => c.classId !== classId);
    const assignmentIds = db.assignments.filter(a => a.classId === classId).map(a => a.id);
    db.assignments = db.assignments.filter(a => a.classId !== classId);
    db.grades = db.grades.filter(g => !assignmentIds.includes(g.assignmentId));
    db.attendance = db.attendance.filter(a => a.classId !== classId);
    db.studyMaterials = db.studyMaterials.filter(m => m.classId !== classId);
    saveDB(db);
    toast.success('Class deleted');
    onDelete();
  };

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Update class name and section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-section">Section</Label>
            <Input
              id="class-section"
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateClass}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or reset your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
          <div>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button asChild variant="outline" className="w-full">
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </label>
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Demo Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to Demo Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace all your data with demo data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this class</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Class
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this class and all associated data including students, assignments, grades, and attendance records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Class
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
