// ===== TEMPLATE SYSTEM EXPORTS =====

// Types
export type {
  ModuleConfig,
  ModuleTab,
  ModuleSubTab,
  ModuleFilter,
  ModuleAction,
  ModuleNotification,
  ModuleStats,
  ModuleSearchResult,
  ModuleColors,
  BaseItem,
  BaseModuleLayoutProps,
  BaseTabSystemProps,
  BaseFilterSystemProps,
  BaseSearchSystemProps,
  BaseCardSystemProps,
  ModuleContextValue
} from './types/module-config';

// Core Components
export { BaseModuleLayout } from './BaseModuleLayout';
export { BaseTabSystem, BaseSubTabSystem } from './BaseTabSystem';
export { BaseFilterSystem, QuickFilters, useFilters } from './BaseFilterSystem';
export { BaseSearchSystem, useSearch } from './BaseSearchSystem';
export { 
  BaseCard, 
  StatsCard, 
  EmptyStateCard, 
  ListCard, 
  QuickActionsCard, 
  FilterCard 
} from './BaseCardSystem';

// Provider and Hooks
export { 
  ModuleProvider, 
  useModule, 
  useModuleData, 
  useModuleStats 
} from './ModuleProvider';

// Module Builders - Generic Template
export { createGenericModule, generateGenericDemoData } from './modules/generic-config';

// Utilities
export { moduleUtils } from './utils/module-utils';