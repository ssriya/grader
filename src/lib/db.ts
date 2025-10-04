// localStorage-based database for gradebook

export interface Profile {
  id: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  name: string;
}

export interface Class {
  id: string;
  teacherId: string;
  name: string;
  section: string;
}

export interface Enrollment {
  id: string;
  classId: string;
  studentId: string;
}

export interface Category {
  id: string;
  classId: string;
  name: string;
  weight: number;
}

export interface Assignment {
  id: string;
  classId: string;
  categoryId: string;
  title: string;
  points: number;
  dueDate: string;
}

export interface Grade {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number | null;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface StudyMaterial {
  id: string;
  classId: string;
  title: string;
  description: string;
  url: string;
  uploadDate: string;
}

export interface Session {
  userId: string | null;
}

export interface Database {
  profiles: Profile[];
  classes: Class[];
  enrollments: Enrollment[];
  categories: Category[];
  assignments: Assignment[];
  grades: Grade[];
  attendance: Attendance[];
  studyMaterials: StudyMaterial[];
  session: Session;
}

const DB_KEY = 'gradebook_db';

export function loadDB(): Database {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return createDemoData();
}

export function saveDB(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function createDemoData(): Database {
  const teacherId = 'teacher-1';
  const studentIds = ['student-1', 'student-2', 'student-3', 'student-4'];
  const classIds = ['class-1', 'class-2'];

  return {
    profiles: [
      { id: teacherId, email: 'teacher@demo', password: 'demo', role: 'teacher', name: 'Ms. Johnson' },
      { id: studentIds[0], email: 'student@demo', password: 'demo', role: 'student', name: 'Alice Smith' },
      { id: studentIds[1], email: 'bob@demo', password: 'demo', role: 'student', name: 'Bob Wilson' },
      { id: studentIds[2], email: 'carol@demo', password: 'demo', role: 'student', name: 'Carol Davis' },
      { id: studentIds[3], email: 'david@demo', password: 'demo', role: 'student', name: 'David Brown' },
    ],
    classes: [
      { id: classIds[0], teacherId, name: 'Algebra I', section: 'Period 1' },
      { id: classIds[1], teacherId, name: 'Biology', section: 'Period 3' },
    ],
    enrollments: [
      { id: 'enr-1', classId: classIds[0], studentId: studentIds[0] },
      { id: 'enr-2', classId: classIds[0], studentId: studentIds[1] },
      { id: 'enr-3', classId: classIds[1], studentId: studentIds[0] },
      { id: 'enr-4', classId: classIds[1], studentId: studentIds[2] },
      { id: 'enr-5', classId: classIds[1], studentId: studentIds[3] },
    ],
    categories: [
      { id: 'cat-1', classId: classIds[0], name: 'Homework', weight: 0.3 },
      { id: 'cat-2', classId: classIds[0], name: 'Tests', weight: 0.5 },
      { id: 'cat-3', classId: classIds[0], name: 'Participation', weight: 0.2 },
      { id: 'cat-4', classId: classIds[1], name: 'Labs', weight: 0.4 },
      { id: 'cat-5', classId: classIds[1], name: 'Exams', weight: 0.6 },
    ],
    assignments: [
      { id: 'asg-1', classId: classIds[0], categoryId: 'cat-1', title: 'HW 1', points: 10, dueDate: '2025-01-15' },
      { id: 'asg-2', classId: classIds[0], categoryId: 'cat-2', title: 'Test 1', points: 100, dueDate: '2025-01-20' },
      { id: 'asg-3', classId: classIds[1], categoryId: 'cat-4', title: 'Lab 1', points: 50, dueDate: '2025-01-18' },
    ],
    grades: [
      { id: 'gr-1', assignmentId: 'asg-1', studentId: studentIds[0], score: 9 },
      { id: 'gr-2', assignmentId: 'asg-1', studentId: studentIds[1], score: 8 },
      { id: 'gr-3', assignmentId: 'asg-2', studentId: studentIds[0], score: 92 },
      { id: 'gr-4', assignmentId: 'asg-2', studentId: studentIds[1], score: 85 },
      { id: 'gr-5', assignmentId: 'asg-3', studentId: studentIds[0], score: 45 },
      { id: 'gr-6', assignmentId: 'asg-3', studentId: studentIds[2], score: 48 },
    ],
    attendance: [],
    studyMaterials: [
      { id: 'sm-1', classId: classIds[0], title: 'Chapter 1 Notes', description: 'Introduction to Linear Equations', url: '#', uploadDate: '2025-01-10' },
      { id: 'sm-2', classId: classIds[1], title: 'Cell Structure Guide', description: 'Comprehensive guide to cell biology', url: '#', uploadDate: '2025-01-12' },
    ],
    session: { userId: null },
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
