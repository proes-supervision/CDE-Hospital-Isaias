import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, UploadCloud, Activity, CheckCircle, 
  XCircle, Clock, Shield, Users, FileDigit, Settings, LogOut, ChevronRight, Lock, User, Copy, Database, MessageSquare, Menu, X
} from 'lucide-react';

// --- CONFIGURACIÓN ISO 19650 Y ACCESOS ---
const PROJECT_NAME = "CONSTRUCCION HOSPITAL DE SEGUNDO NIVEL ISAIAS";
const SUPERVISION_COMPANY = "PROES - MARCONI SOUTO";

const ROLE_CONFIG = {
  CONTRATISTA: {
    label: 'Contratista',
    password: 'CA01',
    users: ['Otto Medina', 'Hugo Fernandez', 'Fernando Pinaya', 'Dennis Vallejos', 'Erlan Lopez', 'Alejandra Terrazas']
  },
  SUPERVISION: {
    label: 'Supervisión',
    password: 'SN02',
    users: ['Zacarias Ortega', 'Cecilia Zurita', 'Edson Copa', 'Ariel Flores', 'Rodmy Alanez', 'Jose Rios']
  },
  FISCAL_OBRA: {
    label: 'Fiscal de Obra',
    password: 'FO03',
    users: ['Alex Colque', 'Mauricio Cortez', 'Rolando Bustillos']
  },
  FISCAL_SEG: {
    label: 'Fiscal de Seguimiento',
    password: 'FS04',
    users: ['Fiscal de Seguimiento Asignado']
  }
};

const ISO_CODES = {
  proyecto: 'HIO',
  originador: [
    { code: 'CON', name: 'Contratista' },
    { code: 'SUP', name: 'Supervisión' },
    { code: 'FDO', name: 'Fiscal de Obra' },
    { code: 'FDS', name: 'Fiscal de Seguimiento' }
  ],
  volumen: ['Z01', 'Z02', 'Z03', 'ZZZ'], 
  nivel: ['N00', 'N01', 'N02', 'N03', 'NZZ'], 
  tipo: [
    { code: 'M3D', name: 'Modelo 3D (rvt, ifc, nwd)' },
    { code: 'M2D', name: 'Plano 2D (dwg, pdf)' },
    { code: 'COM', name: 'Cómputo Métrico (xls, pdf)' },
    { code: 'INF', name: 'Informe (doc, pdf)' },
    { code: 'NOT', name: 'Nota (doc, pdf)' },
    { code: 'ACT', name: 'Acta (doc, pdf)' },
    { code: 'ESP', name: 'Especificación Técnica (doc, pdf)' },
    { code: 'MEM', name: 'Memoria de Cálculo (doc, pdf)' },
    { code: 'PRE', name: 'Presupuesto (xls, zpp)' },
    { code: 'CRN', name: 'Cronograma (mpp, pdf)' },
    { code: 'IMG', name: 'Imagen / Fotografía (png, jpg)' },
    { code: 'APU', name: 'Analisis de Precio Unitario' },
    { code: 'OTR', name: 'Otro documento' }
  ],
  disciplina: [
    { code: 'GER', name: 'Gerencia de Supervisión', reqRole: 'SUPERVISION' },
    { code: 'RES', name: 'Residencia de Supervisión', reqRole: 'SUPERVISION' },
    { code: 'ARQ', name: 'Arquitectura' },
    { code: 'EST', name: 'Estructuras' },
    { code: 'ELT', name: 'Eléctrica' },
    { code: 'HID', name: 'Hidrosanitario' },
    { code: 'GMD', name: 'Gases Medicinales' },
    { code: 'HVC', name: 'Climatización' },
    { code: 'COM', name: 'Datos y Comunicaciones' },
    { code: 'BIO', name: 'Biomédico' },
    { code: 'GNA', name: 'Gas Natural' },
    { code: 'SSO', name: 'Seguridad y Salud Ocupacional' },
    { code: 'MED', name: 'Medio Ambiente' },
    { code: 'GCC', name: 'Gestión / Coordinación / Control' }
  ],
  revision: [
    { code: 'VP', name: 'Versión Preliminar' },
    { code: 'VD', name: 'Versión Definitiva' },
    { code: 'AB', name: 'As-Built' }
  ],
  extensiones: [
    '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.dwg', '.rvt', 
    '.ifc', '.nwd', '.png', '.jpg', '.mpp', '.zpp', 'otro...'
  ],
  carpetas: [
    { code: 'WIP', name: 'WIP (En Progreso)' },
    { code: 'SHARED', name: 'Shared (Compartido)' },
    { code: 'PUBLISHED', name: 'Published (Publicado)' },
    { code: 'ARCHIVE', name: 'Archive (Archivado)' }
  ]
};

const WORKFLOW_STATES = {
  WIP: { id: 'WIP', label: 'Trabajo en Progreso', color: 'bg-slate-100 text-slate-700' },
  REVIEW_SUP: { id: 'REVIEW_SUP', label: 'Revisión Supervisión', color: 'bg-blue-100 text-blue-700' },
  REVIEW_FIS: { id: 'REVIEW_FIS', label: 'Revisión Fiscal', color: 'bg-purple-100 text-purple-700' },
  REJECTED: { id: 'REJECTED', label: 'Rechazado/Corregir', color: 'bg-red-100 text-red-700' },
  APPROVED: { id: 'APPROVED', label: 'Aprobado/Publicado', color: 'bg-emerald-100 text-emerald-700' },
  ARCHIVED: { id: 'ARCHIVED', label: 'Archivado/Histórico', color: 'bg-orange-100 text-orange-700' }
};

export default function App() {
  // --- ESTADOS GLOBALES ---
  const [userRole, setUserRole] = useState(null); // 'CONTRATISTA', 'SUPERVISION', etc.
  const [activeUser, setActiveUser] = useState(null); // Nombre de la persona específica
  const [currentView, setCurrentView] = useState('dashboard');
  
  // NUEVO: Estado para controlar el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- ESTADOS DE LOGIN ---
  const [loginStep, setLoginStep] = useState(1); // 1: Seleccionar rol, 2: Contraseña y Usuario
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- BASE DE DATOS SIMULADA ---
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      isoName: 'HIO-CON-ARQ-M2D-VP-001-V01.pdf',
      originalName: 'plano_arquitectura_final_v2.pdf',
      status: 'REVIEW_SUP',
      uploadedBy: 'Otto Medina',
      uploadedRole: 'CONTRATISTA',
      date: '2026-03-06',
      type: 'Plano 2D (dwg, pdf)',
      discipline: 'Arquitectura',
      comments: [],
      folder: 'SHARED',
      destinatario: 'Supervisión',
      description: 'Plano arquitectónico planta baja preliminar'
    },
    {
      id: 'doc-2',
      isoName: 'HIO-SUP-GCC-COM-VD-002-V01.xlsx',
      originalName: 'Planilla_Avance_Mes5_Corregida.xlsx',
      status: 'APPROVED',
      uploadedBy: 'Zacarias Ortega',
      uploadedRole: 'SUPERVISION',
      date: '2026-03-05',
      type: 'Cómputo Métrico (xls, pdf)',
      discipline: 'Gestión / Coordinación / Control',
      comments: [{ author: 'Zacarias Ortega', text: 'Planilla revisada y corregida.', date: '2026-03-05' }],
      folder: 'PUBLISHED',
      destinatario: 'Fiscal de Obra',
      description: 'Cómputos métricos consolidados del mes 5'
    }
  ]);
  
  const [logs, setLogs] = useState([
    { id: 1, action: 'Documento Subido', doc: 'HIO-CON-ARQ-M2D-VP-001-V01.pdf', user: 'Otto Medina (Contratista)', time: 'Hace 2 horas' },
    { id: 2, action: 'Aprobación Fiscal', doc: 'HIO-SUP-GCC-COM-VD-002-V01.xlsx', user: 'Alex Colque (Fiscal de Obra)', time: 'Ayer' }
  ]);

  // --- FUNCIONES DE LOGIN ---
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setSelectedUser(ROLE_CONFIG[roleKey].users[0]); // Seleccionar el primero por defecto
    setPasswordInput('');
    setLoginError('');
    setLoginStep(2);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ROLE_CONFIG[selectedRole].password) {
      setUserRole(selectedRole);
      setActiveUser(selectedUser);
      // Resetear estados de login
      setLoginStep(1);
      setSelectedRole(null);
      setPasswordInput('');
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta. Intente nuevamente.');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setActiveUser(null);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };

  // NUEVO: Enrutador que cierra el menú móvil automáticamente al seleccionar una opción
  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // 1. PANTALLA DE LOGIN
  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 antialiased">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mb-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <div className="flex flex-col items-center mb-2">
              <h1 className="text-4xl font-black text-blue-700 tracking-tight mb-2">CDE</h1>
              <h2 className="text-sm md:text-base font-bold text-slate-700 leading-tight uppercase max-w-[250px]">{PROJECT_NAME}</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">Plataforma de Gestión Documental según ISO 19650</p>
          </div>

          {loginStep === 1 ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-600 mb-4 text-center">Seleccione su área de acceso:</p>
              {Object.keys(ROLE_CONFIG).map(roleKey => (
                <button
                  key={roleKey}
                  onClick={() => handleRoleSelect(roleKey)}
                  className="w-full py-4 px-5 text-left border rounded-xl hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <span className="font-bold text-slate-700 group-hover:text-blue-700">
                    {ROLE_CONFIG[roleKey].label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <button type="button" onClick={() => setLoginStep(1)} className="text-sm text-blue-600 hover:underline font-semibold">
                  &larr; Volver
                </button>
                <span className="font-bold text-slate-700 flex-1 text-center">
                  Ingreso: {ROLE_CONFIG[selectedRole].label}
                </span>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-200">
                  {loginError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                  <User size={14}/> Seleccione su Usuario
                </label>
                <select 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {ROLE_CONFIG[selectedRole].users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
                  <Lock size={14}/> Contraseña de Acceso
                </label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-500/30"
              >
                Ingresar al Sistema
              </button>
            </form>
          )}
        </div>
        
        {/* Footer Login */}
        <p className="text-slate-400 text-xs text-center max-w-md font-bold mt-4">
          Desarrollado por <span className="text-blue-500 text-sm tracking-wider uppercase drop-shadow-sm">Zacarias Ortega</span> para el proyecto <span className="text-slate-300">{PROJECT_NAME}</span>
        </p>
      </div>
    );
  }

  // --- FILTRO DE VISIBILIDAD DE DOCUMENTOS ---
  // Restringe acceso a Fiscales para que solo vean lo que la Supervisión les envía o lo que ellos generan
  const visibleDocuments = documents.filter(doc => {
    if (userRole === 'SUPERVISION' || userRole === 'CONTRATISTA') return true;
    if (userRole === 'FISCAL_OBRA' || userRole === 'FISCAL_SEG') {
      const myLabel = ROLE_CONFIG[userRole].label;
      // Solo ven los que ellos mismos subieron o los que les han sido remitidos directamente como destinatarios.
      return doc.uploadedRole === userRole || doc.destinatario === myLabel;
    }
    return false;
  });

  // --- INTERFAZ PRINCIPAL ---
  return (
    <div className="min-h-screen bg-slate-50 flex antialiased text-slate-800 overflow-hidden relative">
      
      {/* OVERLAY PARA MÓVILES (Fondo oscuro al abrir el menú) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR RESPONSIVO */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 shrink-0`}>
        <div className="p-6 border-b border-slate-800 relative">
          
          {/* Botón de cerrar (Solo móvil) */}
          <button 
            className="md:hidden absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>

          <div className="flex items-start gap-3 text-white font-bold text-md leading-tight mb-4 pr-6">
            <Folder className="text-blue-500 shrink-0 mt-1" />
            <span>CDE HOSPITAL ISAIAS</span>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Usuario Activo
            </div>
            <div className="flex items-center gap-2 text-white font-semibold mb-1">
              <User size={14} className="text-blue-400 shrink-0" />
              <span className="truncate">{activeUser}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="truncate">{ROLE_CONFIG[userRole].label}</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarBtn active={currentView === 'dashboard'} onClick={() => handleNavigation('dashboard')} icon={<Activity />} text="Dashboard" />
          <SidebarBtn active={currentView === 'cde'} onClick={() => handleNavigation('cde')} icon={<Folder />} text="Entorno de Datos (CDE)" />
          <SidebarBtn active={currentView === 'upload'} onClick={() => handleNavigation('upload')} icon={<UploadCloud />} text="Subir / Generar ISO" />
          <SidebarBtn active={currentView === 'database'} onClick={() => handleNavigation('database')} icon={<Database />} text="Base de Datos Central" />
          <SidebarBtn active={currentView === 'logs'} onClick={() => handleNavigation('logs')} icon={<Clock />} text="Audit Trail" />
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-semibold hover:text-white hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* HEADER RESPONSIVO */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3 md:gap-0 min-w-0">
            {/* Botón de Menú Hamburguesa (Solo móvil) */}
            <button 
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">
              {currentView === 'dashboard' ? 'Dashboard General' : 
               currentView === 'cde' ? 'Entorno de Datos Común' : 
               currentView === 'upload' ? 'Carga de Documentos' : 
               currentView === 'database' ? 'Base de Datos' : 'Trazabilidad'}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-400">Supervisión a cargo de:</span>
              <span className="text-sm font-bold text-slate-700">{SUPERVISION_COMPANY}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
            <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 shrink-0">
              <Shield size={16} className="text-blue-500" />
              <span className="hidden sm:inline">ISO 19650</span>
            </span>
          </div>
        </header>

        {/* MAIN AREA */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50 w-full">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardView documents={visibleDocuments} logs={logs} role={userRole} />}
            {currentView === 'cde' && <CDEView documents={visibleDocuments} role={userRole} activeUser={activeUser} setDocuments={setDocuments} setLogs={setLogs} />}
            {currentView === 'upload' && <UploadView setDocuments={setDocuments} setLogs={setLogs} setCurrentView={setCurrentView} activeUser={activeUser} role={userRole} documentsLength={documents.length} />}
            {currentView === 'database' && <DatabaseView documents={documents} />}
            {currentView === 'logs' && <LogsView logs={logs} />}
          </div>
        </main>

        {/* PERSISTENT FOOTER */}
        <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold text-slate-400">
            Desarrollado por <span className="text-blue-400 text-sm tracking-wider uppercase drop-shadow-sm">Zacarias Ortega</span> para el proyecto <span className="text-slate-300">{PROJECT_NAME}</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// VISTAS DEL SISTEMA
// ==========================================

function DashboardView({ documents, logs, role }) {
  const pendingReview = documents.filter(d => 
    (role === 'SUPERVISION' && d.status === 'REVIEW_SUP') || 
    (role.includes('FISCAL') && d.status === 'REVIEW_FIS')
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Documentos" value={documents.length} icon={<FileText />} color="blue" />
        <StatCard title="Aprobados (Publicados)" value={documents.filter(d => d.status === 'APPROVED').length} icon={<CheckCircle />} color="emerald" />
        <StatCard title="Requieren tu Revisión" value={pendingReview} icon={<Clock />} color="orange" highlight={pendingReview > 0} />
        <StatCard title="Rechazados" value={documents.filter(d => d.status === 'REJECTED').length} icon={<XCircle />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Folder className="text-slate-400" /> Flujo de Trabajo Reciente</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Código ISO</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 rounded-tr-lg">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{doc.isoName}</td>
                    <td className="px-4 py-3">{doc.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${WORKFLOW_STATES[doc.status].color}`}>
                        {WORKFLOW_STATES[doc.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">{doc.date.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity className="text-slate-400" /> Audit Trail Rápido</h3>
          <div className="space-y-4">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div>
                  <p className="font-semibold text-slate-700">{log.action}</p>
                  <p className="text-xs text-slate-500 font-mono truncate w-48" title={log.doc}>{log.doc}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1">{log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CDEView({ documents, role, activeUser, setDocuments, setLogs }) {
  // Estado para el Modal de Justificación de Movimientos
  const [modalConfig, setModalConfig] = useState(null);
  const [actionComment, setActionComment] = useState('');

  // 1. Interceptor: Prepara la acción y abre el Modal
  const requestAction = (doc, actionType, payload = {}) => {
    setModalConfig({ doc, actionType, payload });
    setActionComment('');
  };

  // 2. Ejecutor: Aplica la lógica una vez confirmado el comentario
  const executeAction = (e) => {
    e.preventDefault();
    if (!modalConfig) return;

    const { doc, actionType, payload } = modalConfig;
    const commentText = actionComment.trim() ? ` | Motivo: ${actionComment}` : '';

    if (actionType === 'MANUAL_MOVE') {
      let newStatus = 'WIP';
      if (payload.targetFolder === 'SHARED') newStatus = 'REVIEW_FIS';
      if (payload.targetFolder === 'PUBLISHED') newStatus = 'APPROVED';
      if (payload.targetFolder === 'ARCHIVE') newStatus = 'ARCHIVED';

      setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, status: newStatus, folder: payload.targetFolder } : d));
      
      setLogs(prev => [{
        id: Date.now(),
        action: `Traslado Administrativo (a ${payload.targetFolder})${commentText}`,
        doc: doc.isoName,
        user: `${activeUser} (${ROLE_CONFIG[role].label})`,
        time: new Date().toLocaleString()
      }, ...prev]);

    } else if (actionType === 'REMITIR') {
      setDocuments(docs => {
        const existeCopia = docs.some(d => d.isoName === doc.isoName && d.folder === 'PUBLISHED');
        const updatedDocs = docs.map(d => d.id === doc.id ? { ...d, status: 'REVIEW_FIS', destinatario: payload.destinatario } : d);

        if (!existeCopia) {
          const copyDoc = {
            ...doc,
            id: `${doc.id}-copy-${Date.now()}`,
            status: 'APPROVED',
            folder: 'PUBLISHED',
            destinatario: 'General / Publicado',
            description: `${doc.description ? doc.description + ' ' : ''}(Copia Automática)`
          };
          return [copyDoc, ...updatedDocs];
        }
        return updatedDocs;
      });

      setLogs(prev => [{
        id: Date.now(),
        action: `Remitido a ${payload.destinatario} (Copia PUBLISHED)${commentText}`,
        doc: doc.isoName,
        user: `${activeUser} (${ROLE_CONFIG[role].label})`,
        time: new Date().toLocaleString()
      }, ...prev]);

    } else {
      // Acciones Secuenciales Estándar
      let newStatus = doc.status;
      let newFolder = doc.folder;
      let newDest = doc.destinatario;
      let actionName = '';

      if (actionType === 'APPROVE') {
        newStatus = 'APPROVED'; newFolder = 'PUBLISHED'; newDest = 'General / Publicado';
        actionName = `Aprobado Final (Movido a PUBLISHED)${commentText}`;
      } else if (actionType === 'REJECT') {
        newStatus = 'REJECTED'; newFolder = 'WIP'; newDest = doc.uploadedBy;
        actionName = `Rechazado/Observado (Devuelto a Originador)${commentText}`;
      } else if (actionType === 'RETURN_SUP') {
        newStatus = 'REVIEW_SUP'; newFolder = 'SHARED'; newDest = 'Supervisión';
        actionName = `Devuelto a Supervisión (Permanece en SHARED)${commentText}`;
      } else if (actionType === 'ARCHIVE') {
        newStatus = 'ARCHIVED'; newFolder = 'ARCHIVE'; newDest = 'Archivo General';
        actionName = `Archivado (Movido a ARCHIVE)${commentText}`;
      }

      setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, status: newStatus, folder: newFolder, destinatario: newDest } : d));
      
      setLogs(prev => [{
        id: Date.now(),
        action: actionName,
        doc: doc.isoName,
        user: `${activeUser} (${ROLE_CONFIG[role].label})`,
        time: new Date().toLocaleString()
      }, ...prev]);
    }

    // Cerrar modal y limpiar
    setModalConfig(null);
    setActionComment('');
  };

  const CARPETAS_CDE = [
    { id: 'WIP', name: '01-WIP (Trabajo en Progreso)', color: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
    { id: 'SHARED', name: '02-SHARED (Compartido / Revisión)', color: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
    { id: 'PUBLISHED', name: '03-PUBLISHED (Publicado / Aprobado)', color: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800' },
    { id: 'ARCHIVE', name: '04-ARCHIVE (Archivado / Histórico)', color: 'bg-orange-50 border-orange-300', text: 'text-orange-800' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px] relative">
      
      {/* MODAL DE JUSTIFICACIÓN DE ACCIONES */}
      {modalConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <MessageSquare className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 leading-tight">Justificación Requerida</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trazabilidad del CDE</p>
              </div>
            </div>
            
            <form onSubmit={executeAction}>
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1 font-medium">Documento afectado:</p>
                <p className="text-sm font-mono font-bold text-slate-800 break-all">{modalConfig.doc.isoName}</p>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-black text-slate-700 uppercase">Motivo / Comentario (Recomendado)</label>
                <textarea 
                  value={actionComment}
                  onChange={e => setActionComment(e.target.value)}
                  placeholder="Explique brevemente el motivo de este movimiento o cambio de estado para que quede registrado en la base de datos..."
                  className="w-full border border-slate-300 p-3 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-24"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setModalConfig(null)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 shadow-md transition-colors">
                  Confirmar y Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Folder className="text-blue-600"/> Directorio CDE Estructurado</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Los documentos se agrupan automáticamente según su estado y carpeta de destino.</p>
        </div>
      </div>

      <div className="space-y-8">
        {CARPETAS_CDE.map(carpeta => {
          const docsEnCarpeta = documents.filter(d => d.folder === carpeta.id);
          
          return (
            <div key={carpeta.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className={`px-5 py-3 border-b font-bold ${carpeta.color} ${carpeta.text} flex justify-between items-center`}>
                <span className="flex items-center gap-2"><Folder size={18} /> {carpeta.name}</span>
                <span className="bg-white/60 px-3 py-1 rounded-md text-xs border border-white/40 shadow-sm">{docsEnCarpeta.length} archivos</span>
              </div>
              
              <div className="p-4 bg-slate-50 space-y-3 min-h-[80px]">
                {docsEnCarpeta.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                    <Folder size={32} className="opacity-20 mb-2" />
                    <p className="text-sm font-medium text-center">Carpeta vacía</p>
                  </div>
                ) : (
                  docsEnCarpeta.map(doc => (
                    <div key={doc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg shadow-sm border border-slate-200">
                          <FileDigit className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-mono font-bold text-slate-800 text-sm md:text-base">{doc.isoName}</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Original: {doc.originalName} • Subido por: {doc.uploadedBy} el {doc.date}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            <span className="text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              {doc.type} • {doc.discipline}
                            </span>
                            <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] ${WORKFLOW_STATES[doc.status].color}`}>
                              {WORKFLOW_STATES[doc.status].label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* ACCIONES DE FLUJO DE TRABAJO BASADAS EN EL ROL */}
                      <div className="mt-4 md:mt-0 flex flex-wrap gap-2 w-full md:w-auto">
                        <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex-1 md:flex-none">
                          Ver Doc
                        </button>
                        
                        {/* Botón de Archivar para Fiscal de Obra y Fiscal de Seguimiento */}
                        {doc.folder !== 'ARCHIVE' && (role === 'FISCAL_OBRA' || role === 'FISCAL_SEG') && (
                          <button onClick={() => requestAction(doc, 'ARCHIVE')} className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors flex-1 md:flex-none">
                            Archivar
                          </button>
                        )}
                        
                        {/* Autorización Especial: Traslado Libre para Supervisión */}
                        {role === 'SUPERVISION' && (
                          <select
                            value=""
                            onChange={(e) => {
                              requestAction(doc, 'MANUAL_MOVE', { targetFolder: e.target.value });
                              e.target.value = ""; // Resetear select
                            }}
                            className="px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-700 cursor-pointer transition-colors flex-1 md:flex-none outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="" disabled>Trasladar a...</option>
                            {doc.folder !== 'WIP' && <option value="WIP">➡️ Carpeta WIP</option>}
                            {doc.folder !== 'SHARED' && <option value="SHARED">➡️ Carpeta SHARED</option>}
                            {doc.folder !== 'PUBLISHED' && <option value="PUBLISHED">➡️ Carpeta PUBLISHED</option>}
                            {doc.folder !== 'ARCHIVE' && <option value="ARCHIVE">➡️ Carpeta ARCHIVE</option>}
                          </select>
                        )}
                        
                        {/* Acciones del Flujo Secuencial Normal (Solo para Supervisión en SHARED) */}
                        {role === 'SUPERVISION' && doc.folder === 'SHARED' && (
                          <>
                            <button onClick={() => requestAction(doc, 'REMITIR', { destinatario: 'Fiscal de Obra' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-colors flex-1 md:flex-none">
                              Enviar a Fiscal de Obra
                            </button>
                            <button onClick={() => requestAction(doc, 'REMITIR', { destinatario: 'Fiscal de Seguimiento' })} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-colors flex-1 md:flex-none">
                              Enviar a Fiscal de Seguimiento
                            </button>
                          </>
                        )}
                        
                        {/* Acciones de los Fiscales */}
                        {(role === 'FISCAL_OBRA' || role === 'FISCAL_SEG') && doc.status === 'REVIEW_FIS' && (
                          <>
                            <button onClick={() => requestAction(doc, 'RETURN_SUP')} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
                              Devolver a Supervisión
                            </button>
                            <button onClick={() => requestAction(doc, 'APPROVE')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-md transition-colors">
                              Aprobar Final
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UploadView({ setDocuments, setLogs, setCurrentView, activeUser, role, documentsLength }) {
  // Lógica de Destinatario según el Rol
  let destinatarioOptions = [];
  if (role === 'CONTRATISTA') destinatarioOptions = ['Supervisión'];
  else if (role === 'SUPERVISION') destinatarioOptions = ['Contratista', 'Fiscal de Obra', 'Fiscal de Seguimiento'];
  else destinatarioOptions = ['Supervisión']; // Fiscales envían a Supervisión

  // Disciplinas filtradas (GER y RES solo para Supervisión)
  const disciplinasFiltradas = ISO_CODES.disciplina.filter(d => 
    !d.reqRole || d.reqRole === role
  );

  // Fecha y Correlativo Automáticos
  const fechaActual = new Date().toISOString().split('T')[0];
  const autoNumero = String(documentsLength + 1).padStart(3, '0');

  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [isCopied, setIsCopied] = useState(false); // Estado para el botón de copiar

  const [formData, setFormData] = useState({
    originador: role === 'CONTRATISTA' ? 'CON' : role === 'SUPERVISION' ? 'SUP' : 'FDO',
    disciplina: disciplinasFiltradas[0].code,
    tipo: 'M2D',
    revision: 'VP',
    fecha: fechaActual,
    version: 'V01',
    extension: '.pdf',
    carpetaDestino: 'WIP',
    destinatario: destinatarioOptions[0],
    descripcion: '',
    file: null
  });

  const generatedName = `HIO-${formData.originador}-${formData.disciplina}-${formData.tipo}-${formData.revision}-${autoNumero}-${formData.version}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      setFormError('Por favor, selecciona o arrastra un archivo.');
      return;
    }
    
    // Validación de peso máximo del archivo (500 MB = 500 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 524288000;
    if (formData.file.size > MAX_FILE_SIZE) {
      setFormError('El archivo supera el límite máximo permitido de 500 MB.');
      return;
    }

    if (!formData.version) {
      setFormError('Por favor, ingresa la Versión del documento (ej. V01).');
      return;
    }
    
    setFormError('');
    
    // Si el usuario eligió una extensión manualmente del selector, se usa esa, sino la original.
    let ext = formData.extension === 'otro...' ? `.${formData.file.name.split('.').pop()}` : formData.extension;
    const finalName = `${generatedName}${ext}`;
    
    const newDoc = {
      id: `doc-${Date.now()}`,
      isoName: finalName,
      originalName: formData.file.name,
      status: formData.carpetaDestino === 'WIP' ? 'WIP' : formData.carpetaDestino === 'PUBLISHED' ? 'APPROVED' : 'REVIEW_SUP',
      uploadedBy: activeUser,
      uploadedRole: role,
      date: formData.fecha,
      type: ISO_CODES.tipo.find(t => t.code === formData.tipo)?.name || formData.tipo,
      discipline: ISO_CODES.disciplina.find(d => d.code === formData.disciplina)?.name || formData.disciplina,
      comments: [],
      folder: formData.carpetaDestino,
      destinatario: formData.destinatario,
      description: formData.descripcion
    };

    setDocuments(prev => [newDoc, ...prev]);
    
    // Añadir al Audit Trail simulando guardado en Google Sheets
    const actionText = `Genera Doc -> ${formData.carpetaDestino} (Envía a: ${formData.destinatario})`;
    const newLog = {
      id: Date.now(),
      action: actionText,
      doc: finalName,
      user: `${activeUser} (${ROLE_CONFIG[role].label})`,
      time: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev]);
    
    // Mostrar notificación de éxito y luego redirigir
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentView('cde');
    }, 2500);
  };

  // Función para copiar al portapapeles de forma segura
  const handleCopyName = () => {
    let ext = formData.extension === 'otro...' ? '' : formData.extension;
    const textToCopy = `${generatedName}${ext}`;
    
    // Usando execCommand para máxima compatibilidad
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* MODAL DE ÉXITO DE OPERACIÓN */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 transition-all">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">¡Documento Guardado!</h3>
            <p className="text-sm text-slate-500 mb-6">El archivo se ha subido al CDE y se notificó a {formData.destinatario}.</p>
            <div className="flex space-x-2 justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2"><Settings /> Generador y Carga ISO 19650</h3>
            <p className="text-blue-100 text-sm mt-1 font-medium">
              El documento será almacenado de forma segura y registrado en la base de datos central automáticamente.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {formError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 flex items-center gap-2">
              <XCircle size={18} /> {formError}
            </div>
          )}

          {/* Vista previa del nombre */}
          <div className="mb-8 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl text-center shadow-inner relative group">
            <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2">Nombre Estandarizado ISO 19650 (Autogenerado)</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-2xl md:text-3xl font-mono font-bold text-blue-900 tracking-tight break-all">
                {generatedName}<span className="text-blue-500">{formData.extension === 'otro...' ? '[ext]' : formData.extension}</span>
              </p>
              <button 
                type="button"
                onClick={handleCopyName}
                title="Copiar nombre al portapapeles"
                className={`p-2 rounded-lg transition-all flex items-center gap-1 ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-700'}`}
              >
                {isCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
                <span className="text-xs font-bold hidden md:inline">{isCopied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <div className="space-y-1.5 bg-slate-100 p-2.5 rounded-lg border border-slate-200 shadow-inner">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                 Originador
              </label>
              <input type="text" value={formData.originador} readOnly className="w-full bg-slate-200 border border-slate-300 p-2 rounded-md text-sm font-bold text-slate-500 cursor-not-allowed text-center" />
            </div>
            
            <SelectField label="Disciplina/Rol" value={formData.disciplina} onChange={e => setFormData({...formData, disciplina: e.target.value})} options={disciplinasFiltradas} />
            <SelectField label="Tipo Documento" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} options={ISO_CODES.tipo} />
            <SelectField label="Revisión" value={formData.revision} onChange={e => setFormData({...formData, revision: e.target.value})} options={ISO_CODES.revision} />
            
            <div className="space-y-1.5 bg-slate-100 p-2.5 rounded-lg border border-slate-200 shadow-inner flex flex-col justify-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                 Nº Sistema (CDE)
              </label>
              <input type="text" value={autoNumero} readOnly className="w-full bg-slate-200 border border-slate-300 p-2 rounded-md text-sm font-mono font-bold text-slate-500 cursor-not-allowed text-center" />
            </div>
            
            <div className="space-y-1.5 bg-slate-100 p-2.5 rounded-lg border border-slate-200 shadow-inner flex flex-col justify-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Fecha</label>
              <input type="date" value={formData.fecha} readOnly className="w-full bg-slate-200 border border-slate-300 p-2 rounded-md text-sm font-bold text-slate-500 cursor-not-allowed" />
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Versión</label>
              <input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value.toUpperCase()})} placeholder="V01" maxLength="3" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-mono font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Extensión</label>
              <select value={formData.extension} onChange={e => setFormData({...formData, extension: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {ISO_CODES.extensiones.map(ext => (
                  <option key={ext} value={ext}>{ext}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SECCIÓN SEPARADA DE ENRUTAMIENTO */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mb-8 shadow-inner">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-300 pb-2">
              <Folder size={18}/> Enrutamiento y Destino del Documento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Carpeta Destino" value={formData.carpetaDestino} onChange={e => setFormData({...formData, carpetaDestino: e.target.value})} options={ISO_CODES.carpetas} />
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider text-blue-600">Entregar A</label>
                <select value={formData.destinatario} onChange={e => setFormData({...formData, destinatario: e.target.value})} className="w-full border-2 border-blue-200 bg-blue-50 p-2.5 rounded-lg text-sm font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {destinatarioOptions.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Descripción del Archivo (Opcional)</label>
            <textarea 
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Añade un texto breve describiendo el contenido de este archivo para mayor contexto..."
              className="w-full border border-slate-300 p-3 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
            />
          </div>

          <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-8 text-center hover:bg-blue-50 transition-colors relative cursor-pointer group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const ext = `.${file.name.split('.').pop().toLowerCase()}`;
                  // Autoseleccionar extensión si está en la lista
                  const matchedExt = ISO_CODES.extensiones.includes(ext) ? ext : 'otro...';
                  setFormData({...formData, file: file, extension: matchedExt});
                }
              }}
            />
            <UploadCloud className="w-12 h-12 text-blue-400 mx-auto mb-3 group-hover:text-blue-600 transition-colors" />
            <p className="font-bold text-slate-700 text-lg">
              {formData.file ? formData.file.name : 'Haz clic o arrastra el archivo aquí'}
            </p>
            <p className="text-sm font-semibold text-slate-500 mt-1">Sube el archivo (Máx. 500 MB) para guardarlo en la carpeta {formData.carpetaDestino}</p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-end gap-3 border-t border-slate-200 pt-6">
            <button type="button" onClick={() => setCurrentView('cde')} className="px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-3 bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-colors">
              <CheckCircle size={20} /> Guardar y Notificar a {formData.destinatario}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LogsView({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <Clock className="text-blue-600" /> Trazabilidad Completa (Audit Trail)
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-2">
          Registro inmutable de todas las acciones, aprobaciones y modificaciones en el Entorno de Datos Común.
        </p>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-8">
            <div className="absolute -left-2 top-1.5 w-4 h-4 bg-blue-500 rounded-full ring-4 ring-white shadow-sm"></div>
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
                <span className="font-bold text-slate-800 text-base">{log.action}</span>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm inline-block">
                  {log.time}
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-600">
                  Documento: <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{log.doc}</span>
                </p>
                <p className="text-sm font-semibold text-slate-600">
                  Actor responsable: <span className="font-bold text-slate-800">{log.user}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UTILIDADES UI ---

function SidebarBtn({ active, icon, text, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm
        ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      {React.cloneElement(icon, { size: 20 })}
      <span>{text}</span>
    </button>
  );
}

function StatCard({ title, value, icon, color, highlight }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  
  return (
    <div className={`p-6 rounded-xl border ${colors[color]} ${highlight ? 'ring-2 ring-orange-400 shadow-lg' : 'shadow-sm'} flex flex-col justify-center h-full`}>
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <p className={`text-xs font-black uppercase tracking-wider opacity-70 mb-2 leading-tight`}>{title}</p>
          <h3 className="text-3xl md:text-4xl font-black tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-white/60 rounded-xl shadow-sm shrink-0">
          {React.cloneElement(icon, { size: 28 })}
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={onChange} className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        {options.map(opt => (
          <option key={opt.code} value={opt.code}>{opt.code} - {opt.name}</option>
        ))}
      </select>
    </div>
  );
}

function DatabaseView({ documents }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-emerald-600 p-5 text-white flex items-center gap-3">
        <div className="bg-emerald-700/50 p-2 rounded-lg border border-emerald-500/30">
          <Database size={24} />
        </div>
        <div>
          <h3 className="font-bold text-xl">Registro Maestro (Base de Datos)</h3>
          <p className="text-emerald-100 text-sm font-medium mt-0.5">Vista de solo lectura del histórico general para todos los actores</p>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-slate-600 bg-slate-100 border-b border-slate-300 uppercase font-black tracking-wider">
            <tr>
              <th className="px-5 py-4 border-r border-slate-200">Fecha</th>
              <th className="px-5 py-4 border-r border-slate-200">Nombre ISO</th>
              <th className="px-5 py-4 border-r border-slate-200">Originador</th>
              <th className="px-5 py-4 border-r border-slate-200">Entregado A</th>
              <th className="px-5 py-4 border-r border-slate-200">Carpeta</th>
              <th className="px-5 py-4 border-r border-slate-200">Estado</th>
              <th className="px-5 py-4">Descripción / Notas</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 border-r border-slate-200 text-slate-600 font-medium">{doc.date}</td>
                <td className="px-5 py-3 border-r border-slate-200 font-mono text-blue-700 font-bold">{doc.isoName}</td>
                <td className="px-5 py-3 border-r border-slate-200 text-slate-700">{doc.uploadedBy} <span className="text-[10px] text-slate-400 block uppercase font-bold">{doc.uploadedRole}</span></td>
                <td className="px-5 py-3 border-r border-slate-200 text-emerald-700 font-bold">{doc.destinatario}</td>
                <td className="px-5 py-3 border-r border-slate-200">
                  <span className="bg-slate-200 px-2.5 py-1 rounded text-[11px] font-black uppercase text-slate-700 tracking-wide">{doc.folder}</span>
                </td>
                <td className="px-5 py-3 border-r border-slate-200">
                  <span className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[10px] ${WORKFLOW_STATES[doc.status]?.color || 'bg-slate-100 text-slate-700'}`}>
                    {WORKFLOW_STATES[doc.status]?.label || doc.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500 font-medium truncate max-w-xs" title={doc.description}>{doc.description || '-'}</td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-slate-500 font-medium">No hay registros en la base de datos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
