import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { loadDB, saveDB, generateId, Attendance } from '@/lib/db';
import { toast } from 'sonner';

interface AttendanceTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function AttendanceTab({ classId, onRefresh }: AttendanceTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const db = loadDB();
  const enrollments = db.enrollments.filter(e => e.classId === classId);
  const students = enrollments.map(enr => {
    const student = db.profiles.find(p => p.id === enr.studentId);
    const attendance = db.attendance.find(
      a => a.classId === classId && a.studentId === enr.studentId && a.date === selectedDate
    );
    return {
      ...student,
      status: attendance?.status || 'present',
    };
  });

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const db = loadDB();
    const existing = db.attendance.find(
      a => a.classId === classId && a.studentId === studentId && a.date === selectedDate
    );

    if (existing) {
      existing.status = status;
    } else {
      const newAttendance: Attendance = {
        id: generateId('att'),
        classId,
        studentId,
        date: selectedDate,
        status,
      };
      db.attendance.push(newAttendance);
    }

    saveDB(db);
    onRefresh();
    toast.success('Attendance updated');
  };

  const getAttendanceSummary = (studentId: string) => {
    const records = db.attendance.filter(a => a.classId === classId && a.studentId === studentId);
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    return { present, absent, late, total: records.length };
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Present</TableHead>
              <TableHead className="text-right">Absent</TableHead>
              <TableHead className="text-right">Late</TableHead>
              <TableHead className="text-right">Total Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(student => {
              const summary = getAttendanceSummary(student.id!);
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student?.name}</TableCell>
                  <TableCell>
                    <Select
                      value={student.status}
                      onValueChange={(value: 'present' | 'absent' | 'late') => 
                        handleAttendanceChange(student.id!, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">{summary.present}</TableCell>
                  <TableCell className="text-right">{summary.absent}</TableCell>
                  <TableCell className="text-right">{summary.late}</TableCell>
                  <TableCell className="text-right">{summary.total}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
