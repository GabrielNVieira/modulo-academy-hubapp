import { ModuleConfig, ModuleTab, ModuleAction } from '../types/module-config';

export const moduleUtils = {
  // Validar configuração do módulo
  validateConfig: (config: ModuleConfig): string[] => {
    const errors: string[] = [];
    
    if (!config.id) errors.push('ID do módulo é obrigatório');
    if (!config.name) errors.push('Nome do módulo é obrigatório');
    if (!config.title) errors.push('Título do módulo é obrigatório');
    if (!config.icon) errors.push('Ícone do módulo é obrigatório');
    if (!config.tabs || config.tabs.length === 0) errors.push('Pelo menos uma aba é obrigatória');
    if (!config.colors) errors.push('Paleta de cores é obrigatória');
    
    return errors;
  },

  // Gerar ID único para módulo
  generateModuleId: (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  // Criar aba padrão
  createTab: (
    id: string, 
    label: string, 
    icon: any, 
    options: Partial<ModuleTab> = {}
  ): ModuleTab => ({
    id,
    label,
    icon,
    mobileIcon: options.mobileIcon || icon,
    badge: options.badge || 0,
    disabled: options.disabled || false,
    ...options
  }),

  // Criar ação padrão
  createAction: (
    id: string,
    label: string,
    icon: any,
    action: () => void,
    type: 'primary' | 'secondary' | 'floating' = 'primary',
    shortcut?: string
  ): ModuleAction => ({
    id,
    label,
    icon,
    type,
    action,
    shortcut
  }),

  // Merge configurações de módulo
  mergeConfigs: (base: ModuleConfig, override: Partial<ModuleConfig>): ModuleConfig => {
    return {
      ...base,
      ...override,
      colors: { ...base.colors, ...override.colors },
      tabs: override.tabs || base.tabs,
      filters: override.filters || base.filters,
      actions: override.actions || base.actions,
      initialData: { ...base.initialData, ...override.initialData }
    };
  },

  // Gerar estrutura de pastas para módulo
  generateModuleStructure: (moduleId: string) => {
    return {
      moduleRoot: `/modules/${moduleId}/`,
      components: `/modules/${moduleId}/components/`,
      types: `/modules/${moduleId}/types/`,
      utils: `/modules/${moduleId}/utils/`,
      hooks: `/modules/${moduleId}/hooks/`,
      config: `/modules/${moduleId}/config.ts`,
      index: `/modules/${moduleId}/index.ts`
    };
  },

  // Criar template de componente
  createComponentTemplate: (
    componentName: string,
    moduleId: string
  ): string => {
    return `import { useModule } from '../../template-system';
import { BaseCard } from '../../template-system';

interface ${componentName}Props {
  // Props específicas do componente
}

export function ${componentName}({ }: ${componentName}Props) {
  const { data, actions, config } = useModule();

  return (
    <BaseCard title="${componentName}">
      <div className="space-y-4">
        {/* Conteúdo do componente */}
        <p>Componente ${componentName} do módulo ${moduleId}</p>
      </div>
    </BaseCard>
  );
}`;
  },

  // Criar template de hook
  createHookTemplate: (
    hookName: string,
    moduleId: string
  ): string => {
    return `import { useState, useEffect } from 'react';
import { useModule } from '../../template-system';

export function ${hookName}() {
  const { data, actions, config } = useModule();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lógica de inicialização
  }, []);

  // Lógica específica do hook

  return {
    loading,
    // Outros valores retornados
  };
}`;
  },

  // Utilitários de data
  dateUtils: {
    formatPeriod: (period: string): string => {
      const periodMap: Record<string, string> = {
        'hoje': 'Hoje',
        'semanal': 'Esta Semana',
        'mensal': 'Este Mês',
        'trimestral': 'Este Trimestre',
        'anual': 'Este Ano'
      };
      return periodMap[period] || period;
    },

    getPeriodRange: (period: string): { start: Date; end: Date } => {
      const now = new Date();
      const start = new Date(now);
      const end = new Date(now);

      switch (period) {
        case 'hoje':
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'semanal':
          start.setDate(now.getDate() - now.getDay());
          start.setHours(0, 0, 0, 0);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case 'mensal':
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(start.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'trimestral':
          const quarter = Math.floor(now.getMonth() / 3);
          start.setMonth(quarter * 3, 1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(quarter * 3 + 3, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'anual':
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(11, 31);
          end.setHours(23, 59, 59, 999);
          break;
      }

      return { start, end };
    }
  },

  // Utilitários de formatação
  formatUtils: {
    currency: (value: number, currency: string = 'BRL'): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency
      }).format(value);
    },

    number: (value: number): string => {
      return new Intl.NumberFormat('pt-BR').format(value);
    },

    percentage: (value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1
      }).format(value / 100);
    },

    date: (date: string | Date): string => {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },

    datetime: (date: string | Date): string => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    }
  },

  // Utilitários de validação
  validationUtils: {
    email: (email: string): boolean => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },

    phone: (phone: string): boolean => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 11;
    },

    required: (value: any): boolean => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },

    minLength: (value: string, min: number): boolean => {
      return value.length >= min;
    },

    maxLength: (value: string, max: number): boolean => {
      return value.length <= max;
    }
  },

  // Utilitários de cores
  colorUtils: {
    getContrastColor: (hexColor: string): string => {
      const r = parseInt(hexColor.substr(1, 2), 16);
      const g = parseInt(hexColor.substr(3, 2), 16);
      const b = parseInt(hexColor.substr(5, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    },

    hexToRgba: (hex: string, alpha: number = 1): string => {
      const r = parseInt(hex.substr(1, 2), 16);
      const g = parseInt(hex.substr(3, 2), 16);
      const b = parseInt(hex.substr(5, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    generateShades: (baseColor: string): Record<string, string> => {
      // Implementação simplificada - em produção usaria uma biblioteca como chroma.js
      return {
        50: baseColor + '20',
        100: baseColor + '40',
        500: baseColor,
        600: baseColor,
        700: baseColor,
        900: baseColor
      };
    }
  }
};