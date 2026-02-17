import React from 'react';
import { CalculationResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SummaryCardProps {
  result: CalculationResult;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ result }) => {
  const data = [
    { name: 'Salaire Net', value: result.netSalary > 0 ? result.netSalary : 0, color: '#ff7900' }, // Orange brand color
    { name: 'Déductions', value: result.totalDeductions, color: '#ef4444' }, // Red
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-orange-100 sticky top-24">
      <div className="p-6 bg-gray-900 text-white rounded-t-xl">
        <h2 className="text-lg font-medium opacity-90">Salaire Net à Payer</h2>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-4xl font-bold tracking-tight">
            {formatCurrency(result.netSalary)}
          </span>
          <span className="text-sm text-gray-400">MAD</span>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 font-semibold uppercase">Total Revenus</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(result.totalGross)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-600 font-semibold uppercase">Total Retenues</p>
            <p className="text-lg font-bold text-red-800">{formatCurrency(result.totalDeductions)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
          Calcul instantané basé sur les entrées.
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;