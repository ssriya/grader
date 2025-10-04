import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { loadDB, saveDB, generateId } from '@/lib/db';
import { getStudentGrade, getLetterGrade } from '@/lib/grading';
import { toast } from 'sonner';

interface GradebookTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function GradebookTab({ classId, onRefresh }: GradebookTabProps) {
  const db = loadDB();
  const enrollments = db.enrollments.filter(e => e.classId === classId);
  const assignments = db.assignments.filter(a => a.classId === classId);
  const students = enrollments.map(enr => {
    const student = db.profiles.find(p => p.id === enr.studentId);
    const grade = getStudentGrade(enr.studentId, classId, db);
    return {
      ...student,
      grade,
      letter: getLetterGrade(grade),
    };
  });

  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    const db = loadDB();
    const score = value === '' ? null : parseFloat(value);
    
    const existingGrade = db.grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
    
    if (existingGrade) {
      existingGrade.score = score;
    } else {
      db.grades.push({
        id: generateId('gr'),
        studentId,
        assignmentId,
        score,
      });
    }
    
    saveDB(db);
    onRefresh();
    toast.success('Grade saved');
  };

  const getGrade = (studentId: string, assignmentId: string): number | null => {
    const grade = db.grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId);
    return grade?.score ?? null;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gradebook</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10">Student</TableHead>
                {assignments.map(asg => (
                  <TableHead key={asg.id} className="text-center min-w-[100px]">
                    {asg.title}<br />
                    <span className="text-xs text-muted-foreground">({asg.points} pts)</span>
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">
                    {student?.name}
                  </TableCell>
                  {assignments.map(asg => {
                    const grade = getGrade(student.id!, asg.id);
                    return (
                      <TableCell key={asg.id} className="text-center">
                        <Input
                          type="number"
                          min="0"
                          max={asg.points}
                          step="0.1"
                          value={grade ?? ''}
                          onChange={(e) => handleGradeChange(student.id!, asg.id, e.target.value)}
                          className="w-20 text-center"
                          placeholder="-"
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-bold text-primary">
                    {student.grade !== null 
                      ? `${student.grade.toFixed(1)}% (${student.letter})`
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
