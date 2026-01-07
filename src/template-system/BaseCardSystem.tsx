import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MoreVertical, Plus, Filter, Download, Refresh } from 'lucide-react';
import { BaseCardSystemProps, ModuleAction, ModuleStats } from './types/module-config';

export function BaseCard({ 
  title, 
  subtitle, 
  children, 
  actions = [], 
  className = '' 
}: BaseCardSystemProps) {
  return (
    <Card className={`card-modern ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.slice(0, 2).map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="h-8 w-8 p-0"
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
              </Button>
            ))}
            
            {actions.length > 2 && (
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

// Card para estatísticas/métricas
interface StatsCardProps {
  stats: ModuleStats[];
  className?: string;
}

export function StatsCard({ stats, className = '' }: StatsCardProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                {stat.change && (
                  <div className={`flex items-center text-sm ${
                    stat.change.type === 'positive' 
                      ? 'text-green-600' 
                      : stat.change.type === 'negative' 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {stat.change.value}
                  </div>
                )}
              </div>
              
              {stat.icon && (
                <div className={`p-3 rounded-lg`} style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Card vazio com call-to-action
interface EmptyStateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function EmptyStateCard({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  icon,
  className = '' 
}: EmptyStateCardProps) {
  return (
    <Card className={`card-modern ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 p-3 rounded-lg bg-gray-100">
            {icon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Card de lista genérica
interface ListCardProps<T = any> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  actions?: ModuleAction[];
  emptyState?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  className?: string;
}

export function ListCard<T = any>({ 
  title, 
  items, 
  renderItem, 
  actions = [],
  emptyState,
  className = '' 
}: ListCardProps<T>) {
  if (items.length === 0 && emptyState) {
    return (
      <BaseCard title={title} actions={actions} className={className}>
        <EmptyStateCard
          title={emptyState.title}
          description={emptyState.description}
          actionLabel={emptyState.actionLabel}
          onAction={emptyState.onAction}
        />
      </BaseCard>
    );
  }

  return (
    <BaseCard title={title} actions={actions} className={className}>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

// Card de ações rápidas
interface QuickActionsCardProps {
  title: string;
  actions: Array<{
    id: string;
    label: string;
    icon: any;
    color?: string;
    onClick: () => void;
  }>;
  className?: string;
}

export function QuickActionsCard({ 
  title, 
  actions, 
  className = '' 
}: QuickActionsCardProps) {
  return (
    <BaseCard title={title} className={className}>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: action.color + '20' || '#f3f4f6' }}
            >
              <action.icon 
                className="h-6 w-6" 
                style={{ color: action.color || '#6b7280' }} 
              />
            </div>
            <span className="text-sm font-medium text-center">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </BaseCard>
  );
}

// Card com filtros integrados
interface FilterCardProps {
  title: string;
  children: ReactNode;
  filters?: Array<{
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }>;
  actions?: ModuleAction[];
  className?: string;
}

export function FilterCard({ 
  title, 
  children, 
  filters = [], 
  actions = [],
  className = '' 
}: FilterCardProps) {
  return (
    <BaseCard title={title} actions={actions} className={className}>
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filter.isActive ? "default" : "outline"}
              className="cursor-pointer"
              onClick={filter.onClick}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      )}
      
      {children}
    </BaseCard>
  );
}