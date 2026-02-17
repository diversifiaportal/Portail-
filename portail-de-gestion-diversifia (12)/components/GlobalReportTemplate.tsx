
import React from 'react';
import { SalaryData } from '../types';

interface GlobalReportTemplateProps {
  data: {
    name: string;
    salary: SalaryData;
  }[];
  month: string;
}

const GlobalReportTemplate: React.FC<GlobalReportTemplateProps> = ({ data, month }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  // Sort by name
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

  const totalPayroll = sortedData.reduce((acc, curr) => {
    const s = curr.salary;
    const gross = s.baseSalary + s.commission + s.seniorityBonus + s.prime20HD + s.prime100 + s.bonusCA + s.p4 + s.bonusOther;
    const deductions = s.routerMalus + s.salaryConditionMalus + s.clawbackResiliation + s.clawbackDiversifia + s.lateness + s.absences + s.advance + s.otherDeductions + s.cnss + s.hrIncidents;
    return acc + (gross - deductions);
  }, 0);

  return (
    <div className="hidden print:block p-4 bg-white text-xs font-sans" style={{ fontFamily: 'Verdana, sans-serif' }}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold uppercase text-gray-900">État Global des Salaires - DIVERSIFIA</h1>
        <p className="text-sm text-gray-600 mt-1">Période : {month}</p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-[10px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2 text-left">Nom Prénom</th>
            <th className="border border-gray-300 p-2 text-right bg-green-50">Salaire Base</th>
            <th className="border border-gray-300 p-2 text-right bg-green-50">Commissions</th>
            <th className="border border-gray-300 p-2 text-right bg-green-50">Bonus/Primes</th>
            <th className="border border-gray-300 p-2 text-right font-bold bg-green-100">TOTAL BRUT</th>
            <th className="border border-gray-300 p-2 text-right bg-red-50">CNSS</th>
            <th className="border border-gray-300 p-2 text-right bg-red-50">Avances</th>
            <th className="border border-gray-300 p-2 text-right bg-red-50">Malus/Retenues</th>
            <th className="border border-gray-300 p-2 text-right font-bold bg-red-100">TOTAL RETENUES</th>
            <th className="border border-gray-300 p-2 text-right font-bold text-white bg-gray-900">NET À PAYER</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => {
            const s = item.salary;
            const bonuses = s.prime20HD + s.prime100 + s.bonusCA + s.p4 + s.bonusOther + s.seniorityBonus;
            const totalGross = s.baseSalary + s.commission + bonuses;
            const deductionsNoAvanceNoCnss = s.routerMalus + s.salaryConditionMalus + s.clawbackResiliation + s.clawbackDiversifia + s.lateness + s.absences + s.otherDeductions + s.hrIncidents;
            const totalDeductions = deductionsNoAvanceNoCnss + s.advance + s.cnss;
            const net = totalGross - totalDeductions;

            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 p-1 font-medium">{item.name}</td>
                <td className="border border-gray-300 p-1 text-right">{formatCurrency(s.baseSalary)}</td>
                <td className="border border-gray-300 p-1 text-right">{formatCurrency(s.commission)}</td>
                <td className="border border-gray-300 p-1 text-right">{formatCurrency(bonuses)}</td>
                <td className="border border-gray-300 p-1 text-right font-bold">{formatCurrency(totalGross)}</td>
                <td className="border border-gray-300 p-1 text-right text-red-600">{formatCurrency(s.cnss)}</td>
                <td className="border border-gray-300 p-1 text-right text-red-600">{formatCurrency(s.advance)}</td>
                <td className="border border-gray-300 p-1 text-right text-red-600">{formatCurrency(deductionsNoAvanceNoCnss)}</td>
                <td className="border border-gray-300 p-1 text-right font-bold text-red-600">{formatCurrency(totalDeductions)}</td>
                <td className="border border-gray-300 p-1 text-right font-bold bg-gray-100">{formatCurrency(net)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-900 text-white font-bold">
            <td className="p-2 text-left">TOTAL GÉNÉRAL</td>
            <td className="p-2 text-right" colSpan={8}>TOTAL MASSE SALARIALE NETTE</td>
            <td className="p-2 text-right">{formatCurrency(totalPayroll)}</td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-4 text-[8px] text-gray-500 text-right">
        Généré le {new Date().toLocaleDateString('fr-MA')}
      </div>
    </div>
  );
};

export default GlobalReportTemplate;
