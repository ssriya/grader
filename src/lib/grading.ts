import { Database, Assignment, Grade, Category } from './db';

export function getStudentGrade(studentId: string, classId: string, db: Database): number | null {
  const assignments = db.assignments.filter(a => a.classId === classId);
  const categories = db.categories.filter(c => c.classId === classId);
  
  if (assignments.length === 0) return null;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  categories.forEach(cat => {
    const catAssignments = assignments.filter(a => a.categoryId === cat.id);
    if (catAssignments.length === 0) return;

    let earnedPoints = 0;
    let possiblePoints = 0;

    catAssignments.forEach(asg => {
      const grade = db.grades.find(g => g.assignmentId === asg.id && g.studentId === studentId);
      if (grade?.score !== null && grade?.score !== undefined) {
        earnedPoints += grade.score;
        possiblePoints += asg.points;
      }
    });

    if (possiblePoints > 0) {
      const catPercent = (earnedPoints / possiblePoints);
      totalWeightedScore += catPercent * cat.weight;
      totalWeight += cat.weight;
    }
  });

  if (totalWeight === 0) return null;
  return (totalWeightedScore / totalWeight) * 100;
}

export function getLetterGrade(percent: number | null): string {
  if (percent === null) return '-';
  if (percent >= 90) return 'A';
  if (percent >= 80) return 'B';
  if (percent >= 70) return 'C';
  if (percent >= 60) return 'D';
  return 'F';
}

export function getClassAverage(classId: string, db: Database): number | null {
  const enrollments = db.enrollments.filter(e => e.classId === classId);
  if (enrollments.length === 0) return null;

  const grades = enrollments
    .map(e => getStudentGrade(e.studentId, classId, db))
    .filter(g => g !== null) as number[];

  if (grades.length === 0) return null;
  return grades.reduce((sum, g) => sum + g, 0) / grades.length;
}

export function getAssignmentGrade(assignmentId: string, studentId: string, db: Database): number | null {
  const grade = db.grades.find(g => g.assignmentId === assignmentId && g.studentId === studentId);
  return grade?.score ?? null;
}
