const STORAGE_KEY = 'sala-sistemas-state';
const USER_KEY = 'sala-sistemas-user';
const ADMIN_CODE = 'ADMIN2026SALA';
const DEFAULT_STATE = {
  users: {
    admin: { password: 'admin123', role: 'ADMIN' },
    estudiante: { password: 'user123', role: 'USUARIO' }
  },
  students: [
    { id: crypto.randomUUID(), nombre: 'Alejandro García Ruiz', grado: 6, salon: 1, computador: 1, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Andrea Montoya Zapata', grado: 11, salon: 2, computador: 2, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Andrés Sánchez Vega', grado: 7, salon: 1, computador: 3, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Camila Jiménez Castro', grado: 6, salon: 2, computador: 4, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Cristian Patiño Lozano', grado: 11, salon: 1, computador: 5, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Daniel Torres Reyes', grado: 7, salon: 1, computador: 6, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Daniela Suárez Blanco', grado: 9, salon: 2, computador: 7, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Esteban Molina Guerrero', grado: 9, salon: 1, computador: 8, estado: 'Inactivo', observaciones: 'Monitor con falla', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Felipe Gutiérrez Parra', grado: 7, salon: 2, computador: 9, estado: 'Activo', observaciones: '', updatedAt: Date.now() },
    { id: crypto.randomUUID(), nombre: 'Gabriela Peña Castillo', grado: 8, salon: 1, computador: 10, estado: 'Activo', observaciones: '', updatedAt: Date.now() }
  ],
  grades: [6, 7, 8, 9, 10, 11],
  rooms: [1, 2, 3, 4, 5],
  activity: ['Sistema iniciado correctamente.']
};

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginAdmin = document.getElementById('login-admin');
const loginUser = document.getElementById('login-user');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const adminCodeBlock = document.getElementById('admin-code-block');
const registerRoleInput = document.getElementById('register-role');
const currentRoleLabel = document.getElementById('current-role');
const logoutButton = document.getElementById('logout-button');
const searchInput = document.getElementById('search-input');
const gradeFilter = document.getElementById('grade-filter');
const roomFilter = document.getElementById('room-filter');
const clearFiltersButton = document.getElementById('clear-filters');
const studentTableBody = document.querySelector('#student-table tbody');
const roomMap = document.getElementById('room-map');
const tableAlert = document.getElementById('table-alert');
const openAddModal = document.getElementById('open-add-modal');
const openImportModal = document.getElementById('open-import');
const openAdminPanel = document.getElementById('open-admin-panel');
const clearAllButton = document.getElementById('clear-all');
const downloadTemplateButton = document.getElementById('open-admin-panel');
const adminActionsPanel = document.getElementById('admin-actions');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const quickAdd = document.getElementById('quick-add');
const quickMap = document.getElementById('quick-map');
const quickAdmin = document.getElementById('quick-admin');
const gradeSummary = document.getElementById('grade-summary');
const roomSummary = document.getElementById('room-summary');
const statTotal = document.getElementById('stat-total');
const statOccupied = document.getElementById('stat-occupied');
const statFree = document.getElementById('stat-free');
const statActive = document.getElementById('stat-active');
const statRooms = document.getElementById('stat-rooms');
const statOccupiedMap = document.getElementById('stat-occupied-map');
const statFreeMap = document.getElementById('stat-free-map');
const activityCount = document.getElementById('activity-count');
const activityLog = document.getElementById('activity-log');
const clearActivityButton = document.getElementById('clear-activity');
const gradeTags = document.getElementById('grade-tags');
const roomTags = document.getElementById('room-tags');
const newGradeInput = document.getElementById('new-grade');
const addGradeButton = document.getElementById('add-grade');
const newRoomInput = document.getElementById('new-room');
const addRoomButton = document.getElementById('add-room');
const navButtons = document.querySelectorAll('.nav-button');

let state = loadState();
let sessionUser = loadUser();
let selectedRole = 'ADMIN';

const VALID_STATUSES = ['Activo', 'Inactivo', 'Suspendido'];

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return structuredClone(DEFAULT_STATE);
  }
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadUser() {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(USER_KEY);
  sessionUser = null;
}

function showScreen(screen) {
  loginScreen.classList.toggle('active', screen === 'login');
  dashboardScreen.classList.toggle('active', screen === 'dashboard');
}

function setSelectedRole(role) {
  selectedRole = role;
  loginAdmin.classList.toggle('active', role === 'ADMIN');
  loginUser.classList.toggle('active', role === 'USUARIO');
}

function showSection(section) {
  document.querySelectorAll('.section-card').forEach(card => {
    card.classList.toggle('active', card.id === section);
  });
  navButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.section === section);
  });
}

function authenticate(username, password, role) {
  const savedUser = state.users[username];
  if (!savedUser) return false;
  return savedUser.password === password && savedUser.role === role;
}

function updateRoleCodeVisibility() {
  adminCodeBlock.classList.toggle('hidden', registerRoleInput.value !== 'ADMIN');
}

function startApp() {
  if (sessionUser) {
    renderDashboard();
    showScreen('dashboard');
  } else {
    showScreen('login');
  }
}

function renderDashboard() {
  currentRoleLabel.textContent = sessionUser.role === 'ADMIN' ? 'Modo ADMIN' : 'Modo USUARIO';
  adminActionsPanel.classList.toggle('hidden', sessionUser.role !== 'ADMIN');
  clearAllButton.classList.toggle('hidden', sessionUser.role !== 'ADMIN');
  openAddModal.disabled = sessionUser.role !== 'ADMIN';
  openImportModal.disabled = sessionUser.role !== 'ADMIN';
  openAdminPanel.disabled = sessionUser.role !== 'ADMIN';
  renderFilters();
  renderTable();
  renderRoomMap();
  renderStats();
  renderActivity();
  renderSummaries();
  renderGradeTags();
  renderRoomTags();
}

function renderFilters() {
  const grades = [...new Set([...state.grades].sort((a, b) => a - b))];
  const rooms = [...new Set([...state.rooms].sort((a, b) => a - b))];
  gradeFilter.innerHTML = '<option value="">Todos los grados</option>' + grades.map(grade => `<option value="${grade}">Grado ${grade}</option>`).join('');
  roomFilter.innerHTML = '<option value="">Todos los salones</option>' + rooms.map(room => `<option value="${room}">Salón ${room}</option>`).join('');
}

function getFilteredStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const gradeValue = gradeFilter.value;
  const roomValue = roomFilter.value;
  return state.students
    .filter(student => {
      const nameMatch = student.nombre.toLowerCase().includes(query);
      const computerMatch = String(student.computador).includes(query);
      const searchMatch = !query || nameMatch || computerMatch;
      const gradeMatch = !gradeValue || String(student.grado) === gradeValue;
      const roomMatch = !roomValue || String(student.salon) === roomValue;
      return searchMatch && gradeMatch && roomMatch;
    })
    .sort((a, b) => a.grado - b.grado || a.salon - b.salon || a.computador - b.computador);
}

function renderTable() {
  const students = getFilteredStudents();
  const duplicates = findDuplicateComputers(state.students);
  tableAlert.classList.toggle('hidden', duplicates.size === 0);
  studentTableBody.innerHTML = students.map(student => {
    const conflict = duplicates.has(student.computador) ? 'overlap' : '';
    return `
      <tr class="${conflict}">
        <td>${student.nombre}</td>
        <td>${student.grado}</td>
        <td>${student.salon}</td>
        <td>${student.computador}</td>
        <td>${student.estado}</td>
        <td>${student.observaciones || '—'}</td>
        <td class="table-actions">
          <button class="inline warning" data-action="view" data-id="${student.id}">Ver</button>
          ${sessionUser.role === 'ADMIN' ? `<button class="inline primary" data-action="edit" data-id="${student.id}">Editar</button><button class="inline danger" data-action="delete" data-id="${student.id}">Eliminar</button>` : ''}
        </td>
      </tr>`;
  }).join('');
}

function renderRoomMap() {
  const assigned = state.students.reduce((map, student) => {
    map[student.computador] = student;
    return map;
  }, {});
  const duplicates = findDuplicateComputers(state.students);
  const cells = Array.from({ length: 35 }, (_, index) => index + 1);
  roomMap.innerHTML = cells.map(number => {
    const student = assigned[number];
    const classes = ['map-cell', student ? 'assigned' : 'free', duplicates.has(number) ? 'overlap' : ''].filter(Boolean).join(' ');
    return `
      <div class="${classes}" data-computer="${number}">
        <strong>PC ${number}</strong>
        <span>${student ? student.nombre : 'Libre'}</span>
        <small>${student ? `Grado ${student.grado} • Salón ${student.salon}` : 'Disponible'}</small>
      </div>`;
  }).join('');
  statRooms.textContent = state.rooms.length;
  statOccupiedMap.textContent = state.students.filter(student => student.computador >= 1 && student.computador <= 35).length;
  statFreeMap.textContent = 35 - state.students.filter(student => student.computador >= 1 && student.computador <= 35).length;
}

function renderStats() {
  const total = state.students.length;
  const occupied = state.students.filter(student => student.computador >= 1 && student.computador <= 35).length;
  const activeCount = state.students.filter(student => student.estado === 'Activo').length;
  statTotal.textContent = total;
  statOccupied.textContent = occupied;
  statFree.textContent = 35 - occupied;
  statActive.textContent = activeCount;
}

function renderActivity() {
  activityCount.textContent = state.activity.length;
  activityLog.innerHTML = state.activity.slice(-20).reverse().map(entry => `<li>${entry}</li>`).join('');
}

function renderSummaries() {
  const gradeCounts = state.grades.map(grade => ({ grade, count: state.students.filter(s => s.grado === grade).length }));
  const roomCounts = state.rooms.map(room => ({ room, count: state.students.filter(s => s.salon === room).length }));
  gradeSummary.innerHTML = gradeCounts.map(item => `<article class="stat-card"><p>Grado ${item.grade}</p><span>${item.count} estudiantes</span></article>`).join('');
  roomSummary.innerHTML = roomCounts.map(item => `<article class="stat-card"><p>Salón ${item.room}</p><span>${item.count} estudiantes</span></article>`).join('');
}

function renderGradeTags() {
  gradeTags.innerHTML = state.grades.map(grade => `
    <span class="tag">Grado ${grade} <button type="button" data-action="remove-grade" data-value="${grade}">×</button></span>
  `).join('');
}

function renderRoomTags() {
  roomTags.innerHTML = state.rooms.map(room => `
    <span class="tag">Salón ${room} <button type="button" data-action="remove-room" data-value="${room}">×</button></span>
  `).join('');
}

function findDuplicateComputers(students) {
  const counts = new Map();
  students.forEach(student => {
    if (!student.computador) return;
    counts.set(student.computador, (counts.get(student.computador) || 0) + 1);
  });
  return new Set([...counts.entries()].filter(([, value]) => value > 1).map(([computer]) => computer));
}

function notifyActivity(message) {
  state.activity.push(`${new Date().toLocaleString()} · ${message}`);
  if (state.activity.length > 50) {
    state.activity.shift();
  }
  saveState();
  renderActivity();
}

function openModal(templateId, onOpen = () => {}) {
  const template = document.getElementById(templateId);
  if (!template) return;
  modalContent.innerHTML = '';
  modalContent.appendChild(template.content.cloneNode(true));
  modalOverlay.classList.remove('hidden');
  onOpen();
}

function closeModalWindow() {
  modalOverlay.classList.add('hidden');
  modalContent.innerHTML = '';
}

function blockIfReadOnly(actionName) {
  if (sessionUser.role === 'USUARIO') {
    alert(`Acción bloqueada: ${actionName} no está permitida en modo estudiante.`);
    return true;
  }
  return false;
}

function openStudentForm(id = null) {
  openModal('student-form-template', () => {
    const title = modalContent.querySelector('#modal-title');
    const form = modalContent.querySelector('#student-form');
    const cancel = modalContent.querySelector('#cancel-student');
    const gradeSelect = form.querySelector('[name="grado"]');
    const roomSelect = form.querySelector('[name="salon"]');

    gradeSelect.innerHTML = state.grades.map(grade => `<option value="${grade}">Grado ${grade}</option>`).join('');
    roomSelect.innerHTML = state.rooms.map(room => `<option value="${room}">Salón ${room}</option>`).join('');

    if (id) {
      const student = state.students.find(item => item.id === id);
      if (!student) return;
      title.textContent = 'Editar estudiante';
      form.nombre.value = student.nombre;
      form.grado.value = student.grado;
      form.salon.value = student.salon;
      form.computador.value = student.computador;
      form.estado.value = student.estado;
      form.observaciones.value = student.observaciones;
    }

    cancel.addEventListener('click', closeModalWindow, { once: true });

    form.onsubmit = event => {
      event.preventDefault();
      const studentData = {
        nombre: form.nombre.value.trim(),
        grado: Number(form.grado.value),
        salon: Number(form.salon.value),
        computador: Number(form.computador.value),
        estado: form.estado.value,
        observaciones: form.observaciones.value.trim()
      };
      const validation = validateStudent(studentData);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }
      if (id) {
        const target = state.students.find(item => item.id === id);
        Object.assign(target, studentData, { updatedAt: Date.now() });
        notifyActivity(`Estudiante actualizado: ${target.nombre}`);
      } else {
        state.students.push({ id: crypto.randomUUID(), ...studentData, updatedAt: Date.now() });
        notifyActivity(`Estudiante agregado: ${studentData.nombre}`);
      }
      saveState();
      renderDashboard();
      closeModalWindow();
    };
  });
}

function openStudentView(id) {
  openModal('student-form-template', () => {
    const title = modalContent.querySelector('#modal-title');
    const form = modalContent.querySelector('#student-form');
    const cancel = modalContent.querySelector('#cancel-student');
    const student = state.students.find(item => item.id === id);
    if (!student) return;
    title.textContent = 'Ver estudiante';
    form.nombre.value = student.nombre;
    form.grado.innerHTML = `<option>${student.grado}</option>`;
    form.salon.innerHTML = `<option>${student.salon}</option>`;
    form.computador.value = student.computador;
    form.estado.value = student.estado;
    form.observaciones.value = student.observaciones;
    form.querySelectorAll('input, select, textarea').forEach(field => field.disabled = true);
    form.querySelector('.primary-btn').classList.add('hidden');
    cancel.textContent = 'Cerrar';
    cancel.addEventListener('click', closeModalWindow, { once: true });
  });
}

function validateStudent(student) {
  if (!student.nombre) return { valid: false, message: 'El nombre es requerido.' };
  if (!student.grado || !state.grades.includes(student.grado)) return { valid: false, message: 'Selecciona un grado válido.' };
  if (!student.salon || !state.rooms.includes(student.salon)) return { valid: false, message: 'Selecciona un salón válido.' };
  if (!student.computador || student.computador < 1 || student.computador > 35) return { valid: false, message: 'El número de computador debe ser entre 1 y 35.' };
  if (!VALID_STATUSES.includes(student.estado)) return { valid: false, message: 'Selecciona un estado válido.' };
  return { valid: true };
}

function handleDeleteStudent(id) {
  if (blockIfReadOnly('eliminar estudiante')) return;
  const student = state.students.find(item => item.id === id);
  if (!student) return;
  if (!confirm(`Eliminar a ${student.nombre}?`)) return;
  state.students = state.students.filter(item => item.id !== id);
  notifyActivity(`Estudiante eliminado: ${student.nombre}`);
  saveState();
  renderDashboard();
}

function openImportForm() {
  if (blockIfReadOnly('carga masiva')) return;
  openModal('import-template', () => {
    const fileInput = modalContent.querySelector('#import-file');
    const confirmBtn = modalContent.querySelector('#import-confirm');
    const cancelBtn = modalContent.querySelector('#cancel-import');
    cancelBtn.addEventListener('click', closeModalWindow, { once: true });
    confirmBtn.addEventListener('click', () => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Selecciona un archivo CSV para importar.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const rows = reader.result.split('\n').map(row => row.trim()).filter(Boolean);
        const [header, ...dataRows] = rows;
        dataRows.forEach(row => {
          const [nombre, grado, salon, computador, estado, observaciones] = row.split(',').map(cell => cell.trim());
          const student = {
            id: crypto.randomUUID(),
            nombre,
            grado: Number(grado),
            salon: Number(salon),
            computador: Number(computador),
            estado: estado || 'Activo',
            observaciones: observaciones || '',
            updatedAt: Date.now()
          };
          if (validateStudent(student).valid) {
            state.students.push(student);
          }
        });
        saveState();
        renderDashboard();
        notifyActivity('Carga masiva realizada desde archivo CSV.');
        closeModalWindow();
      };
      reader.readAsText(file);
    }, { once: true });
  });
}

function addGrade() {
  const value = Number(newGradeInput.value);
  if (!value || state.grades.includes(value)) {
    alert('Ingresa un grado válido y no duplicado.');
    return;
  }
  state.grades.push(value);
  state.grades.sort((a, b) => a - b);
  if (!state.rooms.includes(value)) {
    state.rooms = state.rooms;
  }
  saveState();
  newGradeInput.value = '';
  renderDashboard();
  notifyActivity(`Grado agregado: ${value}`);
}

function addRoom() {
  const value = Number(newRoomInput.value);
  if (!value || state.rooms.includes(value)) {
    alert('Ingresa un salón válido y no duplicado.');
    return;
  }
  state.rooms.push(value);
  state.rooms.sort((a, b) => a - b);
  saveState();
  newRoomInput.value = '';
  renderDashboard();
  notifyActivity(`Salón agregado: ${value}`);
}

function removeGrade(value) {
  if (!confirm(`Eliminar grado ${value}? Los estudiantes con ese grado se mantendrán, pero no aparecerá el grado en la lista.`)) return;
  state.grades = state.grades.filter(grade => grade !== value);
  saveState();
  renderDashboard();
  notifyActivity(`Grado eliminado: ${value}`);
}

function removeRoom(value) {
  if (!confirm(`Eliminar salón ${value}? Los estudiantes con ese salón se mantendrán, pero no aparecerá el salón en la lista.`)) return;
  state.rooms = state.rooms.filter(room => room !== value);
  saveState();
  renderDashboard();
  notifyActivity(`Salón eliminado: ${value}`);
}

function downloadTemplate() {
  const header = 'nombre,grado,salon,computador,estado,observaciones\n';
  const csv = header + 'Ana Pérez,10,2,14,Activo,Mantener teclado\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'plantilla_estudiantes.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const role = registerRoleInput.value;
  const adminCode = document.getElementById('register-admin-code').value.trim();
  if (!username || !password) {
    alert('Completa usuario y contraseña.');
    return;
  }
  if (state.users[username]) {
    alert('Ese usuario ya existe. Elige otro nombre.');
    return;
  }
  if (role === 'ADMIN' && adminCode !== ADMIN_CODE) {
    alert('Código administrador incorrecto.');
    return;
  }
  state.users[username] = { password, role };
  saveState();
  alert('Registro exitoso. Ahora puedes iniciar sesión.');
  registerForm.reset();
  updateRoleCodeVisibility();
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!authenticate(username, password, selectedRole)) {
    alert('Credenciales incorrectas. Usa el rol y usuario adecuado.');
    return;
  }
  sessionUser = { username, role: selectedRole };
  saveUser(sessionUser);
  renderDashboard();
  showScreen('dashboard');
}

function setupEventListeners() {
  loginAdmin.addEventListener('click', () => setSelectedRole('ADMIN'));
  loginUser.addEventListener('click', () => setSelectedRole('USUARIO'));
  registerRoleInput.addEventListener('change', updateRoleCodeVisibility);
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  logoutButton.addEventListener('click', () => { clearUser(); showScreen('login'); });
  clearFiltersButton.addEventListener('click', () => { searchInput.value = ''; gradeFilter.value = ''; roomFilter.value = ''; renderTable(); });
  [searchInput, gradeFilter, roomFilter].forEach(control => control.addEventListener('input', renderTable));
  openAddModal.addEventListener('click', () => { if (!blockIfReadOnly('agregar estudiante')) openStudentForm(); });
  openImportModal.addEventListener('click', openImportForm);
  openAdminPanel.addEventListener('click', () => { showSection('admin'); });
  clearAllButton.addEventListener('click', () => {
    if (blockIfReadOnly('eliminar todos los estudiantes')) return;
    if (!confirm('¿Eliminar todos los estudiantes? Esta acción no se puede deshacer.')) return;
    state.students = [];
    notifyActivity('Todos los estudiantes fueron eliminados.');
    saveState();
    renderDashboard();
  });
  quickAdd.addEventListener('click', () => { if (!blockIfReadOnly('agregar estudiante')) openStudentForm(); });
  quickMap.addEventListener('click', () => { showSection('map'); });
  quickAdmin.addEventListener('click', () => { showSection('admin'); });
  clearActivityButton.addEventListener('click', () => {
    if (!confirm('¿Limpiar historial de actividad?')) return;
    state.activity = [];
    saveState();
    renderActivity();
  });
  addGradeButton.addEventListener('click', addGrade);
  addRoomButton.addEventListener('click', addRoom);
  closeModal.addEventListener('click', closeModalWindow);
  modalOverlay.addEventListener('click', event => { if (event.target === modalOverlay) closeModalWindow(); });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    const value = button.dataset.value;
    if (action === 'view') openStudentView(id);
    if (action === 'edit') { if (!blockIfReadOnly('editar estudiante')) openStudentForm(id); }
    if (action === 'delete') handleDeleteStudent(id);
    if (action === 'remove-grade') removeGrade(Number(value));
    if (action === 'remove-room') removeRoom(Number(value));
  });
  roomMap.addEventListener('click', event => {
    const card = event.target.closest('.map-cell');
    if (!card) return;
    const computer = Number(card.dataset.computer);
    const student = state.students.find(item => item.computador === computer);
    if (!student) {
      alert(`Computador ${computer} está libre.`);
      return;
    }
    openStudentView(student.id);
  });
  navButtons.forEach(button => button.addEventListener('click', () => showSection(button.dataset.section)));
}

setupEventListeners();
startApp();
