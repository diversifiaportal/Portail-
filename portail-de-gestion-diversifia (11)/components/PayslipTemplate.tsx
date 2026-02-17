import React from 'react';
import { SalaryData, SalesData, CalculationResult } from '../types';
import { INCIDENT_CATALOG } from '../constants';

interface PayslipTemplateProps {
  salaryData: SalaryData;
  salesData: SalesData;
  result: CalculationResult;
  month: string;
}

const PayslipTemplate: React.FC<PayslipTemplateProps> = ({ salaryData, result, month }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 }).format(val);

  const Row = ({ label, amount, isDeduction = false, bold = false }: { label: string, amount: number, isDeduction?: boolean, bold?: boolean }) => (
    <tr className={`border-b border-gray-100 ${bold ? 'font-bold' : ''}`}>
      <td className="py-0.5 px-2 text-left">{label}</td>
      <td className={`py-0.5 px-2 text-right ${isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
        {amount !== 0 ? (isDeduction ? '-' : '') + formatCurrency(amount) : '-'}
      </td>
    </tr>
  );

  const activeIncidents = Object.entries(salaryData.incidentsList || {}).map(([id, value]) => {
      const count = value as number;
      const meta = INCIDENT_CATALOG.find(item => item.id === id);
      if (meta && count > 0) {
          return { ...meta, count, total: count * meta.amount };
      }
      return null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div 
      id="printable-payslip" 
      className="hidden print:flex flex-col bg-white p-4 max-w-[210mm] mx-auto text-xs leading-tight text-gray-800 h-full"
      style={{ fontFamily: 'Verdana, sans-serif' }}
    >
      <style>
        {`
          @media print {
            @page { margin: 0.5cm; size: A4 portrait; }
            body { -webkit-print-color-adjust: exact; }
            html, body { height: 100%; margin: 0; padding: 0; }
            #printable-payslip {
              width: 100% !important;
              height: 100vh !important;
              justify-content: space-between;
            }
          }
        `}
      </style>
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative bg-slate-950 p-3 rounded-sm">
            <h1 className="text-lg font-black italic text-white leading-none tracking-tighter">DIVERSIFIA</h1>
            <div className="absolute top-0 -right-3 scale-75">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="18" r="2.5" fill="#ff7900"/>
                <path d="M12 18C12 14.6863 9.31371 12 6 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M18 18C18 11.3726 12.6274 6 6 6" stroke="#ff7900" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <p className="text-[5px] text-[#ff7900] font-black uppercase tracking-[0.3em] mt-0.5">Distributeur Orange</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-base font-bold uppercase text-gray-800">Bulletin de Paie</h2>
          <p className="text-xs font-medium text-gray-600">Période : {month}</p>
        </div>
      </div>

      {/* --- IDENTIFICATION --- */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-gray-300 rounded-sm p-2">
          <h3 className="text-[9px] font-bold text-gray-400 uppercase mb-1 border-b border-gray-100 pb-0.5">Employeur</h3>
          <p className="font-bold text-xs">DIVERSIFIA S.A.R.L</p>
          <p className="text-[10px] text-gray-600">Temara Mall Imb A2 Bureau N7</p>
          <p className="text-[10px] text-gray-600">Temara centre</p>
        </div>
        
        <div className="border border-gray-300 rounded-sm p-2 bg-gray-50">
          <h3 className="text-[9px] font-bold text-gray-400 uppercase mb-1 border-b border-gray-200 pb-0.5">Salarié</h3>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <span className="text-gray-500">Nom Prénom :</span>
            <span className="col-span-2 font-bold uppercase">{salaryData.agentName}</span>
            <span className="text-gray-500">Matricule :</span>
            <span className="col-span-2 font-mono">{salaryData.agentName?.substring(0, 3).toUpperCase() || 'EMP'}-00X</span>
            <span className="text-gray-500">Fonction :</span>
            <span className="col-span-2">Commercial Terrain</span>
          </div>
        </div>
      </div>

      {/* --- TABLEAU FINANCIER --- */}
      <div className="border border-gray-300 rounded-sm mb-4 overflow-hidden flex-grow">
        <div className="grid grid-cols-2 divide-x divide-gray-300 h-full">
          <div>
            <div className="bg-gray-100 py-1 px-2 font-bold text-center border-b border-gray-300 text-[9px] uppercase text-gray-600">
              Éléments de Rémunération (Brut)
            </div>
            <table className="w-full text-[10px]">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                   <th className="py-1 px-2 text-left font-medium">Rubrique</th>
                   <th className="py-1 px-2 text-right font-medium">Montant</th>
                 </tr>
              </thead>
              <tbody>
                <Row label="Salaire de Base" amount={salaryData.baseSalary} bold />
                <Row label="Commissions Ventes" amount={salaryData.commission} />
                <Row label="Prime d'ancienneté" amount={salaryData.seniorityBonus} />
                <Row label="Prime 20 HD" amount={salaryData.prime20HD} />
                <Row label="Prime 100%" amount={salaryData.prime100} />
                <Row label="Bonus Chiffre d'Affaires" amount={salaryData.bonusCA} />
                <Row label="Prime P4" amount={salaryData.p4} />
                <Row label="Autres Bonus" amount={salaryData.bonusOther} />
              </tbody>
            </table>
          </div>

          <div>
            <div className="bg-gray-100 py-1 px-2 font-bold text-center border-b border-gray-300 text-[9px] uppercase text-gray-600">
              Retenues & Déductions
            </div>
            <table className="w-full text-[10px]">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase">
                   <th className="py-1 px-2 text-left font-medium">Rubrique</th>
                   <th className="py-1 px-2 text-right font-medium">Montant</th>
                 </tr>
              </thead>
              <tbody>
                <Row label="Cotisation CNSS" amount={salaryData.cnss} isDeduction />
                <Row label="Malus Routeur" amount={salaryData.routerMalus} isDeduction />
                <Row label="Condition Salaire" amount={salaryData.salaryConditionMalus} isDeduction />
                <Row label="Clawback (Résiliation)" amount={salaryData.clawbackResiliation} isDeduction />
                <Row label="Clawback (Diversifia)" amount={salaryData.clawbackDiversifia} isDeduction />
                <Row label="Retards" amount={salaryData.lateness} isDeduction />
                <Row label="Absences" amount={salaryData.absences} isDeduction />
                <Row label="Avance sur Salaire" amount={salaryData.advance} isDeduction />
                <Row label="Incidents RH" amount={salaryData.hrIncidents} isDeduction />
                <Row label="Autres Prélèvements" amount={salaryData.otherDeductions} isDeduction />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- TOTAUX INTERMEDIAIRES --- */}
      <div className="border border-gray-300 rounded-sm mb-4 bg-gray-50">
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          <div className="flex justify-between items-center py-1.5 px-3">
            <span className="font-bold text-gray-700 text-[10px]">TOTAL BRUT</span>
            <span className="font-bold text-gray-900 text-xs">{formatCurrency(result.totalGross)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3">
            <span className="font-bold text-gray-700 text-[10px]">TOTAL RETENUES</span>
            <span className="font-bold text-red-600 text-xs">-{formatCurrency(result.totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* --- INCIDENTS (Si présents) --- */}
      {activeIncidents.length > 0 && (
        <div className="mb-4 border border-gray-200 bg-gray-50 p-2 text-[8px]">
          <h4 className="font-bold text-gray-600 mb-0.5 uppercase">Justificatif Incidents :</h4>
          <ul className="list-disc list-inside text-gray-500 grid grid-cols-2 gap-x-2">
            {activeIncidents.map((inc, idx) => (
              <li key={idx} className="truncate">
                  {inc.label} {inc.count > 1 && `(x${inc.count})`} : -{inc.total} Dh
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- NET A PAYER --- */}
      <div className="flex justify-end mb-6">
        <div className="border border-gray-900 rounded-sm overflow-hidden w-1/3">
          <div className="bg-gray-900 text-white text-center py-1 text-[10px] uppercase tracking-wider">
            Net à Payer
          </div>
          <div className="bg-white text-center py-2">
            <span className="text-xl font-black text-gray-900">{formatCurrency(result.netSalary)}</span>
          </div>
        </div>
      </div>

      {/* --- SIGNATURES --- */}
      <div className="grid grid-cols-2 gap-8 mt-auto pt-2 border-t border-gray-200 page-break-inside-avoid">
        <div className="text-center">
          <p className="font-bold text-[9px] uppercase mb-6 text-gray-500">Signature Responsable</p>
          <div className="h-10 border-b border-dashed border-gray-300 w-3/4 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-bold text-[9px] uppercase mb-6 text-gray-500">Signature Salarié</p>
          <p className="text-[8px] text-gray-400 mb-1 italic">"Lu et approuvé"</p>
          <div className="h-8 border-b border-dashed border-gray-300 w-3/4 mx-auto"></div>
        </div>
      </div>
      
      {/* --- FOOTER --- */}
      <div className="mt-4 text-center text-[8px] text-gray-400">
        <p>Document généré par DIVERSIFIA - Valable sans cachet pour simulation interne.</p>
        <p>DIVERSIFIA S.A.R.L - RC 123456 - ICE 000123456000078</p>
      </div>
    </div>
  );
};

export default PayslipTemplate;