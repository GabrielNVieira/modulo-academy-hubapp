/**
 * Mobile Period Filter Optimized - Filtro de período ultramoderno para mobile
 * UX/UI Mobile-First com gestos nativos, microinterações e design system E4CEO
 */

import { useState, useRef, useEffect } from 'react'
import { CustomPeriodModal } from './CustomPeriodModal'
import { Filter, ChevronDown, Calendar, Clock, TrendingUp, X } from 'lucide-react'
import { useMobile } from './ui/use-mobile'
import { motion, AnimatePresence } from 'motion/react'

export type PeriodType = 'semanal' | 'mensal' | 'trimestral' | 'anual' | 'personalizado'

interface MobilePeriodFilterOptimizedProps {
  value: string
  onChange: (value: string) => void
  isLoading?: boolean
  className?: string
  showOnDesktop?: boolean
  compact?: boolean
  iconOnly?: boolean
  transactionCount?: number
}

export function MobilePeriodFilterOptimized({ 
  value, 
  onChange, 
  isLoading = false,
  className = '',
  showOnDesktop = false,
  compact = false,
  iconOnly = false,
  transactionCount = 0
}: MobilePeriodFilterOptimizedProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const isMobile = useMobile()

  // Só mostrar no mobile ou quando explicitamente habilitado para desktop
  if (!isMobile && !showOnDesktop) {
    return null
  }

  const periodOptions = [
    { 
      key: 'semanal', 
      label: '7d', 
      fullLabel: 'Últimos 7 dias',
      icon: Clock,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Visualização semanal'
    },
    { 
      key: 'mensal', 
      label: '30d', 
      fullLabel: 'Últimos 30 dias',
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      description: 'Visualização mensal'
    },
    { 
      key: 'trimestral', 
      label: '3m', 
      fullLabel: 'Últimos 3 meses',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Análise trimestral'
    },  
    { 
      key: 'anual', 
      label: '1a', 
      fullLabel: 'Último ano',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      description: 'Visão anual completa'
    }
  ]

  // Obter dados do período atual
  const getCurrentPeriod = () => {
    const current = periodOptions.find(option => option.key === value)
    return current || {
      key: value,
      label: value === 'personalizado' ? 'Custom' : '1a',
      fullLabel: value === 'personalizado' ? 'Período personalizado' : 'Último ano',
      icon: Filter,
      color: 'from-slate-500 to-slate-600',
      description: 'Período personalizado'
    }
  }

  const currentPeriod = getCurrentPeriod()

  // Fechar dropdown com gestos e cliques externos
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      
      // Prevent body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden'
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
        if (isMobile) {
          document.body.style.overflow = ''
        }
      }
    }
  }, [isDropdownOpen, isMobile])

  const handleValueChange = (newValue: string) => {
    if (newValue === 'personalizado') {
      setIsCustomModalOpen(true)
    } else {
      onChange(newValue)
      setSelectedPeriod(newValue)
    }
    setIsDropdownOpen(false)
  }

  const handleCustomPeriodApply = (startDate: string, endDate: string) => {
    onChange('personalizado')
    setSelectedPeriod('personalizado')
    setIsCustomModalOpen(false)
  }

  // Componente icon-only para header mobile ao lado das notificações
  if (iconOnly) {
    return (
      <>
        <div className={`relative ${className}`} ref={dropdownRef}>
          <button
            ref={triggerRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading}
            className={`
              w-10 h-10 bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 flex items-center justify-center group
              ${isDropdownOpen ? 'ring-1 ring-primary/20' : ''}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={`Filtro: ${currentPeriod.fullLabel}`}
          >
            <Filter className="h-4 w-4 text-slate-600 group-hover:text-slate-800" />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </button>

          {/* Icon-only Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full mt-1 right-0 z-50 min-w-[180px] bg-white/98 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl overflow-hidden"
              >
                {/* Header do filtro */}
                <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-600" />
                    <span className="font-semibold text-slate-900">Período</span>
                    {transactionCount > 0 && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                        {transactionCount}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-1.5">
                  {periodOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleValueChange(option.key)}
                        className={`
                          w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3
                          ${value === option.key
                            ? 'bg-[var(--color-multifins-blue)] text-white shadow-sm' 
                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                          }
                        `}
                      >
                        <IconComponent className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">{option.fullLabel}</div>
                          <div className={`text-xs ${
                            value === option.key ? 'text-white/80' : 'text-slate-500'
                          }`}>
                            {option.description}
                          </div>
                        </div>
                        {value === option.key && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </button>
                    )
                  })}
                  
                  <div className="my-1.5 border-t border-slate-100" />
                  
                  <button
                    onClick={() => handleValueChange('personalizado')}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3
                      ${value === 'personalizado'
                        ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      }
                    `}
                  >
                    <Filter className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">Período Personalizado</div>
                      <div className={`text-xs ${
                        value === 'personalizado' ? 'text-white/80' : 'text-slate-500'
                      }`}>
                        Escolha datas específicas
                      </div>
                    </div>
                    {value === 'personalizado' && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CustomPeriodModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onApply={handleCustomPeriodApply}
        />
      </>
    )
  }

  // Componente compact para header mobile
  if (compact) {
    return (
      <>
        <div className={`relative ${className}`} ref={dropdownRef}>
          <button
            ref={triggerRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200
              bg-white/90 backdrop-blur-md shadow-sm border border-white/30 text-slate-700
              hover:bg-white hover:shadow-md active:scale-95
              ${isDropdownOpen ? 'bg-white shadow-md ring-1 ring-primary/20' : ''}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={`Filtro: ${currentPeriod.fullLabel}`}
          >
            <currentPeriod.icon className="h-3 w-3" />
            <span>{currentPeriod.label}</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
            
            {isLoading && (
              <div className="h-2 w-2 border border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </button>

          {/* Compact Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full mt-1 right-0 z-50 min-w-[160px] bg-white/98 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="p-1.5">
                  {periodOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleValueChange(option.key)}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2
                          ${value === option.key
                            ? 'bg-[var(--color-multifins-blue)] text-white shadow-sm' 
                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                          }
                        `}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    )
                  })}
                  
                  <div className="my-1.5 border-t border-slate-100" />
                  
                  <button
                    onClick={() => handleValueChange('personalizado')}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2
                      ${value === 'personalizado'
                        ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      }
                    `}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span className="font-medium">Custom</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CustomPeriodModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onApply={handleCustomPeriodApply}
        />
      </>
    )
  }

  // Versão mobile full com bottom sheet
  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Botão removido conforme solicitado */}
      </div>

      {/* Custom Period Modal */}
      <CustomPeriodModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={handleCustomPeriodApply}
      />
    </>
  )
}