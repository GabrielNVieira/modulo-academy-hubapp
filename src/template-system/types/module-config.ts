import { ReactNode, ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

// ===== TIPOS BASE GENÉRICOS =====

export interface BaseItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ModuleColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface ModuleTab {
  id: string;
  label: string;
  icon: LucideIcon;
  mobileIcon?: LucideIcon;
  badge?: number;
  disabled?: boolean;
  order?: number;
  color?: string;
}

export interface ModuleSubTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  component: ComponentType<any>;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface ModuleFilter {
  id: string;
  label: string;
  type: 'select' | 'period' | 'search' | 'custom';
  options?: FilterOption[];
  defaultValue?: string;
  component?: ComponentType<any>;
}

export interface ModuleAction {
  id: string;
  label: string;
  icon: LucideIcon;
  type: 'primary' | 'secondary' | 'floating';
  action: () => void;
  shortcut?: string;
}

export interface ModuleNotification {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface ModuleStats {
  label: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: LucideIcon;
  color?: string;
}

export interface ModuleSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  data: any;
}

// ===== CONFIGURAÇÃO PRINCIPAL DO MÓDULO =====

export interface ModuleConfig {
  // Identificação
  id: string;
  name: string;
  title: string;
  description?: string;
  version?: string;
  
  // Visual
  icon: LucideIcon;
  colors: ModuleColors;
  
  // Navegação
  tabs: ModuleTab[];
  subTabs?: Record<string, ModuleSubTab[]>;
  
  // Filtros e Busca
  filters: ModuleFilter[];
  periodFilter?: {
    enabled: boolean;
    title?: string;
    description?: string;
    defaultPeriods?: Array<{
      id: string;
      label: string;
      days: number;
    }>;
    allowCustomPeriod?: boolean;
  };
  searchConfig: {
    placeholder: string;
    categories: string[];
    searchFields: string[];
  };
  
  // Ações
  actions: ModuleAction[];
  
  // Dashboard
  dashboardStats?: ModuleStats[];
  dashboardWidgets?: ComponentType<any>[];
  
  // Configurações iniciais
  initialData?: {
    showWelcome: boolean;
    demoData: any[];
    notifications: ModuleNotification[];
  };
  
  // Hooks customizados
  hooks?: {
    useModuleData?: () => any;
    useModuleActions?: () => any;
    useModuleNotifications?: () => any;
  };
}

// ===== PROPS PARA COMPONENTS BASE =====

export interface BaseModuleLayoutProps {
  config: ModuleConfig;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  selectedPeriod?: string;
  onPeriodChange?: (period: string, customDates?: { start: string; end: string }) => void;
  children: ReactNode;
}

export interface BaseTabSystemProps {
  tabs: ModuleTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobile?: boolean;
}

export interface BaseFilterSystemProps {
  filters: ModuleFilter[];
  values: Record<string, any>;
  onChange: (filterId: string, value: any) => void;
  className?: string;
}

export interface BaseSearchSystemProps {
  config: ModuleConfig['searchConfig'];
  data: any[];
  onResults: (results: ModuleSearchResult[]) => void;
  onSelect: (result: ModuleSearchResult) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface BaseCardSystemProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ModuleAction[];
  className?: string;
}

// ===== CONTEXTO DO MÓDULO =====

export interface ModuleContextValue {
  config: ModuleConfig;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  data: any[];
  setData: (data: any[]) => void;
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  actions: {
    add: (item: any) => void;
    update: (id: string, updates: any) => void;
    delete: (id: string) => void;
    refresh: () => void;
  };
  notifications: {
    add: (notification: ModuleNotification) => void;
    clear: () => void;
  };
}

// ===== TIPOS PARA MÓDULOS ESPECÍFICOS =====

// Financeiro
export interface FinancialModule extends ModuleConfig {
  id: 'financeiro';
  currencies: string[];
  accountTypes: string[];
  transactionCategories: string[];
}

// Agenda
export interface AgendaModule extends ModuleConfig {
  id: 'agenda';
  eventTypes: string[];
  timeZones: string[];
  calendarViews: string[];
}

// CRM
export interface CRMModule extends ModuleConfig {
  id: 'crm';
  contactTypes: string[];
  pipelineStages: string[];
  leadSources: string[];
}

// E-commerce
export interface EcommerceModule extends ModuleConfig {
  id: 'ecommerce';
  productCategories: string[];
  orderStatuses: string[];
  paymentMethods: string[];
}