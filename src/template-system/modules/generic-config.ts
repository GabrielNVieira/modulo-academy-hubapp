import { ModuleConfig, ModuleTab, ModuleFilter, ModuleAction } from '../types/module-config';
import { 
  Home, 
  List, 
  BarChart3, 
  Users, 
  Settings, 
  Plus,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

export function createGenericModule(customConfig?: Partial<ModuleConfig>): ModuleConfig {
  const defaultConfig: ModuleConfig = {
    id: 'generic-module',
    name: 'Módulo Genérico',
    title: 'Template Base',
    description: 'Template genérico para criar qualquer tipo de módulo',
    version: '1.0.0',
    
    // Ícone do módulo
    icon: Home,

    // Abas do módulo (configuráveis)
    tabs: [
      {
        id: 'home',
        label: 'Dashboard',
        icon: Home,
        order: 0,
        color: '#10b981'
      },
      {
        id: 'data',
        label: 'Dados',
        icon: List,
        order: 1,
        color: '#3b82f6'
      },
      {
        id: 'analytics',
        label: 'Análises',
        icon: BarChart3,
        order: 2,
        color: '#8b5cf6'
      },
      {
        id: 'team',
        label: 'Equipe',
        icon: Users,
        order: 3,
        color: '#f59e0b'
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: Settings,
        order: 4,
        color: '#6b7280'
      }
    ],

    // Filtros secundários (não incluem período - será tratado separadamente)
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { id: 'all', value: 'all', label: 'Todos' },
          { id: 'active', value: 'active', label: 'Ativos' },
          { id: 'inactive', value: 'inactive', label: 'Inativos' },
          { id: 'pending', value: 'pending', label: 'Pendentes' }
        ],
        defaultValue: 'all'
      },
      {
        id: 'category',
        label: 'Categoria',
        type: 'select',
        options: [
          { id: 'all', value: 'all', label: 'Todas' },
          { id: 'high', value: 'high', label: 'Alta Prioridade' },
          { id: 'medium', value: 'medium', label: 'Média Prioridade' },
          { id: 'low', value: 'low', label: 'Baixa Prioridade' }
        ],
        defaultValue: 'all'
      }
    ],

    // Configuração do filtro de período (igual ao MultiFins)
    periodFilter: {
      enabled: true,
      title: 'Filtros Avançados',
      description: 'Escolha um período pré-definido ou personalize suas datas para análise detalhada',
      defaultPeriods: [
        { id: 'semanal', label: 'Últimos 7 dias', days: 7 },
        { id: 'mensal', label: 'Últimos 30 dias', days: 30 },
        { id: 'trimestral', label: 'Últimos 90 dias', days: 90 },
        { id: 'semestral', label: 'Últimos 6 meses', days: 180 }
      ],
      allowCustomPeriod: true
    },

    // Ações disponíveis
    actions: [
      {
        id: 'add-item',
        label: 'Adicionar Item',
        type: 'floating',
        icon: Plus,
        action: () => console.log('Adicionar novo item')
      },
      {
        id: 'export-data',
        label: 'Exportar Dados',
        type: 'primary',
        icon: Download,
        action: () => console.log('Exportar dados')
      },
      {
        id: 'import-data',
        label: 'Importar Dados',
        type: 'secondary',
        icon: Upload,
        action: () => console.log('Importar dados')
      }
    ],

    // Configuração de busca
    searchConfig: {
      placeholder: 'Buscar em todos os dados...',
      categories: ['Todos', 'Ativos', 'Pendentes', 'Inativos'],
      searchFields: ['title', 'description', 'category', 'status']
    },

    // Configurações visuais
    colors: {
      primary: '#10b981',
      secondary: '#0f172a',
      accent: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },

    // Dados iniciais (opcionais)
    initialData: {
      showWelcome: true,
      demoData: generateGenericDemoData(),
      notifications: [
        {
          type: 'info',
          title: 'Bem-vindo ao Template!',
          message: 'Este é um módulo genérico que você pode personalizar.',
          duration: 5000
        }
      ]
    }
  };

  // Mesclar com configurações customizadas se fornecidas
  return {
    ...defaultConfig,
    ...customConfig,
    tabs: customConfig?.tabs || defaultConfig.tabs,
    filters: customConfig?.filters || defaultConfig.filters,
    actions: customConfig?.actions || defaultConfig.actions,
    colors: { ...defaultConfig.colors, ...customConfig?.colors }
  };
}

// Dados demo genéricos
export function generateGenericDemoData() {
  const items = [];
  const categories = ['high', 'medium', 'low'];
  const statuses = ['active', 'inactive', 'pending'];
  
  for (let i = 1; i <= 20; i++) {
    items.push({
      id: `item-${i}`,
      title: `Item ${i}`,
      description: `Descrição do item ${i} - dados de exemplo para demonstração`,
      category: categories[Math.floor(Math.random() * categories.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      value: Math.floor(Math.random() * 10000),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      tags: [`tag-${Math.floor(Math.random() * 5) + 1}`, `tipo-${Math.floor(Math.random() * 3) + 1}`]
    });
  }
  
  return items;
}

// Dados de estatísticas genéricas
export function generateGenericStats() {
  return {
    totalItems: 20,
    activeItems: 12,
    pendingItems: 5,
    inactiveItems: 3,
    highPriority: 8,
    mediumPriority: 7,
    lowPriority: 5,
    totalValue: 125000,
    averageValue: 6250,
    growth: 12.5
  };
}