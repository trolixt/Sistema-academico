"use client";

import { useEffect, useMemo, useState } from "react";

type AttendanceStatus = "Presente" | "Tardanza" | "Ausente";
type AttendanceRecord = { date: string; status: AttendanceStatus };
type Activity = { name: string; week: number; scores?: Record<string, number>; max: number };
type Course = {
  id: string; name: string; code: string; teacher: string; group: string; room: string;
  days: string[]; start: string; end: string; weeks: number; students: string[];
  attendance: Record<string, AttendanceRecord[]>; activities: Activity[];
  color: string; active: boolean; scheduleActive?: boolean; cycleId?: string;
};
type DirectoryPerson = { id: string; name: string; email: string; detail: string; active: boolean; channelId?: string; phone?: string; document?: string; birthDate?: string; simulationScore?: number };
type AdminCycle = { id: string; name: string; start: string; end: string; weeks: number; active: boolean };
type AdminGroup = { id: string; name: string; level: string; active: boolean };
type AdminSection = "Resumen" | "Estudiantes" | "Docentes" | "Cursos" | "Ciclos" | "Grupos" | "Horarios";
type Role = "Estudiante" | "Docente" | "Administrador";
type Tab = "Información" | "Asistencia" | "Notas";

const channelSubjects = [
  { id: "canal-1", name: "Ciencias de la Salud y Biomédicas", color: "mint", subjects: ["Biología", "Anatomía", "Química", "Razonamiento Matemático", "Razonamiento Verbal", "Física", "Lenguaje"] },
  { id: "canal-2", name: "Ciencias Exactas e Ingenierías", color: "blue", subjects: ["Álgebra", "Geometría", "Trigonometría", "Aritmética", "Física", "Química", "Razonamiento Matemático", "Razonamiento Verbal"] },
  { id: "canal-3", name: "Ciencias Sociales, Letras y Humanidades", color: "violet", subjects: ["Lenguaje y Literatura", "Historia (del Perú y Universal)", "Geografía", "Economía", "Educación Cívica", "Filosofía y Psicología", "Razonamiento Verbal", "Razonamiento Matemático"] },
  { id: "canal-4", name: "Ciencias Empresariales y Actuariales", color: "amber", subjects: ["Economía", "Aritmética", "Álgebra", "Razonamiento Matemático", "Razonamiento Verbal", "Lenguaje", "Historia y Geografía"] },
];
const people = ["Ana Torres", "Luis Mendoza", "Sofía Herrera", "Mateo Silva", "Valeria Cruz", "Diego Flores"];
const initialStudents: DirectoryPerson[] = people.map((name, index) => ({ id: `student-${index + 1}`, name, email: `${name.toLowerCase().replaceAll(" ", ".")}@althea.edu`, detail: "Preparación preuniversitaria", active: true, channelId: `canal-${index % 4 + 1}`, phone: "", document: "", birthDate: "" }));
const initialTeachers: DirectoryPerson[] = ["Javier Ramírez", "María Fernanda López", "Carlos Vega"].map((name, index) => ({ id: `teacher-${index + 1}`, name, email: `${name.toLowerCase().replaceAll(" ", ".")}@althea.edu`, detail: ["Matemática", "Comunicación", "Ciencias"][index], active: true }));
const initialCycles: AdminCycle[] = [{ id: "cycle-1", name: "Ciclo marzo – abril 2027", start: "2027-03-01", end: "2027-04-30", weeks: 4, active: true }];
const initialGroups: AdminGroup[] = ["MAT-A", "MAT-B", "COM-A", "CIE-A"].map((name) => ({ id: `group-${name.toLowerCase()}`, name, level: "Secundaria · 1.º año", active: true }));
const palettes = ["blue", "violet", "mint", "amber", "rose"];
const weekdayOptions = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const initialCourses: Course[] = [
  {
    id: "mat-a", name: "Matemática", code: "MAT", teacher: "Javier Ramírez", group: "MAT-A", room: "Aula 101", cycleId: "cycle-1",
    days: ["Lun", "Mié"], start: "08:00", end: "10:00", weeks: 4, students: people.slice(0, 5), color: "blue", active: true,
    attendance: {
      "Ana Torres": [{ date: "08/03/2027", status: "Ausente" }, { date: "10/03/2027", status: "Presente" }, { date: "15/03/2027", status: "Presente" }, { date: "17/03/2027", status: "Presente" }],
      "Luis Mendoza": [{ date: "08/03/2027", status: "Presente" }, { date: "10/03/2027", status: "Presente" }],
      "Sofía Herrera": [{ date: "08/03/2027", status: "Presente" }],
    },
    activities: ["Números y operaciones", "Álgebra básica", "Ecuaciones", "Evaluación del mes"].map((name, i) => ({ name, week: i + 1, max: 20, scores: i === 0 ? { "Ana Torres": 18, "Luis Mendoza": 16, "Sofía Herrera": 19 } : {} })),
  },
  {
    id: "mat-b", name: "Matemática", code: "MAT", teacher: "Javier Ramírez", group: "MAT-B", room: "Aula 102", cycleId: "cycle-1",
    days: ["Mar", "Jue"], start: "16:00", end: "18:00", weeks: 4, students: people.slice(1), color: "violet", active: true,
    attendance: {}, activities: ["Operaciones", "Fracciones", "Geometría", "Evaluación del mes"].map((name, i) => ({ name, week: i + 1, max: 20 })),
  },
  {
    id: "com-a", name: "Comunicación", code: "COM", teacher: "María Fernanda López", group: "COM-A", room: "Aula 203", cycleId: "cycle-1",
    days: ["Mar", "Jue"], start: "10:30", end: "12:00", weeks: 4, students: people.slice(0, 4), color: "mint", active: true,
    attendance: {}, activities: ["Comprensión lectora", "Tipos de texto", "Redacción", "Exposición"].map((name, i) => ({ name, week: i + 1, max: 20, scores: i < 2 ? { "Ana Torres": [17, 19][i], "Luis Mendoza": [15, 18][i] } : {} })),
  },
  {
    id: "cien-a", name: "Ciencias", code: "CIE", teacher: "Carlos Vega", group: "CIE-A", room: "Laboratorio 1", cycleId: "cycle-1",
    days: ["Lun", "Mié", "Vie"], start: "13:00", end: "14:30", weeks: 4, students: people.slice(0, 3), color: "amber", active: true,
    attendance: {}, activities: ["El método científico", "Materia y energía", "Ecosistemas", "Proyecto final"].map((name, i) => ({ name, week: i + 1, max: 20, scores: i === 0 ? { "Ana Torres": 16, "Diego Flores": 18 } : {} })),
  },
];

const iconPaths: Record<string, string> = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 5.5v16M8 7h8M8 11h8",
  calendar: "M7 2v4m10-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2zM7 13h3v3H7z",
  chart: "M4 19V5m0 14h17M8 15l4-4 3 2 5-6",
  users: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6-7a4 4 0 0 1 0 8m2 3a4 4 0 0 1 4 4v2",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4a8 8 0 0 0-.1-1.3l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2.3-1.3L14.8 3h-4l-.4 2.4A8 8 0 0 0 8.1 6.7l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 2.6l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2.3 1.3l.4 2.4h4l.4-2.4a8 8 0 0 0 2.3-1.3l2.4 1 2-3.5-2-1.5A8 8 0 0 0 20 12z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6 6-6-6 6-6",
  clock: "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14m-7-7h14",
  close: "M18 6 6 18M6 6l12 12",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  trend: "M3 17l6-6 4 4 8-8m-6 0h6v6",
};

function Icon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.grid} /></svg>;
}

function initials(value: string) { return value.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function average(course: Course, student: string) {
  const scores = course.activities.filter((activity) => activity.scores?.[student] !== undefined);
  if (!scores.length) return null;
  return (scores.reduce((sum, activity) => sum + (activity.scores?.[student] || 0) / activity.max * 20, 0) / scores.length).toFixed(1);
}
function attendanceSummary(course: Course, student: string) {
  const records = course.attendance[student] || [];
  const present = records.filter((record) => record.status === "Presente").length;
  const late = records.filter((record) => record.status === "Tardanza").length;
  const absent = records.filter((record) => record.status === "Ausente").length;
  return { records, present, late, absent, total: records.length, percentage: records.length ? Math.round((present + late) / records.length * 100) : 100 };
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [students, setStudents] = useState<DirectoryPerson[]>(initialStudents);
  const [teachers, setTeachers] = useState<DirectoryPerson[]>(initialTeachers);
  const [cycles, setCycles] = useState<AdminCycle[]>(initialCycles);
  const [groups, setGroups] = useState<AdminGroup[]>(initialGroups);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>("Estudiante");
  const [tab, setTab] = useState<Tab>("Información");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [student, setStudent] = useState("Ana Torres");
  const [teacher, setTeacher] = useState("Javier Ramírez");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState("2027-03-15");
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus>>({});
  const [activityDraft, setActivityDraft] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", teacher: "Javier Ramírez", group: "", room: "", start: "08:00", end: "10:00", weeks: 4, days: ["Lun", "Mié"] as string[], color: "blue", students: [] as string[], activities: ["Actividad 1", "Actividad 2", "Actividad 3", "Actividad 4"], cycleId: "cycle-1" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("althea-courses-v1");
      if (stored) {
        try { setCourses(JSON.parse(stored) as Course[]); } catch { window.localStorage.removeItem("althea-courses-v1"); }
      }
      const directory = window.localStorage.getItem("althea-admin-v1");
      if (directory) {
        try {
          const parsed = JSON.parse(directory) as { students?: DirectoryPerson[]; teachers?: DirectoryPerson[]; cycles?: AdminCycle[]; groups?: AdminGroup[] };
          if (parsed.students) setStudents(parsed.students.map((person, index) => ({ ...person, channelId: person.channelId || `canal-${index % channelSubjects.length + 1}`, detail: person.detail.startsWith("Secundaria") ? "Preparación preuniversitaria" : person.detail })));
          if (parsed.teachers) setTeachers(parsed.teachers);
          if (parsed.cycles) setCycles(parsed.cycles);
          if (parsed.groups) setGroups(parsed.groups);
        } catch { window.localStorage.removeItem("althea-admin-v1"); }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (ready) window.localStorage.setItem("althea-courses-v1", JSON.stringify(courses)); }, [courses, ready]);
  useEffect(() => { if (ready) window.localStorage.setItem("althea-admin-v1", JSON.stringify({ students, teachers, cycles, groups })); }, [students, teachers, cycles, groups, ready]);

  const activeCourses = useMemo(() => courses.filter((course) => course.active), [courses]);
  const selectedCourse = courses.find((course) => course.id === selectedId) || null;
  const studentCourses = students.some((item) => item.name === student && item.active) ? activeCourses.filter((course) => course.students.includes(student)) : [];
  const teacherCourses = teachers.some((item) => item.name === teacher && item.active) ? activeCourses.filter((course) => course.teacher === teacher) : [];
  function changeRole(nextRole: Role) {
    setRole(nextRole); setSelectedId(null); setTab("Información"); setSaved(false);
  }
  function openCourse(course: Course) { setSelectedId(course.id); setTab("Información"); setSaved(false); }
  function backToCourses() { setSelectedId(null); setTab("Información"); setSaved(false); }
  function openNewCourse() {
    setEditingId(null);
    const currentCycle = cycles.find((item) => item.active);
    setForm({ name: "", teacher: "Javier Ramírez", group: "", room: "", start: "08:00", end: "10:00", weeks: currentCycle?.weeks || 4, days: ["Lun", "Mié"], color: "blue", students: [student], activities: Array.from({ length: currentCycle?.weeks || 4 }, (_, index) => `Actividad ${index + 1}`), cycleId: currentCycle?.id || "" });
    setModal(true);
  }
  function openEditCourse(course: Course) {
    setEditingId(course.id);
    setForm({ name: course.name, teacher: course.teacher, group: course.group, room: course.room, start: course.start, end: course.end, weeks: course.weeks, days: course.days, color: course.color, students: course.students, activities: course.activities.map((activity) => activity.name), cycleId: course.cycleId || cycles.find((item) => item.active)?.id || "" });
    setModal(true);
  }
  function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const previous = courses.find((course) => course.id === editingId);
    const code = form.name.trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 3).toUpperCase();
    const activities = Array.from({ length: form.weeks }, (_, index) => ({
      name: form.activities[index]?.trim() || `Actividad ${index + 1}`,
      week: index + 1,
      max: previous?.activities[index]?.max || 20,
      scores: previous?.activities[index]?.scores || {},
    }));
    const nextCourse: Course = {
      id: editingId || `course-${Date.now()}`, name: form.name.trim(), code, teacher: form.teacher.trim(), group: form.group.trim().toUpperCase(), room: form.room.trim(),
      days: weekdayOptions.filter((day) => form.days.includes(day)), start: form.start, end: form.end, weeks: Math.max(1, form.weeks), students: form.students,
      color: form.color, active: previous?.active ?? true, scheduleActive: previous?.scheduleActive ?? true, cycleId: form.cycleId, attendance: previous?.attendance || {}, activities,
    };
    setCourses((current) => editingId ? current.map((course) => course.id === editingId ? nextCourse : course) : [...current, nextCourse]);
    if (editingId === selectedId) setSelectedId(nextCourse.id);
    setModal(false); setSaved(true);
  }
  function markAttendance() {
    if (!selectedCourse) return;
    const date = new Date(`${attendanceDate}T12:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
    setCourses((current) => current.map((course) => {
      if (course.id !== selectedCourse.id) return course;
      const attendance = { ...course.attendance };
      for (const name of course.students) {
        const records = attendance[name] || [];
        attendance[name] = [...records.filter((record) => record.date !== date), { date, status: attendanceDraft[`${course.id}-${name}`] || "Presente" }];
      }
      return { ...course, attendance };
    }));
    setSaved(true);
  }
  function saveGrades() {
    if (!selectedCourse) return;
    setCourses((current) => current.map((course) => course.id !== selectedCourse.id ? course : {
      ...course, activities: course.activities.map((activity, index) => {
        const scores = { ...(activity.scores || {}) };
        for (const name of course.students) {
          const draft = activityDraft[`${course.id}-${index}-${name}`];
          if (draft !== undefined && draft !== "") scores[name] = Math.min(activity.max, Math.max(0, Number(draft)));
        }
        return { ...activity, scores };
      }),
    }));
    setSaved(true);
  }
  function savePerson(kind: "Estudiantes" | "Docentes", next: DirectoryPerson, previousName?: string) {
    const setter = kind === "Estudiantes" ? setStudents : setTeachers;
    setter((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    if (previousName && previousName !== next.name) {
      setCourses((current) => current.map((course) => {
        if (kind === "Docentes") return course.teacher === previousName ? { ...course, teacher: next.name } : course;
        const attendance = { ...course.attendance };
        if (attendance[previousName]) { attendance[next.name] = attendance[previousName]; delete attendance[previousName]; }
        const activities = course.activities.map((activity) => {
          const scores = { ...(activity.scores || {}) };
          if (scores[previousName] !== undefined) { scores[next.name] = scores[previousName]; delete scores[previousName]; }
          return { ...activity, scores };
        });
        return { ...course, students: course.students.map((name) => name === previousName ? next.name : name), attendance, activities };
      }));
      if (kind === "Estudiantes" && student === previousName) setStudent(next.name);
      if (kind === "Docentes" && teacher === previousName) setTeacher(next.name);
    }
  }
  function saveGroup(next: AdminGroup, previousName?: string) {
    setGroups((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    if (previousName && previousName !== next.name) setCourses((current) => current.map((course) => course.group === previousName ? { ...course, group: next.name } : course));
  }
  function saveCycle(next: AdminCycle) {
    setCycles((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    setCourses((current) => current.map((course) => course.cycleId !== next.id ? course : {
      ...course,
      weeks: next.weeks,
      activities: Array.from({ length: next.weeks }, (_, index) => course.activities[index] || { name: `Actividad ${index + 1}`, week: index + 1, max: 20, scores: {} }).map((activity, index) => ({ ...activity, week: index + 1 })),
    }));
  }
  function toggleCourse(id: string) { setCourses((current) => current.map((course) => course.id === id ? { ...course, active: !course.active } : course)); }
  function toggleSchedule(id: string) { setCourses((current) => current.map((course) => course.id === id ? { ...course, scheduleActive: course.scheduleActive === false } : course)); }
  function deleteScheduleDay(id: string, day: string) { setCourses((current) => current.map((course) => course.id === id ? { ...course, days: course.days.filter((item) => item !== day) } : course)); }
  function deleteCourse(id: string) { setCourses((current) => current.filter((course) => course.id !== id)); if (selectedId === id) setSelectedId(null); }
  function deletePerson(kind: "Estudiantes" | "Docentes", id: string) {
    const record = (kind === "Estudiantes" ? students : teachers).find((item) => item.id === id);
    if (!record) return;
    if (kind === "Docentes" && courses.some((course) => course.teacher === record.name)) { window.alert("Este docente tiene cursos asignados. Desactívalo o reasigna sus cursos antes de eliminarlo."); return; }
    (kind === "Estudiantes" ? setStudents : setTeachers)((current) => current.filter((item) => item.id !== id));
    if (kind === "Estudiantes") setCourses((current) => current.map((course) => {
      const attendance = { ...course.attendance }; delete attendance[record.name];
      return { ...course, students: course.students.filter((name) => name !== record.name), attendance, activities: course.activities.map((activity) => { const scores = { ...(activity.scores || {}) }; delete scores[record.name]; return { ...activity, scores }; }) };
    }));
  }

  const navItems = role === "Estudiante"
    ? [{ label: "Mis cursos", icon: "book" }, { label: "Asistencia", icon: "calendar" }, { label: "Mis notas", icon: "chart" }]
    : role === "Docente"
      ? [{ label: "Mis clases", icon: "grid" }, { label: "Tomar asistencia", icon: "calendar" }, { label: "Calificaciones", icon: "chart" }]
      : [{ label: "Administración", icon: "settings" }];

  function navigateTo(label: string) {
    if (label === "Asistencia" || label === "Tomar asistencia") {
      setTab("Asistencia");
      if (!selectedId) setSelectedId((role === "Estudiante" ? studentCourses : teacherCourses)[0]?.id || null);
    }
    else if (label === "Mis notas" || label === "Calificaciones") {
      setTab("Notas");
      if (!selectedId) setSelectedId((role === "Estudiante" ? studentCourses : teacherCourses)[0]?.id || null);
    }
    else { setSelectedId(null); setTab("Información"); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); backToCourses(); }}>
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>althea<span className="brand-period">.</span><small>ACADEMIA</small></span>
        </a>
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <button className="workspace-switch"><span className="workspace-avatar">A</span><span className="workspace-copy"><strong>Academia Althea</strong><small>Plan institucional</small></span><span className="chevron">⌄</span></button>
        <div className="nav-label">MENÚ PRINCIPAL</div>
        <nav className="side-nav" aria-label="Menú principal">
          {navItems.map((item, index) => {
            const active = selectedCourse ? (item.label === "Asistencia" || item.label === "Tomar asistencia" ? tab === "Asistencia" : item.label === "Mis notas" || item.label === "Calificaciones" ? tab === "Notas" : tab === "Información") : index === 0;
            return <button key={item.label} className={`nav-item ${active ? "active" : ""}`} onClick={() => navigateTo(item.label)}><Icon name={item.icon} /><span>{item.label}</span>{role === "Estudiante" && item.label === "Mis cursos" && <span className="nav-count">{studentCourses.length}</span>}</button>;
          })}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">✳</span><strong>¿Necesitas ayuda?</strong><p>Estamos aquí para ayudarte a aprender.</p><button>Contactar soporte <Icon name="arrow" size={14} /></button></div><button className="settings-link"><Icon name="settings" /> Configuración</button><button className="profile-button"><span className="profile-avatar">{initials(role === "Estudiante" ? student : role === "Docente" ? teacher : "Coordinación")}</span><span><strong>{role === "Estudiante" ? student : role === "Docente" ? teacher : "Coordinación"}</strong><small>{role}</small></span><Icon name="more" size={17} /></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Academia Althea</span><span className="crumb-slash">/</span><strong>{selectedCourse ? selectedCourse.name : role === "Estudiante" ? "Área de estudiante" : role === "Docente" ? "Área docente" : "Administración"}</strong></div><div className="topbar-actions"><span className="today-chip"><span className="status-dot" /> Ciclo marzo – abril 2027</span><button className="icon-button notification" aria-label="Notificaciones"><span>♧</span><i /></button><div className="role-picker"><span>Vista:</span><select value={role} onChange={(event) => changeRole(event.target.value as Role)} aria-label="Cambiar tipo de usuario"><option>Estudiante</option><option>Docente</option><option>Administrador</option></select></div></div></header>

        <div className="page-content">
          {role === "Estudiante" && !selectedCourse && <StudentHome courses={studentCourses} students={students.filter((item) => item.active)} student={student} setStudent={setStudent} openCourse={openCourse} />}
          {role === "Estudiante" && selectedCourse && <CourseDetail course={selectedCourse} student={student} tab={tab} setTab={setTab} onBack={backToCourses} />}
          {role === "Docente" && !selectedCourse && <TeacherHome courses={teacherCourses} teacherNames={teachers.filter((item) => item.active).map((item) => item.name)} teacher={teacher} setTeacher={setTeacher} openCourse={openCourse} />}
          {role === "Docente" && selectedCourse && <TeacherCourse course={selectedCourse} tab={tab} setTab={setTab} onBack={backToCourses} attendanceDate={attendanceDate} setAttendanceDate={setAttendanceDate} attendanceDraft={attendanceDraft} setAttendanceDraft={setAttendanceDraft} onMark={markAttendance} activityDraft={activityDraft} setActivityDraft={setActivityDraft} onSaveGrades={saveGrades} saved={saved} />}
          {role === "Administrador" && <AdminHome courses={courses} students={students} teachers={teachers} cycles={cycles} groups={groups} onNew={openNewCourse} onEdit={openEditCourse} onToggleCourse={toggleCourse} onDeleteCourse={deleteCourse} onToggleSchedule={toggleSchedule} onDeleteSchedule={deleteScheduleDay} onSavePerson={savePerson} onTogglePerson={(kind, id) => (kind === "Estudiantes" ? setStudents : setTeachers)((current) => current.map((item) => item.id === id ? { ...item, active: !item.active } : item))} onDeletePerson={deletePerson} onSaveCycle={saveCycle} onToggleCycle={(id) => setCycles((current) => current.map((item) => item.id === id ? { ...item, active: !item.active } : item))} onDeleteCycle={(id) => { if (courses.some((course) => course.cycleId === id)) { window.alert("Este ciclo tiene cursos asociados. Reasigna los cursos antes de eliminarlo."); return; } setCycles((current) => current.filter((item) => item.id !== id)); }} onSaveGroup={saveGroup} onToggleGroup={(id) => setGroups((current) => current.map((item) => item.id === id ? { ...item, active: !item.active } : item))} onDeleteGroup={(id) => { const group = groups.find((item) => item.id === id); if (group && courses.some((course) => course.group === group.name)) { window.alert("Este grupo tiene cursos asociados. Reasigna los cursos antes de eliminarlo."); return; } setGroups((current) => current.filter((item) => item.id !== id)); }} />}
        </div>
        <footer className="footer"><span>© 2027 Academia Althea</span><span>Hecho para aprender <span className="footer-heart">♥</span></span></footer>
      </main>

      {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><form className="course-modal" onSubmit={saveCourse}><div className="modal-heading"><div><span className="eyebrow">GESTIÓN ACADÉMICA</span><h2>{editingId ? "Editar curso" : "Crear un curso"}</h2><p>Organiza las clases y actividades de tu academia.</p></div><button type="button" className="icon-button" onClick={() => setModal(false)} aria-label="Cerrar"><Icon name="close" /></button></div><div className="form-grid"><label className="form-field field-wide">Nombre del curso<input autoFocus required placeholder="Ej. Matemática" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="form-field field-wide">Ciclo académico<select required value={form.cycleId} onChange={(event) => { const cycle = cycles.find((item) => item.id === event.target.value); const weeks = cycle?.weeks || form.weeks; setForm({ ...form, cycleId: event.target.value, weeks, activities: Array.from({ length: weeks }, (_, index) => form.activities[index] || `Actividad ${index + 1}`) }); }}>{cycles.filter((item) => item.active || item.id === form.cycleId).map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.name} · {cycle.weeks} semanas</option>)}</select></label><label className="form-field">Docente a cargo<input required list="teacher-options" placeholder="Nombre del docente" value={form.teacher} onChange={(event) => setForm({ ...form, teacher: event.target.value })} /></label><datalist id="teacher-options">{teachers.filter((item) => item.active).map((item) => <option key={item.id} value={item.name} />)}</datalist><label className="form-field">Grupo o sección<input required list="group-options" placeholder="Ej. MAT-A" value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })} /></label><datalist id="group-options">{groups.filter((item) => item.active).map((item) => <option key={item.id} value={item.name} />)}</datalist><label className="form-field">Aula<input required placeholder="Ej. Aula 101" value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} /></label><div className="form-field"><span>Horario</span><div className="time-fields"><input type="time" aria-label="Hora de inicio" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} /><span>–</span><input type="time" aria-label="Hora de fin" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} /></div></div><label className="form-field field-wide">Días de clase<div className="day-picker">{weekdayOptions.map((day) => <button type="button" key={day} className={form.days.includes(day) ? "chosen" : ""} onClick={() => setForm({ ...form, days: form.days.includes(day) ? form.days.filter((item) => item !== day) : [...form.days, day] })}>{day}</button>)}</div></label><label className="form-field">Duración del ciclo<select value={form.weeks} onChange={(event) => { const weeks = Number(event.target.value); setForm({ ...form, weeks, activities: Array.from({ length: weeks }, (_, index) => form.activities[index] || `Actividad ${index + 1}`) }); }}>{[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((weeks) => <option key={weeks} value={weeks}>{weeks} {weeks === 1 ? "semana" : "semanas"}</option>)}</select><small className="field-hint">Define una actividad evaluable para cada semana.</small></label><div className="form-field field-wide"><span>Actividades semanales</span><div className="weekly-activity-fields">{form.activities.slice(0, form.weeks).map((activity, index) => <label key={index}><span>Semana {index + 1}</span><input required value={activity} onChange={(event) => setForm({ ...form, activities: form.activities.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} placeholder={`Actividad de la semana ${index + 1}`} /></label>)}</div></div><label className="form-field">Color del curso<div className="color-picker">{palettes.map((color) => <button type="button" aria-label={`Color ${color}`} key={color} className={`color-swatch ${color} ${form.color === color ? "selected" : ""}`} onClick={() => setForm({ ...form, color })} />)}</div></label><div className="form-field field-wide"><span>Estudiantes inscritos</span><div className="student-picker">{students.filter((item) => item.active).map(({ name, id }) => <label key={id} className="student-option"><input type="checkbox" checked={form.students.includes(name)} onChange={(event) => setForm({ ...form, students: event.target.checked ? [...form.students, name] : form.students.filter((item) => item !== name) })} /><span className="tiny-avatar">{initials(name)}</span>{name}</label>)}</div></div></div><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setModal(false)}>Cancelar</button><button type="submit" className="button-primary"><Icon name="plus" size={16} /> {editingId ? "Guardar cambios" : "Crear curso"}</button></div></form></div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function StudentHome({ courses, students, student, setStudent, openCourse }: { courses: Course[]; students: DirectoryPerson[]; student: string; setStudent: (value: string) => void; openCourse: (course: Course) => void }) {
  const nextClass = courses.flatMap((course) => course.days.map((day) => ({ course, day }))).sort((a, b) => a.course.start.localeCompare(b.course.start))[0];
  const averageValue = courses.map((course) => average(course, student)).filter((value): value is string => value !== null);
  const overall = averageValue.length ? (averageValue.reduce((sum, value) => sum + Number(value), 0) / averageValue.length).toFixed(1) : "—";
  return <>
    <div className="welcome-row"><div><div className="eyebrow">LUNES, 15 DE MARZO DE 2027</div><h1>¡Hola, {student.split(" ")[0]}! <span className="wave">✳</span></h1><p>Un buen día para aprender algo nuevo.</p></div><label className="student-switch">Ver como<select value={student} onChange={(event) => setStudent(event.target.value)}>{students.map((item) => <option key={item.id}>{item.name}</option>)}</select></label></div>
    <section className="stats-grid"><StatCard icon="book" label="Cursos activos" value={String(courses.length).padStart(2, "0")} hint="Este ciclo" color="blue" /><StatCard icon="calendar" label="Asistencia" value={`${courses.length ? Math.round(courses.reduce((sum, course) => sum + attendanceSummary(course, student).percentage, 0) / courses.length) : 0}%`} hint="Promedio general" color="mint" /><StatCard icon="chart" label="Promedio de notas" value={overall} hint="Sobre 20 puntos" color="violet" /><StatCard icon="clock" label="Próxima clase" value={nextClass ? nextClass.course.start : "—"} hint={nextClass ? `${nextClass.course.name} · ${nextClass.day}` : "Sin clases programadas"} color="amber" /></section>
    <div className="section-heading"><div><h2>Mis cursos</h2><p>Selecciona un curso para consultar su información.</p></div><span className="result-count">{courses.length} cursos <span>·</span> ciclo activo</span></div>
    {courses.length ? <div className="course-grid">{courses.map((course) => <StudentCourseCard key={course.id} course={course} student={student} onClick={() => openCourse(course)} />)}</div> : <EmptyState title="Aún no tienes cursos inscritos" message="Cuando coordinación te inscriba en un curso, lo encontrarás aquí." />}
    <section className="announcement"><div className="announcement-icon">✦</div><div><span className="eyebrow">TU ESPACIO DE APRENDIZAJE</span><h3>Cada paso cuenta.</h3><p>Revisa tus actividades semana a semana y sigue de cerca tu progreso.</p></div><span className="announcement-spark">✳</span></section>
  </>;
}

function StatCard({ icon, label, value, hint, color }: { icon: string; label: string; value: string; hint: string; color: string }) {
  return <article className="stat-card"><div className={`stat-icon ${color}`}><Icon name={icon} /></div><div><span className="stat-label">{label}</span><div className="stat-value">{value}</div><span className="stat-hint">{hint}</span></div></article>;
}

function StudentCourseCard({ course, student, onClick }: { course: Course; student: string; onClick: () => void }) {
  const summary = attendanceSummary(course, student); const avg = average(course, student); const graded = course.activities.filter((activity) => activity.scores?.[student] !== undefined).length;
  return <button className="course-card" onClick={onClick}><div className={`course-cover ${course.color}`}><div className="cover-orbit orbit-one"/><div className="cover-orbit orbit-two"/><span className="course-monogram">{course.code.slice(0, 2)}</span><span className="course-badge"><i /> En curso</span><span className="cover-course-name">{course.name}</span><span className="cover-group">{course.group} <span>·</span> {course.room}</span></div><div className="course-card-body"><div className="teacher-row"><span className={`teacher-avatar ${course.color}`}>{initials(course.teacher)}</span><div><strong>{course.teacher}</strong><small>Docente a cargo</small></div><span className="card-arrow"><Icon name="arrow" /></span></div><div className="course-card-divider"/><div className="course-metadata"><div><span>Horario</span><strong>{course.days.join(" y ")} · {course.start}–{course.end}</strong></div><div><span>Asistencia</span><strong>{summary.percentage}% <i className="tiny-progress"><b style={{ width: `${summary.percentage}%` }} /></i></strong></div><div><span>Promedio</span><strong>{avg || "Pendiente"}{avg ? <small> / 20</small> : null}</strong></div></div><div className="course-card-bottom"><span>{course.weeks} semanas</span><span>{graded}/{course.activities.length} actividades calificadas</span></div></div></button>;
}

function CourseDetail({ course, student, tab, setTab, onBack }: { course: Course; student: string; tab: Tab; setTab: (tab: Tab) => void; onBack: () => void }) {
  const summary = attendanceSummary(course, student); const avg = average(course, student);
  return <><button className="back-link" onClick={onBack}><Icon name="back" size={15} /> Volver a mis cursos</button><div className={`detail-banner ${course.color}`}><span className="detail-monogram">{course.code.slice(0, 2)}</span><div><div className="detail-title-line"><h1>{course.name}</h1><span className="course-badge"><i /> En curso</span></div><p>{course.teacher} <span>·</span> {course.group} <span>·</span> {course.room}</p></div><div className="detail-banner-side"><span>Tu grupo</span><strong>{course.group}</strong></div></div><div className="detail-tabs" role="tablist" aria-label="Información del curso">{(["Información", "Asistencia", "Notas"] as Tab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{item === "Información" ? <Icon name="book" size={15} /> : item === "Asistencia" ? <Icon name="calendar" size={15} /> : <Icon name="chart" size={15} />}{item}</button>)}</div>{tab === "Información" ? <StudentInfo course={course} student={student} summary={summary} avg={avg} /> : tab === "Asistencia" ? <StudentAttendance course={course} summary={summary} /> : <StudentGrades course={course} student={student} />}</>;
}

function StudentInfo({ course, student, summary, avg }: { course: Course; student: string; summary: ReturnType<typeof attendanceSummary>; avg: string | null }) {
  return <><div className="detail-summary-grid"><article className="summary-card"><div className="summary-card-head"><span>Docente</span><span className="summary-icon violet"><Icon name="users" size={16} /></span></div><div className="summary-teacher"><span className={`teacher-avatar ${course.color}`}>{initials(course.teacher)}</span><div><strong>{course.teacher}</strong><small>Docente a cargo</small></div></div></article><article className="summary-card"><div className="summary-card-head"><span>Horario de clases</span><span className="summary-icon blue"><Icon name="clock" size={16} /></span></div><strong className="summary-main">{course.days.join(" y ")}</strong><span className="summary-sub">{course.start} – {course.end} · {course.room}</span></article><article className="summary-card"><div className="summary-card-head"><span>Asistencia</span><span className="summary-icon mint"><Icon name="calendar" size={16} /></span></div><strong className="summary-main">{summary.percentage}<small>%</small></strong><div className="metric-progress"><b style={{ width: `${summary.percentage}%` }} /></div><span className="summary-sub">{summary.present} de {summary.total} clases asistidas</span></article><article className="summary-card"><div className="summary-card-head"><span>Promedio actual</span><span className="summary-icon amber"><Icon name="chart" size={16} /></span></div><strong className="summary-main">{avg || "—"}<small>{avg ? " / 20" : ""}</small></strong><span className="summary-sub">{course.activities.filter((activity) => activity.scores?.[student] !== undefined).length} de {course.activities.length} actividades</span></article></div><div className="content-columns"><section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Plan del ciclo</h2><p>Una actividad cada semana · {course.weeks} semanas</p></div><span className="subtle-pill">{course.activities.length} actividades</span></div><div className="activity-timeline">{course.activities.map((activity, index) => <div className="timeline-row" key={`${activity.week}-${activity.name}`}><span className={`timeline-dot ${activity.scores?.[student] !== undefined ? "done" : ""}`}>{activity.scores?.[student] !== undefined ? <Icon name="check" size={13} /> : String(index + 1).padStart(2, "0")}</span><div className="timeline-copy"><span>SEMANA {activity.week}</span><strong>{activity.name}</strong></div><span className={`activity-state ${activity.scores?.[student] !== undefined ? "graded" : "pending"}`}>{activity.scores?.[student] !== undefined ? `${activity.scores[student]}/${activity.max} pts` : "Pendiente"}</span></div>)}</div></section><section className="panel student-panel"><div className="panel-heading"><div><h2>Mi espacio</h2><p>Tu información en este grupo</p></div><span className="profile-avatar small">{initials(student)}</span></div><div className="student-information"><div><span>Estudiante</span><strong>{student}</strong></div><div><span>Grupo</span><strong>{course.group}</strong></div><div><span>Duración del ciclo</span><strong>{course.weeks} semanas</strong></div><div><span>Próxima actividad</span><strong>{course.activities.find((activity) => activity.scores?.[student] === undefined)?.name || "¡Completaste todas!"}</strong></div></div></section></div></>;
}

function StudentAttendance({ course, summary }: { course: Course; summary: ReturnType<typeof attendanceSummary> }) {
  return <><div className="detail-summary-grid attendance-stats"><article className="summary-card"><div className="summary-card-head"><span>Clases registradas</span><span className="summary-icon blue"><Icon name="calendar" size={16} /></span></div><strong className="summary-main">{summary.total}</strong><span className="summary-sub">Durante el ciclo</span></article><article className="summary-card"><div className="summary-card-head"><span>Presentes</span><span className="summary-icon mint"><Icon name="check" size={16} /></span></div><strong className="summary-main">{summary.present}</strong><span className="summary-sub">Asistencia regular</span></article><article className="summary-card"><div className="summary-card-head"><span>Tardanzas</span><span className="summary-icon amber"><Icon name="clock" size={16} /></span></div><strong className="summary-main">{summary.late}</strong><span className="summary-sub">Llegadas registradas</span></article><article className="summary-card"><div className="summary-card-head"><span>Ausencias</span><span className="summary-icon rose"><Icon name="close" size={16} /></span></div><strong className="summary-main">{summary.absent}</strong><span className="summary-sub">Faltas registradas</span></article></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Registro de asistencia</h2><p>{course.days.join(" y ")} · {course.start}–{course.end}</p></div><span className="subtle-pill">{summary.percentage}% asistencia</span></div><AttendanceTable records={summary.records} />{!summary.total && <div className="empty-inline">Todavía no hay clases registradas para este curso.</div>}</section></>;
}

function StudentGrades({ course, student }: { course: Course; student: string }) {
  const graded = course.activities.filter((activity) => activity.scores?.[student] !== undefined); const avg = average(course, student);
  return <><div className="grade-hero"><div><span className="eyebrow">TU PROGRESO EN {course.group}</span><h2>Notas del curso</h2><p>Cada actividad semanal suma a tu aprendizaje.</p></div><div className="grade-overall"><span>Promedio actual</span><strong>{avg || "—"}<small>{avg ? " / 20" : ""}</small></strong><span>{graded.length} de {course.activities.length} actividades calificadas</span></div></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Actividades del ciclo</h2><p>Una actividad por semana · máximo 20 puntos</p></div><span className="subtle-pill">{graded.length}/{course.activities.length} evaluadas</span></div><div className="grade-list">{course.activities.map((activity, index) => <div className="grade-row" key={`${activity.week}-${activity.name}`}><span className={`grade-number ${activity.scores?.[student] !== undefined ? "scored" : ""}`}>{String(index + 1).padStart(2, "0")}</span><div className="grade-activity"><span>SEMANA {activity.week}</span><strong>{activity.name}</strong></div>{activity.scores?.[student] !== undefined ? <><div className="grade-progress"><span><b style={{ width: `${activity.scores[student] / activity.max * 100}%` }} /></span></div><strong className="grade-score">{activity.scores[student]}<small>/{activity.max}</small></strong><span className="grade-status scored">Calificado</span></> : <><div className="grade-progress empty"><span /></div><strong className="grade-score muted">—<small>/{activity.max}</small></strong><span className="grade-status pending">Pendiente</span></>}</div>)}</div></section></>;
}

function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  return <div className="attendance-table"><div className="attendance-table-head"><span>FECHA</span><span>ESTADO</span></div>{[...records].reverse().map((record) => <div key={`${record.date}-${record.status}`} className="attendance-table-row"><span>{record.date}</span><span><i className={`attendance-badge ${record.status.toLowerCase()}`}><b />{record.status}</i></span></div>)}</div>;
}

function TeacherHome({ courses, teacherNames, teacher, setTeacher, openCourse }: { courses: Course[]; teacherNames: string[]; teacher: string; setTeacher: (value: string) => void; openCourse: (course: Course) => void }) {
  const sortedCourses = [...courses].sort((a, b) => a.start.localeCompare(b.start));
  const todayClasses = sortedCourses.filter((course) => course.scheduleActive !== false && course.days.includes("Lun"));
  return <><div className="welcome-row"><div><div className="eyebrow">LUNES, 15 DE MARZO DE 2027</div><h1>Buen día, {teacher.split(" ")[0]} <span className="wave">✳</span></h1><p>Tu jornada y tus grupos de hoy, en un solo lugar.</p></div><label className="student-switch">Ver como<select value={teacher} onChange={(event) => setTeacher(event.target.value)}>{teacherNames.map((name) => <option key={name}>{name}</option>)}</select></label></div><section className="stats-grid"><StatCard icon="book" label="Cursos a cargo" value={String(courses.length).padStart(2, "0")} hint="Este ciclo" color="blue" /><StatCard icon="users" label="Estudiantes" value={String(courses.reduce((sum, course) => sum + course.students.length, 0))} hint="En tus grupos" color="mint" /><StatCard icon="calendar" label="Clases de hoy" value={String(todayClasses.length).padStart(2, "0")} hint="Lunes · 15 mar" color="violet" /><StatCard icon="chart" label="Actividades" value={String(courses.reduce((sum, course) => sum + course.activities.length, 0))} hint="En este ciclo" color="amber" /></section><div className="section-heading"><div><h2>Tu horario de hoy</h2><p>Elige un grupo para comenzar la clase o tomar asistencia.</p></div><span className="result-count">Lunes, 15 de marzo <span>·</span> 2027</span></div>{todayClasses.length ? <div className="schedule-list">{todayClasses.map((course) => <TeacherClassCard key={course.id} course={course} openCourse={openCourse} />)}</div> : <EmptyState title="Hoy no tienes clases programadas" message="Consulta tus cursos para ver tu horario semanal." />}<div className="section-heading teacher-courses-heading"><div><h2>Todos mis cursos</h2><p>Selecciona el grupo con el que vas a trabajar.</p></div><span className="result-count">{courses.length} grupos asignados</span></div><div className="course-grid">{courses.map((course) => <StudentCourseCard key={course.id} course={course} student={course.students[0] || "Estudiante"} onClick={() => openCourse(course)} />)}</div></>;
}

function TeacherClassCard({ course, openCourse }: { course: Course; openCourse: (course: Course) => void }) {
  return <article className="schedule-card"><div className="schedule-time"><strong>{course.start}</strong><span /><strong>{course.end}</strong></div><span className={`schedule-accent ${course.color}`} /><div className="schedule-course"><div><span className="schedule-group">{course.group} <i>·</i> {course.room}</span><h3>{course.name}</h3><p><Icon name="users" size={14} /> {course.students.length} estudiantes <span>·</span> {course.days.join(" y ")}</p></div><div className="schedule-actions"><span className="live-chip"><i /> Próxima clase</span><button className="button-primary" onClick={() => openCourse(course)}><Icon name="calendar" size={15} /> Tomar asistencia</button></div></div></article>;
}

function TeacherCourse({ course, tab, setTab, onBack, attendanceDate, setAttendanceDate, attendanceDraft, setAttendanceDraft, onMark, activityDraft, setActivityDraft, onSaveGrades, saved }: { course: Course; tab: Tab; setTab: (tab: Tab) => void; onBack: () => void; attendanceDate: string; setAttendanceDate: (value: string) => void; attendanceDraft: Record<string, AttendanceStatus>; setAttendanceDraft: (value: Record<string, AttendanceStatus>) => void; onMark: () => void; activityDraft: Record<string, string>; setActivityDraft: (value: Record<string, string>) => void; onSaveGrades: () => void; saved: boolean }) {
  return <><button className="back-link" onClick={onBack}><Icon name="back" size={15} /> Volver a mis cursos</button><div className={`detail-banner ${course.color}`}><span className="detail-monogram">{course.code.slice(0, 2)}</span><div><div className="detail-title-line"><h1>{course.name}</h1><span className="course-badge"><i /> En curso</span></div><p>{course.group} <span>·</span> {course.room} <span>·</span> {course.students.length} estudiantes</p></div><div className="detail-banner-side"><span>Horario asignado</span><strong>{course.days.join(" y ")} · {course.start}</strong></div></div><div className="detail-tabs" role="tablist" aria-label="Herramientas del curso">{(["Información", "Asistencia", "Notas"] as Tab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{item === "Información" ? <Icon name="book" size={15} /> : item === "Asistencia" ? <Icon name="calendar" size={15} /> : <Icon name="chart" size={15} />}{item === "Información" ? "Resumen" : item === "Asistencia" ? "Tomar asistencia" : "Calificaciones"}</button>)}</div>{tab === "Información" ? <TeacherOverview course={course} onAttendance={() => setTab("Asistencia")} onGrades={() => setTab("Notas")} /> : tab === "Asistencia" ? <TeacherAttendance course={course} attendanceDate={attendanceDate} setAttendanceDate={setAttendanceDate} attendanceDraft={attendanceDraft} setAttendanceDraft={setAttendanceDraft} onMark={onMark} saved={saved} /> : <TeacherGrades course={course} activityDraft={activityDraft} setActivityDraft={setActivityDraft} onSave={onSaveGrades} saved={saved} />}</>;
}

function TeacherOverview({ course, onAttendance, onGrades }: { course: Course; onAttendance: () => void; onGrades: () => void }) {
  const records = Object.values(course.attendance).flat(); const present = records.filter((item) => item.status === "Presente").length; const today = course.days.includes("Lun");
  return <><div className="teacher-overview-top"><div><span className="eyebrow">TU GRUPO</span><h2>{course.name} <span>{course.group}</span></h2><p><Icon name="calendar" size={15} /> {course.days.join(" y ")} · {course.start}–{course.end} <span>·</span> {course.room}</p></div><div className="overview-actions"><button className="button-secondary" onClick={onGrades}><Icon name="chart" size={15} /> Calificar actividades</button><button className="button-primary" onClick={onAttendance}><Icon name="calendar" size={15} /> Tomar asistencia</button></div></div><div className="detail-summary-grid"><article className="summary-card"><div className="summary-card-head"><span>Estudiantes</span><span className="summary-icon blue"><Icon name="users" size={16} /></span></div><strong className="summary-main">{course.students.length}</strong><span className="summary-sub">Inscritos en {course.group}</span></article><article className="summary-card"><div className="summary-card-head"><span>Asistencias registradas</span><span className="summary-icon mint"><Icon name="check" size={16} /></span></div><strong className="summary-main">{records.length}</strong><span className="summary-sub">{present} presentes en total</span></article><article className="summary-card"><div className="summary-card-head"><span>Actividades del ciclo</span><span className="summary-icon violet"><Icon name="chart" size={16} /></span></div><strong className="summary-main">{course.activities.length}</strong><span className="summary-sub">Una por semana · {course.weeks} semanas</span></article><article className="summary-card"><div className="summary-card-head"><span>Próxima clase</span><span className="summary-icon amber"><Icon name="clock" size={16} /></span></div><strong className="summary-main">{course.start}</strong><span className="summary-sub">{today ? "Hoy" : course.days.join(" y ")} · {course.room}</span></article></div><div className="content-columns"><section className="panel"><div className="panel-heading"><div><h2>Lista del grupo</h2><p>Estudiantes inscritos en este curso</p></div><span className="subtle-pill">{course.students.length} estudiantes</span></div><div className="roster-list">{course.students.map((name, index) => { const info = attendanceSummary(course, name); return <div className="roster-row" key={name}><span className={`roster-avatar avatar-${index % 5}`}>{initials(name)}</span><span className="roster-name"><strong>{name}</strong><small>{course.group}</small></span><span className="roster-attendance"><i className="tiny-progress"><b style={{ width: `${info.percentage}%` }} /></i>{info.percentage}%</span><span className="roster-grade">{info.total} clases</span></div>; })}</div></section><section className="panel"><div className="panel-heading"><div><h2>Plan de actividades</h2><p>Planificación por semana</p></div><Icon name="more" /></div><div className="compact-activities">{course.activities.map((activity) => <div key={activity.week}><span>SEM {String(activity.week).padStart(2, "0")}</span><strong>{activity.name}</strong><small>{course.students.filter((name) => course.activities[activity.week - 1]?.scores?.[name] !== undefined).length}/{course.students.length} calificadas</small></div>)}</div></section></div></>;
}

function TeacherAttendance({ course, attendanceDate, setAttendanceDate, attendanceDraft, setAttendanceDraft, onMark, saved }: { course: Course; attendanceDate: string; setAttendanceDate: (value: string) => void; attendanceDraft: Record<string, AttendanceStatus>; setAttendanceDraft: (value: Record<string, AttendanceStatus>) => void; onMark: () => void; saved: boolean }) {
  return <><div className="teacher-panel-intro"><div><span className="eyebrow">REGISTRO DE CLASE</span><h2>Tomar asistencia</h2><p>Marca el estado de cada estudiante para la sesión de {course.name}.</p></div><label className="date-input">Fecha de clase<input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} /></label></div><section className="panel attendance-taking"><div className="attendance-class-banner"><div className={`summary-icon ${course.color}`}><Icon name="calendar" /></div><div><strong>{course.name} · {course.group}</strong><span>{course.days.join(" y ")} · {course.start}–{course.end} <i>·</i> {course.room}</span></div><span className="subtle-pill">{course.students.length} estudiantes</span></div><div className="taking-heading"><span>ESTUDIANTE</span><span>ESTADO DE ASISTENCIA</span></div>{course.students.map((name, index) => { const summary = attendanceSummary(course, name); const today = summary.records.find((record) => record.date === new Date(`${attendanceDate}T12:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })); const value = attendanceDraft[`${course.id}-${name}`] || today?.status || "Presente"; return <div className="taking-row" key={name}><span className={`roster-avatar avatar-${index % 5}`}>{initials(name)}</span><span className="roster-name"><strong>{name}</strong><small>{course.group}</small></span><div className="attendance-options">{(["Presente", "Tardanza", "Ausente"] as AttendanceStatus[]).map((status) => <button key={status} className={`${value === status ? `selected ${status.toLowerCase()}` : ""}`} onClick={() => setAttendanceDraft({ ...attendanceDraft, [`${course.id}-${name}`]: status })}><i />{status}</button>)}</div></div>; })}<div className="attendance-submit"><span><Icon name="clock" size={15} /> Los cambios se guardan para esta fecha.</span><div>{saved && <span className="saved-message"><Icon name="check" size={14} /> Asistencia guardada</span>}<button className="button-primary" onClick={onMark}><Icon name="check" size={16} /> Guardar asistencia</button></div></div></section></>;
}

function TeacherGrades({ course, activityDraft, setActivityDraft, onSave, saved }: { course: Course; activityDraft: Record<string, string>; setActivityDraft: (value: Record<string, string>) => void; onSave: () => void; saved: boolean }) {
  const [selectedActivity, setSelectedActivity] = useState(0); const activity = course.activities[selectedActivity];
  return <><div className="teacher-panel-intro"><div><span className="eyebrow">EVALUACIÓN DEL CURSO</span><h2>Calificaciones</h2><p>Registra las notas de tus estudiantes para cada actividad semanal.</p></div><span className="subtle-pill">{course.activities.length} actividades · máximo 20 puntos</span></div><div className="grade-workspace"><section className="panel activity-selector-panel"><div className="panel-heading"><div><h2>Actividades</h2><p>Plan del ciclo</p></div></div><div className="activity-selector">{course.activities.map((item, index) => <button key={item.week} className={selectedActivity === index ? "selected" : ""} onClick={() => setSelectedActivity(index)}><span className="grade-number">{String(index + 1).padStart(2, "0")}</span><span><small>SEMANA {item.week}</small><strong>{item.name}</strong></span><Icon name="arrow" size={16} /></button>)}</div></section><section className="panel grade-entry-panel"><div className="panel-heading"><div><h2>{activity.name}</h2><p>Semana {activity.week} · máximo {activity.max} puntos</p></div><span className="subtle-pill">{course.students.length} estudiantes</span></div><div className="grade-entry-list">{course.students.map((name, index) => { const currentValue = activityDraft[`${course.id}-${selectedActivity}-${name}`] ?? (activity.scores?.[name] === undefined ? "" : String(activity.scores[name])); return <label className="grade-entry-row" key={name}><span className={`roster-avatar avatar-${index % 5}`}>{initials(name)}</span><span className="roster-name"><strong>{name}</strong><small>{course.group}</small></span><div className="score-input-wrap"><input type="number" min="0" max={activity.max} step="0.5" placeholder="—" value={currentValue} onChange={(event) => setActivityDraft({ ...activityDraft, [`${course.id}-${selectedActivity}-${name}`]: event.target.value })} /><span>/ {activity.max}</span></div></label>; })}</div><div className="attendance-submit"><span><Icon name="chart" size={15} /> Las notas se reflejan en el promedio del curso.</span><div>{saved && <span className="saved-message"><Icon name="check" size={14} /> Notas guardadas</span>}<button className="button-primary" onClick={onSave}>Guardar calificaciones</button></div></div></section></div></>;
}

function AdminHome({ courses, students, teachers, cycles, groups, onNew, onEdit, onToggleCourse, onDeleteCourse, onToggleSchedule, onDeleteSchedule, onSavePerson, onTogglePerson, onDeletePerson, onSaveCycle, onToggleCycle, onDeleteCycle, onSaveGroup, onToggleGroup, onDeleteGroup }: {
  courses: Course[]; students: DirectoryPerson[]; teachers: DirectoryPerson[]; cycles: AdminCycle[]; groups: AdminGroup[];
  onNew: () => void; onEdit: (course: Course) => void; onToggleCourse: (id: string) => void; onDeleteCourse: (id: string) => void; onToggleSchedule: (id: string) => void; onDeleteSchedule: (id: string, day: string) => void;
  onSavePerson: (kind: "Estudiantes" | "Docentes", person: DirectoryPerson, previousName?: string) => void; onTogglePerson: (kind: "Estudiantes" | "Docentes", id: string) => void;
  onDeletePerson: (kind: "Estudiantes" | "Docentes", id: string) => void; onSaveCycle: (cycle: AdminCycle) => void; onToggleCycle: (id: string) => void; onDeleteCycle: (id: string) => void;
  onSaveGroup: (group: AdminGroup, previousName?: string) => void; onToggleGroup: (id: string) => void; onDeleteGroup: (id: string) => void;
}) {
  const [section, setSection] = useState<AdminSection>("Resumen");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [editor, setEditor] = useState<AdminSection | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", detail: "", start: "2027-03-01", end: "2027-04-30", weeks: 4, level: "Preparación preuniversitaria", channelId: "canal-1", phone: "", document: "", birthDate: "", simulationScore: "" });
  const activeCourseCount = courses.filter((item) => item.active).length;
  const activeStudentCount = students.filter((item) => item.active).length;
  const selectedChannel = channelSubjects.find((item) => item.id === selectedChannelId) || null;
  const selectedStudent = students.find((item) => item.id === selectedStudentId) || null;
  const channelStudents = students.filter((item) => item.channelId === selectedChannelId);
  const subjectCourse = selectedSubject && selectedStudent ? courses.find((course) => course.name.toLocaleLowerCase("es") === selectedSubject.toLocaleLowerCase("es") && course.students.includes(selectedStudent.name)) : undefined;
  const scheduleRows = courses.flatMap((course) => (course.days.length ? course.days : ["Sin días"]).map((day) => ({ course, day })));
  const sections: { name: AdminSection; description: string; icon: string; count: number }[] = [
    { name: "Resumen", description: "Vista general de la academia", icon: "grid", count: 0 },
    { name: "Estudiantes", description: "Gestiona cuentas y matrículas", icon: "users", count: students.length },
    { name: "Docentes", description: "Gestiona docentes y especialidades", icon: "users", count: teachers.length },
    { name: "Cursos", description: "Administra cursos y actividades", icon: "book", count: courses.length },
    { name: "Ciclos", description: "Configura periodos académicos", icon: "calendar", count: cycles.length },
    { name: "Grupos", description: "Organiza secciones y niveles", icon: "grid", count: groups.length },
    { name: "Horarios", description: "Organiza días, horas y aulas", icon: "clock", count: scheduleRows.length },
  ];
  function openEditor(kind: AdminSection, value?: DirectoryPerson | AdminCycle | AdminGroup) {
    setEditor(kind); setEditing(value ? { id: value.id, name: value.name } : null);
    if (kind === "Estudiantes" || kind === "Docentes") {
      const person = value as DirectoryPerson | undefined;
      setForm({ name: person?.name || "", email: person?.email || "", detail: person?.detail || "Preparación preuniversitaria", start: "2027-03-01", end: "2027-04-30", weeks: 4, level: "Preparación preuniversitaria", channelId: person?.channelId || selectedChannelId || "canal-1", phone: person?.phone || "", document: person?.document || "", birthDate: person?.birthDate || "", simulationScore: person?.simulationScore === undefined ? "" : String(person.simulationScore) });
    } else if (kind === "Ciclos") {
      const cycle = value as AdminCycle | undefined;
      setForm({ name: cycle?.name || "", email: "", detail: "", start: cycle?.start || "2027-03-01", end: cycle?.end || "2027-04-30", weeks: cycle?.weeks || 4, level: "Preparación preuniversitaria", channelId: selectedChannelId || "canal-1", phone: "", document: "", birthDate: "", simulationScore: "" });
    } else {
      const group = value as AdminGroup | undefined;
      setForm({ name: group?.name || "", email: "", detail: "", start: "2027-03-01", end: "2027-04-30", weeks: 4, level: group?.level || "Preparación preuniversitaria", channelId: selectedChannelId || "canal-1", phone: "", document: "", birthDate: "", simulationScore: "" });
    }
  }
  function saveEntity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = editing?.id || `${section.toLowerCase()}-${Date.now()}`;
    if (editor === "Estudiantes" || editor === "Docentes") {
      const previous = (editor === "Estudiantes" ? students : teachers).find((item) => item.id === id);
      const record: DirectoryPerson = { id, name: form.name.trim(), email: form.email.trim(), detail: form.detail.trim(), active: previous?.active ?? true, ...(editor === "Estudiantes" ? { channelId: form.channelId, phone: form.phone.trim(), document: form.document.trim(), birthDate: form.birthDate, simulationScore: form.simulationScore === "" ? undefined : Number(form.simulationScore) } : {}) };
      onSavePerson(editor, record, editing?.name);
    } else if (editor === "Ciclos") {
      const record: AdminCycle = { id, name: form.name.trim(), start: form.start, end: form.end, weeks: form.weeks, active: cycles.find((item) => item.id === id)?.active ?? true };
      onSaveCycle(record);
    } else if (editor === "Grupos") {
      const record: AdminGroup = { id, name: form.name.trim().toUpperCase(), level: form.level.trim(), active: groups.find((item) => item.id === id)?.active ?? true };
      onSaveGroup(record, editing?.name);
    }
    setEditor(null);
  }
  const activeTitle = section === "Resumen" ? "Panel de administración" : section;
  const description = sections.find((item) => item.name === section)?.description || "";
  const canCreate = section !== "Resumen";
  return <>
    <PageHeading eyebrow="CENTRO DE CONTROL" title={activeTitle} description={description} action={canCreate && section !== "Horarios" ? <button className="button-primary" onClick={section === "Cursos" ? onNew : () => openEditor(section)}><Icon name="plus" /> Agregar {section === "Estudiantes" ? "estudiante" : section === "Docentes" ? "docente" : section === "Cursos" ? "curso" : section === "Ciclos" ? "ciclo" : "grupo"}</button> : section === "Horarios" ? <button className="button-primary" onClick={onNew}><Icon name="plus" /> Agregar horario</button> : undefined} />
    <div className="admin-layout"><nav className="admin-section-nav" aria-label="Secciones de administración">{sections.map((item) => <button key={item.name} className={section === item.name ? "selected" : ""} onClick={() => setSection(item.name)}><Icon name={item.icon} size={16} /><span>{item.name}</span>{item.count > 0 && <small>{item.count}</small>}</button>)}</nav><section className="admin-section-content">
      {section === "Resumen" && <>
        {!selectedChannel ? <>
          <div className="channel-intro"><div><span className="eyebrow">ADMISIÓN PREUNIVERSITARIA</span><h2>Canales académicos</h2><p>Selecciona un canal para consultar a sus estudiantes y el avance por área.</p></div><span className="channel-total"><strong>{String(activeStudentCount).padStart(2, "0")}</strong><small>estudiantes activos</small></span></div>
          <div className="channel-grid">{channelSubjects.map((channel, index) => { const count = students.filter((item) => item.channelId === channel.id && item.active).length; return <button key={channel.id} className={`channel-card ${channel.color}`} onClick={() => { setSelectedChannelId(channel.id); setSelectedStudentId(null); setSelectedSubject(null); }}><span className="channel-card-top"><span className="channel-number">0{index + 1}</span><span className="channel-student-count"><Icon name="users" size={15} />{count}</span></span><span className="channel-card-title">Canal {index + 1}</span><strong>{channel.name}</strong><span className="channel-card-bottom"><span>{channel.subjects.length} áreas académicas</span><Icon name="arrow" size={17} /></span><span className="channel-decoration" /></button>; })}</div>
          <section className="panel admin-note"><span className="summary-icon violet"><Icon name="settings" /></span><div><strong>Gestión por canal</strong><p>Desde cada canal puedes abrir el perfil de un estudiante, revisar sus datos personales, consultar asistencia por área y ver sus puntajes en exámenes simulacro.</p></div></section>
        </> : <>
          <button className="back-link" onClick={() => { setSelectedStudentId(null); setSelectedSubject(null); setSelectedChannelId(null); }}><Icon name="back" size={15} /> Todos los canales</button>
          {!selectedStudent ? <>
            <div className="channel-detail-heading"><div className={`channel-detail-mark ${selectedChannel.color}`}>0{channelSubjects.findIndex((item) => item.id === selectedChannel.id) + 1}</div><div><span className="eyebrow">CANAL {channelSubjects.findIndex((item) => item.id === selectedChannel.id) + 1}</span><h2>{selectedChannel.name}</h2><p>{selectedChannel.subjects.length} áreas de preparación · {channelStudents.filter((item) => item.active).length} estudiantes activos</p></div></div>
            <div className="channel-roster">{channelStudents.length ? channelStudents.map((person, index) => <button className="channel-student-row" key={person.id} onClick={() => { setSelectedStudentId(person.id); setSelectedSubject(null); }}><span className={`roster-avatar avatar-${index % 5}`}>{initials(person.name)}</span><span className="channel-student-copy"><strong>{person.name}</strong><small>{person.email} · {person.detail}</small></span><StatusPill active={person.active} /><Icon name="arrow" size={17} /></button>) : <EmptyState title="Aún no hay estudiantes en este canal" message="Edita el perfil de un estudiante para asignarlo a este canal." action={<button className="button-primary" onClick={() => setSection("Estudiantes")}>Gestionar estudiantes</button>} />}</div>
            <section className="channel-subject-preview"><div className="panel-heading"><div><h2>Áreas del canal</h2><p>Materias que corresponden a esta línea de preparación</p></div></div><div className="subject-chip-list">{selectedChannel.subjects.map((subject) => <span key={subject}>{subject}</span>)}</div></section>
          </> : <>
            <div className="student-detail-heading"><span className="student-detail-avatar">{initials(selectedStudent.name)}</span><div><span className="eyebrow">PERFIL DEL ESTUDIANTE</span><h2>{selectedStudent.name}</h2><p>{selectedChannel.name}</p></div><button className="button-secondary" onClick={() => openEditor("Estudiantes", selectedStudent)}>Editar datos</button></div>
            {!selectedSubject ? <div className="student-detail-grid"><section className="panel student-personal-card"><div className="panel-heading"><div><h2>Datos personales</h2><p>Información de matrícula</p></div></div><dl className="personal-data-list"><div><dt>Correo electrónico</dt><dd>{selectedStudent.email || "Sin registrar"}</dd></div><div><dt>Teléfono</dt><dd>{selectedStudent.phone || "Sin registrar"}</dd></div><div><dt>DNI / documento</dt><dd>{selectedStudent.document || "Sin registrar"}</dd></div><div><dt>Fecha de nacimiento</dt><dd>{selectedStudent.birthDate || "Sin registrar"}</dd></div><div><dt>Estado</dt><dd><StatusPill active={selectedStudent.active} /></dd></div></dl><div className="simulation-score"><span><Icon name="chart" size={17} /> Último examen simulacro</span><strong>{selectedStudent.simulationScore ?? "—"}<small>{selectedStudent.simulationScore === undefined ? "Sin puntaje" : " / 20"}</small></strong></div></section><section className="panel student-subject-card"><div className="panel-heading"><div><h2>Áreas y cursos</h2><p>Selecciona un área para revisar su asistencia.</p></div><span className="subtle-pill">{selectedChannel.subjects.length} áreas</span></div><div className="student-subject-list">{selectedChannel.subjects.map((subject) => { const assigned = courses.some((course) => course.name.toLocaleLowerCase("es") === subject.toLocaleLowerCase("es") && course.students.includes(selectedStudent.name)); return <button key={subject} onClick={() => setSelectedSubject(subject)}><span className="subject-mini-icon"><Icon name="book" size={15} /></span><span><strong>{subject}</strong><small>{assigned ? "Ver registro de asistencia" : "Área del canal"}</small></span><Icon name="arrow" size={16} /></button>; })}</div></section></div> : <>
              <button className="back-link subject-back" onClick={() => setSelectedSubject(null)}><Icon name="back" size={15} /> Perfil de {selectedStudent.name}</button><div className="panel subject-attendance-panel"><div className="panel-heading"><div><span className="eyebrow">ASISTENCIA POR ÁREA</span><h2>{selectedSubject}</h2><p>{subjectCourse ? `${subjectCourse.group} · ${subjectCourse.teacher}` : "Este curso todavía no tiene un registro de asistencia asignado."}</p></div>{subjectCourse && <span className="attendance-percent">{attendanceSummary(subjectCourse, selectedStudent.name).percentage}%<small>asistencia</small></span>}</div>{subjectCourse ? <EntityTable headers={["FECHA", "ESTADO"]} empty="Aún no hay asistencias registradas." rows={(subjectCourse.attendance[selectedStudent.name] || []).map((record, index) => <tr key={`${record.date}-${index}`}><td><strong>{record.date}</strong></td><td><StatusPill active={record.status === "Presente"} />{record.status !== "Presente" && <span className={`attendance-status-text ${record.status === "Tardanza" ? "late" : "absent"}`}>{record.status}</span>}</td></tr>)} /> : <div className="empty-inline">Las asistencias aparecerán aquí cuando se habilite el registro para esta área.</div>}</div>
        </>}
      </>}
      {(section === "Estudiantes" || section === "Docentes") && <DirectoryTable title={section} records={section === "Estudiantes" ? students : teachers} onEdit={(record) => openEditor(section, record)} onToggle={(record) => onTogglePerson(section, record.id)} onDelete={(record) => { if (window.confirm(`¿Eliminar a ${record.name}? Esta acción no se puede deshacer.`)) onDeletePerson(section, record.id); }} />}
      {section === "Cursos" && <div className="admin-course-list">{courses.length ? courses.map((course) => <article className={`admin-course-row ${course.active ? "" : "inactive"}`} key={course.id}><span className={`admin-course-icon ${course.color}`}>{course.code.slice(0, 2)}</span><div className="admin-course-copy"><span>{course.group} <i>·</i> {course.room}</span><strong>{course.name}</strong><small>{course.teacher}</small></div><div className="admin-course-plan"><span>PLAN DEL CICLO</span><strong>{course.weeks} semanas</strong><small>{course.activities.length} actividades</small></div><div className="admin-course-enrollment"><span>ESTADO</span><strong>{course.active ? "Activo" : "Inactivo"}</strong><small>{course.students.length} estudiantes</small></div><div className="admin-row-actions"><button className="button-secondary edit-button" onClick={() => onEdit(course)}>Editar</button><button className={`status-action ${course.active ? "deactivate" : "activate"}`} onClick={() => onToggleCourse(course.id)}>{course.active ? "Desactivar" : "Activar"}</button><button className="delete-action" aria-label="Eliminar curso" onClick={() => { if (window.confirm(`¿Eliminar el curso ${course.name} · ${course.group}? Esta acción no se puede deshacer.`)) onDeleteCourse(course.id); }}>Eliminar</button></div></article>) : <EmptyState title="Todavía no hay cursos" message="Crea el primer curso para organizar horarios, docentes y estudiantes." action={<button className="button-primary" onClick={onNew}><Icon name="plus" /> Crear curso</button>} />}</div>}
      {section === "Ciclos" && <EntityTable headers={["CICLO", "FECHAS", "DURACIÓN", "ESTADO", "ACCIONES"]} empty="Aún no hay ciclos registrados." rows={cycles.map((cycle) => <tr key={cycle.id}><td><strong>{cycle.name}</strong></td><td>{cycle.start} – {cycle.end}</td><td>{cycle.weeks} semanas</td><td><StatusPill active={cycle.active} /></td><td><RowActions active={cycle.active} onEdit={() => openEditor("Ciclos", cycle)} onToggle={() => onToggleCycle(cycle.id)} onDelete={() => { if (window.confirm(`¿Eliminar ${cycle.name}?`)) onDeleteCycle(cycle.id); }} /></td></tr>)} />}
      {section === "Grupos" && <EntityTable headers={["GRUPO", "NIVEL", "CURSOS", "ESTADO", "ACCIONES"]} empty="Aún no hay grupos registrados." rows={groups.map((group) => <tr key={group.id}><td><strong>{group.name}</strong></td><td>{group.level}</td><td>{courses.filter((course) => course.group === group.name).length}</td><td><StatusPill active={group.active} /></td><td><RowActions active={group.active} onEdit={() => openEditor("Grupos", group)} onToggle={() => onToggleGroup(group.id)} onDelete={() => { if (window.confirm(`¿Eliminar el grupo ${group.name}?`)) onDeleteGroup(group.id); }} /></td></tr>)} />}
      {section === "Horarios" && <EntityTable headers={["CURSO / GRUPO", "DOCENTE", "DÍA", "HORA", "AULA", "ESTADO", "ACCIONES"]} empty="Aún no hay horarios asignados." rows={scheduleRows.map(({ course, day }, index) => <tr key={`${course.id}-${day}-${index}`}><td><strong>{course.name}</strong><small className="table-subtext">{course.group}</small></td><td>{course.teacher}</td><td>{day}</td><td>{course.start} – {course.end}</td><td>{course.room}</td><td><StatusPill active={course.scheduleActive !== false} /></td><td><RowActions active={course.scheduleActive !== false} onEdit={() => onEdit(course)} onToggle={() => onToggleSchedule(course.id)} onDelete={() => { if (window.confirm(`¿Eliminar la clase de ${course.name} para el día ${day}?`)) onDeleteSchedule(course.id, day); }} /></td></tr>)} />}
    </section></div>
    {editor && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(null); }}><form className="course-modal admin-entity-modal" onSubmit={saveEntity}><div className="modal-heading"><div><span className="eyebrow">ADMINISTRACIÓN</span><h2>{editing ? `Editar ${singular(section)}` : `Agregar ${singular(section)}`}</h2><p>Completa los datos y guarda los cambios.</p></div><button type="button" className="icon-button" onClick={() => setEditor(null)} aria-label="Cerrar"><Icon name="close" /></button></div><div className="form-grid"><label className="form-field field-wide">{editor === "Ciclos" ? "Nombre del ciclo" : editor === "Grupos" ? "Nombre del grupo" : "Nombre completo"}<input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={editor === "Grupos" ? "Ej. MAT-A" : "Nombre"} /></label>{(editor === "Estudiantes" || editor === "Docentes") && <><label className="form-field">Correo electrónico<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nombre@althea.edu" /></label><label className="form-field">{editor === "Estudiantes" ? "Grado y nivel" : "Especialidad"}<input required value={form.detail} onChange={(event) => setForm({ ...form, detail: event.target.value })} placeholder={editor === "Estudiantes" ? "Secundaria · 1.º año" : "Área de enseñanza"} /></label></>}{editor === "Grupos" && <label className="form-field field-wide">Nivel o grado<input required value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} /></label>}{editor === "Ciclos" && <><label className="form-field">Fecha de inicio<input type="date" required value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} /></label><label className="form-field">Fecha de fin<input type="date" required value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} /></label><label className="form-field">Duración<select value={form.weeks} onChange={(event) => setForm({ ...form, weeks: Number(event.target.value) })}>{[4, 8, 12, 16, 20].map((weeks) => <option key={weeks} value={weeks}>{weeks} semanas</option>)}</select></label></>}</div><div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className="button-primary"><Icon name="check" size={16} /> Guardar {singular(section)}</button></div></form></div>}
  </>;
}

function singular(section: AdminSection) { return section === "Estudiantes" ? "estudiante" : section === "Docentes" ? "docente" : section === "Ciclos" ? "ciclo" : "grupo"; }
function StatusPill({ active }: { active: boolean }) { return <span className={`admin-status ${active ? "active" : "inactive"}`}><i />{active ? "Activo" : "Inactivo"}</span>; }
function RowActions({ active, onEdit, onToggle, onDelete }: { active: boolean; onEdit: () => void; onToggle: () => void; onDelete?: () => void }) { return <div className="admin-row-actions"><button className="button-secondary edit-button" onClick={onEdit}>Editar</button><button className={`status-action ${active ? "deactivate" : "activate"}`} onClick={onToggle}>{active ? "Desactivar" : "Activar"}</button>{onDelete && <button className="delete-action" onClick={onDelete}>Eliminar</button>}</div>; }
function DirectoryTable({ title, records, onEdit, onToggle, onDelete }: { title: string; records: DirectoryPerson[]; onEdit: (record: DirectoryPerson) => void; onToggle: (record: DirectoryPerson) => void; onDelete: (record: DirectoryPerson) => void }) {
  return <EntityTable headers={["PERSONA", "CORREO", title === "Estudiantes" ? "CANAL" : "ESPECIALIDAD", "ESTADO", "ACCIONES"]} empty={`Aún no hay ${title.toLowerCase()} registrados.`} rows={records.map((record) => <tr key={record.id}><td><div className="directory-name"><span className="roster-avatar">{initials(record.name)}</span><strong>{record.name}</strong></div></td><td>{record.email}</td><td>{title === "Estudiantes" ? `Canal ${Number(record.channelId?.replace("canal-", "") || 0) || "sin asignar"}` : record.detail}</td><td><StatusPill active={record.active} /></td><td><RowActions active={record.active} onEdit={() => onEdit(record)} onToggle={() => onToggle(record)} onDelete={() => onDelete(record)} /></td></tr>)} />;
}
function EntityTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[]; empty: string }) {
  return <div className="entity-table-wrap">{rows.length ? <table className="entity-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows}</tbody></table> : <div className="empty-inline">{empty}</div>}</div>;
}

function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="book" size={22} /></span><h3>{title}</h3><p>{message}</p>{action}</div>;
}
