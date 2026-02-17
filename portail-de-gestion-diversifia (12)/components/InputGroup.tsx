import React from 'react';
import { SalaryData } from '../types';

type SalaryDataNumberKeys = {
  [K in keyof SalaryData]: SalaryData[K] extends number ? K : never;
}[keyof SalaryData];

interface InputGroupProps {
  title: string;
  icon: React.ReactNode;
  fields: {
    key: SalaryDataNumberKeys;
    label: string;
    placeholder?: string;
    readOnly?: boolean;
  }[];
  data: SalaryData;
  onChange: (key: keyof SalaryData, value: number) => void;
  colorClass: string;
  readOnly?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({ title, icon, fields, data, onChange, colorClass, readOnly = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-2">
        <span className={colorClass}>{icon}</span>
        <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={field.key} className="group">
            <label htmlFor={field.key} className="block text-sm font-medium text-gray-600 mb-1">
              {field.label}
            </label>
            <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name={field.key}
                  id={field.key}
                  min="0"
                  readOnly={readOnly || field.readOnly}
                  className={`block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#ff7900] sm:text-sm sm:leading-6 transition-all ${
                    (readOnly || field.readOnly) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                  placeholder={field.placeholder || "0"}
                  value={data[field.key] === 0 ? '' : data[field.key]}
                  onChange={(e) => {
                    if (readOnly || field.readOnly) return;
                    const val = parseFloat(e.target.value);
                    onChange(field.key, isNaN(val) ? 0 : val);
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-xs font-medium">Dh</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputGroup;