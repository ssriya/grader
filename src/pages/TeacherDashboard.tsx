import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { loadDB, saveDB, generateId, Class } from '@/lib/db';
import { getClassAverage, getLetterGrade } from '@/lib/grading';
import { GraduationCap, Users, Plus, LogOut, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassSection, setNewClassSection] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const db = loadDB();
    if (!db.session.userId) {
      navigate('/');
      return;
    }
    const teacher = db.profiles.find(p => p.id === db.session.userId);
    if (teacher?.role !== 'teacher') {
      navigate('/');
      return;
    }
    setTeacherName(teacher.name);
    setClasses(db.classes.filter(c => c.teacherId === db.session.userId));
  }, [navigate]);

  const handleLogout = () => {
    const db = loadDB();
    db.session.userId = null;
    saveDB(db);
    navigate('/');
  };

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast.error('Class name is required');
      return;
    }

    const db = loadDB();
    const newClass: Class = {
      id: generateId('class'),
      teacherId: db.session.userId!,
      name: newClassName,
      section: newClassSection,
    };
    
    db.classes.push(newClass);
    saveDB(db);
    setClasses([...classes, newClass]);
    setNewClassName('');
    setNewClassSection('');
    setIsDialogOpen(false);
    toast.success('Class created successfully');
  };

  const getClassStats = (classId: string) => {
    const db = loadDB();
    const studentCount = db.enrollments.filter(e => e.classId === classId).length;
    const avg = getClassAverage(classId, db);
    return { studentCount, average: avg };
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gradebook</h1>
              <p className="text-sm text-muted-foreground">{teacherName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">My Classes</h2>
            <p className="text-muted-foreground">Manage your classes and students</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class-name">Class Name</Label>
                  <Input
                    id="class-name"
                    placeholder="e.g., Algebra I"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-section">Section</Label>
                  <Input
                    id="class-section"
                    placeholder="e.g., Period 1"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateClass} className="w-full">
                  Create Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => {
            const stats = getClassStats(cls.id);
            return (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/class/${cls.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    {cls.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{cls.section}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{stats.studentCount} students</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Class Average</span>
                      <span className="text-lg font-bold text-primary">
                        {stats.average !== null 
                          ? `${stats.average.toFixed(1)}% (${getLetterGrade(stats.average)})`
                          : '-'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-4">Create your first class to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
