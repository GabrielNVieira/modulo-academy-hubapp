import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModuleConfig, ModuleContextValue, ModuleNotification } from './types/module-config';

const ModuleContext = createContext<ModuleContextValue | null>(null);

interface ModuleProviderProps {
  config: ModuleConfig;
  children: ReactNode;
  initialData?: any[];
}

export function ModuleProvider({ config, children, initialData = [] }: ModuleProviderProps) {
  const [activeTab, setActiveTab] = useState(config.tabs[0]?.id || '');
  const [data, setData] = useState<any[]>(initialData);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Função de notificação temporária
  const addNotification = (notification: ModuleNotification) => {
    console.log('Notificação:', notification);
  };

  // Inicializar dados demo se configurado
  useEffect(() => {
    if (config.initialData?.demoData && data.length === 0) {
      setData(config.initialData.demoData);
    }
  }, [config.initialData?.demoData, data.length]);

  // Ações genéricas do módulo
  const actions = {
    add: (item: any) => {
      const newItem = {
        ...item,
        id: item.id || generateId(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setData(prev => [newItem, ...prev]);
      
      // Notificação de sucesso
      addNotification({
        type: 'success',
        title: 'Item Adicionado',
        message: `${newItem.title || 'Novo item'} foi adicionado com sucesso`
      });
    },

    update: (id: string, updates: any) => {
      setData(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        )
      );
      
      addNotification({
        type: 'success',
        title: 'Item Atualizado',
        message: 'As alterações foram salvas com sucesso'
      });
    },

    delete: (id: string) => {
      const item = data.find(d => d.id === id);
      setData(prev => prev.filter(d => d.id !== id));
      
      addNotification({
        type: 'success',
        title: 'Item Removido',
        message: `${item?.title || 'Item'} foi removido com sucesso`
      });
    },

    refresh: () => {
      // Lógica de refresh específica do módulo
      if (config.hooks?.useModuleData) {
        // Usar hook customizado se disponível
        const refreshedData = config.hooks.useModuleData();
        if (refreshedData) {
          setData(refreshedData);
        }
      }
      
      addNotification({
        type: 'success',
        title: 'Dados Atualizados',
        message: 'Todas as informações foram sincronizadas'
      });
    }
  };

  // Ações de notificação
  const notifications = {
    add: (notification: ModuleNotification) => {
      addNotification(notification);
    },
    
    clear: () => {
      // Implementar limpeza de notificações se necessário
    }
  };

  const contextValue: ModuleContextValue = {
    config,
    activeTab,
    setActiveTab,
    data,
    setData,
    filters,
    setFilters,
    actions,
    notifications
  };

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
}

// Hook para usar o contexto do módulo
export function useModule() {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModule deve ser usado dentro de um ModuleProvider');
  }
  return context;
}

// Hook para dados do módulo com filtros
export function useModuleData() {
  const { data, filters } = useModule();
  
  // Aplicar filtros aos dados
  const filteredData = data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      // Lógica de filtro genérica
      switch (key) {
        case 'search':
          return item.title?.toLowerCase().includes(value.toLowerCase()) ||
                 item.description?.toLowerCase().includes(value.toLowerCase());
        
        case 'period':
          if (!item.createdAt) return true;
          return filterByPeriod(new Date(item.createdAt), value);
        
        case 'category':
          return item.category === value;
        
        case 'status':
          return item.status === value;
        
        default:
          return item[key] === value;
      }
    });
  });

  return filteredData;
}

// Hook para estatísticas do módulo
export function useModuleStats() {
  const { data, config } = useModule();
  
  const stats = {
    total: data.length,
    recent: data.filter(item => {
      if (!item.createdAt) return false;
      const created = new Date(item.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length,
    categories: groupBy(data, 'category'),
    statuses: groupBy(data, 'status'),
    trend: calculateTrend(data)
  };

  return stats;
}

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function filterByPeriod(date: Date, period: string): boolean {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (period) {
    case 'hoje':
      return diffDays <= 1;
    case 'semanal':
      return diffDays <= 7;
    case 'mensal':
      return diffDays <= 30;
    case 'trimestral':
      return diffDays <= 90;
    case 'anual':
      return diffDays <= 365;
    default:
      return true;
  }
}

function groupBy(array: any[], key: string): Record<string, number> {
  return array.reduce((groups, item) => {
    const group = item[key] || 'Outros';
    groups[group] = (groups[group] || 0) + 1;
    return groups;
  }, {});
}

function calculateTrend(data: any[]): { direction: 'up' | 'down' | 'stable'; percentage: number } {
  if (data.length < 2) return { direction: 'stable', percentage: 0 };
  
  // Calcular tendência baseada nos últimos 30 dias vs 30 dias anteriores
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
  
  const recent = data.filter(item => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    return created > thirtyDaysAgo;
  }).length;
  
  const previous = data.filter(item => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    return created > sixtyDaysAgo && created <= thirtyDaysAgo;
  }).length;
  
  if (previous === 0) return { direction: 'stable', percentage: 0 };
  
  const percentage = Math.round(((recent - previous) / previous) * 100);
  const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
  
  return { direction, percentage: Math.abs(percentage) };
}