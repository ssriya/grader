import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, UserMinus } from 'lucide-react';
import { loadDB, saveDB, generateId, Enrollment } from '@/lib/db';
import { getStudentGrade, getLetterGrade } from '@/lib/grading';
import { toast } from 'sonner';

interface StudentsTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function StudentsTab({ classId, onRefresh }: StudentsTabProps) {
  const [studentEmail, setStudentEmail] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const db = loadDB();
  const enrollments = db.enrollments.filter(e => e.classId === classId);
  const students = enrollments.map(enr => {
    const student = db.profiles.find(p => p.id === enr.studentId);
    const grade = getStudentGrade(enr.studentId, classId, db);
    return {
      ...student,
      enrollmentId: enr.id,
      grade,
      letter: getLetterGrade(grade),
    };
  });

  const handleAddStudent = () => {
    const db = loadDB();
    const student = db.profiles.find(p => p.email === studentEmail && p.role === 'student');
    
    if (!student) {
      toast.error('Student not found');
      return;
    }

    const existing = db.enrollments.find(e => e.classId === classId && e.studentId === student.id);
    if (existing) {
      toast.error('Student already enrolled');
      return;
    }

    const newEnrollment: Enrollment = {
      id: generateId('enr'),
      classId,
      studentId: student.id,
    };

    db.enrollments.push(newEnrollment);
    saveDB(db);
    setStudentEmail('');
    setIsAddDialogOpen(false);
    onRefresh();
    toast.success('Student added successfully');
  };

  const handleRemoveStudent = (enrollmentId: string) => {
    const db = loadDB();
    db.enrollments = db.enrollments.filter(e => e.id !== enrollmentId);
    saveDB(db);
    onRefresh();
    toast.success('Student removed from class');
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Students</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student to Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-email">Student Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="student@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Current Grade</TableHead>
              <TableHead className="text-right">Letter</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(student => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student?.name}</TableCell>
                <TableCell>{student?.email}</TableCell>
                <TableCell className="text-right">
                  {student.grade !== null ? `${student.grade.toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">{student.letter}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveStudent(student.enrollmentId)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
