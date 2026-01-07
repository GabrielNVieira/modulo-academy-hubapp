import React, { useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

interface PeriodOption {
  id: string;
  label: string;
  days: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AdvancedPeriodFilterProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriod: string;
  onPeriodChange: (period: string, customDates?: { start: string; end: string }) => void;
  periodOptions?: PeriodOption[];
  title?: string;
  description?: string;
}

const defaultPeriodOptions: PeriodOption[] = [
  { id: 'semanal', label: 'Últimos 7 dias', days: 7, icon: Clock },
  { id: 'mensal', label: 'Últimos 30 dias', days: 30, icon: Clock },
  { id: 'trimestral', label: 'Últimos 90 dias', days: 90, icon: Clock },
  { id: 'semestral', label: 'Últimos 6 meses', days: 180, icon: Clock }
];

export function AdvancedPeriodFilter({
  isOpen,
  onClose,
  selectedPeriod,
  onPeriodChange,
  periodOptions = defaultPeriodOptions,
  title = 'Filtros Avançados',
  description = 'Escolha um período pré-definido ou personalize suas datas para análise detalhada'
}: AdvancedPeriodFilterProps) {
  const [localSelectedPeriod, setLocalSelectedPeriod] = useState(selectedPeriod);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);

  if (!isOpen) return null;

  const handlePeriodSelect = (periodId: string) => {
    setLocalSelectedPeriod(periodId);
    setIsCustomPeriod(false);
  };

  const handleCustomPeriodToggle = () => {
    setIsCustomPeriod(true);
    setLocalSelectedPeriod('custom');
  };

  const handleApplyFilter = () => {
    if (isCustomPeriod && customStart && customEnd) {
      onPeriodChange('custom', { start: customStart, end: customEnd });
    } else {
      onPeriodChange(localSelectedPeriod);
    }
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedPeriod(selectedPeriod);
    setIsCustomPeriod(false);
    setCustomStart('');
    setCustomEnd('');
    onClose();
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const maxDate = formatDateForInput(today);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <button 
            onClick={handleCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Períodos Populares */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Períodos Populares</h4>
            <div className="grid grid-cols-2 gap-3">
              {periodOptions.map((option) => {
                const isSelected = localSelectedPeriod === option.id && !isCustomPeriod;
                return (
                  <button
                    key={option.id}
                    onClick={() => handlePeriodSelect(option.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 bg-white/50 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <option.icon className={`h-5 w-5 ${
                          isSelected ? 'text-primary' : 'text-gray-400'
                        }`} />
                      )}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <button
                onClick={handleCustomPeriodToggle}
                className="bg-white px-4 py-1 text-gray-500 hover:text-primary transition-colors"
              >
                ou personalize
              </button>
            </div>
          </div>

          {/* Período Personalizado */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Período Personalizado</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => {
                      setCustomStart(e.target.value);
                      handleCustomPeriodToggle();
                    }}
                    max={maxDate}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isCustomPeriod
                        ? 'border-primary bg-primary/5 text-primary focus:ring-2 focus:ring-primary/20'
                        : 'border-gray-200 bg-white/50 text-gray-500'
                    } focus:outline-none focus:border-primary`}
                    placeholder="dd/mm/aaaa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => {
                      setCustomEnd(e.target.value);
                      handleCustomPeriodToggle();
                    }}
                    max={maxDate}
                    min={customStart}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isCustomPeriod
                        ? 'border-primary bg-primary/5 text-primary focus:ring-2 focus:ring-primary/20'
                        : 'border-gray-200 bg-white/50 text-gray-500'
                    } focus:outline-none focus:border-primary`}
                    placeholder="dd/mm/aaaa"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 h-12 font-medium"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleApplyFilter}
            className="flex-1 h-12 font-medium bg-primary hover:bg-primary/90 text-white"
            disabled={isCustomPeriod && (!customStart || !customEnd)}
          >
            <Check className="h-4 w-4 mr-2" />
            Aplicar Filtro
          </Button>
        </div>
      </div>
    </div>
  );
}