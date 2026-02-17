
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Loader2, Lock } from 'lucide-react';
import { getCloudData } from '../services/database';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cloudUsers, setCloudUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getCloudData('users');
        if (data && Array.isArray(data)) {
          setCloudUsers(data);
        }
      } catch (e) {
        console.error("Erreur chargement utilisateurs Firebase:", e);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
        const lowerUser = username.toLowerCase();
        
        if (lowerUser === 'admin' && password === 'admin123') {
            onLogin({ 
              username: 'admin', 
              role: 'admin', 
              allowedApps: ['commissions', 'fleet', 'stock', 'users', 'hr-attendance', 'adv', 'kpi-pilot'] 
            });
            setIsLoading(false);
            return;
        }

        const foundUser = cloudUsers.find(u => u.username.toLowerCase() === lowerUser && u.password === password);
        
        if (foundUser) {
            onLogin(foundUser);
        } else {
            setError('Identifiant ou mot de passe incorrect.');
        }
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-fade-up">
        <div className="bg-slate-950 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ff7900]"></div>
          
          {/* Nouveau Logo DIVERSIFIA complet */}
          <div className="relative inline-block mb-8">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">DIVERSIFIA</h1>
            {/* Icône Signal Radio style image utilisateur */}
            <div className="absolute -top-6 -right-10 scale-125">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="18" r="2.5" fill="#ff7900"/>
                <path d="M12 18C12 14.6863 9.31371 12 6 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M18 18C18 11.3726 12.6274 6 6 6" stroke="#ff7900" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div className="text-[10px] font-black text-[#ff7900] uppercase tracking-[0.5em] mt-3 block">Distributeur Orange</div>
          </div>
          
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Accès Portail Unifié v2.5</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Identifiant</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900] transition-all font-bold text-slate-900 shadow-inner"
                placeholder="ex: adnane.l"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#ff7900] focus:border-[#ff7900] transition-all font-bold text-slate-900 shadow-inner"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-6 top-4 w-5 h-5 text-slate-300" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff7900] hover:bg-slate-900 disabled:bg-slate-200 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-100 flex items-center justify-center uppercase tracking-widest text-xs"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se Connecter'}
            </button>
          </form>
          
          <div className="mt-10 text-center">
             <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Sécurisé par Diversifia Cloud</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;