import React, { useMemo } from 'react';
import { SalesData } from '../types';
import { COMMISSION_RATES, PRODUCT_OFFERS } from '../constants';
import { Wifi, Smartphone, Box, Share2, Plus, Minus, Tag, Wallet, RotateCcw } from 'lucide-react';

interface SalesPanelProps {
  data: SalesData;
  onChange: (key: keyof SalesData, value: number) => void;
  readOnly?: boolean;
}

const SalesPanel: React.FC<SalesPanelProps> = ({ data, onChange, readOnly = false }) => {
  
  // Calcul du total en temps réel pour le bandeau
  const currentTotal = useMemo(() => {
    return Object.entries(data).reduce((acc, [key, qty]) => {
      return acc + (qty as number) * (COMMISSION_RATES[key as keyof SalesData] || 0);
    }, 0);
  }, [data]);

  const handleIncrement = (key: keyof SalesData, delta: number) => {
    if (readOnly) return;
    const currentVal = data[key] || 0;
    const newVal = Math.max(0, currentVal + delta);
    onChange(key, newVal);
  };

  // Récupère le nom officiel de l'offre depuis la configuration ADV
  const getOfferLabel = (key: string) => {
    const offer = PRODUCT_OFFERS.find(o => o.id === key);
    return offer ? offer.label : key.toUpperCase();
  };

  const renderProductCard = (key: keyof SalesData, colorClass: string, bgClass: string) => {
    const label = getOfferLabel(key);
    const rate = COMMISSION_RATES[key];
    const quantity = data[key] || 0;
    const totalForProduct = quantity * rate;

    return (
      <div key={key} className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${quantity > 0 ? `bg-white border-${colorClass.split('-')[1]}-200 shadow-md transform scale-[1.02]` : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 rounded-xl ${bgClass} ${colorClass}`}>
            <Tag className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Commission</span>
            <span className={`block text-sm font-black ${colorClass}`}>{rate} DH</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-black text-slate-700 uppercase leading-tight mb-4 h-8 flex items-center" title={label}>{label}</h4>
          
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1">
            <button 
              onClick={() => handleIncrement(key, -1)}
              disabled={readOnly || quantity === 0}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${quantity === 0 || readOnly ? 'text-slate-300 cursor-not-allowed' : 'bg-white text-slate-700 shadow-sm hover:text-rose-500'}`}
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className={`font-black text-lg ${quantity > 0 ? 'text-slate-900' : 'text-slate-300'}`}>
              {quantity}
            </span>

            <button 
              onClick={() => handleIncrement(key, 1)}
              disabled={readOnly}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${readOnly ? 'text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white shadow-md hover:bg-[#ff7900]'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {quantity > 0 && (
          <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-lg">
            Total: {totalForProduct} DH
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Section 1: Internet Fixe */}
      <div>
        <div className="flex items-center space-x-2 mb-4 px-2">
          <Wifi className="w-5 h-5 text-[#ff7900]" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Internet Fixe (Fibre & ADSL)</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {renderProductCard('tdlte', 'text-orange-500', 'bg-orange-50')}
          {renderProductCard('ftth20', 'text-orange-500', 'bg-orange-50')}
          {renderProductCard('ftth50', 'text-orange-500', 'bg-orange-50')}
          {renderProductCard('ftth100', 'text-orange-500', 'bg-orange-50')}
          {renderProductCard('ftth200', 'text-orange-500', 'bg-orange-50')}
          {renderProductCard('ftth500', 'text-orange-500', 'bg-orange-50')}
          {renderProductCard('adsl', 'text-slate-500', 'bg-slate-100')}
        </div>
      </div>

      {/* Section 2: Box & Mobile */}
      <div>
        <div className="flex items-center space-x-2 mb-4 px-2 mt-8">
          <Box className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Box 4G & Forfaits Mobiles</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {renderProductCard('box249', 'text-indigo-600', 'bg-indigo-50')}
          {renderProductCard('box349', 'text-indigo-600', 'bg-indigo-50')}
          {renderProductCard('box5g', 'text-purple-600', 'bg-purple-50')}
          {renderProductCard('forf6h', 'text-blue-500', 'bg-blue-50')}
          {renderProductCard('forf15h', 'text-blue-500', 'bg-blue-50')}
          {renderProductCard('forf22h', 'text-blue-500', 'bg-blue-50')}
          {renderProductCard('forf34h', 'text-blue-500', 'bg-blue-50')}
          {renderProductCard('illimiteNat', 'text-emerald-500', 'bg-emerald-50')}
        </div>
      </div>

      {/* Section 3: Partage */}
      <div>
        <div className="flex items-center space-x-2 mb-4 px-2 mt-8">
          <Share2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Offres Partage</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {renderProductCard('partage20', 'text-emerald-600', 'bg-emerald-50')}
          {renderProductCard('partage50', 'text-emerald-600', 'bg-emerald-50')}
          {renderProductCard('partage100', 'text-emerald-600', 'bg-emerald-50')}
          {renderProductCard('partage200', 'text-emerald-600', 'bg-emerald-50')}
        </div>
      </div>

      {/* Bandeau Total Flottant */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between z-40 border border-slate-700/50 backdrop-blur-md bg-opacity-95">
         <div className="flex items-center space-x-3 ml-2">
            <div className="w-10 h-10 bg-[#ff7900] rounded-full flex items-center justify-center animate-pulse">
               <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Commissions</p>
               <p className="text-xl font-black text-white leading-none">{currentTotal.toLocaleString()} DH</p>
            </div>
         </div>
         {!readOnly && (
           <button 
             onClick={() => {
               if(confirm('Réinitialiser toutes les quantités à zéro ?')) {
                 Object.keys(data).forEach(k => onChange(k as keyof SalesData, 0));
               }
             }}
             className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
             title="Remettre à zéro"
           >
             <RotateCcw className="w-5 h-5 text-slate-400" />
           </button>
         )}
      </div>

    </div>
  );
};

export default SalesPanel;