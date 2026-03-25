import React, { useState, useEffect } from 'react';
import { 
  Folder, FileText, UploadCloud, Activity, CheckCircle, 
  XCircle, Clock, Shield, Users, FileDigit, Settings, LogOut, ChevronRight, Lock, User, Copy, Database, MessageSquare, Menu, X, RefreshCw
} from 'lucide-react';

// ==========================================
// 🔴 1. PEGA TU URL MÁGICA AQUÍ ABAJO 🔴
// ==========================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwWi5jBiEOhUXaIV7t3I-IdfDWAR87HtavkUVyALNHCU5FZEB7MfzAsWW3vvpbZ8IN5Sw/exec';

// --- CONFIGURACIÓN ISO 19650 Y ACCESOS ---
const PROJECT_NAME = "CONSTRUCCION HOSPITAL DE SEGUNDO NIVEL ISAIAS";
const SUPERVISION_COMPANY = "PROES - MARCONI SOUTO";

const ROLE_CONFIG = {
  CONTRATISTA: { label: 'Contratista', password: 'CA01', users: ['Otto Medina', 'Hugo Fernandez', 'Fernando Pinaya', 'Dennis Vallejos', 'Erlan Lopez', 'Alejandra Terrazas'] },
  SUPERVISION: { label: 'Supervisión', password: 'SN02', users: ['Zacarias Ortega', 'Cecilia Zurita', 'Edson Copa', 'Ariel Flores', 'Rodmy Alanez', 'Jose Rios'] },
  FISCAL_OBRA: { label: 'Fiscal de Obra', password: 'FO03', users: ['Alex Colque', 'Mauricio Cortez', 'Rolando Bustillos'] },
  FISCAL_SEG: { label: 'Fiscal de Seguimiento', password: 'FS04', users: ['Fiscal de Seguimiento Asignado'] }
};

const ISO_CODES = {
  proyecto: 'HIO',
  originador: [
    { code: 'CON', name: 'Contratista' },
    { code: 'SUP', name: 'Supervisión' },
    { code: 'FDO', name: 'Fiscal de Obra' },
    { code: 'FDS', name: 'Fiscal de Seguimiento' }
  ],
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
  extensiones: [ '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.dwg', '.rvt', '.ifc', '.nwd', '.png', '.jpg', '.mpp', '.zpp', 'otro...' ],
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
  const [userRole, setUserRole] = useState(null); 
  const [activeUser, setActiveUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [loginStep, setLoginStep] = useState(1); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- ESTADOS DE DATOS REALES ---
  const [documents, setDocuments] = useState([]); 
  const [allLogs, setAllLogs] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);

  // --- MOTOR DE CONEXIÓN CON GOOGLE SHEETS ---
  const loadDataFromDatabase = async () => {
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return;
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const formattedLogs = result.data.map((row, index) => ({
          id: `log-${index}-${Date.now()}`,
          date: row['Fecha y Hora (Timestamp)'] || row['Fecha'] || '',
          isoName: row['Nombre ISO'] || '',
          originalName: row['Nombre Original'] || '',
          folder: row['Carpeta Destino'] || 'WIP',
          status: row['Estado'] || 'WIP',
          originador: row['Originador'] || '',
          discipline: row['Disciplina'] || '',
          type: row['Tipo Doc'] || '',
          revision: row['Revisión'] || '',
          version: row['Versión'] || '',
          uploadedBy: row['Subido Por (Usuario)'] || row['Subido Por'] || '',
          uploadedRole: row['Rol'] || '',
          destinatario: row['Entregado A (Destinatario)'] || row['Entregado A'] || '',
          description: row['Descripción'] || row['Descripción / Motivo'] || '',
          driveUrl: row['Link del Archivo (Drive)'] || row['Link en Google Drive'] || '#'
        }));

        const reversedLogs = formattedLogs.reverse();
        setAllLogs(reversedLogs);

        const uniqueDocsMap = {};
        reversedLogs.forEach(log => {
          if (!uniqueDocsMap[log.isoName]) {
            uniqueDocsMap[log.isoName] = { ...log, id: log.isoName }; 
          }
        });
        setDocuments(Object.values(uniqueDocsMap));
      }
    } catch (error) {
      console.error("Error conectando a la base de datos:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (userRole) loadDataFromDatabase();
  }, [userRole]);

  // --- HELPER PARA ENVIAR ACTUALIZACIONES DE ESTADO A GOOGLE ---
  const logActionToDatabase = async (updatedDoc, actionDescription) => {
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return;
    
    const payload = {
      actionType: 'UPDATE_STATUS', 
      fecha: new Date().toLocaleString(),
      isoName: updatedDoc.isoName,
      originalName: updatedDoc.originalName,
      carpetaDestino: updatedDoc.folder,
      status: updatedDoc.status,
      originador: updatedDoc.originador,
      disciplina: updatedDoc.discipline,
      tipo: updatedDoc.type,
      revision: updatedDoc.revision,
      version: updatedDoc.version,
      uploadedBy: activeUser, 
      uploadedRole: userRole,
      destinatario: updatedDoc.destinatario,
      descripcion: actionDescription,
      driveUrl: updatedDoc.driveUrl 
    };

    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
      await loadDataFromDatabase(); 
    } catch (error) {
      console.error("Error actualizando estado en base de datos:", error);
    }
  };

  // --- FUNCIONES DE LOGIN ---
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setSelectedUser(ROLE_CONFIG[roleKey].users[0]);
    setPasswordInput('');
    setLoginError('');
    setLoginStep(2);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ROLE_CONFIG[selectedRole].password) {
      setUserRole(selectedRole);
      setActiveUser(selectedUser);
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
    setDocuments([]);
    setAllLogs([]);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 antialiased selection:bg-blue-500 selection:text-white">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full mb-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" strokeWidth={1.5} />
            <div className="flex flex-col items-center mb-1.5">
              <h1 className="text-3xl font-black text-blue-700 tracking-tight mb-1">CDE</h1>
              <h2 className="text-xs font-bold text-slate-700 leading-tight uppercase text-center tracking-wide">{PROJECT_NAME}</h2>
            </div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Gestión Documental ISO 19650</p>
          </div>

          {loginStep === 1 ? (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-slate-500 mb-3 text-center uppercase tracking-wider">Seleccione su perfil de acceso</p>
              {Object.keys(ROLE_CONFIG).map(roleKey => (
                <button key={roleKey} onClick={() => handleRoleSelect(roleKey)} className="w-full py-3 px-4 text-left border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group">
                  <span className="font-bold text-slate-700 text-xs group-hover:text-blue-700">{ROLE_CONFIG[roleKey].label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <button type="button" onClick={() => setLoginStep(1)} className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 transition-colors">&larr; Volver</button>
                <span className="font-bold text-slate-700 flex-1 text-center text-xs uppercase tracking-wide">Ingreso: {ROLE_CONFIG[selectedRole].label}</span>
              </div>
              {loginError && <div className="p-2.5 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-200 text-center">{loginError}</div>}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><User size={12}/> Usuario Asignado</label>
                <select value={selectedUser || ''} onChange={(e) => setSelectedUser(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  {ROLE_CONFIG[selectedRole].users.map(user => <option key={user} value={user}>{user}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Lock size={12}/> Contraseña de Seguridad</label>
                <input type="password" value={passwordInput || ''} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all mt-2 shadow-md shadow-blue-600/20">Autorizar Ingreso</button>
            </form>
          )}
        </div>
        <p className="text-slate-400 text-xs text-center max-w-md font-bold mt-4">
          Desarrollado por <span className="text-blue-500 text-sm tracking-wider uppercase drop-shadow-sm">Zacarias Ortega</span> para el proyecto <span className="text-slate-300">{PROJECT_NAME}</span>
        </p>
      </div>
    );
  }

  // --- FILTRO DE VISIBILIDAD DE DOCUMENTOS (CDE) ---
  const visibleDocuments = documents.filter(doc => {
    if (userRole === 'SUPERVISION' || userRole === 'CONTRATISTA') return true;
    if (userRole === 'FISCAL_OBRA' || userRole === 'FISCAL_SEG') {
      const myLabel = ROLE_CONFIG[userRole].label;
      return doc.uploadedRole === userRole || doc.destinatario === myLabel || doc.folder === 'PUBLISHED';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex antialiased text-slate-800 overflow-hidden relative selection:bg-blue-200">
      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      {/* SIDEBAR COMPACTO Y ELEGANTE */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 shrink-0`}>
        <div className="p-5 border-b border-slate-800/60 relative">
          <button className="md:hidden absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
          <div className="flex items-center gap-2.5 text-white font-bold text-sm leading-tight mb-4 pr-4">
            <Folder className="text-blue-500 shrink-0" size={18} /><span>CDE ISAIAS</span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Sesión Activa</div>
            <div className="flex items-center gap-1.5 text-white font-semibold text-xs mb-0.5"><User size={12} className="text-blue-400 shrink-0" /><span className="truncate">{activeUser}</span></div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold tracking-wide"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div><span className="truncate uppercase">{ROLE_CONFIG[userRole].label}</span></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <SidebarBtn active={currentView === 'dashboard'} onClick={() => handleNavigation('dashboard')} icon={<Activity />} text="Dashboard" />
          <SidebarBtn active={currentView === 'cde'} onClick={() => handleNavigation('cde')} icon={<Folder />} text="Entorno de Datos" />
          <SidebarBtn active={currentView === 'upload'} onClick={() => handleNavigation('upload')} icon={<UploadCloud />} text="Subir / Generar" />
          <SidebarBtn active={currentView === 'database'} onClick={() => handleNavigation('database')} icon={<Database />} text="Base Maestro" />
          <SidebarBtn active={currentView === 'logs'} onClick={() => handleNavigation('logs')} icon={<Clock />} text="Audit Trail" />
        </nav>
        <div className="p-3 border-t border-slate-800/60">
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-400 font-semibold text-xs hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={16} /><span>Cerrar Sesión</span></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 rounded-md shrink-0" onClick={() => setIsMobileMenuOpen(true)}><Menu size={20} /></button>
            <h2 className="text-sm md:text-base font-black text-slate-800 truncate tracking-tight">
              {currentView === 'dashboard' ? 'Métricas Generales' : currentView === 'cde' ? 'CDE / Estructura ISO' : currentView === 'upload' ? 'Carga y Enrutamiento' : currentView === 'database' ? 'Base de Datos' : 'Trazabilidad'}
            </h2>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={loadDataFromDatabase} disabled={isLoading} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors">
              <RefreshCw size={12} className={isLoading ? "animate-spin text-blue-500" : ""} /> <span className="hidden sm:inline">Sincronizar</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Supervisión Técnica</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase">{SUPERVISION_COMPANY}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/50 w-full">
          <div className="max-w-6xl mx-auto">
            {isLoading && currentView !== 'upload' ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400"><RefreshCw size={28} className="animate-spin mb-3 text-blue-500" /><p className="text-xs font-bold tracking-wide">Sincronizando registros...</p></div>
            ) : (
              <>
                {currentView === 'dashboard' && <DashboardView documents={visibleDocuments} role={userRole} />}
                {currentView === 'cde' && <CDEView documents={visibleDocuments} role={userRole} logActionToDatabase={logActionToDatabase} />}
                {currentView === 'upload' && <UploadView loadData={loadDataFromDatabase} setCurrentView={setCurrentView} activeUser={activeUser} role={userRole} documentsLength={documents.length} />}
                {currentView === 'database' && <DatabaseView logs={allLogs} />}
                {currentView === 'logs' && <LogsView logs={allLogs} />}
              </>
            )}
          </div>
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 p-4 text-center shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-bold text-slate-400">Desarrollado por <span className="text-blue-400 text-sm tracking-wider uppercase drop-shadow-sm">Zacarias Ortega</span> para el proyecto <span className="text-slate-300">{PROJECT_NAME}</span></p>
        </footer>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES SECUNDARIOS (VISTAS)
// ==========================================

function DashboardView({ documents, role }) {
  const pendingReview = documents.filter(d => (role === 'SUPERVISION' && d.status === 'REVIEW_SUP') || (role.includes('FISCAL') && d.status === 'REVIEW_FIS')).length;
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Docs Totales" value={documents.length} icon={<FileText />} color="blue" />
        <StatCard title="Aprobados" value={documents.filter(d => d.status === 'APPROVED' || d.folder === 'PUBLISHED').length} icon={<CheckCircle />} color="emerald" />
        <StatCard title="Pendientes" value={pendingReview} icon={<Clock />} color="orange" highlight={pendingReview > 0} />
        <StatCard title="Rechazados" value={documents.filter(d => d.status === 'REJECTED').length} icon={<XCircle />} color="red" />
      </div>
    </div>
  );
}

function CDEView({ documents, role, logActionToDatabase }) {
  const [modalConfig, setModalConfig] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const requestAction = (doc, actionType, payload = {}) => {
    setModalConfig({ doc, actionType, payload });
    setActionComment('');
  };

  const executeAction = async (e) => {
    e.preventDefault();
    if (!modalConfig) return;
    setIsProcessing(true);

    const { doc, actionType, payload } = modalConfig;
    const commentText = actionComment.trim() ? `Motivo: ${actionComment}` : 'Sin justificación escrita';
    let updatedDoc = { ...doc };
    let actionLogText = '';

    if (actionType === 'MANUAL_MOVE') {
      let newStatus = 'WIP';
      if (payload.targetFolder === 'SHARED') newStatus = 'REVIEW_FIS';
      if (payload.targetFolder === 'PUBLISHED') newStatus = 'APPROVED';
      if (payload.targetFolder === 'ARCHIVE') newStatus = 'ARCHIVED';
      updatedDoc.status = newStatus; updatedDoc.folder = payload.targetFolder;
      actionLogText = `Traslado Admin (a ${payload.targetFolder}) | ${commentText}`;
    } else if (actionType === 'REMITIR') {
      updatedDoc.status = 'REVIEW_FIS'; updatedDoc.destinatario = payload.destinatario;
      actionLogText = `Remitido a ${payload.destinatario} | ${commentText}`;
    } else {
      if (actionType === 'APPROVE') { updatedDoc.status = 'APPROVED'; updatedDoc.folder = 'PUBLISHED'; updatedDoc.destinatario = 'General'; actionLogText = `Aprobado (a PUBLISHED) | ${commentText}`; } 
      else if (actionType === 'REJECT') { updatedDoc.status = 'REJECTED'; updatedDoc.folder = 'WIP'; updatedDoc.destinatario = doc.originador; actionLogText = `Rechazado (a WIP) | ${commentText}`; } 
      else if (actionType === 'RETURN_SUP') { updatedDoc.status = 'REVIEW_SUP'; updatedDoc.folder = 'SHARED'; updatedDoc.destinatario = 'Supervisión'; actionLogText = `Devuelto a Sup. | ${commentText}`; } 
      else if (actionType === 'ARCHIVE') { updatedDoc.status = 'ARCHIVED'; updatedDoc.folder = 'ARCHIVE'; updatedDoc.destinatario = 'Archivo'; actionLogText = `Archivado | ${commentText}`; }
    }

    await logActionToDatabase(updatedDoc, actionLogText);
    setIsProcessing(false); setModalConfig(null); setActionComment('');
  };

  const CARPETAS_CDE = [
    { id: 'WIP', name: '01-WIP (En Progreso)', color: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
    { id: 'SHARED', name: '02-SHARED (Revisión)', color: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
    { id: 'PUBLISHED', name: '03-PUBLISHED (Aprobados)', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' },
    { id: 'ARCHIVE', name: '04-ARCHIVE (Histórico)', color: 'bg-orange-50 border-orange-200', text: 'text-orange-800' }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      
      {modalConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 md:p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3"><MessageSquare className="text-blue-600" size={16} /><div><h3 className="text-sm font-black text-slate-800">Justificación Requerida</h3></div></div>
            <form onSubmit={executeAction}>
              <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg"><p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-0.5">Afectando a:</p><p className="text-xs font-mono font-bold text-slate-700 break-all">{modalConfig.doc.isoName}</p></div>
              <div className="space-y-1.5 mb-4"><label className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Motivo</label><textarea value={actionComment || ''} onChange={e => setActionComment(e.target.value)} placeholder="Breve justificación..." required className="w-full border border-slate-200 p-2.5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none resize-none h-16" autoFocus /></div>
              <div className="flex gap-2 justify-end"><button type="button" disabled={isProcessing} onClick={() => setModalConfig(null)} className="px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-500 hover:bg-slate-100 uppercase tracking-wide">Cancelar</button><button type="submit" disabled={isProcessing} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wide text-white hover:bg-blue-700 shadow-sm">{isProcessing ? <RefreshCw size={12} className="animate-spin" /> : 'Confirmar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {CARPETAS_CDE.map(carpeta => {
        const docsEnCarpeta = documents.filter(d => d.folder === carpeta.id);
        return (
          <div key={carpeta.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className={`px-4 py-2.5 border-b font-bold ${carpeta.color} ${carpeta.text} flex justify-between items-center text-xs md:text-sm`}>
              <span className="flex items-center gap-2"><Folder size={14} /> <span>{carpeta.name}</span></span>
              <span className="bg-white/60 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-white/40">{docsEnCarpeta.length} arch.</span>
            </div>
            <div className="p-3 bg-slate-50/50 space-y-2">
              {docsEnCarpeta.length === 0 ? (
                <div className="py-4 text-center text-slate-400"><p className="text-[11px] font-medium tracking-wide">Vacío</p></div>
              ) : (
                docsEnCarpeta.map(doc => (
                  <div key={doc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all bg-white gap-3">
                    <div className="flex items-start gap-2.5 w-full min-w-0">
                      <div className="p-1.5 bg-slate-50 rounded border border-slate-100 shrink-0"><FileDigit className="w-5 h-5 text-blue-500" strokeWidth={1.5} /></div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-mono font-bold text-slate-700 text-[11px] md:text-xs truncate" title={doc.isoName}>{doc.isoName}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-medium truncate uppercase tracking-wide">De: <span className="font-bold text-slate-500">{doc.uploadedBy}</span> • Para: <span className="font-bold text-slate-500">{doc.destinatario}</span></p>
                        <div className="mt-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${WORKFLOW_STATES[doc.status]?.color || 'bg-slate-100 text-slate-600'}`}>{WORKFLOW_STATES[doc.status]?.label || doc.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 w-full md:w-auto shrink-0 mt-1 md:mt-0">
                      <a href={doc.driveUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-50 flex-1 md:flex-none text-center">Ver</a>
                      
                      {doc.folder !== 'ARCHIVE' && (role === 'FISCAL_OBRA' || role === 'FISCAL_SEG') && (
                        <button onClick={() => requestAction(doc, 'ARCHIVE')} className="px-2.5 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded text-[10px] font-bold uppercase tracking-wide hover:bg-orange-100 flex-1 md:flex-none">Archivar</button>
                      )}
                      
                      {role === 'SUPERVISION' && (
                        <select value="" onChange={(e) => { requestAction(doc, 'MANUAL_MOVE', { targetFolder: e.target.value }); e.target.value = ""; }} className="px-2 py-1.5 bg-slate-800 text-white border border-slate-700 rounded text-[10px] font-bold uppercase tracking-wide hover:bg-slate-700 cursor-pointer flex-1 md:flex-none outline-none">
                          <option value="" disabled>Mover a...</option>
                          {doc.folder !== 'WIP' && <option value="WIP">WIP</option>}
                          {doc.folder !== 'SHARED' && <option value="SHARED">SHARED</option>}
                          {doc.folder !== 'PUBLISHED' && <option value="PUBLISHED">PUBLISHED</option>}
                          {doc.folder !== 'ARCHIVE' && <option value="ARCHIVE">ARCHIVE</option>}
                        </select>
                      )}
                      
                      {role === 'SUPERVISION' && doc.folder === 'SHARED' && (
                        <>
                          <button onClick={() => requestAction(doc, 'REMITIR', { destinatario: 'Fiscal de Obra' })} className="px-2.5 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-wide hover:bg-blue-700 flex-1 md:flex-none">A F.Obra</button>
                          <button onClick={() => requestAction(doc, 'REMITIR', { destinatario: 'Fiscal de Seguimiento' })} className="px-2.5 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-wide hover:bg-indigo-700 flex-1 md:flex-none">A F.Seg</button>
                        </>
                      )}
                      
                      {(role === 'FISCAL_OBRA' || role === 'FISCAL_SEG') && doc.status === 'REVIEW_FIS' && (
                        <>
                          <button onClick={() => requestAction(doc, 'RETURN_SUP')} className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-bold uppercase tracking-wide hover:bg-red-100 flex-1 md:flex-none">Rechazar</button>
                          <button onClick={() => requestAction(doc, 'APPROVE')} className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase tracking-wide hover:bg-emerald-700 flex-1 md:flex-none">Aprobar</button>
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
  );
}

function UploadView({ loadData, setCurrentView, activeUser, role, documentsLength }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); 
  const [externalLink, setExternalLink] = useState('');

  let destinatarioOptions = [];
  if (role === 'CONTRATISTA') destinatarioOptions = ['Supervisión'];
  else if (role === 'SUPERVISION') destinatarioOptions = ['Contratista', 'Fiscal de Obra', 'Fiscal de Seguimiento'];
  else destinatarioOptions = ['Supervisión'];

  const fechaActual = new Date().toISOString().split('T')[0];
  const autoNumero = String(documentsLength + 1).padStart(3, '0');

  const [formData, setFormData] = useState({
    originador: role === 'CONTRATISTA' ? 'CON' : role === 'SUPERVISION' ? 'SUP' : 'FDO',
    disciplina: 'ARQ', tipo: 'M2D', revision: 'VP', fecha: fechaActual, version: 'V01',
    extension: '.pdf', carpetaDestino: 'WIP', destinatario: destinatarioOptions[0], descripcion: '', file: null
  });

  const generatedName = `HIO-${formData.originador}-${formData.disciplina}-${formData.tipo}-${formData.revision}-${autoNumero}-${formData.version}`;

  const handleCopyName = () => {
    let ext = formData.extension === 'otro...' ? '' : formData.extension;
    const textToCopy = `${generatedName}${ext}`;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy; document.body.appendChild(textArea); textArea.select();
    document.execCommand("copy"); document.body.removeChild(textArea);
    setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return setFormError('Falta configurar API.');
    if (uploadMode === 'file') {
      if (!formData.file) return setFormError('Seleccione archivo.');
      if (formData.file.size > 52428800) return setFormError('Límite: 50 MB en modo físico.');
    } else {
      if (!externalLink || !externalLink.includes('http')) return setFormError('Enlace inválido.');
    }
    if (!formData.version) return setFormError('Falta versión.');

    setIsSubmitting(true); setFormError('');

    let ext = formData.extension === 'otro...' ? (formData.file ? `.${formData.file.name.split('.').pop()}` : '') : formData.extension;
    const finalName = `${generatedName}${ext}`;

    const basePayload = {
      isoName: finalName, originalName: uploadMode === 'file' ? formData.file.name : 'Enlace Externo',
      carpetaDestino: formData.carpetaDestino, status: formData.carpetaDestino === 'WIP' ? 'WIP' : formData.carpetaDestino === 'PUBLISHED' ? 'APPROVED' : 'REVIEW_SUP',
      originador: formData.originador, disciplina: ISO_CODES.disciplina.find(d => d.code === formData.disciplina)?.name || formData.disciplina,
      tipo: ISO_CODES.tipo.find(t => t.code === formData.tipo)?.name || formData.tipo, revision: formData.revision, version: formData.version, 
      fecha: formData.fecha, uploadedBy: activeUser, uploadedRole: role, destinatario: formData.destinatario, descripcion: formData.descripcion
    };

    const sendPayload = async (payload) => {
      try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.status === 'success') {
          setShowSuccess(true); await loadData(); setTimeout(() => { setShowSuccess(false); setCurrentView('cde'); }, 1500);
        } else { setFormError(result.message); }
      } catch (err) { setFormError('Error de red.'); }
      setIsSubmitting(false);
    };

    if (uploadMode === 'file') {
      const reader = new FileReader(); reader.readAsDataURL(formData.file);
      reader.onload = async () => { await sendPayload({ ...basePayload, actionType: 'UPLOAD', fileBase64: reader.result, mimeType: formData.file.type }); };
    } else { await sendPayload({ ...basePayload, actionType: 'UPLOAD_LINK', driveUrl: externalLink }); }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs text-center shadow-2xl"><CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" /><h3 className="text-sm font-black text-slate-800">Carga Exitosa</h3></div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white"><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Settings size={16}/> Configuración ISO 19650</h3></div>
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-200 flex items-center gap-1.5"><XCircle size={14} /> {formError}</div>}
          
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center relative">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Código Generado</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <p className="text-base md:text-lg font-mono font-bold text-blue-900 tracking-tight">{generatedName}<span className="text-blue-400">{formData.extension === 'otro...' ? '[ext]' : formData.extension}</span></p>
              <button type="button" onClick={handleCopyName} className={`px-2.5 py-1.5 rounded text-[9px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 border ${isCopied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}>{isCopied ? <CheckCircle size={12} /> : <Copy size={12} />}{isCopied ? 'Copiado' : 'Copiar'}</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
             <SelectField label="Disciplina" value={formData.disciplina || ''} onChange={e => setFormData({...formData, disciplina: e.target.value})} options={ISO_CODES.disciplina.filter(d => !d.reqRole || d.reqRole === role)} />
             <SelectField label="Tipo Doc" value={formData.tipo || ''} onChange={e => setFormData({...formData, tipo: e.target.value})} options={ISO_CODES.tipo} />
             <SelectField label="Revisión" value={formData.revision || ''} onChange={e => setFormData({...formData, revision: e.target.value})} options={ISO_CODES.revision} />
             <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Versión</label><input type="text" value={formData.version || ''} onChange={e => setFormData({...formData, version: e.target.value.toUpperCase()})} maxLength="3" className="w-full border border-slate-200 p-2 rounded text-xs font-mono font-bold uppercase outline-none focus:border-blue-400" /></div>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Carpeta Destino" value={formData.carpetaDestino || ''} onChange={e => setFormData({...formData, carpetaDestino: e.target.value})} options={ISO_CODES.carpetas} />
              <div className="space-y-1"><label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Entregar A</label><select value={formData.destinatario || ''} onChange={e => setFormData({...formData, destinatario: e.target.value})} className="w-full border border-blue-200 bg-blue-50/50 p-2 rounded text-xs font-bold text-blue-800 outline-none">{destinatarioOptions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            </div>
            <div className="mt-3 space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Comentarios</label><textarea value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full border border-slate-200 p-2 rounded text-xs font-medium h-12 resize-none outline-none focus:border-blue-400" /></div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg mb-3 w-max mx-auto border border-slate-200">
            <button type="button" onClick={() => setUploadMode('file')} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${uploadMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Físico (&lt;50MB)</button>
            <button type="button" onClick={() => setUploadMode('link')} className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${uploadMode === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Link (&gt;50MB)</button>
          </div>

          {uploadMode === 'file' ? (
            <div key="upload-file" className="border border-dashed border-blue-300 bg-blue-50/30 rounded-lg p-5 text-center relative cursor-pointer hover:bg-blue-50/80 transition-colors">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => { const file = e.target.files[0]; if(file){ const ext = `.${file.name.split('.').pop().toLowerCase()}`; setFormData({...formData, file: file, extension: ISO_CODES.extensiones.includes(ext)?ext:'otro...'}); } }} />
              <UploadCloud className="w-6 h-6 text-blue-400 mx-auto mb-1.5" />
              <p className="font-bold text-slate-600 text-xs">{formData.file ? formData.file.name : 'Adjuntar archivo'}</p>
            </div>
          ) : (
            <div key="upload-link" className="border border-blue-200 bg-slate-50/50 rounded-lg p-4 text-center">
              <input type="url" value={externalLink || ''} onChange={e => setExternalLink(e.target.value)} placeholder="https://drive.google.com/..." className="w-full border border-slate-200 p-2.5 rounded text-xs font-medium focus:border-blue-400 outline-none text-center" required={uploadMode === 'link'} />
            </div>
          )}

          <div className="mt-5 flex justify-end"><button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-5 py-2 bg-blue-600 rounded text-[10px] font-bold uppercase tracking-widest text-white flex justify-center items-center hover:bg-blue-700 transition-colors shadow-sm">{isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : 'Procesar'}</button></div>
        </form>
      </div>
    </div>
  );
}

function DatabaseView({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-slate-800 p-3 md:p-4 text-white flex items-center gap-2.5">
        <Database size={16} className="text-emerald-400" /><div><h3 className="font-bold text-sm uppercase tracking-wide">Base Maestra</h3></div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-[9px] md:text-[10px] text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase font-black text-slate-500 tracking-wider">
            <tr><th className="px-3 py-2.5">Fecha</th><th className="px-3 py-2.5">Código ISO</th><th className="px-3 py-2.5">Autoría</th><th className="px-3 py-2.5">Destino</th><th className="px-3 py-2.5">Dir</th><th className="px-3 py-2.5">Estado</th></tr>
          </thead>
          <tbody>
            {logs.length === 0 ? <tr><td colSpan="6" className="text-center py-6 text-slate-400 text-xs">Sin registros.</td></tr> : logs.map((doc) => (
              <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-3 py-2 text-slate-500 font-medium">{doc.date.split(' ')[0]}</td>
                <td className="px-3 py-2 font-mono font-bold text-blue-600"><a href={doc.driveUrl} target="_blank" rel="noreferrer" className="hover:underline">{doc.isoName}</a></td>
                <td className="px-3 py-2"><span className="block font-bold text-slate-700">{doc.uploadedBy}</span><span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{doc.uploadedRole}</span></td>
                <td className="px-3 py-2 font-bold text-emerald-600">{doc.destinatario}</td>
                <td className="px-3 py-2"><span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-black text-slate-600">{doc.folder}</span></td>
                <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${WORKFLOW_STATES[doc.status]?.color || 'bg-slate-100'}`}>{WORKFLOW_STATES[doc.status]?.label || doc.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogsView({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6">
      <div className="mb-5 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide"><Clock className="text-blue-500" size={16} /> Audit Trail</h3>
      </div>
      <div className="relative border-l border-slate-200 ml-2 space-y-4 pb-2">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-5">
            <div className="absolute -left-[5px] top-1 w-2 h-2 bg-blue-400 rounded-full ring-2 ring-white"></div>
            <div className="bg-slate-50/50 hover:bg-slate-50 transition-colors p-3 rounded-lg border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-1 mb-1.5">
                <span className="font-bold text-slate-700 text-[11px] md:text-xs uppercase tracking-wide">{log.description || 'Actualización de Documento'}</span>
                <span className="text-[9px] font-bold text-slate-400">{log.date}</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-500">Doc: <span className="font-mono font-bold text-blue-700">{log.isoName}</span></p>
                <p className="text-[10px] text-slate-500">Por: <span className="font-bold text-slate-700">{log.uploadedBy}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UTILS ---
function SidebarBtn({ active, icon, text, onClick }) { return <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-bold text-xs transition-all ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{React.cloneElement(icon, { size: 16 })}<span className="truncate tracking-wide">{text}</span></button>; }
function StatCard({ title, value, icon, color }) { const colors = { blue: 'bg-blue-50/50 text-blue-700 border-blue-100', emerald: 'bg-emerald-50/50 text-emerald-700 border-emerald-100', red: 'bg-red-50/50 text-red-700 border-red-100', orange: 'bg-orange-50/50 text-orange-700 border-orange-100' }; return <div className={`p-3 md:p-4 rounded-lg border ${colors[color]} flex justify-between items-center h-full`}><div className="min-w-0"><p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-0.5 text-slate-500 truncate">{title}</p><h3 className="text-xl md:text-2xl font-black">{value}</h3></div><div className="p-2 bg-white rounded-md shadow-sm shrink-0 opacity-80">{React.cloneElement(icon, { size: 18 })}</div></div>; }
function SelectField({ label, value, onChange, options }) { return <div className="space-y-1 flex flex-col justify-center"><label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</label><select value={value} onChange={onChange} className="w-full border border-slate-200 p-2 rounded text-xs font-semibold text-slate-700 truncate outline-none focus:border-blue-400 transition-colors">{options.map(opt => <option key={opt.code} value={opt.code}>{opt.code} - {opt.name}</option>)}</select></div>; }
