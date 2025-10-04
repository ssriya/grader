import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loadDB, saveDB } from '@/lib/db';
import { getStudentGrade, getLetterGrade } from '@/lib/grading';
import { GraduationCap, LogOut, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);

  useEffect(() => {
    const db = loadDB();
    if (!db.session.userId) {
      navigate('/');
      return;
    }
    const student = db.profiles.find(p => p.id === db.session.userId);
    if (student?.role !== 'student') {
      navigate('/');
      return;
    }
    setStudentName(student.name);

    const enrollments = db.enrollments.filter(e => e.studentId === db.session.userId);
    const classes = enrollments.map(enr => {
      const cls = db.classes.find(c => c.id === enr.classId);
      const teacher = db.profiles.find(p => p.id === cls?.teacherId);
      const grade = getStudentGrade(db.session.userId!, enr.classId, db);
      return {
        ...cls,
        teacherName: teacher?.name,
        grade,
        letter: getLetterGrade(grade),
      };
    });
    setEnrolledClasses(classes);
  }, [navigate]);

  const handleLogout = () => {
    const db = loadDB();
    db.session.userId = null;
    saveDB(db);
    navigate('/');
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
              <p className="text-sm text-muted-foreground">{studentName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">My Classes</h2>
          <p className="text-muted-foreground">View your grades and assignments</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrolledClasses.map((cls) => (
            <Card 
              key={cls.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/class/${cls.id}/student`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {cls.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{cls.section}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Teacher</span>
                    <span className="text-sm font-medium">{cls.teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Grade</span>
                    <span className="text-lg font-bold text-primary">
                      {cls.grade !== null 
                        ? `${cls.grade.toFixed(1)}% (${cls.letter})`
                        : '-'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {enrolledClasses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No classes enrolled</h3>
            <p className="text-muted-foreground">Contact your teacher to be added to classes</p>
          </div>
        )}
      </main>
    </div>
  );
}
