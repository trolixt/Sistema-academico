(function () {
  "use strict";

  const STORAGE_KEY = "althea-academy-demo-v1";
  const SESSION_KEY = "althea-academy-session";

  const roles = {
    admin: { label: "Administrador", name: "Alejandro Torres", username: "admin" },
    staff: { label: "Personal administrativo", name: "Lucía Mendoza", username: "secretaria" },
    teacher: { label: "Docente", name: "Carlos Ramírez", username: "docente", teacherId: 1 },
    student: { label: "Estudiante", name: "Mariana Salazar", username: "estudiante", studentId: 1 },
  };

  const menu = {
    admin: [
      ["dashboard", "Dashboard", "home"], ["users", "Usuarios", "users"], ["students", "Estudiantes", "student"],
      ["teachers", "Docentes", "teacher"], ["courses", "Cursos", "book"], ["cycles", "Ciclos académicos", "calendar"],
      ["groups", "Grupos", "layers"], ["schedules", "Horarios", "clock"], ["enrollments", "Matrículas", "file"],
      ["payments", "Pagos", "card"], ["attendance", "Asistencia", "check"], ["grades", "Notas", "chart"],
      ["settings", "Configuración", "settings"],
    ],
    staff: [
      ["dashboard", "Dashboard", "home"], ["students", "Estudiantes", "student"], ["enrollments", "Matrículas", "file"],
      ["payments", "Pagos", "card"], ["courses", "Cursos", "book"], ["groups", "Grupos", "layers"],
      ["schedules", "Horarios", "clock"], ["queries", "Consultas", "search"],
    ],
    teacher: [
      ["dashboard", "Dashboard", "home"], ["my-groups", "Mis grupos", "layers"], ["my-schedule", "Mi horario", "clock"],
      ["attendance", "Asistencia", "check"], ["evaluations", "Evaluaciones", "clipboard"], ["grades", "Notas", "chart"],
    ],
    student: [
      ["dashboard", "Inicio", "home"], ["my-enrollment", "Mi matrícula", "file"], ["my-courses", "Mis cursos", "book"],
      ["my-schedule", "Mi horario", "clock"], ["my-attendance", "Mi asistencia", "check"],
      ["my-grades", "Mis notas", "chart"], ["my-payments", "Mis pagos", "card"],
    ],
  };

  const iconPaths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    student: '<path d="m2 10 10-5 10 5-10 5L2 10Z"/><path d="M6 12.2V17c3 2.5 9 2.5 12 0v-4.8M22 10v6"/>',
    teacher: '<circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2.5a6.5 6.5 0 0 1 13 0V21M9 14.8V18l3 2 3-2v-3.2"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M4 19.5V6.5M8 8h8"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h2"/>',
    check: '<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="10"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.4v-4h.1A1.7 1.7 0 0 0 4.2 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1v-.1h4v.1a1.7 1.7 0 0 0 1 1.7 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7 1Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.file}</svg>`;
  }
  const money = (n) => `S/ ${Number(n).toFixed(2)}`;
  const initials = (name) => name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  const byId = (list, id) => list.find((x) => Number(x.id) === Number(id));
  const badge = (status) => {
    const s = String(status);
    const type = /Activo|Activa|Pagado|Publicada|Presente|Abierta/i.test(s) ? "success" :
      /Pendiente|Borrador|Tardanza/i.test(s) ? "warning" :
      /Inactivo|Anulado|Ausente|Cerrada/i.test(s) ? "danger" : "info";
    return `<span class="badge badge-${type}">${s}</span>`;
  };

  function seedData() {
    const first = ["Mariana", "Diego", "Valeria", "Sebastián", "Camila", "Mateo", "Luciana", "Gabriel", "Daniela", "Thiago", "Adriana", "Nicolás", "Sofía", "Joaquín", "Renata", "Santiago", "Antonella", "Bruno", "Mía", "Emiliano"];
    const last = ["Salazar", "Quispe", "Mendoza", "Rojas", "Torres", "Castro", "Vargas", "Flores", "Paredes", "Reyes", "Cruz", "García", "Morales", "Soto", "Campos", "Navarro", "Ruiz", "Luna", "Medina", "Peña"];
    const students = first.map((name, i) => ({
      id: i + 1, code: `EST-${String(i + 1).padStart(4, "0")}`, dni: `${72845100 + i}`,
      firstName: name, lastName: last[i], phone: `9${String(4125600 + i * 173).padStart(8, "0")}`,
      email: `${name.toLowerCase()}.${last[i].toLowerCase()}@correo.pe`, status: i === 14 || i === 18 ? "Inactivo" : "Activo",
    }));
    const teachers = [
      { id: 1, name: "Carlos Ramírez", specialty: "Matemática", email: "carlos.ramirez@althea.edu", status: "Activo" },
      { id: 2, name: "Andrea Ponce", specialty: "Ciencias", email: "andrea.ponce@althea.edu", status: "Activo" },
      { id: 3, name: "Miguel Herrera", specialty: "Física", email: "miguel.herrera@althea.edu", status: "Activo" },
      { id: 4, name: "Patricia León", specialty: "Comunicación", email: "patricia.leon@althea.edu", status: "Activo" },
      { id: 5, name: "Renzo Vidal", specialty: "Inglés", email: "renzo.vidal@althea.edu", status: "Inactivo" },
    ];
    const courseNames = ["Matemática", "Física", "Química", "Comunicación", "Biología", "Inglés", "Razonamiento Verbal", "Razonamiento Matemático"];
    const courses = courseNames.map((name, i) => ({ id: i + 1, code: `CUR-${String(i + 1).padStart(3, "0")}`, name, hours: i < 4 ? 4 : 3, status: i === 7 ? "Inactivo" : "Activo" }));
    const cycles = [
      { id: 1, name: "Ciclo Verano 2027", start: "2027-01-06", end: "2027-02-28", status: "Finalizado" },
      { id: 2, name: "Ciclo I 2027", start: "2027-03-01", end: "2027-07-15", status: "Activo" },
      { id: 3, name: "Ciclo II 2027", start: "2027-08-01", end: "2027-12-15", status: "Planificado" },
    ];
    const groupDefs = [
      [1, "MAT-A", 1, 28, "Aula 101", "Lun y Mié · 08:00-10:00"], [1, "MAT-B", 1, 25, "Aula 102", "Mar y Jue · 16:00-18:00"],
      [2, "FIS-A", 3, 24, "Aula 202", "Mié y Vie · 10:00-12:00"], [3, "QUI-A", 2, 22, "Lab. 01", "Mar y Jue · 10:00-12:00"],
      [4, "COM-A", 4, 30, "Aula 104", "Lun y Vie · 14:00-16:00"], [5, "BIO-A", 2, 24, "Lab. 02", "Sáb · 08:00-11:00"],
      [6, "ING-A", 5, 20, "Aula 204", "Mar y Jue · 18:00-19:30"], [7, "RV-A", 4, 28, "Aula 103", "Sáb · 11:00-14:00"],
      [8, "RM-A", 1, 26, "Aula 201", "Vie · 16:00-19:00"], [2, "FIS-B", 3, 25, "Aula 203", "Lun y Mié · 16:00-18:00"],
    ];
    const groups = groupDefs.map((g, i) => ({ id: i + 1, courseId: g[0], code: g[1], teacherId: g[2], capacity: g[3], room: g[4], schedule: g[5], cycleId: 2, status: i === 6 ? "Inactivo" : "Activo" }));
    const schedules = groups.map((g, i) => ({ id: i + 1, groupId: g.id, day: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][i % 6], start: i % 2 ? "16:00" : "08:00", end: i % 2 ? "18:00" : "10:00", room: g.room }));
    const enrollments = students.map((s, i) => ({ id: i + 1, code: `MAT-2027-${String(i + 1).padStart(4, "0")}`, studentId: s.id, groupId: (i % 10) + 1, cycleId: 2, date: `2027-03-${String((i % 18) + 1).padStart(2, "0")}`, status: i === 14 ? "Inactiva" : "Activa" }));
    const concepts = ["Matrícula", "Mensualidad 1", "Mensualidad 2"];
    const payments = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1, enrollmentId: (i % 20) + 1, concept: concepts[i % 3], amount: 150,
      date: i > 24 ? "" : `2027-03-${String((i % 23) + 1).padStart(2, "0")}`,
      method: ["Tarjeta", "Yape", "Efectivo", "Transferencia"][i % 4], status: i > 24 ? "Pendiente" : i === 7 ? "Anulado" : "Pagado",
    }));
    // Give the demo student four visible courses.
    [2, 3, 4].forEach((groupId, idx) => enrollments.push({ id: 21 + idx, code: `MAT-2027-00${21 + idx}`, studentId: 1, groupId, cycleId: 2, date: "2027-03-01", status: "Activa" }));
    const attendance = [];
    [1, 2, 3, 4].forEach((groupId) => {
      ["2027-03-08", "2027-03-10", "2027-03-15", "2027-03-17"].forEach((date, d) => {
        students.slice(0, 10).forEach((s, i) => attendance.push({ id: attendance.length + 1, groupId, studentId: s.id, date, status: (i + d) % 9 === 0 ? "Ausente" : (i + d) % 6 === 0 ? "Tardanza" : "Presente", closed: d < 3 }));
      });
    });
    const evaluations = [
      { id: 1, groupId: 1, name: "Examen 01", date: "2027-03-15", status: "Publicada" },
      { id: 2, groupId: 1, name: "Examen 02", date: "2027-03-22", status: "Publicada" },
      { id: 3, groupId: 1, name: "Práctica Calificada 01", date: "2027-03-29", status: "Publicada" },
      { id: 4, groupId: 1, name: "Simulacro 01", date: "2027-04-05", status: "Borrador" },
      { id: 5, groupId: 2, name: "Examen Final", date: "2027-04-12", status: "Borrador" },
      { id: 6, groupId: 9, name: "Práctica 01", date: "2027-03-18", status: "Publicada" },
    ];
    const scores = [];
    evaluations.forEach((ev, e) => students.slice(0, 12).forEach((s, i) => scores.push({ evaluationId: ev.id, studentId: s.id, value: Math.min(20, 13 + ((i + e * 2) % 7)) })));
    [15, 17, 18].forEach((value, index) => {
      const score = scores.find((item) => item.evaluationId === index + 1 && item.studentId === 1);
      if (score) score.value = value;
    });
    const users = [
      { id: 1, username: "admin", name: "Alejandro Torres", role: "Administrador", email: "admin@althea.edu", status: "Activo" },
      { id: 2, username: "secretaria", name: "Lucía Mendoza", role: "Administrativo", email: "lucia@althea.edu", status: "Activo" },
      { id: 3, username: "docente", name: "Carlos Ramírez", role: "Docente", email: "carlos@althea.edu", status: "Activo" },
      { id: 4, username: "estudiante", name: "Mariana Salazar", role: "Estudiante", email: "mariana@correo.pe", status: "Activo" },
      { id: 5, username: "apoyo", name: "Rosa Fuentes", role: "Administrativo", email: "rosa@althea.edu", status: "Inactivo" },
    ];
    return { students, teachers, courses, cycles, groups, schedules, enrollments, payments, attendance, evaluations, scores, users };
  }

  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedData(); } catch (_) { return seedData(); }
  }
  let db = loadData();
  let session = sessionStorage.getItem(SESSION_KEY) || "";
  let currentView = "dashboard";
  let viewParams = {};

  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
  function roleData() { return roles[session]; }
  function showToast(message, type) {
    const el = document.getElementById("toast");
    el.textContent = message; el.className = `toast show${type ? ` ${type}` : ""}`;
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => { el.className = "toast"; }, 2600);
  }
  function dateLabel(value) {
    if (!value) return "—";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  function courseForGroup(groupId) { const g = byId(db.groups, groupId); return g ? byId(db.courses, g.courseId) : null; }
  function studentName(id) { const s = byId(db.students, id); return s ? `${s.firstName} ${s.lastName}` : "Sin asignar"; }
  function teacherName(id) { return byId(db.teachers, id)?.name || "Sin asignar"; }
  function enrollmentStudent(payment) { const e = byId(db.enrollments, payment.enrollmentId); return e ? studentName(e.studentId) : "—"; }

  function renderLogin() {
    document.getElementById("app").innerHTML = `
      <main class="login-page">
        <section class="login-visual">
          <div class="brand"><span class="brand-mark">A</span> Althea</div>
          <div class="login-copy">
            <span class="login-kicker">Gestión académica inteligente</span>
            <h1>Todo tu centro educativo, en un solo lugar.</h1>
            <p>Organiza estudiantes, matrículas, clases y finanzas con una experiencia clara para cada integrante de tu academia.</p>
          </div>
          <div class="login-foot">Prototipo funcional · Ciclo académico 2027</div>
        </section>
        <section class="login-panel">
          <div class="login-box">
            <div class="brand mobile-brand"><span class="brand-mark">A</span> Althea</div>
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales para acceder al sistema.</p>
            <div class="quick-users" aria-label="Usuarios de prueba">
              <button class="quick-user" data-quick="admin">Administrador</button>
              <button class="quick-user" data-quick="secretaria">Administrativo</button>
              <button class="quick-user" data-quick="docente">Docente</button>
              <button class="quick-user" data-quick="estudiante">Estudiante</button>
            </div>
            <form id="login-form">
              <div class="field"><label for="login-user">Usuario</label><input id="login-user" name="username" autocomplete="username" placeholder="Ingresa tu usuario" required /></div>
              <div class="field"><label for="login-pass">Contraseña</label><input id="login-pass" name="password" type="password" autocomplete="current-password" placeholder="Ingresa tu contraseña" required /></div>
              <button class="btn btn-primary btn-block" type="submit">Iniciar sesión</button>
            </form>
            <div class="login-hint">Selecciona un usuario de prueba. La contraseña para todos es <strong>123456</strong>.</div>
          </div>
        </section>
      </main>`;
  }

  function renderShell() {
    const user = roleData();
    const nav = menu[session];
    const activeLabel = nav.find((x) => x[0] === currentView)?.[1] || "Detalle";
    document.getElementById("app").innerHTML = `
      <div class="app-shell">
        <aside class="sidebar" id="sidebar">
          <div class="brand"><span class="brand-mark">A</span> Althea</div>
          <div class="side-role"><small>Sesión actual</small><strong>${user.label}</strong></div>
          <nav class="nav">
            <div class="nav-label">Principal</div>
            ${nav.map(([view, label, ico]) => `<button class="nav-item ${view === currentView ? "active" : ""}" data-nav="${view}">${icon(ico)}<span>${label}</span></button>`).join("")}
          </nav>
          <div class="sidebar-bottom"><div class="support-card"><strong>¿Necesitas ayuda?</strong>Consulta la guía del sistema con tu coordinador.</div></div>
        </aside>
        <div class="mobile-overlay" id="mobile-overlay"></div>
        <section class="workspace">
          <header class="topbar">
            <div class="top-left">
              <button class="menu-toggle" id="menu-toggle">${icon("menu")}</button>
              <div class="top-title"><small>Academia Althea / ${user.label}</small><strong>${activeLabel}</strong></div>
            </div>
            <div class="top-actions">
              <select class="role-switch" id="role-switch" aria-label="Cambiar rol">
                ${Object.entries(roles).map(([key, r]) => `<option value="${key}" ${key === session ? "selected" : ""}>Vista: ${r.label}</option>`).join("")}
              </select>
              <div class="user-chip"><span class="avatar">${initials(user.name)}</span><span class="user-copy"><strong>${user.name}</strong><span>${user.label}</span></span></div>
              <button class="btn btn-outline btn-sm" data-action="logout">${icon("logout")} Salir</button>
            </div>
          </header>
          <main class="content" id="content">${renderCurrentView()}</main>
        </section>
      </div>`;
  }

  function pageHead(title, description, actions = "") {
    return `<div class="page-head"><div><div class="eyebrow">Academia Althea</div><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="head-actions">${actions}</div>` : ""}</div>`;
  }
  function statCard(label, value, footer, ico = "chart") {
    return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(ico)}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${footer}</div></div>`;
  }
  function personCell(name, sub) { return `<div class="person"><span class="person-avatar">${initials(name)}</span><span><strong>${name}</strong><small>${sub || ""}</small></span></div>`; }
  function tableCard(headers, rows, toolbar = "") {
    return `<section class="card">${toolbar}<div class="table-wrap"><table><thead><tr>${headers.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}"><div class="empty"><strong>No encontramos resultados</strong>Prueba con otros filtros.</div></td></tr>`}</tbody></table></div></section>`;
  }
  function actionButtons(id, options = {}) {
    return `<div class="actions">
      ${options.view ? `<button class="icon-btn" title="Ver detalle" data-action="${options.view}" data-id="${id}">${icon("eye")}</button>` : ""}
      ${options.edit ? `<button class="icon-btn" title="Editar" data-action="${options.edit}" data-id="${id}">${icon("edit")}</button>` : ""}
      ${options.toggle ? `<button class="btn btn-outline btn-sm" data-action="${options.toggle}" data-id="${id}">${options.toggleLabel || "Cambiar estado"}</button>` : ""}
    </div>`;
  }

  function renderCurrentView() {
    const views = {
      dashboard: renderDashboard, users: renderUsers, students: renderStudents, "student-detail": renderStudentDetail,
      teachers: renderTeachers, courses: renderCourses, cycles: renderCycles, groups: renderGroups, schedules: renderSchedules,
      enrollments: renderEnrollments, payments: renderPayments, attendance: renderAttendance, grades: renderGrades,
      settings: renderSettings, queries: renderQueries, "my-groups": renderMyGroups, "group-detail": renderGroupDetail,
      "my-schedule": renderMySchedule, evaluations: renderEvaluations, "evaluation-detail": renderEvaluationDetail,
      "my-enrollment": renderMyEnrollment, "my-courses": renderMyCourses, "course-detail": renderCourseDetail,
      "my-attendance": renderMyAttendance, "my-grades": renderMyGrades, "my-payments": renderMyPayments,
    };
    return (views[currentView] || renderDashboard)();
  }

  function renderDashboard() {
    if (session === "teacher") return renderTeacherDashboard();
    if (session === "student") return renderStudentDashboard();
    const admin = session === "admin";
    const cards = admin
      ? [["Estudiantes", "350", "+18 este ciclo", "student"], ["Docentes", "18", "16 activos", "teacher"], ["Cursos", "12", "8 en curso", "book"], ["Grupos", "25", "92% de ocupación", "layers"], ["Matrículas recientes", "8", "Últimos 7 días", "file"], ["Pagos pendientes", "12", money(1800), "card"]]
      : [["Total de estudiantes", "350", "+18 este ciclo", "student"], ["Matrículas activas", "327", "93.4% del total", "file"], ["Pagos pendientes", "12", money(1800), "card"], ["Matrículas recientes", "8", "Últimos 7 días", "chart"]];
    const recentEnrollments = db.enrollments.slice(-5).reverse().map((e) => {
      const g = byId(db.groups, e.groupId), c = courseForGroup(e.groupId);
      return `<tr><td>${personCell(studentName(e.studentId), e.code)}</td><td>${c?.name || "—"}</td><td>${g?.code || "—"}</td><td>${dateLabel(e.date)}</td><td>${badge(e.status)}</td></tr>`;
    }).join("");
    const recentPayments = db.payments.filter((p) => p.status === "Pagado").slice(-5).reverse().map((p) =>
      `<tr><td>${enrollmentStudent(p)}</td><td>${p.concept}</td><td><strong>${money(p.amount)}</strong></td><td>${p.method}</td><td>${dateLabel(p.date)}</td></tr>`).join("");
    return `${pageHead(admin ? "Resumen general" : "Panel administrativo", `Buenos días, ${roleData().name.split(" ")[0]}. Aquí tienes el estado de la academia.`)}
      <div class="stats-grid">${cards.map((x) => statCard(...x)).join("")}</div>
      <div class="grid-2">
        ${tableCard(["Estudiante", "Curso", "Grupo", "Fecha", "Estado"], recentEnrollments, `<div class="card-head"><div><h3>Matrículas recientes</h3><p>Últimos registros del ciclo actual</p></div><button class="btn btn-ghost btn-sm" data-nav="enrollments">Ver todas</button></div>`)}
        <div class="card">
          <div class="card-head"><div><h3>Resumen del ciclo</h3><p>Ciclo I 2027 · En curso</p></div>${badge("Activo")}</div>
          <div class="card-body"><div class="metric-list">
            <div class="metric-row"><span>Ocupación de grupos</span><strong>82%</strong><div class="progress"><i style="width:82%"></i></div></div>
            <div class="metric-row"><span>Asistencia promedio</span><strong>91%</strong><div class="progress"><i style="width:91%;background:#0e9f8a"></i></div></div>
            <div class="metric-row"><span>Pagos recaudados</span><strong>87%</strong><div class="progress"><i style="width:87%;background:#d99016"></i></div></div>
          </div></div>
        </div>
      </div>
      <div style="height:18px"></div>
      ${tableCard(["Estudiante", "Concepto", "Monto", "Método", "Fecha"], recentPayments, `<div class="card-head"><div><h3>Pagos recientes</h3><p>Operaciones confirmadas</p></div><button class="btn btn-ghost btn-sm" data-nav="payments">Ver historial</button></div>`)}`;
  }

  function renderTeacherDashboard() {
    const teacherGroups = db.groups.filter((g) => g.teacherId === roleData().teacherId);
    return `${pageHead("Panel docente", "Revisa tus clases y actividades académicas de hoy.")}
      <div class="stats-grid">
        ${statCard("Mis grupos", teacherGroups.length, "3 grupos activos", "layers")}
        ${statCard("Clases de hoy", "2", "Próxima a las 10:00", "clock")}
        ${statCard("Evaluaciones pendientes", db.evaluations.filter((e) => e.status === "Borrador" && teacherGroups.some((g) => g.id === e.groupId)).length, "Requieren completar notas", "clipboard")}
        ${statCard("Evaluaciones publicadas", "4", "Visibles por estudiantes", "check")}
      </div>
      <div class="grid-2">
        <section class="card"><div class="card-head"><div><h3>Agenda de hoy</h3><p>Miércoles, 17 de marzo</p></div></div><div class="card-body">
          <div class="metric-list">
            <div class="availability"><span><strong>08:00 · Matemática</strong><br><small>MAT-A · Aula 101</small></span>${badge("Finalizada")}</div>
            <div class="availability"><span><strong>10:00 · Razonamiento Matemático</strong><br><small>RM-A · Aula 201</small></span>${badge("Próxima")}</div>
          </div>
        </div></section>
        <section class="card"><div class="card-head"><div><h3>Acciones rápidas</h3><p>Continúa con tus tareas frecuentes</p></div></div><div class="card-body">
          <div class="grid-equal"><button class="btn btn-outline" data-nav="attendance">${icon("check")} Registrar asistencia</button><button class="btn btn-outline" data-nav="evaluations">${icon("clipboard")} Ingresar notas</button></div>
        </div></section>
      </div>`;
  }

  function renderStudentDashboard() {
    const sid = roleData().studentId;
    const ens = db.enrollments.filter((e) => e.studentId === sid && e.status === "Activa");
    return `${pageHead("Hola, Mariana", "Este es el resumen de tu actividad académica.")}
      <div class="stats-grid">
        ${statCard("Mi matrícula", ens[0]?.code || "—", "Ciclo I 2027 · Activa", "file")}
        ${statCard("Mis cursos", ens.length, "Todos en curso", "book")}
        ${statCard("Próximas clases", "2", "La siguiente: 08:00", "clock")}
        ${statCard("Pagos pendientes", "2", money(300), "card")}
      </div>
      <div class="grid-2">
        <section class="card"><div class="card-head"><div><h3>Próximas clases</h3><p>Tu agenda académica</p></div><button class="btn btn-ghost btn-sm" data-nav="my-schedule">Ver horario</button></div><div class="card-body">
          <div class="metric-list"><div class="availability"><span><strong>Lunes · 08:00</strong><br><small>Matemática · Aula 101</small></span>${badge("Próxima")}</div><div class="availability"><span><strong>Miércoles · 10:00</strong><br><small>Física · Aula 202</small></span>${badge("Próxima")}</div></div>
        </div></section>
        ${tableCard(["Evaluación", "Curso", "Nota"], [
          ["Examen 02", "Matemática", "17"], ["Práctica Calificada 01", "Matemática", "18"], ["Examen 01", "Física", "16"],
        ].map((x) => `<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td><span class="badge badge-info">${x[2]}</span></td></tr>`).join(""), `<div class="card-head"><div><h3>Últimas notas</h3><p>Evaluaciones publicadas</p></div><button class="btn btn-ghost btn-sm" data-nav="my-grades">Ver todas</button></div>`)}
      </div>`;
  }

  function toolbar(type, filterOptions, placeholder = "Buscar...") {
    return `<div class="toolbar"><div class="search">${icon("search")}<input data-search="${type}" placeholder="${placeholder}" value="${viewParams.search || ""}" /></div>
      ${filterOptions ? `<select data-filter="${type}"><option value="">Todos los estados</option>${filterOptions.map((x) => `<option ${viewParams.filter === x ? "selected" : ""}>${x}</option>`).join("")}</select>` : ""}</div>`;
  }
  function filtered(list, fields) {
    const q = (viewParams.search || "").toLowerCase();
    return list.filter((x) => (!q || fields.some((f) => String(x[f] || "").toLowerCase().includes(q))) && (!viewParams.filter || x.status === viewParams.filter || x.role === viewParams.filter));
  }

  function renderUsers() {
    const list = filtered(db.users, ["username", "name", "email", "role"]);
    const rows = list.map((u) => `<tr><td>${personCell(u.name, `@${u.username}`)}</td><td>${u.email}</td><td>${badge(u.role)}</td><td>${badge(u.status)}</td><td>${actionButtons(u.id, { edit: "edit-user", toggle: "toggle-user", toggleLabel: u.status === "Activo" ? "Desactivar" : "Activar" })}</td></tr>`).join("");
    return `${pageHead("Usuarios", "Gestiona accesos, roles y estados de las cuentas.", `<button class="btn btn-primary" data-action="new-user">${icon("plus")} Crear usuario</button>`)}
      ${tableCard(["Usuario", "Correo", "Rol", "Estado", "Acciones"], rows, toolbar("users", ["Administrador", "Administrativo", "Docente", "Estudiante"], "Buscar por nombre, usuario o correo"))}`;
  }

  function renderStudents() {
    const canEdit = session === "staff";
    const list = filtered(db.students, ["code", "dni", "firstName", "lastName", "email"]);
    const rows = list.map((s) => `<tr><td><strong>${s.code}</strong></td><td>${s.dni}</td><td>${personCell(`${s.firstName} ${s.lastName}`, s.email)}</td><td>${s.phone}</td><td>${badge(s.status)}</td><td>${actionButtons(s.id, { view: "view-student", edit: canEdit ? "edit-student" : "", toggle: canEdit ? "toggle-student" : "", toggleLabel: s.status === "Activo" ? "Desactivar" : "Activar" })}</td></tr>`).join("");
    return `${pageHead("Estudiantes", canEdit ? "Administra la información y el estado de tus estudiantes." : "Consulta el padrón general de estudiantes.", canEdit ? `<button class="btn btn-primary" data-action="new-student">${icon("plus")} Nuevo estudiante</button>` : "")}
      ${tableCard(["Código", "DNI", "Estudiante", "Teléfono", "Estado", "Acciones"], rows, toolbar("students", ["Activo", "Inactivo"], "Buscar por código, DNI o nombre"))}`;
  }

  function renderStudentDetail() {
    const s = byId(db.students, viewParams.id) || db.students[0];
    const ens = db.enrollments.filter((e) => e.studentId === s.id);
    const paymentRows = db.payments.filter((p) => ens.some((e) => e.id === p.enrollmentId)).map((p) => `<tr><td>${p.concept}</td><td>${money(p.amount)}</td><td>${dateLabel(p.date)}</td><td>${p.method}</td><td>${badge(p.status)}</td></tr>`).join("");
    return `<button class="back-link" data-nav="students">${icon("back")} Volver a estudiantes</button>
      ${pageHead(`${s.firstName} ${s.lastName}`, `${s.code} · DNI ${s.dni}`, `<button class="btn btn-outline" data-action="edit-student" data-id="${s.id}">${icon("edit")} Editar datos</button>`)}
      <div class="tabs"><button class="tab active">Resumen</button><button class="tab" data-scroll="student-enrollments">Matrículas</button><button class="tab" data-scroll="student-payments">Pagos</button><button class="tab" data-scroll="student-academic">Rendimiento</button></div>
      <section class="card"><div class="card-head"><h3>Datos personales</h3>${badge(s.status)}</div><div class="card-body"><div class="info-grid">
        <div class="info-item"><span>Correo</span><strong>${s.email}</strong></div><div class="info-item"><span>Teléfono</span><strong>${s.phone}</strong></div><div class="info-item"><span>DNI</span><strong>${s.dni}</strong></div>
      </div></div></section><div style="height:16px"></div>
      <div id="student-enrollments">${tableCard(["Matrícula", "Curso", "Grupo", "Fecha", "Estado"], ens.map((e) => { const g = byId(db.groups, e.groupId); return `<tr><td><strong>${e.code}</strong></td><td>${courseForGroup(e.groupId)?.name || "—"}</td><td>${g?.code || "—"}</td><td>${dateLabel(e.date)}</td><td>${badge(e.status)}</td></tr>`; }).join(""), `<div class="card-head"><h3>Matrículas</h3></div>`)}</div>
      <div style="height:16px"></div><div id="student-payments">${tableCard(["Concepto", "Monto", "Fecha", "Método", "Estado"], paymentRows, `<div class="card-head"><h3>Historial de pagos</h3></div>`)}</div>
      <div style="height:16px"></div><div id="student-academic" class="grid-equal">
        <section class="card"><div class="card-head"><h3>Asistencia por curso</h3></div><div class="card-body"><div class="metric-list"><div class="metric-row"><span>Matemática</span><strong>92%</strong><div class="progress"><i style="width:92%"></i></div></div><div class="metric-row"><span>Física</span><strong>88%</strong><div class="progress"><i style="width:88%"></i></div></div></div></div></section>
        <section class="card"><div class="card-head"><h3>Promedio por curso</h3></div><div class="card-body"><div class="metric-list"><div class="metric-row"><span>Matemática</span><strong>16.7</strong></div><div class="metric-row"><span>Física</span><strong>15.8</strong></div></div></div></section>
      </div>`;
  }

  function renderTeachers() {
    const rows = db.teachers.map((t) => `<tr><td>${personCell(t.name, t.email)}</td><td>${t.specialty}</td><td>${db.groups.filter((g) => g.teacherId === t.id).length}</td><td>${badge(t.status)}</td><td>${actionButtons(t.id, { edit: "edit-teacher", toggle: "toggle-teacher", toggleLabel: t.status === "Activo" ? "Desactivar" : "Activar" })}</td></tr>`).join("");
    return `${pageHead("Docentes", "Consulta y administra el equipo académico.", `<button class="btn btn-primary" data-action="new-teacher">${icon("plus")} Nuevo docente</button>`)}${tableCard(["Docente", "Especialidad", "Grupos", "Estado", "Acciones"], rows, toolbar("teachers", ["Activo", "Inactivo"], "Buscar docente"))}`;
  }

  function renderCourses() {
    const editable = session === "admin";
    const list = filtered(db.courses, ["code", "name"]);
    const rows = list.map((c) => `<tr><td><strong>${c.code}</strong></td><td>${c.name}</td><td>${c.hours} h/semana</td><td>${db.groups.filter((g) => g.courseId === c.id).length}</td><td>${badge(c.status)}</td><td>${editable ? actionButtons(c.id, { edit: "edit-course", toggle: "toggle-course", toggleLabel: c.status === "Activo" ? "Desactivar" : "Activar" }) : "Consulta"}</td></tr>`).join("");
    return `${pageHead("Cursos", editable ? "Configura la oferta académica de la academia." : "Consulta la oferta académica disponible.", editable ? `<button class="btn btn-primary" data-action="new-course">${icon("plus")} Crear curso</button>` : "")}${tableCard(["Código", "Curso", "Carga", "Grupos", "Estado", "Acciones"], rows, toolbar("courses", ["Activo", "Inactivo"], "Buscar curso"))}`;
  }

  function renderCycles() {
    const rows = db.cycles.map((c) => `<tr><td><strong>${c.name}</strong></td><td>${dateLabel(c.start)}</td><td>${dateLabel(c.end)}</td><td>${badge(c.status)}</td><td>${actionButtons(c.id, { edit: "edit-cycle", toggle: "toggle-cycle", toggleLabel: "Cambiar estado" })}</td></tr>`).join("");
    return `${pageHead("Ciclos académicos", "Define periodos y controla su estado.", `<button class="btn btn-primary" data-action="new-cycle">${icon("plus")} Crear ciclo</button>`)}${tableCard(["Ciclo", "Inicio", "Fin", "Estado", "Acciones"], rows)}`;
  }

  function renderGroups() {
    const editable = session === "admin";
    const rows = db.groups.map((g) => `<tr><td><strong>${courseForGroup(g.id)?.name || "—"}</strong></td><td>${g.code}</td><td>${teacherName(g.teacherId)}</td><td>${g.capacity} estudiantes</td><td>${g.room}</td><td>${badge(g.status)}</td><td>${editable ? actionButtons(g.id, { edit: "edit-group" }) : "Consulta"}</td></tr>`).join("");
    return `${pageHead("Grupos", editable ? "Organiza grupos, capacidad y docentes asignados." : "Consulta los grupos del ciclo actual.", editable ? `<button class="btn btn-primary" data-action="new-group">${icon("plus")} Crear grupo</button>` : "")}${tableCard(["Curso", "Grupo", "Docente", "Capacidad", "Aula", "Estado", "Acciones"], rows, toolbar("groups", ["Activo", "Inactivo"], "Buscar grupo o curso"))}`;
  }

  function renderSchedules() {
    const editable = session === "admin";
    const rows = db.schedules.map((s) => { const g = byId(db.groups, s.groupId); return `<tr><td><strong>${g?.code || "—"}</strong></td><td>${courseForGroup(s.groupId)?.name || "—"}</td><td>${s.day}</td><td>${s.start} - ${s.end}</td><td>${s.room}</td><td>${editable ? actionButtons(s.id, { edit: "edit-schedule" }) : "Consulta"}</td></tr>`; }).join("");
    return `${pageHead("Horarios", "Consulta aulas, días y horas por grupo.", editable ? `<button class="btn btn-primary" data-action="new-schedule">${icon("plus")} Crear horario</button>` : "")}${tableCard(["Grupo", "Curso", "Día", "Hora", "Aula", "Acciones"], rows)}`;
  }

  function renderEnrollments() {
    if (session === "staff" && viewParams.mode === "new") return renderEnrollmentForm();
    const canCreate = session === "staff";
    const rows = db.enrollments.slice().reverse().map((e) => { const g = byId(db.groups, e.groupId); return `<tr><td><strong>${e.code}</strong></td><td>${personCell(studentName(e.studentId), byId(db.students, e.studentId)?.code)}</td><td>${courseForGroup(e.groupId)?.name || "—"}</td><td>${g?.code || "—"}</td><td>${dateLabel(e.date)}</td><td>${badge(e.status)}</td></tr>`; }).join("");
    return `${pageHead("Matrículas", canCreate ? "Registra y consulta matrículas del ciclo actual." : "Consulta las matrículas académicas.", canCreate ? `<button class="btn btn-primary" data-action="start-enrollment">${icon("plus")} Nueva matrícula</button>` : "")}${tableCard(["Código", "Estudiante", "Curso", "Grupo", "Fecha", "Estado"], rows, toolbar("enrollments", ["Activa", "Inactiva"], "Buscar matrícula o estudiante"))}`;
  }

  function renderEnrollmentForm() {
    return `<button class="back-link" data-action="cancel-enrollment">${icon("back")} Volver a matrículas</button>
      ${pageHead("Nueva matrícula", "Completa los datos para registrar una matrícula.")}
      <form class="card" id="enrollment-form"><div class="card-body"><h3 class="form-section-title">Información de la matrícula</h3>
        <div class="form-grid">
          <div class="field full"><label>Buscar y seleccionar estudiante</label><select name="studentId" required><option value="">Selecciona un estudiante</option>${db.students.filter((s) => s.status === "Activo").map((s) => `<option value="${s.id}">${s.code} · ${s.firstName} ${s.lastName} · DNI ${s.dni}</option>`).join("")}</select></div>
          <div class="field"><label>Ciclo académico</label><select name="cycleId" required>${db.cycles.map((c) => `<option value="${c.id}" ${c.status === "Activo" ? "selected" : ""}>${c.name}</option>`).join("")}</select></div>
          <div class="field"><label>Curso</label><select name="courseId" id="enroll-course" required><option value="">Selecciona un curso</option>${db.courses.filter((c) => c.status === "Activo").map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
          <div class="field full"><label>Grupo</label><select name="groupId" id="enroll-group" required><option value="">Primero selecciona un curso</option></select></div>
        </div>
        <div class="availability" id="availability"><span>Selecciona un grupo para consultar la disponibilidad.</span><strong>—</strong></div>
      </div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="cancel-enrollment">Cancelar</button><button class="btn btn-primary" type="submit">Registrar matrícula</button></div></form>`;
  }

  function renderPayments() {
    const canEdit = session === "staff";
    const list = db.payments.slice().reverse().filter((p) => !viewParams.filter || p.status === viewParams.filter);
    const rows = list.map((p) => `<tr><td><strong>${byId(db.enrollments, p.enrollmentId)?.code || "—"}</strong></td><td>${enrollmentStudent(p)}</td><td>${p.concept}</td><td><strong>${money(p.amount)}</strong></td><td>${dateLabel(p.date)}</td><td>${p.method}</td><td>${badge(p.status)}</td><td>${canEdit && p.status === "Pagado" ? `<button class="btn btn-outline btn-sm" data-action="void-payment" data-id="${p.id}">Anular</button>` : "—"}</td></tr>`).join("");
    return `${pageHead("Pagos", canEdit ? "Registra operaciones y consulta el historial." : "Consulta el historial de pagos.", canEdit ? `<button class="btn btn-primary" data-action="new-payment">${icon("plus")} Registrar pago</button>` : "")}${tableCard(["Matrícula", "Estudiante", "Concepto", "Monto", "Fecha", "Método", "Estado", "Acciones"], rows, toolbar("payments", ["Pagado", "Pendiente", "Anulado"], "Buscar estudiante o matrícula"))}`;
  }

  function teacherGroupIds() { return db.groups.filter((g) => g.teacherId === roleData().teacherId).map((g) => g.id); }
  function renderMyGroups() {
    const list = db.groups.filter((g) => g.teacherId === roleData().teacherId);
    return `${pageHead("Mis grupos", "Accede a los grupos y estudiantes que tienes asignados.")}
      <div class="course-grid">${list.map((g) => { const c = byId(db.courses, g.courseId); const count = db.enrollments.filter((e) => e.groupId === g.id && e.status === "Activa").length; return `<button class="course-card" data-action="view-group" data-id="${g.id}"><div class="course-code"><span class="course-icon">${c.name.slice(0, 2).toUpperCase()}</span>${badge(g.status)}</div><h3>${c.name} · ${g.code}</h3><p>${count} estudiantes matriculados</p><div class="course-meta"><div><span>Horario</span><strong>${g.schedule}</strong></div><div><span>Aula</span><strong>${g.room}</strong></div></div></button>`; }).join("")}</div>`;
  }
  function renderGroupDetail() {
    const g = byId(db.groups, viewParams.id) || db.groups[0], c = byId(db.courses, g.courseId);
    const students = db.enrollments.filter((e) => e.groupId === g.id).map((e) => byId(db.students, e.studentId)).filter(Boolean);
    return `<button class="back-link" data-nav="my-groups">${icon("back")} Volver a mis grupos</button>
      ${pageHead(`${c.name} · ${g.code}`, `${g.schedule} · ${g.room}`, `<button class="btn btn-outline" data-action="group-attendance" data-id="${g.id}">${icon("check")} Asistencia</button><button class="btn btn-primary" data-action="group-evaluations" data-id="${g.id}">${icon("clipboard")} Evaluaciones</button>`)}
      ${tableCard(["Código", "Estudiante", "DNI", "Correo", "Estado"], students.map((s) => `<tr><td><strong>${s.code}</strong></td><td>${personCell(`${s.firstName} ${s.lastName}`, "")}</td><td>${s.dni}</td><td>${s.email}</td><td>${badge(s.status)}</td></tr>`).join(""), `<div class="card-head"><div><h3>Lista de estudiantes</h3><p>${students.length} estudiantes matriculados</p></div></div>`)}`;
  }

  function renderAttendance() {
    if (session === "admin") {
      const grouped = db.groups.slice(0, 8).map((g) => `<tr><td><strong>${g.code}</strong></td><td>${courseForGroup(g.id)?.name}</td><td>${teacherName(g.teacherId)}</td><td>17/03/2027</td><td>${badge(g.id % 3 ? "Cerrada" : "Abierta")}</td></tr>`).join("");
      return `${pageHead("Asistencia", "Consulta los registros de asistencia por grupo.")}${tableCard(["Grupo", "Curso", "Docente", "Última fecha", "Estado"], grouped)}`;
    }
    const groupIds = teacherGroupIds();
    const groupId = Number(viewParams.groupId || groupIds[0]);
    const date = viewParams.date || (groupId === groupIds[1] ? "2027-03-15" : "2027-03-17");
    const g = byId(db.groups, groupId);
    let records = db.attendance.filter((a) => a.groupId === groupId && a.date === date);
    if (!records.length) {
      db.enrollments.filter((e) => e.groupId === groupId).forEach((e) => records.push({ id: Date.now() + e.id, groupId, studentId: e.studentId, date, status: "Presente", closed: false }));
    }
    const isClosed = records.length && records.every((r) => r.closed);
    const rows = records.map((r) => `<tr><td>${personCell(studentName(r.studentId), byId(db.students, r.studentId)?.code)}</td><td><select class="select-state attendance-state" data-student="${r.studentId}" ${isClosed ? "disabled" : ""}><option ${r.status === "Presente" ? "selected" : ""}>Presente</option><option ${r.status === "Tardanza" ? "selected" : ""}>Tardanza</option><option ${r.status === "Ausente" ? "selected" : ""}>Ausente</option></select></td></tr>`).join("");
    return `${pageHead("Registro de asistencia", "Selecciona un grupo y una fecha para gestionar la asistencia.", isClosed ? badge("Cerrada") : badge("Abierta"))}
      <section class="card"><div class="toolbar"><div class="field" style="margin:0;min-width:240px"><label>Grupo</label><select id="attendance-group">${groupIds.map((id) => { const x = byId(db.groups, id); return `<option value="${id}" ${id === groupId ? "selected" : ""}>${courseForGroup(id)?.name} · ${x.code}</option>`; }).join("")}</select></div><div class="field" style="margin:0"><label>Fecha</label><input id="attendance-date" type="date" value="${date}" /></div></div>
      <div class="card-head"><div><h3>${courseForGroup(groupId)?.name} · ${g?.code}</h3><p>${records.length} estudiantes · ${dateLabel(date)}</p></div></div>
      <div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Estado</th></tr></thead><tbody>${rows || `<tr><td colspan="2"><div class="empty"><strong>No hay estudiantes</strong>Este grupo aún no tiene matrículas.</div></td></tr>`}</tbody></table></div>
      <div class="modal-foot">${isClosed ? `<span class="callout" style="margin:0">La asistencia está cerrada y no puede modificarse.</span>` : `<button class="btn btn-outline" data-action="save-attendance">Guardar asistencia</button><button class="btn btn-primary" data-action="close-attendance">Cerrar asistencia</button>`}</div></section>`;
  }

  function renderEvaluations() {
    const gids = session === "teacher" ? teacherGroupIds() : db.groups.map((g) => g.id);
    const filteredEvals = db.evaluations.filter((e) => gids.includes(e.groupId) && (!viewParams.groupId || e.groupId === Number(viewParams.groupId)));
    const rows = filteredEvals.map((e) => { const g = byId(db.groups, e.groupId); return `<tr><td><strong>${e.name}</strong></td><td>${courseForGroup(e.groupId)?.name}</td><td>${g?.code}</td><td>${dateLabel(e.date)}</td><td>${badge(e.status)}</td><td>${actionButtons(e.id, { view: "view-evaluation" })}</td></tr>`; }).join("");
    return `${pageHead("Evaluaciones", "Crea evaluaciones, registra notas y publícalas.", session === "teacher" ? `<button class="btn btn-primary" data-action="new-evaluation">${icon("plus")} Crear evaluación</button>` : "")}${tableCard(["Evaluación", "Curso", "Grupo", "Fecha", "Estado", "Acciones"], rows)}`;
  }

  function renderEvaluationDetail() {
    const ev = byId(db.evaluations, viewParams.id) || db.evaluations[0], g = byId(db.groups, ev.groupId);
    const students = db.enrollments.filter((e) => e.groupId === ev.groupId).map((e) => byId(db.students, e.studentId)).filter(Boolean);
    const locked = ev.status === "Publicada";
    const rows = students.map((s) => { const score = db.scores.find((x) => x.evaluationId === ev.id && x.studentId === s.id); return `<tr><td>${personCell(`${s.firstName} ${s.lastName}`, s.code)}</td><td><input class="note-input" type="number" min="0" max="20" value="${score?.value ?? ""}" data-student="${s.id}" ${locked ? "disabled" : ""} /></td></tr>`; }).join("");
    return `<button class="back-link" data-nav="evaluations">${icon("back")} Volver a evaluaciones</button>
      ${pageHead(ev.name, `${courseForGroup(ev.groupId)?.name} · ${g?.code} · ${dateLabel(ev.date)}`, badge(ev.status))}
      ${locked ? `<div class="callout">Esta evaluación está publicada. Las notas son visibles para los estudiantes y están bloqueadas.</div>` : `<div class="callout">La evaluación está en borrador. Puedes modificar las notas antes de publicarla.</div>`}
      <section class="card"><div class="card-head"><div><h3>Registro de notas</h3><p>Escala vigesimal: 0 a 20</p></div></div><div class="table-wrap"><table><thead><tr><th>Estudiante</th><th>Nota</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="modal-foot">${locked ? (session === "admin" ? `<button class="btn btn-outline" data-action="enable-evaluation">Habilitar edición</button>` : "") : `<button class="btn btn-outline" data-action="save-scores">Guardar borrador</button><button class="btn btn-primary" data-action="publish-evaluation">Publicar evaluación</button>`}</div></section>`;
  }

  function renderGrades() {
    if (session === "teacher") return renderEvaluations();
    const rows = db.evaluations.map((e) => `<tr><td><strong>${e.name}</strong></td><td>${courseForGroup(e.groupId)?.name}</td><td>${byId(db.groups, e.groupId)?.code}</td><td>${dateLabel(e.date)}</td><td>${badge(e.status)}</td><td>${actionButtons(e.id, { view: "view-evaluation" })}</td></tr>`).join("");
    return `${pageHead("Notas y evaluaciones", "Consulta evaluaciones y resultados por grupo.")}${tableCard(["Evaluación", "Curso", "Grupo", "Fecha", "Estado", "Detalle"], rows)}`;
  }

  function renderMyCourses() {
    const ens = db.enrollments.filter((e) => e.studentId === roleData().studentId && e.status === "Activa").slice(0, 4);
    return `${pageHead("Mis cursos", "Consulta información, asistencia y notas de tus cursos.")}
      <div class="course-grid">${ens.map((e) => { const g = byId(db.groups, e.groupId), c = byId(db.courses, g.courseId); return `<button class="course-card" data-action="view-course" data-id="${c.id}" data-group="${g.id}"><div class="course-code"><span class="course-icon">${c.name.slice(0,2).toUpperCase()}</span>${badge("En curso")}</div><h3>${c.name}</h3><p>${teacherName(g.teacherId)}</p><div class="course-meta"><div><span>Grupo</span><strong>${g.code}</strong></div><div><span>Horario</span><strong>${g.schedule}</strong></div><div><span>Aula</span><strong>${g.room}</strong></div></div></button>`; }).join("")}</div>`;
  }

  function renderCourseDetail() {
    const c = byId(db.courses, viewParams.id) || db.courses[0], g = byId(db.groups, viewParams.groupId) || db.groups.find((x) => x.courseId === c.id);
    const tab = viewParams.tab || "info";
    const sid = roleData().studentId;
    const records = db.attendance.filter((a) => a.groupId === g.id && a.studentId === sid);
    const published = db.evaluations.filter((e) => e.groupId === g.id && e.status === "Publicada");
    const scores = published.map((e) => ({ e, score: db.scores.find((s) => s.evaluationId === e.id && s.studentId === sid)?.value }));
    const average = scores.length ? (scores.reduce((sum, x) => sum + Number(x.score || 0), 0) / scores.length).toFixed(1) : "—";
    let content = `<section class="card"><div class="card-head"><h3>Información del curso</h3></div><div class="card-body"><div class="info-grid"><div class="info-item"><span>Docente</span><strong>${teacherName(g.teacherId)}</strong></div><div class="info-item"><span>Grupo</span><strong>${g.code}</strong></div><div class="info-item"><span>Horario</span><strong>${g.schedule}</strong></div><div class="info-item"><span>Aula</span><strong>${g.room}</strong></div><div class="info-item"><span>Ciclo</span><strong>Ciclo I 2027</strong></div><div class="info-item"><span>Estado</span><strong>En curso</strong></div></div></div></section>`;
    if (tab === "attendance") {
      const counts = ["Presente", "Tardanza", "Ausente"].map((s) => records.filter((r) => r.status === s).length);
      content = `<div class="stats-grid">${statCard("Clases registradas", records.length, "Durante el ciclo", "calendar")}${statCard("Presentes", counts[0], "Asistencia regular", "check")}${statCard("Tardanzas", counts[1], "Llegadas registradas", "clock")}${statCard("Ausencias", counts[2], "Faltas registradas", "file")}</div>${tableCard(["Fecha", "Estado"], records.map((r) => `<tr><td>${dateLabel(r.date)}</td><td>${badge(r.status)}</td></tr>`).join(""))}`;
    }
    if (tab === "grades") {
      content = `<div class="stats-grid">${statCard("Promedio", average, "Solo notas publicadas", "chart")}</div>${tableCard(["Evaluación", "Fecha", "Nota"], scores.map((x) => `<tr><td><strong>${x.e.name}</strong></td><td>${dateLabel(x.e.date)}</td><td><span class="badge badge-info">${x.score ?? "—"}</span></td></tr>`).join(""))}`;
    }
    return `<button class="back-link" data-nav="my-courses">${icon("back")} Volver a mis cursos</button>
      <div class="detail-hero"><span class="course-icon">${c.name.slice(0,2).toUpperCase()}</span><div><h2>${c.name}</h2><p>${teacherName(g.teacherId)} · ${g.code} · ${g.room}</p></div></div>
      <div class="tabs"><button class="tab ${tab === "info" ? "active" : ""}" data-course-tab="info">Información</button><button class="tab ${tab === "attendance" ? "active" : ""}" data-course-tab="attendance">Asistencia</button><button class="tab ${tab === "grades" ? "active" : ""}" data-course-tab="grades">Notas</button></div>${content}`;
  }

  function renderMyEnrollment() {
    const list = db.enrollments.filter((e) => e.studentId === roleData().studentId && e.status === "Activa");
    const rows = list.map((e) => { const g = byId(db.groups, e.groupId); return `<tr><td><strong>${e.code}</strong></td><td>Ciclo I 2027</td><td>${courseForGroup(e.groupId)?.name}</td><td>${g.code}</td><td>${teacherName(g.teacherId)}</td><td>${dateLabel(e.date)}</td><td>${badge(e.status)}</td></tr>`; }).join("");
    return `${pageHead("Mi matrícula", "Consulta los cursos incluidos en tu matrícula vigente.")}${tableCard(["Código", "Ciclo", "Curso", "Grupo", "Docente", "Fecha", "Estado"], rows)}`;
  }
  function renderMySchedule() {
    const studentView = session === "student";
    const gids = studentView ? db.enrollments.filter((e) => e.studentId === roleData().studentId).map((e) => e.groupId) : teacherGroupIds();
    const rows = db.schedules.filter((s) => gids.includes(s.groupId)).map((s) => `<tr><td><strong>${s.day}</strong></td><td>${courseForGroup(s.groupId)?.name}</td><td>${s.start} - ${s.end}</td><td>${s.room}</td></tr>`).join("");
    return `${pageHead("Mi horario", studentView ? "Consulta tus clases de la semana." : "Consulta tus clases y aulas asignadas.")}${tableCard(["Día", "Curso", "Hora", "Aula"], rows)}`;
  }
  function renderMyAttendance() {
    const sid = roleData().studentId;
    const groups = db.enrollments.filter((e) => e.studentId === sid).map((e) => e.groupId);
    const rows = db.attendance.filter((a) => a.studentId === sid && groups.includes(a.groupId)).map((a) => `<tr><td>${courseForGroup(a.groupId)?.name}</td><td>${dateLabel(a.date)}</td><td>${badge(a.status)}</td></tr>`).join("");
    return `${pageHead("Mi asistencia", "Consulta tus registros de asistencia por curso.")}${tableCard(["Curso", "Fecha", "Estado"], rows)}`;
  }
  function renderMyGrades() {
    const sid = roleData().studentId;
    const gids = db.enrollments.filter((e) => e.studentId === sid).map((e) => e.groupId);
    const rows = db.evaluations.filter((e) => gids.includes(e.groupId) && e.status === "Publicada").map((e) => `<tr><td>${courseForGroup(e.groupId)?.name}</td><td><strong>${e.name}</strong></td><td>${dateLabel(e.date)}</td><td><span class="badge badge-info">${db.scores.find((s) => s.evaluationId === e.id && s.studentId === sid)?.value ?? "—"}</span></td></tr>`).join("");
    return `${pageHead("Mis notas", "Solo se muestran evaluaciones publicadas.")}${tableCard(["Curso", "Evaluación", "Fecha", "Nota"], rows)}`;
  }
  function renderMyPayments() {
    const rows = [
      ["Matrícula", 150, "2027-03-01", "Pagado"], ["Mensualidad 1", 150, "2027-03-15", "Pagado"],
      ["Mensualidad 2", 150, "", "Pendiente"], ["Mensualidad 3", 150, "", "Pendiente"],
    ].map((p) => `<tr><td><strong>${p[0]}</strong></td><td>${money(p[1])}</td><td>${dateLabel(p[2])}</td><td>${badge(p[3])}</td></tr>`).join("");
    return `${pageHead("Mis pagos", "Consulta tu cronograma y el estado de tus pagos.")}${tableCard(["Concepto", "Monto", "Fecha", "Estado"], rows)}`;
  }

  function renderQueries() {
    return `${pageHead("Consultas", "Accesos rápidos a información operativa.")}
      <div class="course-grid">
        <button class="course-card" data-nav="students"><div class="course-code"><span class="course-icon">${icon("student")}</span></div><h3>Padrón de estudiantes</h3><p>Consulta datos y estado de estudiantes.</p></button>
        <button class="course-card" data-nav="enrollments"><div class="course-code"><span class="course-icon">${icon("file")}</span></div><h3>Reporte de matrículas</h3><p>Revisa matrículas por ciclo y grupo.</p></button>
        <button class="course-card" data-nav="payments"><div class="course-code"><span class="course-icon">${icon("card")}</span></div><h3>Estado de pagos</h3><p>Consulta pagos realizados y pendientes.</p></button>
      </div>`;
  }
  function renderSettings() {
    return `${pageHead("Configuración", "Personaliza los datos generales del simulador.")}
      <section class="card"><div class="card-head"><h3>Datos de la academia</h3></div><form class="card-body" id="settings-form"><div class="form-grid"><div class="field"><label>Nombre comercial</label><input name="name" value="Academia Althea" /></div><div class="field"><label>Correo institucional</label><input name="email" value="contacto@althea.edu.pe" /></div><div class="field"><label>Teléfono</label><input name="phone" value="+51 01 555 0190" /></div><div class="field"><label>Zona horaria</label><select><option>America/Lima (GMT-5)</option></select></div><div class="field full"><label>Dirección</label><input value="Av. Javier Prado 1520, Lima" /></div></div><button class="btn btn-primary" type="submit">Guardar configuración</button></form></section>`;
  }

  function openModal(title, subtitle, body, submitText = "Guardar", formId = "modal-form", size = "") {
    document.getElementById("modal-root").innerHTML = `<div class="modal-backdrop"><div class="modal ${size}"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-action="close-modal" aria-label="Cerrar">×</button></div><form id="${formId}"><div class="modal-body">${body}</div><div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn-primary">${submitText}</button></div></form></div></div>`;
  }
  function closeModal() { document.getElementById("modal-root").innerHTML = ""; }
  const input = (label, name, value = "", type = "text", required = true) => `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${value}" ${required ? "required" : ""} /></div>`;
  const select = (label, name, values, selected = "") => `<div class="field"><label>${label}</label><select name="${name}" required>${values.map((x) => { const v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return `<option value="${v}" ${String(v) === String(selected) ? "selected" : ""}>${l}</option>`; }).join("")}</select></div>`;

  function openUserModal(id) {
    const u = id ? byId(db.users, id) : null;
    openModal(u ? "Editar usuario" : "Crear usuario", "Configura los datos de acceso y el rol.", `<div class="form-grid">${input("Nombre completo", "name", u?.name)}${input("Usuario", "username", u?.username)}${input("Correo", "email", u?.email, "email")}${select("Rol", "role", ["Administrador", "Administrativo", "Docente", "Estudiante"], u?.role || "Administrativo")}${input("Contraseña", "password", "", "password", !u)}${select("Estado", "status", ["Activo", "Inactivo"], u?.status || "Activo")}</div><input type="hidden" name="id" value="${id || ""}" />`, u ? "Guardar cambios" : "Crear usuario", "user-form");
  }
  function openStudentModal(id) {
    const s = id ? byId(db.students, id) : null;
    openModal(s ? "Editar estudiante" : "Nuevo estudiante", "Registra la información personal del estudiante.", `<div class="form-grid">${input("Nombres", "firstName", s?.firstName)}${input("Apellidos", "lastName", s?.lastName)}${input("DNI", "dni", s?.dni)}${input("Teléfono", "phone", s?.phone)}<div class="full">${input("Correo electrónico", "email", s?.email, "email")}</div>${select("Estado", "status", ["Activo", "Inactivo"], s?.status || "Activo")}</div><input type="hidden" name="id" value="${id || ""}" />`, s ? "Guardar cambios" : "Registrar estudiante", "student-form");
  }
  function openCourseModal(id) {
    const c = id ? byId(db.courses, id) : null;
    openModal(c ? "Editar curso" : "Crear curso", "Configura los datos básicos del curso.", `<div class="form-grid">${input("Código", "code", c?.code || `CUR-${String(db.courses.length + 1).padStart(3, "0")}`)}${input("Nombre del curso", "name", c?.name)}${input("Horas por semana", "hours", c?.hours || 3, "number")}${select("Estado", "status", ["Activo", "Inactivo"], c?.status || "Activo")}</div><input type="hidden" name="id" value="${id || ""}" />`, c ? "Guardar cambios" : "Crear curso", "course-form");
  }
  function openTeacherModal(id) {
    const t = id ? byId(db.teachers, id) : null;
    openModal(t ? "Editar docente" : "Nuevo docente", "Completa la información académica del docente.", `<div class="form-grid">${input("Nombre completo", "name", t?.name)}${input("Especialidad", "specialty", t?.specialty)}<div class="full">${input("Correo", "email", t?.email, "email")}</div>${select("Estado", "status", ["Activo", "Inactivo"], t?.status || "Activo")}</div><input type="hidden" name="id" value="${id || ""}" />`, t ? "Guardar cambios" : "Registrar docente", "teacher-form");
  }
  function openCycleModal(id) {
    const c = id ? byId(db.cycles, id) : null;
    openModal(c ? "Editar ciclo" : "Crear ciclo", "Define las fechas y estado del periodo.", `<div class="form-grid"><div class="full">${input("Nombre", "name", c?.name)}</div>${input("Fecha de inicio", "start", c?.start, "date")}${input("Fecha de fin", "end", c?.end, "date")}${select("Estado", "status", ["Planificado", "Activo", "Finalizado"], c?.status || "Planificado")}</div><input type="hidden" name="id" value="${id || ""}" />`, c ? "Guardar cambios" : "Crear ciclo", "cycle-form");
  }
  function openGroupModal(id) {
    const g = id ? byId(db.groups, id) : null;
    openModal(g ? "Editar grupo" : "Crear grupo", "Asigna curso, docente, capacidad y aula.", `<div class="form-grid">${select("Curso", "courseId", db.courses.map((c) => [c.id, c.name]), g?.courseId)}${input("Código del grupo", "code", g?.code)}${select("Docente", "teacherId", db.teachers.map((t) => [t.id, `${t.name} · ${t.specialty}`]), g?.teacherId)}${input("Capacidad", "capacity", g?.capacity || 25, "number")}${input("Aula", "room", g?.room || "")}${input("Horario resumido", "schedule", g?.schedule || "")}${select("Estado", "status", ["Activo", "Inactivo"], g?.status || "Activo")}</div><input type="hidden" name="id" value="${id || ""}" />`, g ? "Guardar cambios" : "Crear grupo", "group-form");
  }
  function openScheduleModal(id) {
    const s = id ? byId(db.schedules, id) : null;
    openModal(s ? "Editar horario" : "Crear horario", "Define el día, hora y aula.", `<div class="form-grid">${select("Grupo", "groupId", db.groups.map((g) => [g.id, `${g.code} · ${courseForGroup(g.id)?.name}`]), s?.groupId)}${select("Día", "day", ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], s?.day || "Lunes")}${input("Hora de inicio", "start", s?.start || "08:00", "time")}${input("Hora de fin", "end", s?.end || "10:00", "time")}${input("Aula", "room", s?.room || "")}</div><input type="hidden" name="id" value="${id || ""}" />`, s ? "Guardar cambios" : "Crear horario", "schedule-form");
  }
  function openPaymentModal() {
    openModal("Registrar pago", "El pago quedará asociado a una matrícula.", `<div class="form-grid"><div class="full">${select("Matrícula y estudiante", "enrollmentId", db.enrollments.filter((e) => e.status === "Activa").map((e) => [e.id, `${e.code} · ${studentName(e.studentId)}`]))}</div>${select("Concepto", "concept", ["Matrícula", "Mensualidad 1", "Mensualidad 2", "Mensualidad 3", "Materiales"])}${input("Monto", "amount", "150", "number")}${select("Método", "method", ["Efectivo", "Tarjeta", "Yape", "Transferencia"])}${input("Fecha", "date", "2027-03-20", "date")}</div>`, "Registrar pago", "payment-form");
  }
  function openEvaluationModal() {
    const gids = teacherGroupIds();
    openModal("Crear evaluación", "Primero crea la evaluación; luego podrás registrar notas.", `<div class="form-grid"><div class="full">${input("Nombre de la evaluación", "name", "")}</div>${input("Fecha", "date", "2027-04-01", "date")}${select("Grupo", "groupId", gids.map((id) => { const g = byId(db.groups, id); return [id, `${courseForGroup(id)?.name} · ${g.code}`]; }))}${select("Estado", "status", ["Borrador", "Publicada"], "Borrador")}</div>`, "Crear evaluación", "evaluation-form");
  }

  function navigate(view, params = {}) {
    currentView = view; viewParams = params;
    renderShell();
    window.scrollTo(0, 0);
  }
  function refreshContent() {
    const content = document.getElementById("content");
    if (content) content.innerHTML = renderCurrentView();
  }
  function formObject(form) { return Object.fromEntries(new FormData(form).entries()); }
  function upsert(list, obj) {
    const id = Number(obj.id);
    if (id) Object.assign(byId(list, id), obj, { id });
    else list.push({ ...obj, id: Math.max(0, ...list.map((x) => Number(x.id))) + 1 });
  }

  document.addEventListener("click", (event) => {
    const quick = event.target.closest("[data-quick]");
    if (quick) {
      document.querySelectorAll(".quick-user").forEach((x) => x.classList.remove("active"));
      quick.classList.add("active");
      document.getElementById("login-user").value = quick.dataset.quick;
      document.getElementById("login-pass").value = "123456";
      return;
    }
    const nav = event.target.closest("[data-nav]");
    if (nav) { navigate(nav.dataset.nav); return; }
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    const action = actionEl.dataset.action, id = Number(actionEl.dataset.id);
    const toggle = (list, success) => { const item = byId(list, id); item.status = item.status === "Activo" ? "Inactivo" : "Activo"; save(); refreshContent(); showToast(success); };
    if (action === "logout") { session = ""; sessionStorage.removeItem(SESSION_KEY); currentView = "dashboard"; renderLogin(); return; }
    if (action === "close-modal") { closeModal(); return; }
    if (action === "new-user") openUserModal();
    if (action === "edit-user") openUserModal(id);
    if (action === "toggle-user") toggle(db.users, "Estado del usuario actualizado.");
    if (action === "new-student") openStudentModal();
    if (action === "edit-student") openStudentModal(id);
    if (action === "toggle-student") toggle(db.students, "Estado del estudiante actualizado.");
    if (action === "view-student") navigate("student-detail", { id });
    if (action === "new-course") openCourseModal();
    if (action === "edit-course") openCourseModal(id);
    if (action === "toggle-course") toggle(db.courses, "Estado del curso actualizado.");
    if (action === "new-teacher") openTeacherModal();
    if (action === "edit-teacher") openTeacherModal(id);
    if (action === "toggle-teacher") toggle(db.teachers, "Estado del docente actualizado.");
    if (action === "new-cycle") openCycleModal();
    if (action === "edit-cycle") openCycleModal(id);
    if (action === "toggle-cycle") { const c = byId(db.cycles, id); c.status = c.status === "Planificado" ? "Activo" : c.status === "Activo" ? "Finalizado" : "Planificado"; save(); refreshContent(); showToast("Estado del ciclo actualizado."); }
    if (action === "new-group") openGroupModal();
    if (action === "edit-group") openGroupModal(id);
    if (action === "new-schedule") openScheduleModal();
    if (action === "edit-schedule") openScheduleModal(id);
    if (action === "start-enrollment") navigate("enrollments", { mode: "new" });
    if (action === "cancel-enrollment") navigate("enrollments");
    if (action === "new-payment") openPaymentModal();
    if (action === "void-payment") { if (confirm("¿Deseas anular este pago? El registro se conservará en el historial.")) { byId(db.payments, id).status = "Anulado"; save(); refreshContent(); showToast("Pago anulado. El registro se conserva."); } }
    if (action === "view-group") navigate("group-detail", { id });
    if (action === "group-attendance") navigate("attendance", { groupId: id, date: "2027-03-17" });
    if (action === "group-evaluations") navigate("evaluations", { groupId: id });
    if (action === "new-evaluation") openEvaluationModal();
    if (action === "view-evaluation") navigate("evaluation-detail", { id });
    if (action === "save-scores") saveScores(false);
    if (action === "publish-evaluation") saveScores(true);
    if (action === "enable-evaluation") { byId(db.evaluations, viewParams.id).status = "Borrador"; save(); refreshContent(); showToast("Edición habilitada para la evaluación."); }
    if (action === "save-attendance") saveAttendance(false);
    if (action === "close-attendance") saveAttendance(true);
    if (action === "view-course") navigate("course-detail", { id, groupId: Number(actionEl.dataset.group), tab: "info" });
  });

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.id === "login-form") {
      const data = formObject(form);
      const found = Object.entries(roles).find(([, r]) => r.username === data.username);
      if (!found || data.password !== "123456") { showToast("Usuario o contraseña incorrectos.", "error"); return; }
      session = found[0]; sessionStorage.setItem(SESSION_KEY, session); currentView = "dashboard"; viewParams = {}; renderShell(); showToast(`Bienvenido, ${roles[session].name}.`); return;
    }
    const handlers = {
      "user-form": () => { const d = formObject(form); delete d.password; upsert(db.users, d); },
      "student-form": () => { const d = formObject(form); if (!d.id) d.code = `EST-${String(db.students.length + 1).padStart(4, "0")}`; upsert(db.students, d); },
      "course-form": () => { const d = formObject(form); d.hours = Number(d.hours); upsert(db.courses, d); },
      "teacher-form": () => upsert(db.teachers, formObject(form)),
      "cycle-form": () => upsert(db.cycles, formObject(form)),
      "group-form": () => { const d = formObject(form); d.courseId = Number(d.courseId); d.teacherId = Number(d.teacherId); d.capacity = Number(d.capacity); d.cycleId = 2; upsert(db.groups, d); },
      "schedule-form": () => { const d = formObject(form); d.groupId = Number(d.groupId); upsert(db.schedules, d); },
      "payment-form": () => { const d = formObject(form); d.enrollmentId = Number(d.enrollmentId); d.amount = Number(d.amount); d.status = "Pagado"; upsert(db.payments, d); },
      "evaluation-form": () => { const d = formObject(form); d.groupId = Number(d.groupId); upsert(db.evaluations, d); },
    };
    if (handlers[form.id]) {
      handlers[form.id](); save(); closeModal(); refreshContent(); showToast("Los cambios se guardaron correctamente."); return;
    }
    if (form.id === "enrollment-form") {
      const d = formObject(form);
      const enrollment = { id: Math.max(...db.enrollments.map((e) => e.id)) + 1, code: `MAT-2027-${String(db.enrollments.length + 1).padStart(4, "0")}`, studentId: Number(d.studentId), groupId: Number(d.groupId), cycleId: Number(d.cycleId), date: "2027-03-20", status: "Activa" };
      db.enrollments.push(enrollment); save();
      openModal("Matrícula registrada", "El registro se creó correctamente.", `<div class="callout">Código generado: <strong>${enrollment.code}</strong></div><div class="info-grid"><div class="info-item"><span>Estudiante</span><strong>${studentName(enrollment.studentId)}</strong></div><div class="info-item"><span>Curso</span><strong>${courseForGroup(enrollment.groupId)?.name}</strong></div><div class="info-item"><span>Estado</span><strong>Activa</strong></div></div>`, "Registrar pago", "enrollment-result");
      return;
    }
    if (form.id === "enrollment-result") { closeModal(); navigate("payments"); setTimeout(openPaymentModal, 50); return; }
    if (form.id === "settings-form") showToast("Configuración guardada.");
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "role-switch") { session = event.target.value; sessionStorage.setItem(SESSION_KEY, session); currentView = "dashboard"; viewParams = {}; renderShell(); showToast(`Vista cambiada a ${roleData().label}.`); }
    if (event.target.matches("[data-filter]")) { viewParams.filter = event.target.value; refreshContent(); }
    if (event.target.id === "enroll-course") {
      const groups = db.groups.filter((g) => g.courseId === Number(event.target.value) && g.status === "Activo");
      document.getElementById("enroll-group").innerHTML = `<option value="">Selecciona un grupo</option>${groups.map((g) => `<option value="${g.id}">${g.code} · ${g.schedule} · ${g.room}</option>`).join("")}`;
    }
    if (event.target.id === "enroll-group") {
      const g = byId(db.groups, event.target.value), used = db.enrollments.filter((e) => e.groupId === Number(event.target.value) && e.status === "Activa").length;
      document.getElementById("availability").innerHTML = g ? `<span>Disponibilidad de ${g.code}</span><strong>${g.capacity - used} de ${g.capacity} vacantes</strong>` : `<span>Selecciona un grupo para consultar la disponibilidad.</span><strong>—</strong>`;
    }
    if (event.target.id === "attendance-group" || event.target.id === "attendance-date") {
      const gid = Number(document.getElementById("attendance-group").value), date = document.getElementById("attendance-date").value;
      navigate("attendance", { groupId: gid, date });
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-search]")) {
      clearTimeout(event.target._timer);
      event.target._timer = setTimeout(() => { viewParams.search = event.target.value; refreshContent(); const inputEl = document.querySelector(`[data-search="${event.target.dataset.search}"]`); inputEl?.focus(); inputEl?.setSelectionRange(inputEl.value.length, inputEl.value.length); }, 180);
    }
  });

  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-course-tab]");
    if (tab) { viewParams.tab = tab.dataset.courseTab; refreshContent(); window.scrollTo(0, 0); }
    const scroll = event.target.closest("[data-scroll]");
    if (scroll) document.getElementById(scroll.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
    if (event.target.id === "menu-toggle") { document.getElementById("sidebar").classList.toggle("open"); document.getElementById("mobile-overlay").classList.toggle("show"); }
    if (event.target.id === "mobile-overlay") { document.getElementById("sidebar").classList.remove("open"); event.target.classList.remove("show"); }
    if (event.target.classList.contains("modal-backdrop")) closeModal();
  });

  function saveScores(publish) {
    const ev = byId(db.evaluations, viewParams.id);
    document.querySelectorAll(".note-input").forEach((inputEl) => {
      const studentId = Number(inputEl.dataset.student), value = Number(inputEl.value);
      let score = db.scores.find((x) => x.evaluationId === ev.id && x.studentId === studentId);
      if (score) score.value = value; else db.scores.push({ evaluationId: ev.id, studentId, value });
    });
    if (publish) ev.status = "Publicada";
    save(); refreshContent(); showToast(publish ? "Evaluación publicada. Las notas quedaron bloqueadas." : "Borrador guardado correctamente.");
  }
  function saveAttendance(close) {
    const groupId = Number(viewParams.groupId || teacherGroupIds()[0]), date = viewParams.date || "2027-03-17";
    document.querySelectorAll(".attendance-state").forEach((selectEl) => {
      const studentId = Number(selectEl.dataset.student);
      let record = db.attendance.find((a) => a.groupId === groupId && a.studentId === studentId && a.date === date);
      if (record) { record.status = selectEl.value; record.closed = close; }
      else db.attendance.push({ id: Date.now() + studentId, groupId, studentId, date, status: selectEl.value, closed: close });
    });
    save(); refreshContent(); showToast(close ? "Asistencia cerrada. La edición quedó bloqueada." : "Asistencia guardada.");
  }

  if (session && roles[session]) renderShell(); else renderLogin();
})();
