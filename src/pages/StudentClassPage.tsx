import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, GraduationCap, FileText } from 'lucide-react';
import { loadDB, Class, Assignment, StudyMaterial } from '@/lib/db';
import { getStudentGrade, getLetterGrade, getAssignmentGrade } from '@/lib/grading';
import GradeEstimator from '@/components/GradeEstimator';

export default function StudentClassPage() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<Class | null>(null);
  const [currentGrade, setCurrentGrade] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    const db = loadDB();
    if (!db.session.userId) {
      navigate('/');
      return;
    }
    const cls = db.classes.find(c => c.id === classId);
    if (!cls) {
      navigate('/student');
      return;
    }
    
    const enrolled = db.enrollments.find(e => e.classId === classId && e.studentId === db.session.userId);
    if (!enrolled) {
      navigate('/student');
      return;
    }

    setClassData(cls);
    const teacher = db.profiles.find(p => p.id === cls.teacherId);
    setTeacherName(teacher?.name || '');
    const grade = getStudentGrade(db.session.userId, classId!, db);
    setCurrentGrade(grade);
    setAssignments(db.assignments.filter(a => a.classId === classId));
    setStudyMaterials(db.studyMaterials.filter(m => m.classId === classId));
  }, [classId, navigate]);

  const db = loadDB();
  const studentId = db.session.userId!;

  if (!classData) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student')}>
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
        <Tabs defaultValue="grades" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <div className="flex items-center justify-between">
              <Card className="flex-1 mr-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    {currentGrade !== null 
                      ? `${currentGrade.toFixed(1)}% (${getLetterGrade(currentGrade)})`
                      : 'No grades yet'
                    }
                  </p>
                </CardContent>
              </Card>
              <GradeEstimator currentGrade={currentGrade} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Grade Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Percent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map(asg => {
                      const score = getAssignmentGrade(asg.id, studentId, db);
                      const category = db.categories.find(c => c.id === asg.categoryId);
                      const percent = score !== null ? (score / asg.points) * 100 : null;
                      return (
                        <TableRow key={asg.id}>
                          <TableCell className="font-medium">{asg.title}</TableCell>
                          <TableCell>{category?.name}</TableCell>
                          <TableCell className="text-right">{score ?? '-'}</TableCell>
                          <TableCell className="text-right">{asg.points}</TableCell>
                          <TableCell className="text-right">
                            {percent !== null ? `${percent.toFixed(1)}%` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map(asg => {
                      const category = db.categories.find(c => c.id === asg.categoryId);
                      return (
                        <TableRow key={asg.id}>
                          <TableCell className="font-medium">{asg.title}</TableCell>
                          <TableCell>{category?.name}</TableCell>
                          <TableCell>{asg.points}</TableCell>
                          <TableCell>{asg.dueDate}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Study Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {studyMaterials.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No study materials available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studyMaterials.map(material => (
                      <Card key={material.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{material.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={material.url} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Class Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teacher</span>
                    <span className="font-medium">{teacherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Section</span>
                    <span className="font-medium">{classData.section}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
