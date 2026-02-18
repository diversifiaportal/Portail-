
import React from 'react';
import { INCIDENT_CATALOG } from '../constants';
import { AlertTriangle, Plus, Minus } from 'lucide-react';

interface IncidentManagerProps {
  selectedIncidents: Record<string, number>;
  onToggleIncident: (incidentId: string, amount: number, delta: number) => void;
  readOnly?: boolean;
}

const IncidentManager: React.FC<IncidentManagerProps> = ({ selectedIncidents, onToggleIncident, readOnly = false }) => {
  
  return (
    <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
      <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Justification des Incidents RH
      </h4>
      
      <div className="grid grid-cols-1 gap-3">
        {INCIDENT_CATALOG.map((incident) => {
          const count = selectedIncidents[incident.id] || 0;
          
          return (
            <div 
              key={incident.id}
              className={`flex items-center justify-between p-2 rounded-md border transition-all ${
                count > 0
                  ? 'bg-red-100 border-red-300 text-red-900' 
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <div className="flex-grow">
                <p className="text-xs font-semibold">{incident.label}</p>
                <p className="text-[10px] text-gray-500">Retenue unitaire : {incident.amount} Dh</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                    onClick={() => !readOnly && onToggleIncident(incident.id, incident.amount, -1)}
                    disabled={readOnly || count === 0}
                    className={`p-1 rounded-full ${readOnly || count === 0 ? 'text-gray-300 cursor-not-allowed' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}
                >
                    <Minus className="w-3 h-3" />
                </button>
                
                <span className={`text-sm font-bold w-4 text-center ${count > 0 ? 'text-red-800' : 'text-gray-400'}`}>
                    {count}
                </span>

                <button
                    onClick={() => !readOnly && onToggleIncident(incident.id, incident.amount, 1)}
                    disabled={readOnly}
                    className={`p-1 rounded-full ${readOnly ? 'text-gray-300 cursor-not-allowed' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}`}
                >
                    <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {Object.keys(selectedIncidents).length === 0 && readOnly && (
        <p className="text-xs text-gray-500 italic">Aucun incident enregistré pour ce mois.</p>
      )}
    </div>
  );
};

export default IncidentManager;
