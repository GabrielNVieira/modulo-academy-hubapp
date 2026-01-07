import { useState, useRef, useEffect } from 'react';
import { useMobile } from '../components/ui/use-mobile';
import { E4CEODashboardLayout } from '../design-system';
import { NotificationProvider, useNotifications } from '../components/dynamic-notification-system';
import { MobileNotificationPanel } from '../components/MobileNotificationPanel';
import { DesktopNotificationPanel } from '../components/DesktopNotificationPanel';
import { BaseSearchSystem } from './BaseSearchSystem';
import { BaseFilterSystem } from './BaseFilterSystem';
import { AdvancedPeriodFilter } from './AdvancedPeriodFilter';
import { FloatingButtons } from '../components/FloatingButtons';
import { SmartSearchButton } from '../components/SmartSearchButton';
import { NotificationBadge } from '../components/NotificationBadge';
import { Button } from '../components/ui/button';
import { Toaster } from '../components/ui/sonner';
import { Bell, Settings, Clock, Filter } from 'lucide-react';
import { BaseModuleLayoutProps, ModuleConfig } from './types/module-config';

interface BaseModuleLayoutState {
  sidebarCollapsed: boolean;
  editMode: boolean;
  showNotifications: boolean;
  showSearch: boolean;
  showFilters: boolean;
  selectedFilters: Record<string, any>;
}

function BaseModuleLayoutContent({
  config,
  activeTab,
  onTabChange,
  selectedPeriod = 'semanal',
  onPeriodChange = () => { },
  children
}: BaseModuleLayoutProps) {
  const isMobile = useMobile();
  const [state, setState] = useState<BaseModuleLayoutState>({
    sidebarCollapsed: false,
    editMode: false,
    showNotifications: false,
    showSearch: false,
    showFilters: false,
    selectedFilters: {}
  });

  const { notifications, addNotification } = useNotifications();

  // Inicializar notificações do módulo
  useEffect(() => {
    if (config.initialData?.notifications && notifications.length === 0) {
      config.initialData.notifications.forEach((notification) => {
        addNotification(notification);
      });
    }
  }, [config.initialData?.notifications, notifications.length, addNotification]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC para fechar modais
      if (e.key === 'Escape') {
        setState(prev => ({
          ...prev,
          showNotifications: false,
          showSearch: false,
          showFilters: false
        }));
      }

      // Cmd+K ou Ctrl+K para abrir busca
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setState(prev => ({ ...prev, showSearch: true }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Função para atualizar estado
  const updateState = (updates: Partial<BaseModuleLayoutState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Função para obter o título dinâmico
  const getDynamicTitle = () => {
    const currentTab = config.tabs.find(tab => tab.id === activeTab);
    return currentTab ? `${currentTab.label}` : config.title;
  };

  // Função para atualizar filtros
  const handleFilterChange = (filterId: string, value: any) => {
    setState(prev => ({
      ...prev,
      selectedFilters: {
        ...prev.selectedFilters,
        [filterId]: value
      }
    }));
  };

  // Ações de busca
  const handleSearchResults = (results: any[]) => {
    // Implementar lógica de resultado de busca se necessário
  };

  const handleSearchSelect = (result: any) => {
    // Implementar lógica de seleção de resultado
    updateState({ showSearch: false });
  };

  return (
    <>
      <E4CEODashboardLayout
        currentPage={activeTab}
        onPageChange={onTabChange}
        sidebarCollapsed={state.sidebarCollapsed}
        onToggleSidebar={() => updateState({ sidebarCollapsed: !state.sidebarCollapsed })}
        title={getDynamicTitle()}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        // Mobile specific props
        onNotificationClick={() => updateState({ showNotifications: !state.showNotifications })}
        onSettingsClick={() => updateState({ editMode: !state.editMode })}
        onSearchClick={() => updateState({ showSearch: !state.showSearch })}
        hasNotifications={notifications.length > 0}
        notificationCount={notifications.length}
        rightContent={
          <div className="flex items-center gap-3">
            {/* Filtro de Período - visível tanto no desktop quanto no mobile */}
            <div className="flex items-center gap-1 p-1 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg">
              {[
                { value: 'semanal', label: '7d' },
                { value: 'mensal', label: '30d' },
                { value: 'trimestral', label: '3m' },
                { value: 'anual', label: '1a' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => onPeriodChange(period.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${selectedPeriod === period.value
                      ? 'bg-[var(--color-multifins-blue)] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {period.label}
                </button>
              ))}

              {/* Botão de Filtro Avançado integrado */}
              <button
                onClick={() => updateState({ showFilters: !state.showFilters })}
                className={`p-2 rounded-lg transition-all duration-200 ${state.showFilters
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                title="Filtros Avançados"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>

            <SmartSearchButton
              onClick={() => updateState({ showSearch: !state.showSearch })}
            />

            <button
              onClick={() => updateState({ showNotifications: !state.showNotifications })}
              className="relative p-2.5 rounded-xl bg-white/95 backdrop-blur-xl border border-white/20 text-gray-700 hover:bg-gray-50 shadow-lg transition-all duration-200"
              title={`Notificações${notifications.length > 0 ? ` (${notifications.length})` : ''}`}
            >
              <Bell className="h-5 w-5" />
              <NotificationBadge count={notifications.length} />
            </button>

            <button
              onClick={() => updateState({ editMode: !state.editMode })}
              className={`p-2.5 rounded-xl transition-all duration-200 ${state.editMode
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white/95 backdrop-blur-xl border border-white/20 text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                }`}
              title={state.editMode ? 'Finalizar Edição' : 'Editar Layout'}
            >
              <Settings className={`h-5 w-5 transition-transform duration-200 ${state.editMode ? 'rotate-180' : ''}`} />
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {children}
        </div>
      </E4CEODashboardLayout>



      {/* Notification Panels */}
      {isMobile ? (
        <MobileNotificationPanel
          isOpen={state.showNotifications}
          onClose={() => updateState({ showNotifications: false })}
          sidebarCollapsed={state.sidebarCollapsed}
        />
      ) : (
        <DesktopNotificationPanel
          isOpen={state.showNotifications}
          onClose={() => updateState({ showNotifications: false })}
          sidebarCollapsed={state.sidebarCollapsed}
        />
      )}

      {/* Advanced Period Filter Modal */}
      <AdvancedPeriodFilter
        isOpen={state.showFilters}
        onClose={() => updateState({ showFilters: false })}
        selectedPeriod={selectedPeriod}
        onPeriodChange={(period, customDates) => {
          onPeriodChange?.(period, customDates);
          updateState({ showFilters: false });
        }}
        periodOptions={config.periodFilter?.defaultPeriods?.map(p => ({
          ...p,
          icon: Clock
        }))}
        title={config.periodFilter?.title || 'Filtros Avançados'}
        description={config.periodFilter?.description || 'Escolha um período para análise'}
      />

      {/* Search System */}
      <BaseSearchSystem
        config={config.searchConfig}
        data={[]} // Dados serão fornecidos pelo módulo específico
        onResults={handleSearchResults}
        onSelect={handleSearchSelect}
        isOpen={state.showSearch}
        onClose={() => updateState({ showSearch: false })}
      />

      {/* Toast notifications */}
      <Toaster />
    </>
  );
}

export function BaseModuleLayout(props: BaseModuleLayoutProps) {
  return (
    <NotificationProvider>
      <BaseModuleLayoutContent {...props} />
    </NotificationProvider>
  );
}