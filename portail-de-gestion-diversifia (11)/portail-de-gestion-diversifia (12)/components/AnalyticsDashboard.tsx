
import React from 'react';
import { SalaryData, SalesData } from '../types';
import { NOVEMBER_OBJECTIVES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';

interface AnalyticsDashboardProps {
  allAgentsData: {
    name: string;
    salary: SalaryData;
    sales: SalesData;
  }[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ allAgentsData }) => {
  
  // Prepare Data for Salary Comparison
  const comparisonData = allAgentsData
    .filter(d => d.salary.baseSalary > 0 || d.salary.commission > 0) // Filter empty entries if any
    .map(d => {
      const totalDeductions = d.salary.routerMalus + d.salary.salaryConditionMalus + d.salary.clawbackResiliation + d.salary.clawbackDiversifia + d.salary.lateness + d.salary.absences + d.salary.advance + d.salary.otherDeductions + d.salary.cnss + d.salary.hrIncidents;
      const totalGross = d.salary.baseSalary + d.salary.commission + d.salary.seniorityBonus + d.salary.prime20HD + d.salary.prime100 + d.salary.bonusCA + d.salary.p4 + d.salary.bonusOther;
      return {
        name: d.name.split(' ')[0], // First name only for cleaner x-axis
        fullName: d.name,
        Net: totalGross - totalDeductions,
        Commission: d.salary.commission,
        Base: d.salary.baseSalary
      };
    })
    .sort((a, b) => b.Net - a.Net); // Sort by highest salary

  // Prepare Data for Objectives vs Realization
  const objectivesData = allAgentsData.map(d => {
    const totalRealized = 
      // Internet
      d.sales.tdlte + d.sales.ftth20 + d.sales.ftth50 + d.sales.ftth100 + d.sales.ftth200 + d.sales.ftth500 + d.sales.adsl +
      // Box
      d.sales.box249 + d.sales.box349 + d.sales.box5g +
      // Mobile & Partage
      d.sales.forf6h + d.sales.forf15h + d.sales.forf22h + d.sales.forf34h + d.sales.illimiteNat +
      d.sales.partage20 + d.sales.partage50 + d.sales.partage100 + d.sales.partage200;

    const objective = NOVEMBER_OBJECTIVES[d.name] || 0;
    const tro = objective > 0 ? Math.round((totalRealized / objective) * 100) : 0;

    return {
      name: d.name.split(' ')[0],
      fullName: d.name,
      Realise: totalRealized,
      Objectif: objective,
      TRO: tro
    };
  }).sort((a, b) => b.Realise - a.Realise);

  let salesMix = { Internet: 0, Mobile: 0, Box: 0 };
  allAgentsData.forEach(({ sales }) => {
    salesMix.Internet += (sales.ftth20 + sales.ftth50 + sales.ftth100 + sales.ftth200 + sales.ftth500 + sales.tdlte + sales.adsl);
    salesMix.Mobile += (sales.forf6h + sales.forf15h + sales.forf22h + sales.forf34h + sales.illimiteNat + sales.partage20 + sales.partage50 + sales.partage100 + sales.partage200);
    salesMix.Box += (sales.box249 + sales.box349 + sales.box5g);
  });

  const pieData = [
    { name: 'Internet Fixe', value: salesMix.Internet, color: '#ff7900' },
    { name: 'Mobile & Partage', value: salesMix.Mobile, color: '#22c55e' },
    { name: 'Box 4G/5G', value: salesMix.Box, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Objectives vs Realization Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Objectifs vs Réalisations</h3>
            <p className="text-sm text-gray-500">Suivi du volume total de ventes et du Taux de Réalisation (TRO)</p>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={objectivesData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 9, fontWeight: 'bold'}} 
                interval={0} 
                angle={-45} 
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" unit="%" />
              <Tooltip 
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" />
              <Bar yAxisId="left" dataKey="Objectif" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Objectif (Vol)" />
              <Bar yAxisId="left" dataKey="Realise" fill="#ff7900" radius={[4, 4, 0, 0]} name="Réalisé (Vol)" />
              <Line yAxisId="right" type="monotone" dataKey="TRO" stroke="#ef4444" strokeWidth={2} name="TRO %" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Salary Ranking */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Classement par Salaire Net</h3>
          <p className="text-sm text-gray-500">Comparaison des revenus nets par agent (Prénom utilisé pour lisibilité)</p>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 9, fontWeight: 'bold'}} 
                interval={0} 
                angle={-45} 
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                formatter={(value: number) => `${value.toLocaleString()} DH`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" />
              <Bar dataKey="Net" fill="#111827" radius={[4, 4, 0, 0]} name="Salaire Net" />
              <Bar dataKey="Commission" fill="#ff7900" radius={[4, 4, 0, 0]} name="Dont Commissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Performance Commissions</h3>
            <p className="text-sm text-gray-500">Top 5 Vendeurs</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={[...comparisonData].sort((a,b) => b.Commission - a.Commission).slice(0, 5)} 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 9, fontWeight: 'bold'}} />
                <Tooltip formatter={(value: number) => `${value} Dh`} />
                <Bar dataKey="Commission" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Mix Produits Global</h3>
            <p className="text-sm text-gray-500">Répartition des ventes totales</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
