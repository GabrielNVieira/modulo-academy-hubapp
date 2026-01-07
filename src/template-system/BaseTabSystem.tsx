import { useMobile } from '../components/ui/use-mobile';
import { BaseTabSystemProps } from './types/module-config';

export function BaseTabSystem({ 
  tabs, 
  activeTab, 
  onTabChange, 
  isMobile: forceMobile 
}: BaseTabSystemProps) {
  const detectedMobile = useMobile();
  const isMobile = forceMobile !== undefined ? forceMobile : detectedMobile;

  if (isMobile) {
    return <MobileTabSystem tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />;
  }

  return <DesktopTabSystem tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />;
}

function MobileTabSystem({ tabs, activeTab, onTabChange }: Omit<BaseTabSystemProps, 'isMobile'>) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 mobile-floating-tabbar-optimized border-t">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.mobileIcon || tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-16 min-h-16
                ${isActive 
                  ? 'text-primary bg-primary/10 shadow-lg' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'touch-feedback'}
              `}
              title={tab.label}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>
                {tab.label}
              </span>
              
              {/* Badge de notificações */}
              {tab.badge && tab.badge > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesktopTabSystem({ tabs, activeTab, onTabChange }: Omit<BaseTabSystemProps, 'isMobile'>) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
              
              {/* Badge de notificações */}
              {tab.badge && tab.badge > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Sub-tabs para abas internas (como Lista, Kanban, Upload na aba Transações)
interface BaseSubTabSystemProps {
  subTabs: any[];
  activeSubTab: string;
  onSubTabChange: (subTabId: string) => void;
  isMobile?: boolean;
}

export function BaseSubTabSystem({ 
  subTabs, 
  activeSubTab, 
  onSubTabChange, 
  isMobile 
}: BaseSubTabSystemProps) {
  if (isMobile) {
    return (
      <div className="flex bg-gray-50 rounded-xl p-1 mb-4">
        {subTabs.map((subTab) => {
          const isActive = activeSubTab === subTab.id;
          const Icon = subTab.icon;
          
          return (
            <button
              key={subTab.id}
              onClick={() => onSubTabChange(subTab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-sm font-medium">{subTab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex space-x-1 mb-6">
      {subTabs.map((subTab) => {
        const isActive = activeSubTab === subTab.id;
        const Icon = subTab.icon;
        
        return (
          <button
            key={subTab.id}
            onClick={() => onSubTabChange(subTab.id)}
            className={`
              flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-sm font-medium">{subTab.label}</span>
          </button>
        );
      })}
    </div>
  );
}