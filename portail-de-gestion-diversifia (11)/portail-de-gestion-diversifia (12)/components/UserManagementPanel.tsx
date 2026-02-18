
import React, { useState, useEffect } from 'react';
import { User, AppId, ModulePermissions } from '../types';
import { UserPlus, Trash2, ShieldCheck, Calculator, Truck, Package, Edit3, RotateCcw, Check, Lock, UserCheck, User as UserIcon, Clock, TrendingUp, Search, BarChart3, Briefcase, MapPin, ClipboardCheck } from 'lucide-react';
import { saveCloudData, getCloudData } from '../services/database';
import { EXCLUDED_AGENTS } from '../constants';

interface UserManagementPanelProps {
  currentAgents: string[];
  onSaveUsers: (users: User[]) => void;
}

const DEFAULT_PERMISSIONS: Record<string, ModulePermissions> = {
  stock: { read: true, create: false, update: false, delete: false },
  fleet: { read: true, create: false, update: false, delete: false },
  commissions: { read: true, create: false, update: false, delete: false },
  hr: { read: true, create: false, update: false, delete: false },
  adv: { read: true, create: true, update: false, delete: false },
  b2bProspect: { read: true, create: true, update: true, delete: false },
  kpiPilot: { read: true, create: false, update: false, delete: false },
  fieldCommand: { read: true, create: true, update: false, delete: false },
  fieldControl: { read: true, create: true, update: false, delete: false }
};

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ currentAgents, onSaveUsers }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isAddingNewAgent, setIsAddingNewAgent] = useState(false);
  const [customAgentName, setCustomAgentName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(currentAgents.length > 0 ? currentAgents[0] : '');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agent'>('agent');
  const [allowedApps, setAllowedApps] = useState<AppId[]>(['adv']);
  const [permissions, setPermissions] = useState<Record<string, ModulePermissions>>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getCloudData('users');
    if (data) {
       const sorted = (data as User[])
        .filter(u => !EXCLUDED_AGENTS.includes((u.associatedAgentName || '').toLowerCase()))
        .sort((a, b) => (a.associatedAgentName || '').localeCompare(b.associatedAgentName || ''));
       setUsers(sorted);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleApp = (id: AppId) => {
    setAllowedApps(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const updatePermission = (moduleId: string, perm: keyof ModulePermissions) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [perm]: !prev[moduleId][perm]
      }
    }));
  };

  const handleSaveUsers = async (updatedUsers: User[]) => {
    const sorted = updatedUsers.sort((a, b) => (a.associatedAgentName || '').localeCompare(b.associatedAgentName || ''));
    setUsers(sorted);
    await saveCloudData('users', sorted);
    onSaveUsers(sorted);
  };

  const resetForm = () => {
    setNewUsername('');
    setNewPassword('');
    setSelectedRole('agent');
    setEditingUsername(null);
    setIsAddingNewAgent(false);
    setCustomAgentName('');
    setAllowedApps(['adv']);
    setPermissions(DEFAULT_PERMISSIONS);
    setSelectedAgent(currentAgents.length > 0 ? currentAgents[0] : '');
  };

  const handleEditUser = (user: User) => {
    setEditingUsername(user.username);
    setNewUsername(user.username);
    setNewPassword(user.password || '');
    setSelectedRole(user.role);
    setAllowedApps(user.allowedApps || []);
    
    // Fusion intelligente pour assurer que les nouveaux modules (ex: adv, b2b) apparaissent même pour les vieux comptes
    const userPerms = user.permissions || {};
    const merged: Record<string, ModulePermissions> = { ...DEFAULT_PERMISSIONS };
    Object.keys(merged).forEach(key => {
      if (userPerms[key as keyof typeof userPerms]) {
        merged[key] = { ...merged[key], ...userPerms[key as keyof typeof userPerms] };
      }
    });
    setPermissions(merged);
    
    if (currentAgents.includes(user.associatedAgentName || '')) {
      setSelectedAgent(user.associatedAgentName || '');
      setIsAddingNewAgent(false);
    } else {
      setIsAddingNewAgent(true);
      setCustomAgentName(user.associatedAgentName || '');
    }
  };

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) return alert("Remplissez tous les champs (Login et Password).");
    
    const agentName = isAddingNewAgent ? customAgentName : selectedAgent;
    if (selectedRole === 'agent' && !agentName) return alert("Le nom du collaborateur est obligatoire pour un compte agent.");

    if (!editingUsername && users.some(u => u.username === newUsername)) {
      return alert("Cet identifiant est déjà utilisé.");
    }
    
    const newUser: User = { 
        username: newUsername, 
        password: newPassword, 
        role: selectedRole, 
        associatedAgentName: selectedRole === 'admin' ? 'Administration' : agentName,
        allowedApps: selectedRole === 'admin' ? ['commissions', 'fleet', 'stock', 'users', 'hr-attendance', 'adv', 'kpi-pilot', 'b2b-prospect', 'field-command', 'field-control'] : allowedApps,
        permissions: selectedRole === 'admin' ? {
          stock: { read: true, create: true, update: true, delete: true },
          fleet: { read: true, create: true, update: true, delete: true },
          commissions: { read: true, create: true, update: true, delete: true },
          hr: { read: true, create: true, update: true, delete: true },
          adv: { read: true, create: true, update: true, delete: true },
          b2bProspect: { read: true, create: true, update: true, delete: true },
          kpiPilot: { read: true, create: true, update: true, delete: true },
          fieldCommand: { read: true, create: true, update: true, delete: true },
          fieldControl: { read: true, create: true, update: true, delete: true }
        } : permissions
    };
    
    let updatedUsers;
    if (editingUsername) {
      updatedUsers = [...users.filter(u => u.username !== editingUsername), newUser];
    } else {
      updatedUsers = [...users, newUser];
    }
    
    handleSaveUsers(updatedUsers);
    resetForm();
  };

  const filteredUsers = users.filter(u => 
    (u.associatedAgentName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const PermissionToggle = ({ moduleId, permKey, label, icon: Icon }: { moduleId: string, permKey?: string, label: string, icon: any }) => {
    if (selectedRole === 'admin') return null;
    
    // Le permKey permet de gérer les cas où l'AppId (ex: b2b-prospect) diffère de la clé dans l'objet permissions (ex: b2bProspect)
    const effectiveKey = permKey || moduleId;
    
    if (!allowedApps.includes(moduleId as AppId)) return null;
    
    const perms = permissions[effectiveKey] || DEFAULT_PERMISSIONS[effectiveKey] || { read: true, create: false, update: false, delete: false };

    return (
      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-center space-x-2 mb-3">
          <Icon className="w-3.5 h-3.5 text-[#ff7900]" />
          <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Droits {label}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['read', 'create', 'update', 'delete'].map((p) => (
            <button
              key={p}
              onClick={() => updatePermission(effectiveKey, p as keyof ModulePermissions)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center transition-all ${
                perms[p as keyof ModulePermissions] 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-300 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {perms[p as keyof ModulePermissions] ? <Check className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {p === 'read' ? 'Lecture' : p === 'create' ? 'Ajout' : p === 'update' ? 'Modif' : 'Suppr'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#ff7900]" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">
                {editingUsername ? `Modifier : ${editingUsername}` : "Gestion des Comptes & Accès"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type de compte et privilèges</p>
            </div>
          </div>
          {editingUsername && (
            <button onClick={resetForm} className="flex items-center px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Annuler
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Section 1: Identité */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">1. Profil & Rôle</h4>
             
             <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                <button onClick={() => setSelectedRole('agent')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${selectedRole === 'agent' ? 'bg-white text-[#ff7900] shadow-sm' : 'text-slate-400'}`}>
                  <UserIcon className="w-3.5 h-3.5 mr-2" /> Salarié
                </button>
                <button onClick={() => setSelectedRole('admin')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center ${selectedRole === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Admin
                </button>
             </div>

             {selectedRole === 'agent' && (
               <div className="space-y-2">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Collaborateur</label>
                    <button onClick={() => setIsAddingNewAgent(!isAddingNewAgent)} className="text-[9px] font-black text-[#ff7900] uppercase hover:underline">
                      {isAddingNewAgent ? "Liste" : "+ Nouveau"}
                    </button>
                  </div>
                  {isAddingNewAgent ? (
                    <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900] shadow-inner" placeholder="Nom complet" value={customAgentName} onChange={(e) => setCustomAgentName(e.target.value)} />
                  ) : (
                    <select className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900] shadow-inner appearance-none cursor-pointer" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                      {currentAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                    </select>
                  )}
               </div>
             )}
             
             <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Identifiant Login</label>
                <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900] shadow-inner" placeholder="ex: omar.k" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
             </div>
             <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Mot de passe</label>
                <input type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-6 font-bold focus:ring-[#ff7900] shadow-inner" placeholder="orange2025" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
             </div>
          </div>

          {/* Section 2: Apps */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">2. Applications</h4>
             {selectedRole === 'admin' ? (
               <div className="bg-slate-900 p-8 rounded-[2rem] text-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-orange-500 mx-auto" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-relaxed">Le rôle Administrateur donne un accès total à tous les modules.</p>
               </div>
             ) : (
               <>
                 <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                    {[
                        { id: 'adv' as AppId, icon: TrendingUp, label: 'ADV' },
                        { id: 'b2b-prospect' as AppId, icon: Briefcase, label: 'B2B' },
                        { id: 'kpi-pilot' as AppId, icon: BarChart3, label: 'KPI Pilot' },
                        { id: 'commissions' as AppId, icon: Calculator, label: 'Paie' },
                        { id: 'fleet' as AppId, icon: Truck, label: 'Flotte' },
                        { id: 'stock' as AppId, icon: Package, label: 'Stock' },
                        { id: 'hr-attendance' as AppId, icon: Clock, label: 'RH' },
                        { id: 'field-command' as AppId, icon: MapPin, label: 'Terrain' },
                        { id: 'field-control' as AppId, icon: ClipboardCheck, label: 'Audit' }
                    ].map(app => (
                        <button key={app.id} onClick={() => toggleApp(app.id)} className={`flex-1 min-w-[60px] p-3 rounded-xl transition-all flex flex-col items-center justify-center space-y-1 ${allowedApps.includes(app.id) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 border border-slate-200'}`} title={app.label}>
                            <app.icon className="w-4 h-4" />
                            <span className="text-[7px] font-black uppercase">{app.label}</span>
                        </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 italic">Modules accessibles pour ce compte salarié.</p>
               </>
             )}
          </div>

          {/* Section 3: Permissions Granulaires */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">3. Permissions Spécifiques</h4>
             {selectedRole === 'admin' ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <Lock className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">Privilèges Totaux</span>
                </div>
             ) : (
               <>
                 <PermissionToggle moduleId="adv" label="Portail ADV" icon={TrendingUp} />
                 <PermissionToggle moduleId="b2b-prospect" permKey="b2bProspect" label="B2B Prospect" icon={Briefcase} />
                 <PermissionToggle moduleId="field-command" permKey="fieldCommand" label="Field Command" icon={MapPin} />
                 <PermissionToggle moduleId="field-control" permKey="fieldControl" label="Contrôle Terrain" icon={ClipboardCheck} />
                 <PermissionToggle moduleId="kpi-pilot" permKey="kpiPilot" label="KPI Pilot" icon={BarChart3} />
                 <PermissionToggle moduleId="commissions" label="Paie & Ventes" icon={Calculator} />
                 <PermissionToggle moduleId="stock" label="Stock Flow" icon={Package} />
                 <PermissionToggle moduleId="fleet" label="Flotte" icon={Truck} />
                 <PermissionToggle moduleId="hr-attendance" label="RH Assiduité" icon={Clock} />
                 {allowedApps.length === 0 && <p className="text-[10px] text-slate-300 font-bold uppercase text-center py-8">Aucune application sélectionnée</p>}
               </>
             )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-50 flex justify-end">
          <button onClick={handleCreateUser} className={`flex items-center ${editingUsername ? 'bg-slate-900' : 'bg-indigo-600'} text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100`}>
            {editingUsername ? <><Edit3 className="w-4 h-4 mr-2" /> Valider les modifications</> : <><UserPlus className="w-4 h-4 mr-2" /> Créer le compte utilisateur</>}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
           <div>
             <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl">Répertoire des Comptes</h3>
             <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center space-x-2 w-fit mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{users.length} comptes actifs</span>
             </div>
           </div>
           
           <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#ff7900] transition-colors" />
              <input 
                type="text" 
                placeholder="Chercher un collaborateur..." 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-[#ff7900] shadow-inner text-sm"
              />
           </div>
        </div>
        
        {/* Cadre avec défilement et en-tête fixe */}
        <div className="overflow-auto max-h-[500px] custom-scrollbar border border-slate-50 rounded-3xl">
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <th className="px-6 py-4 text-left bg-white border-b border-slate-50">Utilisateur / Profil</th>
                <th className="px-6 py-4 text-left bg-white border-b border-slate-50">Login / Pass</th>
                <th className="px-6 py-4 text-left bg-white border-b border-slate-50">Modules & Accès</th>
                <th className="px-6 py-4 text-right bg-white border-b border-slate-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => {
                return (
                  <tr key={u.username} className={`group hover:bg-slate-50 transition-colors ${editingUsername === u.username ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                          {u.associatedAgentName?.charAt(0) || u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 uppercase italic text-xs tracking-tight">{u.associatedAgentName || 'Compte Admin'}</p>
                           <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${u.role === 'admin' ? 'bg-slate-900 text-orange-500' : 'bg-slate-100 text-slate-400'}`}>
                             {u.role}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                         <span className="text-slate-600 font-black font-mono tracking-tight">{u.username}</span>
                         <span className="text-[8px] font-black uppercase text-slate-300">Pass: {u.password}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {u.role === 'admin' ? (
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm">Privilèges Administrateur</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                           {u.allowedApps?.map(appId => (
                              <span key={appId} className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-400 rounded text-[7px] font-black uppercase">
                                {appId}
                              </span>
                           ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => handleEditUser(u)} className="p-2.5 text-slate-300 hover:text-blue-500 bg-white border border-slate-100 rounded-xl transition-all shadow-sm hover:shadow-md"><Edit3 className="w-4 h-4" /></button>
                        {u.username !== 'admin' && (
                          <button onClick={() => { if(confirm(`Supprimer l'accès de ${u.associatedAgentName} ?`)) handleSaveUsers(users.filter(item => item.username !== u.username)); }} className="p-2.5 text-slate-300 hover:text-rose-500 bg-white border border-slate-100 rounded-xl transition-all shadow-sm hover:shadow-md ml-2"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Aucun utilisateur trouvé pour "{userSearchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;
