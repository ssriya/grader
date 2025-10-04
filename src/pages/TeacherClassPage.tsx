import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { loadDB, saveDB, Class } from '@/lib/db';
import OverviewTab from '@/components/teacher/OverviewTab';
import StudentsTab from '@/components/teacher/StudentsTab';
import AssignmentsTab from '@/components/teacher/AssignmentsTab';
import GradebookTab from '@/components/teacher/GradebookTab';
import AttendanceTab from '@/components/teacher/AttendanceTab';
import StudyMaterialsTab from '@/components/teacher/StudyMaterialsTab';
import WeightsTab from '@/components/teacher/WeightsTab';
import SettingsTab from '@/components/teacher/SettingsTab';

export default function TeacherClassPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<Class | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const db = loadDB();
    if (!db.session.userId) {
      navigate('/');
      return;
    }
    const cls = db.classes.find(c => c.id === classId);
    if (!cls || cls.teacherId !== db.session.userId) {
      navigate('/teacher');
      return;
    }
    setClassData(cls);
  }, [classId, navigate, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!classData) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{classData.name}</h1>
                <p className="text-sm text-muted-foreground">{classData.section}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="weights">Weights</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="students">
            <StudentsTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="gradebook">
            <GradebookTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="materials">
            <StudyMaterialsTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="weights">
            <WeightsTab classId={classId!} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab classId={classId!} onRefresh={handleRefresh} onDelete={() => navigate('/teacher')} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
