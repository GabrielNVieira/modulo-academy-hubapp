import { useMobile } from '../components/ui/use-mobile';
import { PeriodFilter } from '../components/PeriodFilter';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { BaseFilterSystemProps, ModuleFilter } from './types/module-config';

export function BaseFilterSystem({ 
  filters, 
  values, 
  onChange, 
  className = '' 
}: BaseFilterSystemProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return <MobileFilterSystem filters={filters} values={values} onChange={onChange} className={className} />;
  }

  return <DesktopFilterSystem filters={filters} values={values} onChange={onChange} className={className} />;
}

function DesktopFilterSystem({ filters, values, onChange, className }: BaseFilterSystemProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {filters.map((filter) => (
        <FilterComponent 
          key={filter.id}
          filter={filter}
          value={values[filter.id]}
          onChange={(value) => onChange(filter.id, value)}
        />
      ))}
    </div>
  );
}

function MobileFilterSystem({ filters, values, onChange, className }: BaseFilterSystemProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <FilterComponent 
          key={filter.id}
          filter={filter}
          value={values[filter.id]}
          onChange={(value) => onChange(filter.id, value)}
          mobile={true}
        />
      ))}
    </div>
  );
}

interface FilterComponentProps {
  filter: ModuleFilter;
  value: any;
  onChange: (value: any) => void;
  mobile?: boolean;
}

function FilterComponent({ filter, value, onChange, mobile = false }: FilterComponentProps) {
  const baseClasses = mobile 
    ? "text-sm" 
    : "";

  switch (filter.type) {
    case 'period':
      return (
        <PeriodFilter 
          value={value || filter.defaultValue || 'semanal'}
          onChange={onChange}
          className={baseClasses}
        />
      );

    case 'select':
      return (
        <Select value={value || filter.defaultValue} onValueChange={onChange}>
          <SelectTrigger className={`w-[180px] ${baseClasses}`}>
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options?.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'search':
      return (
        <Input
          type="text"
          placeholder={filter.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-[200px] ${baseClasses}`}
        />
      );

    case 'custom':
      if (filter.component) {
        const CustomComponent = filter.component;
        return (
          <CustomComponent 
            value={value}
            onChange={onChange}
            mobile={mobile}
            className={baseClasses}
          />
        );
      }
      return null;

    default:
      return null;
  }
}

// Componente para filtros rápidos (chips)
interface QuickFiltersProps {
  filters: Array<{
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }>;
  className?: string;
}

export function QuickFilters({ filters, className = '' }: QuickFiltersProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={filter.isActive ? "default" : "outline"}
          size="sm"
          onClick={filter.onClick}
          className={`
            h-8 text-xs transition-all duration-200
            ${filter.isActive 
              ? 'bg-primary text-white shadow-lg' 
              : 'hover:bg-gray-50'
            }
          `}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

// Hook para gerenciar estado dos filtros
import { useState } from 'react';

export function useFilters(initialFilters: Record<string, any> = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const clearFilter = (filterId: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
    setFilters
  };
}