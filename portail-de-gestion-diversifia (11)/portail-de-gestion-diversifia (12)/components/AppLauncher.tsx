
import React from 'react';
import { AppId, User } from '../types';
import { Calculator, Truck, Package, ChevronRight, Lock, ShieldCheck, Clock, TrendingUp, BarChart3, Briefcase, MonitorPlay, MapPin, ClipboardCheck } from 'lucide-react';

interface AppLauncherProps {
  user: User;
  onSelectApp: (appId: AppId) => void;
}

const AppLauncher: React.FC<AppLauncherProps> = ({ user, onSelectApp }) => {
  const apps = [
    { 
      id: 'tv-dashboard' as AppId,
      name: 'TV Dashboard',
      desc: 'Affichage Salle des Marchés (Live)',
      icon: MonitorPlay,
      color: 'bg-rose-600',
      adminOnly: false // Accessible si dans allowedApps
    },
    { 
      id: 'b2b-prospect' as AppId,
      name: 'B2B Prospect',
      desc: 'Prospection et Lead Management Entreprises',
      icon: Briefcase,
      color: 'bg-slate-800'
    },
    { 
      id: 'field-control' as AppId,
      name: 'Contrôle Terrain',
      desc: 'Audit Qualité & Conformité Vendeurs',
      icon: ClipboardCheck,
      color: 'bg-teal-600'
    },
    { 
      id: 'adv' as AppId, 
      name: 'Portail ADV', 
      desc: 'Suivi des contrats et pilotage commercial', 
      icon: TrendingUp, 
      color: 'bg-indigo-600' 
    },
    { 
      id: 'stock' as AppId, 
      name: 'Orange Stock Flow', 
      desc: 'Mouvements de stock et inventaire', 
      icon: Package, 
      color: 'bg-emerald-600' 
    },
    { 
      id: 'kpi-pilot' as AppId, 
      name: 'KPI Pilot', 
      desc: 'Supervision stratégique & Intelligence IA', 
      icon: BarChart3, 
      color: 'bg-cyan-500' 
    },
    { 
      id: 'commissions' as AppId, 
      name: 'Simulateur Commissions', 
      desc: 'Gestion des paies et performances ventes', 
      icon: Calculator, 
      color: 'bg-orange-500' 
    },
    { 
      id: 'fleet' as AppId, 
      name: 'Gestion de Flotte', 
      desc: 'Suivi des véhicules et carburant', 
      icon: Truck, 
      color: 'bg-blue-600' 
    },
    { 
      id: 'hr-attendance' as AppId, 
      name: 'RH Assiduité', 
      desc: 'Gestion du pointage et des absences', 
      icon: Clock, 
      color: 'bg-indigo-600' 
    },
    { 
      id: 'users' as AppId, 
      name: 'Gestion Accès', 
      desc: 'Droit d\'accès et comptes utilisateurs', 
      icon: ShieldCheck, 
      color: 'bg-slate-900',
      adminOnly: true 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Bonjour, {user.username}</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Choisissez votre espace de travail</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {apps.map((app) => {
          const isVisible = app.adminOnly ? user.role === 'admin' : true;
          if (!isVisible) return null;

          // Sécurité contre allowedApps non défini
          const isAllowed = user.role === 'admin' || (user.allowedApps && user.allowedApps.includes(app.id));
          
          return (
            <button
              key={app.id}
              disabled={!isAllowed}
              onClick={() => onSelectApp(app.id)}
              className={`group relative text-left bg-white p-6 rounded-[2.5rem] shadow-xl transition-all border border-slate-100 flex flex-col ${
                isAllowed 
                ? 'hover:scale-105 hover:shadow-2xl hover:border-indigo-200' 
                : 'opacity-60 grayscale cursor-not-allowed'
              }`}
            >
              <div className={`${app.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                <app.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tighter leading-tight">{app.name}</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">{app.desc}</p>
              
              <div className="flex items-center justify-between mt-auto">
                {isAllowed ? (
                  <span className="text-indigo-600 font-black uppercase text-[10px] tracking-widest flex items-center">
                    Accéder <ChevronRight className="ml-1 w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-slate-300 font-black uppercase text-[10px] tracking-widest flex items-center">
                    <Lock className="mr-1 w-3 h-3" /> Accès restreint
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppLauncher;
