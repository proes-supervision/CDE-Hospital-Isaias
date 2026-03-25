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

  // Estados de Datos Reales (Inician vacíos hasta conectar con Google)
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // EFECTO: Cargar datos desde Google Sheets al iniciar sesión
  const loadDataFromDatabase = async () => {
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return;
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        // Mapear los datos de la hoja a objetos legibles para la app
        const formattedDocs = result.data.map((row, index) => ({
          id: `doc-${index}`,
          date: row['Fecha'] || '',
          isoName: row['Nombre ISO'] || '',
          originalName: row['Nombre Original'] || '',
          folder: row['Carpeta Destino'] || 'WIP',
          status: row['Estado'] || 'WIP',
          originador: row['Originador'] || '',
          discipline: row['Disciplina'] || '',
          type: row['Tipo Doc'] || '',
          revision: row['Revisión'] || '',
          version: row['Versión'] || '',
          uploadedBy: row['Subido Por'] || '',
          uploadedRole: row['Rol'] || '',
          destinatario: row['Entregado A'] || '',
          description: row['Descripción / Motivo'] || '',
          driveUrl: row['Link en Google Drive'] || '#'
        }));
        // Invertimos para que los más recientes salgan arriba
        setDocuments(formattedDocs.reverse());
      }
    } catch (error) {
      console.error("Error conectando a la base de datos:", error);
    }
    setIsLoading(false);
  };

  // Se ejecuta cuando el usuario inicia sesión
  useEffect(() => {
    if (userRole) {
      loadDataFromDatabase();
    }
  }, [userRole]);

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
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  // --- PANTALLA DE LOGIN ---
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
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-500/30">
                Ingresar al Sistema
              </button>
            </form>
          )}
        </div>
        <p className="text-slate-400 text-xs text-center max-w-md font-bold mt-4">
          Desarrollado por <span className="text-blue-500 text-sm tracking-wider uppercase drop-shadow-sm">Zacarias Ortega</span> para el proyecto <span className="text-slate-300">{PROJECT_NAME}</span>
        </p>
      </div>
    );
  }

  // --- FILTRO DE VISIBILIDAD DE DOCUMENTOS ---
  const visibleDocuments = documents.filter(doc => {
    if (userRole === 'SUPERVISION' || userRole === 'CONTRATISTA') return true;
    if (userRole === 'FISCAL_OBRA' || userRole === 'FISCAL_SEG') {
      const myLabel = ROLE_CONFIG[userRole].label;
      return doc.uploadedRole === userRole || (doc.uploadedRole === 'SUPERVISION' && doc.destinatario === myLabel);
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
              {currentView === 'dashboard' ? 'Dashboard General' : currentView === 'cde' ? 'Entorno de Datos Común' : currentView === 'upload' ? 'Carga de Documentos' : 'Base de Datos'}
            </h2>
          </div>
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <button onClick={loadDataFromDatabase} disabled={isLoading} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-500" : ""} /> <span className="hidden sm:inline">Actualizar</span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
            <span className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 shrink-0">
              <Shield size={16} className="text-blue-500" /><span className="hidden sm:inline">ISO 19650</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50 w-full">
          <div className="max-w-7xl mx-auto">
            {isLoading && currentView !== 'upload' ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400"><RefreshCw size={40} className="animate-spin mb-4 text-blue-500" /><p className="font-bold">Conectando con la Base de Datos...</p></div>
            ) : (
              <>
                {currentView === 'dashboard' && <DashboardView documents={visibleDocuments} role={userRole} />}
                {currentView === 'cde' && <CDEView documents={visibleDocuments} role={userRole} activeUser={activeUser} loadData={loadDataFromDatabase} />}
                {currentView === 'upload' && <UploadView loadData={loadDataFromDatabase} setCurrentView={setCurrentView} activeUser={activeUser} role={userRole} documentsLength={documents.length} />}
                {currentView === 'database' && <DatabaseView documents={documents} />}
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
        <StatCard title="Aprobados" value={documents.filter(d => d.status === 'APPROVED').length} icon={<CheckCircle />} color="emerald" />
        <StatCard title="Requieren Revisión" value={pendingReview} icon={<Clock />} color="orange" highlight={pendingReview > 0} />
        <StatCard title="Rechazados" value={documents.filter(d => d.status === 'REJECTED').length} icon={<XCircle />} color="red" />
      </div>
    </div>
  );
}

// --- VISOR DEL CDE ---
function CDEView({ documents, role, activeUser, loadData }) {
  const CARPETAS_CDE = [
    { id: 'WIP', name: '01-WIP (Trabajo en Progreso)', color: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
    { id: 'SHARED', name: '02-SHARED (Compartido / Revisión)', color: 'bg-blue-50 border-blue-300', text: 'text-blue-800' },
    { id: 'PUBLISHED', name: '03-PUBLISHED (Publicado / Aprobado)', color: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800' },
    { id: 'ARCHIVE', name: '04-ARCHIVE (Archivado / Histórico)', color: 'bg-orange-50 border-orange-300', text: 'text-orange-800' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 min-h-[500px]">
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
                          <p className="text-[11px] md:text-xs text-slate-500 mt-1 font-medium truncate">Subido por: {doc.uploadedBy} el {doc.date}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[9px] md:text-[10px] ${WORKFLOW_STATES[doc.status]?.color || 'bg-slate-100'}`}>{WORKFLOW_STATES[doc.status]?.label || doc.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                        <a href={doc.driveUrl} target="_blank" rel="noreferrer" className="px-3 md:px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs md:text-sm font-bold text-slate-700 hover:bg-slate-50 text-center flex-1 md:flex-none">Descargar Doc</a>
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

  // LA MAGIA: Enviar los datos físicos a Google
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!API_URL || API_URL === 'LA_URL_MAGICA_DE_TU_GOOGLE_SCRIPT_AQUI') return setFormError('Falta configurar la URL del Backend en el código.');
    if (!formData.file) return setFormError('Por favor, selecciona un archivo.');
    // Limite de 50MB por restricciones gratuitas de Google Scripts
    if (formData.file.size > 52428800) return setFormError('Límite excedido. Para usar la API gratuita de Google, el archivo no debe pesar más de 50MB.');

    setIsSubmitting(true);
    setFormError('');

    let ext = formData.extension === 'otro...' ? `.${formData.file.name.split('.').pop()}` : formData.extension;
    const finalName = `${generatedName}${ext}`;

    const reader = new FileReader();
    reader.readAsDataURL(formData.file);
    reader.onload = async () => {
      const payload = {
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
        const response = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
          setShowSuccess(true);
          await loadData(); // Recargar la tabla con el nuevo archivo
          setTimeout(() => { setShowSuccess(false); setCurrentView('cde'); }, 2000);
        } else {
          setFormError('Error de Google: ' + result.message);
        }
      } catch (err) {
        setFormError('Error de red al conectar con Google.');
      }
      setIsSubmitting(false);
    };
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl"><CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-slate-800 mb-2">¡Subida Exitosa!</h3><p className="text-sm text-slate-500">El archivo se guardó en la base de datos.</p></div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-4 md:p-6 text-white"><h3 className="text-lg md:text-xl font-bold flex items-center gap-2"><Settings /> Generador y Carga</h3></div>
        <form onSubmit={handleSubmit} className="p-4 md:p-8">
          {formError && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200">{formError}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <SelectField label="Disciplina" value={formData.disciplina} onChange={e => setFormData({...formData, disciplina: e.target.value})} options={ISO_CODES.disciplina} />
             <SelectField label="Tipo Doc" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} options={ISO_CODES.tipo} />
             <SelectField label="Revisión" value={formData.revision} onChange={e => setFormData({...formData, revision: e.target.value})} options={ISO_CODES.revision} />
             <div className="space-y-1.5"><label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Versión</label><input type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value.toUpperCase()})} maxLength="3" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm font-mono font-bold" /></div>
          </div>

          <div className="bg-slate-100 p-4 md:p-6 rounded-xl border border-slate-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <SelectField label="Carpeta Destino" value={formData.carpetaDestino} onChange={e => setFormData({...formData, carpetaDestino: e.target.value})} options={ISO_CODES.carpetas} />
              <div className="space-y-1.5"><label className="text-[11px] font-black text-blue-600 uppercase">Entregar A</label><select value={formData.destinatario} onChange={e => setFormData({...formData, destinatario: e.target.value})} className="w-full border-2 border-blue-200 bg-blue-50 p-2.5 rounded-lg text-sm font-bold text-blue-800">{destinatarioOptions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            </div>
            <div className="mt-4 space-y-1.5"><label className="text-[11px] font-black text-slate-500 uppercase">Motivo / Descripción</label><textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full border border-slate-300 p-3 rounded-lg text-sm h-16 resize-none" /></div>
          </div>

          <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-6 md:p-8 text-center relative cursor-pointer">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setFormData({...formData, file: e.target.files[0]})} />
            <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm md:text-base">{formData.file ? formData.file.name : 'Toca aquí para adjuntar archivo'}</p>
          </div>

          <div className="mt-6 flex justify-end"><button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-6 py-3 bg-blue-600 rounded-lg font-bold text-white flex justify-center items-center">{isSubmitting ? <RefreshCw className="animate-spin" /> : 'Subir a Base de Datos'}</button></div>
        </form>
      </div>
    </div>
  );
}

// --- VISOR DE LA BASE DE DATOS MAESTRA ---
function DatabaseView({ documents }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-emerald-600 p-4 md:p-5 text-white flex items-center gap-3">
        <Database size={24} /><div><h3 className="font-bold text-lg md:text-xl">Registro Maestro</h3></div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs md:text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-100 border-b border-slate-300 uppercase font-black text-slate-600">
            <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Nombre ISO</th><th className="px-4 py-3">Autor</th><th className="px-4 py-3">Carpeta</th><th className="px-4 py-3">Estado</th></tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3">{doc.date}</td><td className="px-4 py-3 font-mono font-bold text-blue-700">{doc.isoName}</td><td className="px-4 py-3">{doc.uploadedBy}</td><td className="px-4 py-3 font-bold">{doc.folder}</td><td className="px-4 py-3">{doc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- UTILS ---
function SidebarBtn({ active, icon, text, onClick }) { return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{React.cloneElement(icon, { size: 20 })}<span className="truncate">{text}</span></button>; }
function StatCard({ title, value, icon, color }) { const colors = { blue: 'bg-blue-50 text-blue-700', emerald: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700', orange: 'bg-orange-50 text-orange-700' }; return <div className={`p-4 md:p-6 rounded-xl border border-slate-200 ${colors[color]} flex justify-between items-center`}><div><p className="text-[10px] md:text-xs font-black uppercase mb-1">{title}</p><h3 className="text-2xl md:text-4xl font-black">{value}</h3></div><div className="p-2 md:p-3 bg-white/60 rounded-xl">{React.cloneElement(icon, { size: 24 })}</div></div>; }
function SelectField({ label, value, onChange, options }) { return <div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase">{label}</label><select value={value} onChange={onChange} className="w-full border border-slate-300 p-2 md:p-2.5 rounded-lg text-sm font-bold text-slate-700 truncate">{options.map(opt => <option key={opt.code} value={opt.code}>{opt.code} - {opt.name}</option>)}</select></div>; }
