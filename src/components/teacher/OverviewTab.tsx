import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar } from 'lucide-react';
import { loadDB } from '@/lib/db';
import { getClassAverage, getLetterGrade } from '@/lib/grading';

interface OverviewTabProps {
  classId: string;
  onRefresh: () => void;
}

export default function OverviewTab({ classId }: OverviewTabProps) {
  const db = loadDB();
  const studentCount = db.enrollments.filter(e => e.classId === classId).length;
  const assignmentCount = db.assignments.filter(a => a.classId === classId).length;
  const average = getClassAverage(classId, db);

  return (
    <div className="space-y-6 mt-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{studentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assignmentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Class Average</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {average !== null 
                ? `${average.toFixed(1)}% (${getLetterGrade(average)})`
                : '-'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the tabs above to manage students, assignments, gradebook, attendance, study materials, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
