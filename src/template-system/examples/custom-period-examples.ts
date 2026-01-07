// Exemplos de configuração personalizada para filtros de período

// ===== EXEMPLO 1: MÓDULO FINANCEIRO =====
export const financialPeriodConfig = {
  enabled: true,
  title: 'Filtros Financeiros',
  description: 'Escolha um período pré-definido ou personalize suas datas para análise financeira detalhada',
  defaultPeriods: [
    { id: 'semanal', label: 'Últimos 7 dias', days: 7 },
    { id: 'mensal', label: 'Últimos 30 dias', days: 30 },
    { id: 'trimestral', label: 'Últimos 90 dias', days: 90 },
    { id: 'semestral', label: 'Últimos 6 meses', days: 180 }
  ],
  allowCustomPeriod: true
};

// ===== EXEMPLO 2: MÓDULO DE VENDAS =====
export const salesPeriodConfig = {
  enabled: true,
  title: 'Período de Vendas',
  description: 'Analise suas vendas em diferentes períodos para otimizar estratégias',
  defaultPeriods: [
    { id: 'hoje', label: 'Hoje', days: 1 },
    { id: 'semanal', label: 'Esta Semana', days: 7 },
    { id: 'mensal', label: 'Este Mês', days: 30 },
    { id: 'trimestral', label: 'Trimestre Atual', days: 90 },
    { id: 'anual', label: 'Ano Atual', days: 365 }
  ],
  allowCustomPeriod: true
};

// ===== EXEMPLO 3: MÓDULO DE MARKETING =====
export const marketingPeriodConfig = {
  enabled: true,
  title: 'Análise de Campanhas',
  description: 'Escolha o período para analisar performance das suas campanhas',
  defaultPeriods: [
    { id: 'campanha1', label: 'Campanha Atual (7d)', days: 7 },
    { id: 'mensal', label: 'Este Mês', days: 30 },
    { id: 'bimestral', label: 'Últimos 2 Meses', days: 60 },
    { id: 'trimestral', label: 'Trimestre', days: 90 }
  ],
  allowCustomPeriod: true
};

// ===== EXEMPLO 4: MÓDULO DE RH =====
export const hrPeriodConfig = {
  enabled: true,
  title: 'Período de Análise RH',
  description: 'Selecione o período para análise de dados de recursos humanos',
  defaultPeriods: [
    { id: 'semanal', label: 'Esta Semana', days: 7 },
    { id: 'mensal', label: 'Este Mês', days: 30 },
    { id: 'bimestral', label: 'Bimestre', days: 60 },
    { id: 'semestral', label: 'Semestre', days: 180 },
    { id: 'anual', label: 'Ano Fiscal', days: 365 }
  ],
  allowCustomPeriod: true
};

// ===== EXEMPLO 5: MÓDULO SIMPLES (SEM PERSONALIZAÇÃO) =====
export const simplePeriodConfig = {
  enabled: true,
  title: 'Filtros',
  description: 'Selecione o período de análise',
  defaultPeriods: [
    { id: 'semanal', label: '7 dias', days: 7 },
    { id: 'mensal', label: '30 dias', days: 30 }
  ],
  allowCustomPeriod: false // Sem período customizado
};

// ===== EXEMPLO 6: MÓDULO SEM FILTRO DE PERÍODO =====
export const noPeriodConfig = {
  enabled: false // Desabilita completamente o filtro de período
};

// ===== COMO USAR NOS MÓDULOS =====

/*
// No arquivo de configuração do seu módulo:

import { financialPeriodConfig } from '../examples/custom-period-examples';

export const createMyCustomModule = (config: Partial<ModuleConfig>) => ({
  // ... outras configurações
  
  // Use uma das configurações de exemplo
  periodFilter: financialPeriodConfig,
  
  // Ou crie sua própria configuração
  periodFilter: {
    enabled: true,
    title: 'Meu Filtro Personalizado',
    description: 'Descrição personalizada para meu módulo',
    defaultPeriods: [
      { id: 'custom1', label: 'Período Especial', days: 15 },
      { id: 'custom2', label: 'Outro Período', days: 45 }
    ],
    allowCustomPeriod: true
  }
});

*/