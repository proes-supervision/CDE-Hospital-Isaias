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
  const [documents, setDocuments] = useState([]); // Versión más reciente de cada archivo (CDE)
  const [allLogs, setAllLogs] = useState([]); // Historial completo de acciones (Audit Trail / Database)
  const [isLoading, setIsLoading] = useState(false);

  // --- MOTOR DE CONEXIÓN CON GOOGLE SHEETS ---
  const loadDataFromDatabase = async () => {
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return;
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Mapear las filas del Sheet a un formato de objeto
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

        // Invertir para tener lo más reciente primero
        const reversedLogs = formattedLogs.reverse();
        setAllLogs(reversedLogs);

        // Agrupar para el CDE: Queremos solo la última versión de estado de cada archivo único
        const uniqueDocsMap = {};
        reversedLogs.forEach(log => {
          if (!uniqueDocsMap[log.isoName]) {
            uniqueDocsMap[log.isoName] = { ...log, id: log.isoName }; // Guardamos solo el registro más reciente de ese archivo
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
      actionType: 'UPDATE_STATUS', // Le dice al AppScript que NO cree un archivo nuevo
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
      uploadedBy: activeUser, // Quién hizo la acción
      uploadedRole: userRole,
      destinatario: updatedDoc.destinatario,
      descripcion: actionDescription,
      driveUrl: updatedDoc.driveUrl // Mantiene el link original
    };

    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
      await loadDataFromDatabase(); // Recargar todo para sincronizar
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 antialiased">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mb-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <div className="flex flex-col items-center mb-2">
              <h1 className="text-4xl font-black text-blue-700 tracking-tight mb-2">CDE</h1>
              <h2 className="text-sm md:text-base font-bold text-slate-700 leading-tight uppercase text-center">{PROJECT_NAME}</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">Plataforma de Gestión Documental según ISO 19650</p>
          </div>

          {loginStep === 1 ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-600 mb-4 text-center">Seleccione su área de acceso:</p>
              {Object.keys(ROLE_CONFIG).map(roleKey => (
                <button key={roleKey} onClick={() => handleRoleSelect(roleKey)} className="w-full py-4 px-5 text-left border rounded-xl hover:bg-blue-50 hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group">
                  <span className="font-bold text-slate-700 group-hover:text-blue-700">{ROLE_CONFIG[roleKey].label}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <button type="button" onClick={() => setLoginStep(1)} className="text-sm text-blue-600 hover:underline font-semibold">&larr; Volver</button>
                <span className="font-bold text-slate-700 flex-1 text-center">Ingreso: {ROLE_CONFIG[selectedRole].label}</span>
              </div>
              {loginError && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-200">{loginError}</div>}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2"><User size={14}/> Seleccione su Usuario</label>
                <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  {ROLE_CONFIG[selectedRole].users.map(user => <option key={user} value={user}>{user}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2"><Lock size={14}/> Contraseña de Acceso</label>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Ingrese su contraseña" className="w-full p-3 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-500/30">Ingresar al Sistema</button>
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
    <div className="min-h-screen bg-slate-50 flex antialiased text-slate-800 overflow-hidden relative">
      {isMobileMenuOpen && <div className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 shrink-0`}>
        <div className="p-6 border-b border-slate-800 relative">
          <button className="md:hidden absolute top-5 right-5 text-slate-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
          <div className="flex items-start gap-3 text-white font-bold text-md leading-tight mb-4 pr-6">
            <Folder className="text-blue-500 shrink-0 mt-1" /><span>CDE HOSPITAL ISAIAS</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Usuario Activo</div>
            <div className="flex items-center gap-2 text-white font-semibold mb-1"><User size={14} className="text-blue-400 shrink-0" /><span className="truncate">{activeUser}</span></div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div><span className="truncate">{ROLE_CONFIG[userRole].label}</span></div>
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-semibold hover:text-white hover:bg-red-500/20 rounded-xl transition-colors"><LogOut size={18} /><span>Cerrar Sesión</span></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-3 md:gap-0 min-w-0">
            <button className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">
              {currentView === 'dashboard' ? 'Dashboard General' : currentView === 'cde' ? 'Entorno de Datos Común' : currentView === 'upload' ? 'Carga de Documentos' : currentView === 'database' ? 'Base de Datos' : 'Trazabilidad (Logs)'}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <button onClick={loadDataFromDatabase} disabled={isLoading} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-500" : ""} /> <span className="hidden sm:inline">Actualizar DB</span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Supervisión:</span>
              <span className="text-xs font-bold text-slate-700">{SUPERVISION_COMPANY}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50 w-full">
          <div className="max-w-7xl mx-auto">
            {isLoading && currentView !== 'upload' ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400"><RefreshCw size={40} className="animate-spin mb-4 text-blue-500" /><p className="font-bold">Sincronizando con Base de Datos...</p></div>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Documentos" value={documents.length} icon={<FileText />} color="blue" />
        <StatCard title="Aprobados/Publicados" value={documents.filter(d => d.status === 'APPROVED' || d.folder === 'PUBLISHED').length} icon={<CheckCircle />} color="emerald" />
        <StatCard title="Requieren Revisión" value={pendingReview} icon={<Clock />} color="orange" highlight={pendingReview > 0} />
        <StatCard title="Rechazados" value={documents.filter(d => d.status === 'REJECTED').length} icon={<XCircle />} color="red" />
      </div>
    </div>
  );
}

// --- VISOR DEL CDE ---
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
      
      updatedDoc.status = newStatus;
      updatedDoc.folder = payload.targetFolder;
      actionLogText = `Traslado Administrativo (a ${payload.targetFolder}) | ${commentText}`;

    } else if (actionType === 'REMITIR') {
      updatedDoc.status = 'REVIEW_FIS';
      updatedDoc.destinatario = payload.destinatario;
      actionLogText = `Remitido a ${payload.destinatario} | ${commentText}`;
      // La creación de la copia automática en PUBLISHED se registrará al refrescar la tabla si lo deseas, 
      // o se guarda como un status update de este doc.

    } else {
      if (actionType === 'APPROVE') { updatedDoc.status = 'APPROVED'; updatedDoc.folder = 'PUBLISHED'; updatedDoc.destinatario = 'General / Publicado'; actionLogText = `Aprobado Final (a PUBLISHED) | ${commentText}`; } 
      else if (actionType === 'REJECT') { updatedDoc.status = 'REJECTED'; updatedDoc.folder = 'WIP'; updatedDoc.destinatario = doc.originador; actionLogText = `Rechazado/Observado (a WIP) | ${commentText}`; } 
      else if (actionType === 'RETURN_SUP') { updatedDoc.status = 'REVIEW_SUP'; updatedDoc.folder = 'SHARED'; updatedDoc.destinatario = 'Supervisión'; actionLogText = `Devuelto a Supervisión | ${commentText}`; } 
      else if (actionType === 'ARCHIVE') { updatedDoc.status = 'ARCHIVED'; updatedDoc.folder = 'ARCHIVE'; updatedDoc.destinatario = 'Archivo General'; actionLogText = `Archivado (a ARCHIVE) | ${commentText}`; }
    }

    // Llamar a la función del componente App para guardar en la base de datos
    await logActionToDatabase(updatedDoc, actionLogText);
    
    setIsProcessing(false);
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 min-h-[500px] relative">
      
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trazabilidad en Base de Datos</p>
              </div>
            </div>
            
            <form onSubmit={executeAction}>
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1 font-medium">Documento afectado:</p>
                <p className="text-sm font-mono font-bold text-slate-800 break-all">{modalConfig.doc.isoName}</p>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-black text-slate-700 uppercase">Motivo / Comentario</label>
                <textarea 
                  value={actionComment}
                  onChange={e => setActionComment(e.target.value)}
                  placeholder="Explique el motivo del traslado o actualización de estado..."
                  required
                  className="w-full border border-slate-300 p-3 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-24"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" disabled={isProcessing} onClick={() => setModalConfig(null)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isProcessing} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 shadow-md transition-colors">
                  {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6 border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Folder className="text-blue-600"/> Directorio Estructurado</h3>
      </div>
      
      <div className="space-y-6 md:space-y-8">
        {CARPETAS_CDE.map(carpeta => {
          const docsEnCarpeta = documents.filter(d => d.folder === carpeta.id);
          return (
            <div key={carpeta.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className={`px-4 py-3 border-b font-bold ${carpeta.color} ${carpeta.text} flex justify-between items-center text-sm md:text-base`}>
                <span className="flex items-center gap-2 truncate"><Folder size={18} className="shrink-0" /> <span className="truncate">{carpeta.name}</span></span>
                <span className="bg-white/60 px-2 py-1 rounded-md text-xs border border-white/40 shrink-0">{docsEnCarpeta.length} arch.</span>
              </div>
              <div className="p-3 md:p-4 bg-slate-50 space-y-3 min-h-[80px]">
                {docsEnCarpeta.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400"><Folder size={32} className="opacity-20 mb-2" /><p className="text-xs md:text-sm font-medium">Carpeta vacía</p></div>
                ) : (
                  docsEnCarpeta.map(doc => (
                    <div key={doc.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white gap-4">
                      <div className="flex items-start gap-3 w-full min-w-0">
                        <div className="p-2 md:p-3 bg-slate-50 rounded-lg shadow-sm border border-slate-200 shrink-0"><FileDigit className="w-6 h-6 md:w-8 md:h-8 text-blue-600" /></div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-mono font-bold text-slate-800 text-sm md:text-base truncate" title={doc.isoName}>{doc.isoName}</h4>
                          <p className="text-[11px] md:text-xs text-slate-500 mt-1 font-medium truncate">Destinatario: <span className="font-bold text-slate-700">{doc.destinatario}</span> • Autor: {doc.uploadedBy}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[9px] md:text-[10px] ${WORKFLOW_STATES[doc.status]?.color || 'bg-slate-100 text-slate-700'}`}>{WORKFLOW_STATES[doc.status]?.label || doc.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                        <a href={doc.driveUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex-1 md:flex-none text-center">Ver Doc</a>
                        
                        {doc.folder !== 'ARCHIVE' && (role === 'FISCAL_OBRA' || role === 'FISCAL_SEG') && (
                          <button onClick={() => requestAction(doc, 'ARCHIVE')} className="px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 flex-1 md:flex-none">Archivar</button>
                        )}
                        
                        {role === 'SUPERVISION' && (
                          <select value="" onChange={(e) => { requestAction(doc, 'MANUAL_MOVE', { targetFolder: e.target.value }); e.target.value = ""; }} className="px-3 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 cursor-pointer flex-1 md:flex-none outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="" disabled>Trasladar a...</option>
                            {doc.folder !== 'WIP' && <option value="WIP">➡️ WIP</option>}
                            {doc.folder !== 'SHARED' && <option value="SHARED">➡️ SHARED</option>}
                            {doc.folder !== 'PUBLISHED' && <option value="PUBLISHED">➡️ PUBLISHED</option>}
                            {doc.folder !== 'ARCHIVE' && <option value="ARCHIVE">➡️ ARCHIVE</option>}
                          </select>
                        )}
                        
                        {role === 'SUPERVISION' && doc.folder === 'SHARED' && (
                          <>
                            <button onClick={() => requestAction(doc, 'REMITIR', { destinatario: 'Fiscal de Obra' })} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md flex-1 md:flex-none">A Fiscal Obra</button>
                            <button onClick={() => requestAction(doc, 'REMITIR', { destinatario: 'Fiscal de Seguimiento' })} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md flex-1 md:flex-none">A Fiscal Seg.</button>
                          </>
                        )}
                        
                        {(role === 'FISCAL_OBRA' || role === 'FISCAL_SEG') && doc.status === 'REVIEW_FIS' && (
                          <>
                            <button onClick={() => requestAction(doc, 'RETURN_SUP')} className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 flex-1 md:flex-none">Devolver a Sup.</button>
                            <button onClick={() => requestAction(doc, 'APPROVE')} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md flex-1 md:flex-none">Aprobar Final</button>
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

// --- CREADOR DE ARCHIVOS Y CONEXIÓN REAL CON GOOGLE ---
function UploadView({ loadData, setCurrentView, activeUser, role, documentsLength }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return setFormError('Falta configurar la URL del Backend en el código (Línea 10).');
    if (!formData.file) return setFormError('Por favor, selecciona un archivo.');
    if (formData.file.size > 52428800) return setFormError('Límite excedido. Para usar la API gratuita de Google, el archivo no debe pesar más de 50MB.');
    if (!formData.version) return setFormError('Ingrese la versión.');

    setIsSubmitting(true);
    setFormError('');

    let ext = formData.extension === 'otro...' ? `.${formData.file.name.split('.').pop()}` : formData.extension;
    const finalName = `${generatedName}${ext}`;

    const reader = new FileReader();
    reader.readAsDataURL(formData.file);
    reader.onload = async () => {
      const payload = {
        actionType: 'UPLOAD',
        fileBase64: reader.result, 
        mimeType: formData.file.type, 
        isoName: finalName, 
        originalName: formData.file.name,
        carpetaDestino: formData.carpetaDestino, 
        status: formData.carpetaDestino === 'WIP' ? 'WIP' : formData.carpetaDestino === 'PUBLISHED' ? 'APPROVED' : 'REVIEW_SUP',
        originador: formData.originador, 
        disciplina: ISO_CODES.disciplina.find(d => d.code === formData.disciplina)?.name || formData.disciplina,
        tipo: ISO_CODES.tipo.find(t => t.code === formData.tipo)?.name || formData.tipo, 
        revision: formData.revision,
        version: formData.version, 
        fecha: formData.fecha, 
        uploadedBy: activeUser, 
        uploadedRole: role,
        destinatario: formData.destinatario, 
        descripcion: formData.descripcion
      };

      try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.status === 'success') {
          setShowSuccess(true);
          await loadData();
          setTimeout(() => { setShowSuccess(false); setCurrentView('cde'); }, 2000);
        } else { setFormError('Error de Base de Datos: ' + result.message); }
      } catch (err) { setFormError('Error de red al conectar con el servidor.'); }
      setIsSubmitting(false);
    };
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl"><CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-800 mb-2">¡Subida Exitosa!</h3><p className="text-sm text-slate-500">El archivo se guardó físicamente y en la base de datos.</p></div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-4 md:p-6 text-white"><h3 className="text-lg md:text-xl font-bold flex items-center gap-2"><Settings /> Generador y Carga</h3></div>
        <form onSubmit={handleSubmit} className="p-4 md:p-8">
          {formError && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 flex items-center gap-2"><XCircle size={18} /> {formError}</div>}
          
          <div className="mb-8 p-5 bg-slate-50 border-2 border-slate-200 rounded-xl text-center shadow-inner relative group">
            <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-2">Nombre Estandarizado ISO 19650</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <p className="text-xl md:text-3xl font-mono font-bold text-blue-900 tracking-tight break-all">{generatedName}<span className="text-blue-500">{formData.extension === 'otro...' ? '[ext]' : formData.extension}</span></p>
              <button type="button" onClick={handleCopyName} className={`p-2 rounded-lg transition-all flex items-center gap-1 ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600 hover:bg-blue-100'}`}>{isCopied ? <CheckCircle size={20} /> : <Copy size={20} />}<span className="text-xs font-bold">{isCopied ? 'Copiado' : 'Copiar'}</span></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <SelectField label="Disciplina" value={formData.disciplina} onChange={e => setFormData({...formData, disciplina: e.target.value})} options={ISO_CODES.disciplina.filter(d => !d.reqRole || d.reqRole === role)} />
             <SelectField label="Tipo Doc" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} options={ISO_CODES.tipo} />
             <SelectField label="Revisión" value={formData.revision} onChange={e => setFormData({...formData, revision: e.target.value})} options={ISO_CODES.revision} />
             <div className="space-y-1.5 flex flex-col justify-center"><label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase">Versión</label><input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value.toUpperCase()})} maxLength="3" className="w-full border border-slate-300 p-2 md:p-2.5 rounded-lg text-sm font-mono font-bold" /></div>
          </div>

          <div className="bg-slate-100 p-4 md:p-6 rounded-xl border border-slate-200 mb-6 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <SelectField label="Carpeta Destino" value={formData.carpetaDestino} onChange={e => setFormData({...formData, carpetaDestino: e.target.value})} options={ISO_CODES.carpetas} />
              <div className="space-y-1.5 flex flex-col justify-center"><label className="text-[10px] md:text-[11px] font-black text-blue-600 uppercase">Entregar A</label><select value={formData.destinatario} onChange={e => setFormData({...formData, destinatario: e.target.value})} className="w-full border-2 border-blue-200 bg-blue-50 p-2 md:p-2.5 rounded-lg text-sm font-bold text-blue-800">{destinatarioOptions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            </div>
            <div className="mt-4 space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase">Motivo / Descripción</label><textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg text-sm h-16 resize-none" /></div>
          </div>

          <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-6 md:p-8 text-center relative cursor-pointer hover:bg-blue-50 transition-colors">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const ext = `.${file.name.split('.').pop().toLowerCase()}`;
                  const matchedExt = ISO_CODES.extensiones.includes(ext) ? ext : 'otro...';
                  setFormData({...formData, file: file, extension: matchedExt});
                }
              }} />
            <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm md:text-base">{formData.file ? formData.file.name : 'Toca aquí para adjuntar archivo (Máx. 50MB)'}</p>
          </div>

          <div className="mt-6 flex justify-end"><button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-6 py-3 bg-blue-600 rounded-lg font-bold text-white flex justify-center items-center shadow-lg hover:bg-blue-700 transition-colors">{isSubmitting ? <RefreshCw className="animate-spin" /> : 'Subir y Guardar'}</button></div>
        </form>
      </div>
    </div>
  );
}

// --- VISOR DE LA BASE DE DATOS MAESTRA ---
function DatabaseView({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-emerald-600 p-4 md:p-5 text-white flex items-center gap-3">
        <Database size={24} /><div><h3 className="font-bold text-lg md:text-xl">Registro Maestro</h3><p className="text-emerald-100 text-xs md:text-sm font-medium">Directorio Único Consolidado</p></div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs md:text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-100 border-b border-slate-300 uppercase font-black text-slate-600">
            <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Nombre ISO</th><th className="px-4 py-3">Autor</th><th className="px-4 py-3">Destino</th><th className="px-4 py-3">Carpeta</th><th className="px-4 py-3">Estado</th></tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-slate-500">No hay registros en la base de datos central.</td></tr>
            ) : (
              logs.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3">{doc.date}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700"><a href={doc.driveUrl} target="_blank" rel="noreferrer" className="hover:underline">{doc.isoName}</a></td>
                  <td className="px-4 py-3"><span className="block">{doc.uploadedBy}</span><span className="text-[10px] text-slate-400 font-bold uppercase">{doc.uploadedRole}</span></td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{doc.destinatario}</td>
                  <td className="px-4 py-3"><span className="bg-slate-200 px-2 py-1 rounded text-[10px] font-black">{doc.folder}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-md font-bold uppercase text-[9px] ${WORKFLOW_STATES[doc.status]?.color || 'bg-slate-100'}`}>{WORKFLOW_STATES[doc.status]?.label || doc.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- VISOR DE AUDIT TRAIL LOGS ---
function LogsView({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Clock className="text-blue-600" /> Trazabilidad (Audit Trail)</h3>
        <p className="text-sm font-medium text-slate-500 mt-2">Registro inmutable de acciones. <br/>Cada comentario o movimiento se graba aquí automáticamente.</p>
      </div>
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-8">
            <div className="absolute -left-2 top-1.5 w-4 h-4 bg-blue-500 rounded-full ring-4 ring-white shadow-sm"></div>
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
                <span className="font-bold text-slate-800 text-base">{log.description || 'Actualización de Documento'}</span>
                <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm inline-block">{log.date}</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-600">Documento: <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{log.isoName}</span></p>
                <p className="text-sm font-semibold text-slate-600">Actor responsable: <span className="font-bold text-slate-800">{log.uploadedBy} ({log.uploadedRole})</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- UTILS ---
function SidebarBtn({ active, icon, text, onClick }) { return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{React.cloneElement(icon, { size: 20 })}<span className="truncate">{text}</span></button>; }
function StatCard({ title, value, icon, color }) { const colors = { blue: 'bg-blue-50 text-blue-700', emerald: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700', orange: 'bg-orange-50 text-orange-700' }; return <div className={`p-4 md:p-6 rounded-xl border border-slate-200 ${colors[color]} flex justify-between items-center h-full`}><div><p className="text-[10px] md:text-xs font-black uppercase mb-1">{title}</p><h3 className="text-2xl md:text-4xl font-black">{value}</h3></div><div className="p-2 md:p-3 bg-white/60 rounded-xl shrink-0">{React.cloneElement(icon, { size: 24 })}</div></div>; }
function SelectField({ label, value, onChange, options }) { return <div className="space-y-1.5 flex flex-col justify-center"><label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase">{label}</label><select value={value} onChange={onChange} className="w-full border border-slate-300 p-2 md:p-2.5 rounded-lg text-sm font-bold text-slate-700 truncate">{options.map(opt => <option key={opt.code} value={opt.code}>{opt.code} - {opt.name}</option>)}</select></div>; }
