/**
 * E4CEO Design System - MultiFins Edition
 * Sistema de design baseado no E4CEO adaptado para o MultiFins
 */

import { useState, ReactNode, useEffect } from 'react'
import {
  LayoutDashboard,
  FileBarChart,
  Heart,
  CreditCard,
  PiggyBank,
  Settings,
  Filter,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react'
import { MobilePeriodFilterOptimized } from './MobilePeriodFilterOptimized'

// ==================== HOOKS ====================

function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
}

// ==================== NAVIGATION COMPONENTS ====================

interface NavigationItem {
  id: string
  icon: any
  label: string
  color?: string
}

interface SidebarProps {
  collapsed?: boolean
  currentPage?: string
  onPageChange?: (page: string) => void
  onToggleCollapse?: () => void
  children?: ReactNode
  navigationItems?: NavigationItem[]
}

export function E4CEOSidebar({
  collapsed = false,
  currentPage = 'home',
  onPageChange = () => { },
  onToggleCollapse = () => { },
  children,
  navigationItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'transactions', icon: CreditCard, label: 'Transações' },
    { id: 'accounts', icon: PiggyBank, label: 'Contas' },
    { id: 'results', icon: FileBarChart, label: 'Relatórios' },
    { id: 'health', icon: Heart, label: 'Saúde' }
  ]
}: SidebarProps) {

  return (
    <div className={`
      fixed top-4 right-4 bottom-4 z-50 
      bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10
      transition-all duration-300 ease-out
      ${collapsed ? 'w-24' : 'w-72'}
    `}>
      {/* Header */}
      <div className={`h-16 flex items-center border-b border-gray-100 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {collapsed ? (
          /* Modo Collapsed - M centralizado com hover effect */
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-xl hover:bg-primary/10 transition-all duration-300 flex items-center justify-center group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md relative overflow-hidden">
              {/* M normal */}
              <span className="text-white font-bold text-sm transition-all duration-300 group-hover:opacity-0 group-hover:scale-50">
                M
              </span>

              {/* 3 barrinhas no hover */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                <div className="w-3 h-0.5 bg-white rounded-full"></div>
                <div className="w-3 h-0.5 bg-white rounded-full"></div>
                <div className="w-3 h-0.5 bg-white rounded-full"></div>
              </div>
            </div>
          </button>
        ) : (
          /* Modo Expandido - M + MultiFins */
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl hover:bg-primary/10 transition-all duration-300 flex items-center justify-center group flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md relative overflow-hidden">
                {/* M normal */}
                <span className="text-white font-bold text-sm transition-all duration-300 group-hover:opacity-0 group-hover:scale-50">
                  M
                </span>

                {/* 3 barrinhas no hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 scale-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                  <div className="w-3 h-0.5 bg-white rounded-full"></div>
                  <div className="w-3 h-0.5 bg-white rounded-full"></div>
                  <div className="w-3 h-0.5 bg-white rounded-full"></div>
                </div>
              </div>
            </button>

            <span className="font-semibold text-gray-900">Nome Modulo</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`
              w-full rounded-xl transition-all duration-300
              relative overflow-hidden group
              ${collapsed
                ? 'flex items-center justify-center p-3'
                : 'flex items-center gap-3 px-3 py-3'
              }
              ${currentPage === item.id
                ? collapsed
                  ? 'bg-transparent'
                  : 'bg-primary/10 text-primary shadow-sm'
                : collapsed
                  ? 'text-gray-600 hover:bg-transparent'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {/* Icon Container - Modo Collapsed */}
            {collapsed ? (
              <div
                className={`
                  w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 relative
                  ${currentPage === item.id
                    ? 'text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/60 text-gray-600 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:border-gray-300/60 hover:text-gray-800 shadow-md hover:shadow-lg'
                  }
                  hover:scale-105 group-hover:shadow-2xl
                `}
                style={currentPage === item.id && item.color ? {
                  background: `linear-gradient(to bottom right, ${item.color}, ${item.color}dd)`
                } : {}}
              >
                <item.icon className={`
                  h-5 w-5 transition-all duration-300
                  ${currentPage === item.id ? 'scale-110' : 'group-hover:scale-110'}
                `} />

                {/* Glow effect para o ativo */}
                {currentPage === item.id && (
                  <div
                    className="absolute inset-0 rounded-xl blur-lg opacity-60"
                    style={{ backgroundColor: item.color ? `${item.color}33` : 'var(--primary-20)' }}
                  />
                )}
              </div>
            ) : (
              <>
                {/* Icon Container - Modo Expandido */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0
                    ${currentPage === item.id
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                    }
                  `}
                  style={currentPage === item.id && item.color ? { backgroundColor: item.color } : {}}
                >
                  <item.icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                </div>
              </>
            )}

            {/* Tooltip para modo collapsed */}
            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900/95 backdrop-blur-xl text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10 group-hover:translate-x-1">
                {item.label}
                {/* Arrow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-b border-white/10"></div>
              </div>
            )}

            {/* Active indicator */}
            {currentPage === item.id && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                style={{ backgroundColor: item.color || 'var(--primary)' }}
              />
            )}
          </button>
        ))}
      </nav>


      {/* Settings */}
      <div className="p-4">
        <button className={`
          w-full rounded-xl transition-all duration-300 group relative
          text-gray-600 hover:text-gray-900
          ${collapsed
            ? 'flex items-center justify-center p-3'
            : 'flex items-center gap-3 px-3 py-3 hover:bg-gray-50'
          }
        `}>
          <div className={`
            rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 relative
            ${collapsed
              ? 'w-11 h-11 bg-gradient-to-br from-white to-gray-50 border border-gray-200/60 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:border-gray-300/60 shadow-md hover:shadow-lg hover:scale-105'
              : 'w-10 h-10 bg-gray-100 hover:bg-gray-200'
            }
          `}>
            <Settings className={`
              transition-all duration-300
              ${collapsed ? 'h-5 w-5 group-hover:scale-110' : 'h-5 w-5'}
            `} />
          </div>

          {!collapsed && <span className="font-medium">Configurações</span>}

          {/* Tooltip para modo collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900/95 backdrop-blur-xl text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10 group-hover:translate-x-1">
              Configurações
              {/* Arrow */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-b border-white/10"></div>
            </div>
          )}
        </button>
      </div>

      {/* Custom content */}
      {children}
    </div>
  )
}

interface MobileTabBarProps {
  currentPage?: string
  onPageChange?: (page: string) => void
  className?: string
  tabItems?: NavigationItem[]
}

export function E4CEOMobileTabBar({
  currentPage = 'home',
  onPageChange = () => { },
  className = '',
  tabItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Home' },
    { id: 'transactions', icon: CreditCard, label: 'Transações' },
    { id: 'accounts', icon: PiggyBank, label: 'Contas' },
    { id: 'results', icon: FileBarChart, label: 'Relatórios' }
  ]
}: MobileTabBarProps) {

  return (
    <div className={`
      fixed bottom-6 left-4 right-4 z-50
      ${className}
    `}>
      {/* Container principal com relação ao FAB */}
      <div className="relative">
        {/* Barra de navegação principal */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 flex items-center justify-between px-4 py-2 h-16">

          {/* Primeira metade - 2 itens à esquerda */}
          <div className="flex flex-1 justify-around">
            {tabItems.slice(0, 2).map((item, index) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300
                  min-w-[64px] relative overflow-hidden
                  ${currentPage === item.id
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                style={currentPage === item.id && item.color ? {
                  backgroundColor: item.color,
                  animationDelay: `${index * 0.1}s`
                } : { animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`
                  w-6 h-6 flex items-center justify-center transition-all duration-200
                  ${currentPage === item.id ? 'scale-110' : ''}
                `}>
                  <item.icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <span className="text-xs font-medium leading-tight">
                  {item.label}
                </span>

                {/* Active indicator */}
                {currentPage === item.id && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-10 animate-pulse"
                    style={{ backgroundColor: item.color || 'var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Espaço para o FAB - 72px de largura para acomodar o botão */}
          <div className="w-18"></div>

          {/* Segunda metade - 2 itens à direita */}
          <div className="flex flex-1 justify-around">
            {tabItems.slice(2).map((item, index) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300
                  min-w-[64px] relative overflow-hidden
                  ${currentPage === item.id
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                style={currentPage === item.id && item.color ? {
                  backgroundColor: item.color,
                  animationDelay: `${(index + 2) * 0.1}s`
                } : { animationDelay: `${(index + 2) * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`
                  w-6 h-6 flex items-center justify-center transition-all duration-200
                  ${currentPage === item.id ? 'scale-110' : ''}
                `}>
                  <item.icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <span className="text-xs font-medium leading-tight">
                  {item.label}
                </span>

                {/* Active indicator */}
                {currentPage === item.id && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-10 animate-pulse"
                    style={{ backgroundColor: item.color || 'var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Botão FAB - Posicionado no centro e metade para fora */}
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 w-16 h-16 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-105 z-10"
          title="Adicionar Transação"
        >
          <span className="text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-200">+</span>

          {/* Anel de borda branca para destacar */}
          <div className="absolute inset-0 rounded-full border-4 border-white/95"></div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-lg group-hover:bg-emerald-400/40 transition-all duration-300"></div>
        </button>
      </div>
    </div>
  )
}

// ==================== HEADER COMPONENTS ====================

interface HeaderProps {
  title?: string
  rightContent?: ReactNode
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
  showPeriodFilter?: boolean
  className?: string
  // Mobile specific props
  onNotificationClick?: () => void
  onSettingsClick?: () => void
  hasNotifications?: boolean
  notificationCount?: number
  onSearchClick?: () => void
}

export function E4CEOHeader({
  title = "Dashboard",
  rightContent,
  selectedPeriod,
  onPeriodChange,
  showPeriodFilter = false,
  className = '',
  onNotificationClick = () => { },
  onSettingsClick = () => { },
  hasNotifications = false,
  notificationCount = 0,
  onSearchClick = () => { }
}: HeaderProps) {
  const isMobile = useMobile();

  return (
    <div className={`fixed top-4 left-4 z-40 ${className}`}>
      {/* Header principal */}
      <header className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 h-18 w-full">
        <div className="h-full px-6 flex items-center justify-between w-full">
          {/* Left side - Logo e título */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">💰</span>
            </div>
            {!isMobile && (
              <span className="text-lg font-semibold text-gray-900">{title}</span>
            )}
            {isMobile && (
              <span className="text-lg font-semibold text-gray-900">MultiFins</span>
            )}
          </div>

          {/* Center - Espaço flexível para empurrar os botões para a direita */}
          <div className="flex-1 min-w-0"></div>

          {/* Right side - Botões fixos no canto direito */}
          <div className="flex items-center gap-2.5 flex-shrink-0 header-buttons-fixed">
            {/* Mobile Actions - Filtro, Notificações e Configurações */}
            {isMobile && (
              <>
                {/* Botão do Filtro de Período */}
                {showPeriodFilter && selectedPeriod && onPeriodChange && (
                  <MobilePeriodFilterOptimized
                    value={selectedPeriod}
                    onChange={onPeriodChange}
                    showOnDesktop={true}
                    iconOnly={true}
                  />
                )}

                {/* Botão de Busca */}
                <button
                  onClick={onSearchClick}
                  className="w-10 h-10 bg-white/95 backdrop-blur-lg border border-gray-200/60 rounded-xl shadow-sm hover:shadow-md hover:bg-white hover:border-gray-300 transition-all duration-200 flex items-center justify-center group flex-shrink-0"
                  title="Buscar transações"
                >
                  <Search className="h-4.5 w-4.5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                </button>

                {/* Botão de Notificações */}
                <button
                  onClick={onNotificationClick}
                  className="relative w-10 h-10 bg-white/95 backdrop-blur-lg border border-gray-200/60 rounded-xl shadow-sm hover:shadow-md hover:bg-white hover:border-gray-300 transition-all duration-200 flex items-center justify-center group flex-shrink-0"
                  title={`Notificações${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
                >
                  <Bell className="h-4.5 w-4.5 text-gray-600 group-hover:text-gray-900 transition-colors" />

                  {/* Notification badge */}
                  {hasNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                      <div className="relative w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                  )}

                  {/* Notification count */}
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-md">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </div>
                  )}
                </button>

                {/* Botão de Configurações */}
                <button
                  onClick={onSettingsClick}
                  className="w-10 h-10 bg-white/95 backdrop-blur-lg border border-gray-200/60 rounded-xl shadow-sm hover:shadow-md hover:bg-white hover:border-gray-300 transition-all duration-200 flex items-center justify-center group flex-shrink-0"
                  title="Configurações"
                >
                  <Settings className="h-4.5 w-4.5 text-gray-600 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-200" />
                </button>
              </>
            )}

            {/* Desktop content */}
            {!isMobile && rightContent}
          </div>
        </div>
      </header>

      {/* Título da página mobile - Limpo e focado */}
      {isMobile && (
        <div className="mt-6">
          <div className="px-4">
            <h1 className="hidden sm:block text-xl font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== FILTER COMPONENTS ====================

interface FilterDropdownProps {
  label?: string
  options?: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function E4CEOFilterDropdown({
  label = "Filtro",
  options = [],
  value = '',
  onChange = () => { },
  className = ''
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl
          hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-lg
        "
      >
        <Filter className="h-4 w-4" />
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="
            absolute top-full mt-1 left-0 w-48 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50
          ">
            <div className="p-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${value === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ==================== CARD COMPONENTS ====================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  value?: string | number
  change?: {
    value: string
    type: 'positive' | 'negative' | 'neutral'
  }
  size?: 'none' | 'small' | 'medium' | 'large'
}

export function E4CEOCard({
  title,
  value,
  change,
  size = 'medium',
  className = '',
  children,
  ...props
}: CardProps) {
  const sizeClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  return (
    <div
      className={`
        bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10
        ${sizeClasses[size]}
        hover:shadow-3xl transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="text-gray-600 mb-2 font-medium">
          {title}
        </div>
      )}

      {value && (
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {value}
        </div>
      )}

      {change && (
        <div className={`
          flex items-center gap-1 text-sm font-medium
          ${change.type === 'positive' ? 'text-green-600' : ''}
          ${change.type === 'negative' ? 'text-red-600' : ''}
          ${change.type === 'neutral' ? 'text-gray-600' : ''}
        `}>
          <span>{change.value}</span>
        </div>
      )}

      {children}
    </div>
  )
}

// ==================== BUTTON COMPONENTS ====================

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'floating-ceo'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: ReactNode
  onClick?: () => void
}

export function E4CEOButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  onClick = () => { }
}: ButtonProps) {
  const baseClasses = "font-medium transition-all duration-200 flex items-center justify-center gap-2"

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    'floating-ceo': "bg-gradient-to-r from-primary to-primary/80 text-white shadow-2xl hover:shadow-3xl hover:scale-105 rounded-full"
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl"
  }

  if (variant === 'floating-ceo') {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// ==================== LAYOUT COMPONENTS ====================

interface DashboardLayoutProps {
  currentPage?: string
  onPageChange?: (page: string) => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  title?: string
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
  rightContent?: ReactNode
  children?: ReactNode
  // Mobile specific props
  onNotificationClick?: () => void
  onSettingsClick?: () => void
  hasNotifications?: boolean
  notificationCount?: number
  onSearchClick?: () => void
  // Navigation items
  navigationItems?: NavigationItem[]
}

export function E4CEODashboardLayout({
  currentPage = 'home',
  onPageChange = () => { },
  sidebarCollapsed = false,
  onToggleSidebar = () => { },
  title = "💰 MultiFins Dashboard",
  selectedPeriod,
  onPeriodChange,
  rightContent,
  children,
  onNotificationClick = () => { },
  onSettingsClick = () => { },
  hasNotifications = false,
  notificationCount = 0,
  onSearchClick = () => { },
  navigationItems
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Desktop Layout */}
      <div className="hidden md:block h-screen">
        <E4CEOHeader
          title={title}
          rightContent={rightContent}
          onSearchClick={onSearchClick}
          className={`
            transition-all duration-300 ease-out
            ${sidebarCollapsed ? 'right-32' : 'right-80'}
          `}
        />

        <main className={`
          h-screen overflow-auto pt-24 p-6
          transition-all duration-300 ease-out
          ${sidebarCollapsed ? 'pr-36' : 'pr-80'}
        `}>
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Desktop FAB - Posicionado na parte inferior esquerda */}
        <button
          className="hidden md:flex fixed left-8 bottom-8 w-16 h-16 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 items-center justify-center group hover:scale-105 z-50"
          title="Adicionar Transação"
        >
          <span className="text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-200">+</span>

          {/* Anel de borda branca para destacar */}
          <div className="absolute inset-0 rounded-full border-4 border-white/95"></div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-lg group-hover:bg-emerald-400/40 transition-all duration-300"></div>
        </button>

        <E4CEOSidebar
          collapsed={sidebarCollapsed}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onToggleCollapse={onToggleSidebar}
          navigationItems={navigationItems}
        />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen pb-28">
        <E4CEOHeader
          title={title}
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          showPeriodFilter={true}
          className="left-4 right-4 top-4"
          onNotificationClick={onNotificationClick}
          onSettingsClick={onSettingsClick}
          hasNotifications={hasNotifications}
          notificationCount={notificationCount}
          onSearchClick={onSearchClick}
        />

        <main className="p-4 pt-24">
          {children}
        </main>

        <E4CEOMobileTabBar
          currentPage={currentPage}
          onPageChange={onPageChange}
          tabItems={navigationItems}
        />
      </div>


    </div>
  )
}