/**
 * MiniCardsGrid - Componente standalone de grid de mini-cards configuráveis
 *
 * Features:
 * - Grid 5x5 com drag and drop
 * - Resize via canto inferior direito
 * - Auto-reorganização de cards
 * - Cards de métricas customizáveis
 * - Preview em tempo real durante drag/resize
 *
 * Dependências:
 * - @dnd-kit/core
 * - @dnd-kit/sortable
 * - lucide-react
 * - Componentes UI do shadcn/ui (Card, Dialog, Button, Badge, ScrollArea)
 *
 * Uso:
 * import { MiniCardsGrid } from '@/components/MiniCardsGrid'
 * <MiniCardsGrid data={metricaData} />
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  LayoutGrid,
  Users,
  AlertTriangle,
  Clock,
  Target,
  Plus,
  X,
  GripVertical,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Activity,
  Percent,
  ListCollapse,
  Search,
  Eye,
  Pencil,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Type,
  Minus,
  Hash,
  FileText,
  Tag,
  MoreVertical,
  Trash2,
  MousePointer,
  Globe,
  Code,
  Database,
  Grid3X3,
  Table2,
  Play,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Recharts - Biblioteca de gráficos (todos os tipos disponíveis)
import {
  // Gráficos básicos
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell,
  // Gráficos avançados
  RadarChart as RechartsRadarChart,
  Radar as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart as RechartsRadialBarChart,
  RadialBar as RechartsRadialBar,
  ScatterChart as RechartsScatterChart,
  Scatter as RechartsScatter,
  ZAxis,
  ComposedChart as RechartsComposedChart,
  Treemap as RechartsTreemap,
  FunnelChart as RechartsFunnelChart,
  Funnel as RechartsFunnel,
  LabelList,
  // Componentes auxiliares
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend as RechartsLegend
} from 'recharts'

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, color, size } = props;
  return (
    <g>
      <defs>
        <linearGradient id={`treemapGrad-main-${name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color || '#3b82f6'} stopOpacity={1} />
          <stop offset="100%" stopColor={color || '#3b82f6'} stopOpacity={0.7} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#treemapGrad-main-${name})`} stroke="#fff" strokeWidth={3} rx={6} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={11} fontWeight="600">{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.8)" fontSize={9}>{size?.toLocaleString()}</text>
        </>
      )}
    </g>
  );
};

const CustomTreemapContent2 = (props: any) => {
  const { x, y, width, height, index: itemIndex, name, color, size, treemapColors } = props;
  const fillColor = color || (treemapColors && treemapColors[itemIndex]) || '#3b82f6';
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke="#fff"
        strokeWidth={3}
        rx={6}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
      />
      {width > 50 && height > 30 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={11}
            fontWeight="600"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.8)"
            fontSize={9}
          >
            {size?.toLocaleString()}
          </text>
        </>
      )}
    </g>
  );
};

// ============================================
// TIPOS E INTERFACES
// ============================================

// Tipos de componentes disponíveis no canvas
export type CanvasComponentType = 'title' | 'value' | 'description' | 'icon' | 'trend' | 'chart-bar' | 'chart-bar-h' | 'chart-line' | 'chart-area' | 'chart-pie' | 'chart-donut' | 'chart-gauge' | 'chart-heatmap' | 'table' | 'divider' | 'spacer' | 'progress' | 'badge' | 'recharts-bar' | 'recharts-line' | 'recharts-area' | 'recharts-pie' | 'recharts-radar' | 'recharts-radial' | 'recharts-scatter' | 'recharts-composed' | 'recharts-treemap' | 'recharts-funnel'

// ============================================
// DATA SOURCE - Sistema de conexão com banco de dados
// ============================================

export type DataSourceType = 'api' | 'sql' | 'static' | 'mock'

export interface DataSourceConfig {
  type: DataSourceType
  // Para API REST
  endpoint?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: Record<string, unknown>
  // Para SQL (via backend proxy)
  query?: string
  connection?: string // Nome da conexão configurada no backend
  // Mapeamento de campos
  mapping?: {
    labels?: string      // Campo para labels (eixo X)
    values?: string      // Campo para valores (eixo Y)
    series?: string      // Campo para séries (múltiplas linhas)
    columns?: string[]   // Campos para colunas da tabela
  }
  // Refresh
  refreshInterval?: number // em segundos (0 = manual)
  // Transformação de dados
  transform?: string // Função JS como string para transformar dados
}

export interface ChartDataPoint {
  label: string
  value: number
  series?: string
  color?: string
  [key: string]: unknown
}

export interface CanvasComponent {
  id: string
  type: CanvasComponentType
  x: number
  y: number
  width: number
  height: number
  props: Record<string, unknown>
  // Data Source para componentes de gráfico
  dataSource?: DataSourceConfig
}

export interface MetricaConfig {
  id: string
  titulo: string
  descricao: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  cor: string
  borderColor: string
  getValue: (data: MetricaData) => number | string
  categoria: string
  // Componentes do canvas para cards customizados
  canvasComponents?: CanvasComponent[]
  canvasConfig?: {
    gridCols: number
    gridRows: number
    colorScheme: string
  }
  renderCustom?: (data: MetricaData) => React.ReactNode
}

export interface MetricaData {
  // Adicione aqui os dados que suas métricas precisam
  // Exemplo genérico:
  [key: string]: any
}

interface CardSizeConfig {
  cols: number
  rows: number
}

export interface MetricaAtiva {
  id: string
  size: string // Formato: "colsxrows" - ex: "1x1", "2x1", "3x2"
  row: number  // Posição no grid (0-4)
  col: number  // Posição no grid (0-4)
}

interface ResizeInfo {
  id: string
  row: number
  col: number
  cols: number
  rows: number
}

// ============================================
// HOOK useDataSource - Fetch dinâmico de dados
// ============================================

interface UseDataSourceResult {
  data: ChartDataPoint[] | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useDataSource(config: DataSourceConfig | undefined): UseDataSourceResult {
  const [data, setData] = useState<ChartDataPoint[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    if (!config || config.type === 'static') {
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (config.type === 'api' && config.endpoint) {
        const response = await fetch(config.endpoint, {
          method: config.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          },
          ...(config.method === 'POST' && config.body && { body: JSON.stringify(config.body) })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const rawData = await response.json()

        // Aplicar mapeamento de campos
        const mappedData = transformApiData(rawData, config.mapping)
        setData(mappedData)
      } else if (config.type === 'sql' && config.query) {
        // Para SQL, fazer requisição para um endpoint backend que executa a query
        const response = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            connection: config.connection || 'default',
            query: config.query
          })
        })

        if (!response.ok) {
          throw new Error(`SQL Error: ${response.statusText}`)
        }

        const rawData = await response.json()
        const mappedData = transformApiData(rawData, config.mapping)
        setData(mappedData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [config])

  // Fetch inicial e setup de refresh interval
  useEffect(() => {
    fetchData()

    // Limpar interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Configurar novo interval se necessário
    if (config?.refreshInterval && config.refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, config.refreshInterval * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [config, fetchData])

  return { data, loading, error, refresh: fetchData }
}

// Função auxiliar para transformar dados da API/SQL para o formato de gráficos
function transformApiData(
  rawData: unknown,
  mapping?: DataSourceConfig['mapping']
): ChartDataPoint[] {
  // Se rawData já for um array
  if (Array.isArray(rawData)) {
    return rawData.map((item, index) => ({
      label: mapping?.labels ? String(item[mapping.labels]) : `Item ${index + 1}`,
      value: mapping?.values ? Number(item[mapping.values]) || 0 : Number(item.value) || 0,
      ...item
    }))
  }

  // Se rawData tiver uma propriedade data que é array
  if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as { data: unknown[] }).data)) {
    return transformApiData((rawData as { data: unknown[] }).data, mapping)
  }

  // Se rawData tiver uma propriedade rows (comum em queries SQL)
  if (rawData && typeof rawData === 'object' && 'rows' in rawData && Array.isArray((rawData as { rows: unknown[] }).rows)) {
    return transformApiData((rawData as { rows: unknown[] }).rows, mapping)
  }

  return []
}

// ============================================
// MOCK DATASETS - Dados de exemplo para desenvolvimento
// ============================================

export interface MockDataset {
  id: string
  name: string
  description: string
  category: 'vendas' | 'usuarios' | 'metricas' | 'temporal' | 'categorias'
  data: ChartDataPoint[]
}

export const MOCK_DATASETS: MockDataset[] = [
  // === VENDAS ===
  {
    id: 'vendas-semana',
    name: 'Vendas por Dia da Semana',
    description: 'Total de vendas agrupado por dia',
    category: 'vendas',
    data: [
      { label: 'Seg', value: 1250 },
      { label: 'Ter', value: 1890 },
      { label: 'Qua', value: 1560 },
      { label: 'Qui', value: 2100 },
      { label: 'Sex', value: 2450 },
      { label: 'Sáb', value: 1820 },
      { label: 'Dom', value: 980 }
    ]
  },
  {
    id: 'vendas-mes',
    name: 'Vendas Mensais (12 meses)',
    description: 'Evolução de vendas no último ano',
    category: 'vendas',
    data: [
      { label: 'Jan', value: 45000 },
      { label: 'Fev', value: 52000 },
      { label: 'Mar', value: 48000 },
      { label: 'Abr', value: 61000 },
      { label: 'Mai', value: 55000 },
      { label: 'Jun', value: 67000 },
      { label: 'Jul', value: 72000 },
      { label: 'Ago', value: 69000 },
      { label: 'Set', value: 78000 },
      { label: 'Out', value: 82000 },
      { label: 'Nov', value: 91000 },
      { label: 'Dez', value: 105000 }
    ]
  },
  {
    id: 'vendas-produto',
    name: 'Vendas por Produto',
    description: 'Top 5 produtos mais vendidos',
    category: 'vendas',
    data: [
      { label: 'Produto A', value: 3420 },
      { label: 'Produto B', value: 2890 },
      { label: 'Produto C', value: 2150 },
      { label: 'Produto D', value: 1870 },
      { label: 'Produto E', value: 1230 }
    ]
  },
  // === USUÁRIOS ===
  {
    id: 'usuarios-novos',
    name: 'Novos Usuários por Mês',
    description: 'Cadastros mensais',
    category: 'usuarios',
    data: [
      { label: 'Jan', value: 120 },
      { label: 'Fev', value: 145 },
      { label: 'Mar', value: 132 },
      { label: 'Abr', value: 178 },
      { label: 'Mai', value: 165 },
      { label: 'Jun', value: 198 }
    ]
  },
  {
    id: 'usuarios-ativos',
    name: 'Usuários Ativos por Dia',
    description: 'DAU da última semana',
    category: 'usuarios',
    data: [
      { label: 'Seg', value: 1850 },
      { label: 'Ter', value: 2100 },
      { label: 'Qua', value: 1980 },
      { label: 'Qui', value: 2250 },
      { label: 'Sex', value: 2400 },
      { label: 'Sáb', value: 1200 },
      { label: 'Dom', value: 890 }
    ]
  },
  {
    id: 'usuarios-plano',
    name: 'Usuários por Plano',
    description: 'Distribuição por tipo de assinatura',
    category: 'usuarios',
    data: [
      { label: 'Free', value: 4500 },
      { label: 'Basic', value: 2100 },
      { label: 'Pro', value: 890 },
      { label: 'Enterprise', value: 120 }
    ]
  },
  // === MÉTRICAS ===
  {
    id: 'metricas-conversao',
    name: 'Taxa de Conversão',
    description: 'Funil de conversão',
    category: 'metricas',
    data: [
      { label: 'Visitantes', value: 10000 },
      { label: 'Leads', value: 2500 },
      { label: 'Qualificados', value: 800 },
      { label: 'Oportunidades', value: 320 },
      { label: 'Clientes', value: 128 }
    ]
  },
  {
    id: 'metricas-nps',
    name: 'NPS por Mês',
    description: 'Evolução do Net Promoter Score',
    category: 'metricas',
    data: [
      { label: 'Jan', value: 45 },
      { label: 'Fev', value: 52 },
      { label: 'Mar', value: 48 },
      { label: 'Abr', value: 58 },
      { label: 'Mai', value: 62 },
      { label: 'Jun', value: 67 }
    ]
  },
  {
    id: 'metricas-satisfacao',
    name: 'Satisfação do Cliente',
    description: 'Distribuição de avaliações',
    category: 'metricas',
    data: [
      { label: '1 estrela', value: 45 },
      { label: '2 estrelas', value: 89 },
      { label: '3 estrelas', value: 234 },
      { label: '4 estrelas', value: 567 },
      { label: '5 estrelas', value: 890 }
    ]
  },
  // === TEMPORAL ===
  {
    id: 'temporal-hora',
    name: 'Acessos por Hora',
    description: 'Distribuição horária de acessos',
    category: 'temporal',
    data: Array.from({ length: 24 }, (_, i) => ({
      label: `${i}h`,
      value: Math.floor(Math.random() * 500 + (i >= 9 && i <= 18 ? 800 : 200))
    }))
  },
  {
    id: 'temporal-trimestre',
    name: 'Receita por Trimestre',
    description: 'Receita dos últimos 4 trimestres',
    category: 'temporal',
    data: [
      { label: 'Q1 2024', value: 125000 },
      { label: 'Q2 2024', value: 148000 },
      { label: 'Q3 2024', value: 172000 },
      { label: 'Q4 2024', value: 198000 }
    ]
  },
  // === CATEGORIAS ===
  {
    id: 'categorias-ticket',
    name: 'Tickets por Categoria',
    description: 'Distribuição de tickets de suporte',
    category: 'categorias',
    data: [
      { label: 'Bug', value: 234 },
      { label: 'Feature', value: 156 },
      { label: 'Dúvida', value: 445 },
      { label: 'Integração', value: 89 },
      { label: 'Outros', value: 67 }
    ]
  },
  {
    id: 'categorias-despesas',
    name: 'Despesas por Categoria',
    description: 'Distribuição de gastos mensais',
    category: 'categorias',
    data: [
      { label: 'Pessoal', value: 45000 },
      { label: 'Infraestrutura', value: 12000 },
      { label: 'Marketing', value: 8500 },
      { label: 'Software', value: 5200 },
      { label: 'Outros', value: 3800 }
    ]
  }
]

// Função para buscar dataset mockado por ID
export function getMockDataset(id: string): MockDataset | undefined {
  return MOCK_DATASETS.find(d => d.id === id)
}

// Função para listar datasets por categoria
export function getMockDatasetsByCategory(category: MockDataset['category']): MockDataset[] {
  return MOCK_DATASETS.filter(d => d.category === category)
}

// ============================================
// CONSTANTES
// ============================================

const GRID_COLS = 5
const MAX_GRID_ROWS = 5

// ============================================
// MÉTRICAS DISPONÍVEIS (personalize conforme necessário)
// ============================================

export const METRICAS_DISPONIVEIS: MetricaConfig[] = [
  {
    id: 'total-regras',
    titulo: 'Total de Regras',
    descricao: 'Regras cadastradas',
    icon: LayoutGrid,
    cor: 'text-slate-700',
    borderColor: 'border-slate-200',
    getValue: (data) => data.totalRegras ?? 0,
    categoria: 'filas'
  },
  {
    id: 'regras-ativas',
    titulo: 'Regras Ativas',
    descricao: 'Recebendo ocorrências',
    icon: ListCollapse,
    cor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    getValue: (data) => data.regrasAtivas ?? 0,
    categoria: 'filas'
  },
  {
    id: 'casos-pendentes',
    titulo: 'Casos Pendentes',
    descricao: 'No pipeline',
    icon: Target,
    cor: 'text-amber-600',
    borderColor: 'border-amber-100',
    getValue: (data) => data.casosPendentes ?? 0,
    categoria: 'filas'
  },
  {
    id: 'prioridade-critica',
    titulo: 'Prioridade Crítica',
    descricao: 'Necessitam reforço',
    icon: AlertTriangle,
    cor: 'text-rose-600',
    borderColor: 'border-rose-100',
    getValue: (data) => data.prioridadeCritica ?? 0,
    categoria: 'filas'
  },
  {
    id: 'investigadores',
    titulo: 'Investigadores',
    descricao: 'Disponíveis',
    icon: Users,
    cor: 'text-sky-600',
    borderColor: 'border-sky-100',
    getValue: (data) => data.investigadores ?? 0,
    categoria: 'investigadores'
  },
  {
    id: 'taxa-resolucao',
    titulo: 'Taxa de Resolução',
    descricao: 'Casos resolvidos',
    icon: CheckCircle,
    cor: 'text-green-600',
    borderColor: 'border-green-100',
    getValue: (data) => data.taxaResolucao ?? '0%',
    categoria: 'performance'
  },
  {
    id: 'sla-medio',
    titulo: 'SLA Médio',
    descricao: 'Tempo de resposta',
    icon: Clock,
    cor: 'text-indigo-600',
    borderColor: 'border-indigo-100',
    getValue: (data) => data.slaMedio ?? '0h',
    categoria: 'performance'
  },
  {
    id: 'valor-pendente',
    titulo: 'Valor Pendente',
    descricao: 'Em investigação',
    icon: DollarSign,
    cor: 'text-purple-600',
    borderColor: 'border-purple-100',
    getValue: (data) => data.valorPendente ?? 'R$ 0',
    categoria: 'financeiro'
  },
  {
    id: 'casos-confirmados',
    titulo: 'Casos Confirmados',
    descricao: 'Furtos confirmados',
    icon: XCircle,
    cor: 'text-red-600',
    borderColor: 'border-red-100',
    getValue: (data) => data.casosConfirmados ?? 0,
    categoria: 'performance'
  },
  {
    id: 'eficiencia',
    titulo: 'Eficiência',
    descricao: 'Performance geral',
    icon: Activity,
    cor: 'text-cyan-600',
    borderColor: 'border-cyan-100',
    getValue: (data) => data.eficiencia ?? '0%',
    categoria: 'performance'
  },
  {
    id: 'reincidencia',
    titulo: 'Taxa Reincidência',
    descricao: 'Clientes repetidos',
    icon: Percent,
    cor: 'text-orange-600',
    borderColor: 'border-orange-100',
    getValue: (data) => data.reincidencia ?? '0%',
    categoria: 'performance'
  },
  {
    id: 'tendencia',
    titulo: 'Tendência',
    descricao: 'vs. período anterior',
    icon: TrendingUp,
    cor: 'text-teal-600',
    borderColor: 'border-teal-100',
    getValue: (data) => data.tendencia ?? '+0%',
    categoria: 'performance'
  }
]

// Cards padrão iniciais
const DEFAULT_METRICS: MetricaAtiva[] = [
  { id: 'total-regras', size: '1x1', row: 0, col: 0 },
  { id: 'regras-ativas', size: '1x1', row: 0, col: 1 },
  { id: 'casos-pendentes', size: '1x1', row: 0, col: 2 },
  { id: 'prioridade-critica', size: '1x1', row: 0, col: 3 },
  { id: 'investigadores', size: '1x1', row: 0, col: 4 }
]

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function parseCardSize(size: string): CardSizeConfig {
  const [cols, rows] = size.split('x').map(Number)
  return { cols: cols || 1, rows: rows || 1 }
}

function createCardSize(cols: number, rows: number): string {
  return `${cols}x${rows}`
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface MiniCardsGridProps {
  /** Dados para as métricas */
  data: MetricaData
  /** Métricas iniciais (opcional) */
  initialMetrics?: MetricaAtiva[]
  /** Métricas disponíveis para seleção (opcional) */
  availableMetrics?: MetricaConfig[]
  /** Callback quando métricas mudam */
  onMetricsChange?: (metrics: MetricaAtiva[]) => void
  /** Callback quando o painel de cards abre/fecha */
  onPanelToggle?: (isOpen: boolean) => void
  /** Classe CSS adicional */
  className?: string
  /** Variante do grid: 'card' (com fundo card) ou 'flat' (sem fundo, direto na tela) */
  variant?: 'card' | 'flat'
}

export function MiniCardsGrid({
  data,
  initialMetrics = DEFAULT_METRICS,
  availableMetrics = METRICAS_DISPONIVEIS,
  onMetricsChange,
  onPanelToggle,
  className = '',
  variant = 'card'
}: MiniCardsGridProps) {
  // Estados principais
  const [metricasAtivas, setMetricasAtivas] = useState<MetricaAtiva[]>(initialMetrics)
  const [showMetricasModal, setShowMetricasModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados de drag
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDragSize, setActiveDragSize] = useState<{ width: number; height: number } | null>(null)
  const [activeDragOffset, setActiveDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ row: number; col: number } | null>(null)
  const [previewMetricas, setPreviewMetricas] = useState<MetricaAtiva[] | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
  const [gridDimensions, setGridDimensions] = useState<{ cellWidth: number; cellHeight: number; gap: number } | null>(null)

  // Estado para drag de novo card do painel (id do card sendo arrastado do painel)
  const [panelDragId, setPanelDragId] = useState<string | null>(null)

  // Estados de resize
  const [resizingInfo, setResizingInfo] = useState<ResizeInfo | null>(null)
  const [resizePreviewMetricas, setResizePreviewMetricas] = useState<MetricaAtiva[] | null>(null)

  // Estados para preview e edição de cards
  const [previewCardId, setPreviewCardId] = useState<string | null>(null)
  const [editCardId, setEditCardId] = useState<string | null>(null)
  const [isCreatingNewCard, setIsCreatingNewCard] = useState(false)

  const [customCards, setCustomCards] = useState<MetricaConfig[]>([])

  // Combinar métricas disponíveis com cards personalizados
  const allMetrics = [...availableMetrics, ...customCards]

  const gridRef = useRef<HTMLDivElement>(null)

  // Notificar mudanças
  useEffect(() => {
    onMetricsChange?.(metricasAtivas)
  }, [metricasAtivas, onMetricsChange])

  // Notificar quando painel abre/fecha e limpar pesquisa ao fechar
  useEffect(() => {
    onPanelToggle?.(showMetricasModal)
    if (!showMetricasModal) {
      setSearchTerm('')
    }
  }, [showMetricasModal, onPanelToggle])

  // Rastrear posição do cursor durante drag
  useEffect(() => {
    if (!activeId) return

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setCursorPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [activeId])

  // Medir dimensões do grid
  useEffect(() => {
    const measureGrid = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.clientWidth
        if (gridWidth > 0) {
          const gap = 12
          const cellWidth = (gridWidth - (GRID_COLS - 1) * gap) / GRID_COLS
          setGridDimensions({ cellWidth, cellHeight: 100, gap })
        }
      }
    }

    let resizeObserver: ResizeObserver | null = null
    if (gridRef.current) {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(measureGrid)
      })
      resizeObserver.observe(gridRef.current)
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(measureGrid)
    })

    return () => {
      resizeObserver?.disconnect()
    }
  }, [metricasAtivas.length])

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Verificar se uma célula está ocupada
  const isCellOccupied = useCallback((row: number, col: number, metricas: MetricaAtiva[], excludeId?: string) => {
    return metricas.some(m => {
      if (excludeId && m.id === excludeId) return false
      const { cols: mCols, rows: mRows } = parseCardSize(m.size)
      return (
        row >= m.row && row < m.row + mRows &&
        col >= m.col && col < m.col + mCols
      )
    })
  }, [])

  // Verificar se um card cabe em uma posição
  const canPlaceCard = useCallback((row: number, col: number, cardSize: string, metricas: MetricaAtiva[], excludeId?: string): boolean => {
    const { cols: cardCols, rows: cardRows } = parseCardSize(cardSize)

    if (row < 0 || col < 0 || col + cardCols > GRID_COLS || row + cardRows > MAX_GRID_ROWS) {
      return false
    }

    for (let r = 0; r < cardRows; r++) {
      for (let c = 0; c < cardCols; c++) {
        if (isCellOccupied(row + r, col + c, metricas, excludeId)) {
          return false
        }
      }
    }
    return true
  }, [isCellOccupied])

  // Encontrar primeira posição disponível
  const findFirstAvailablePosition = useCallback((metricas: MetricaAtiva[], cardSize: string = '1x1'): { row: number; col: number } | null => {
    const { cols: cardCols, rows: cardRows } = parseCardSize(cardSize)

    for (let row = 0; row <= MAX_GRID_ROWS - cardRows; row++) {
      for (let col = 0; col <= GRID_COLS - cardCols; col++) {
        let canPlace = true
        for (let r = 0; r < cardRows && canPlace; r++) {
          for (let c = 0; c < cardCols && canPlace; c++) {
            if (isCellOccupied(row + r, col + c, metricas)) {
              canPlace = false
            }
          }
        }
        if (canPlace) return { row, col }
      }
    }
    return null
  }, [isCellOccupied])

  // Encontrar próxima posição disponível
  const findNextAvailablePosition = useCallback((
    metricas: MetricaAtiva[],
    cardSize: string = '1x1',
    excludeId?: string
  ): { row: number; col: number } | null => {
    const { cols: cardCols, rows: cardRows } = parseCardSize(cardSize)

    for (let row = 0; row < MAX_GRID_ROWS; row++) {
      for (let col = 0; col <= GRID_COLS - cardCols; col++) {
        let canPlace = true
        for (let r = 0; r < cardRows && canPlace; r++) {
          for (let c = 0; c < cardCols && canPlace; c++) {
            if (isCellOccupied(row + r, col + c, metricas, excludeId)) {
              canPlace = false
            }
          }
        }
        if (canPlace) return { row, col }
      }
    }
    return null
  }, [isCellOccupied])

  // Handler para drag start
  const handleDragStart = (event: DragStartEvent) => {
    const rawId = event.active.id as string

    // Verificar se é um card do painel (tem prefixo "panel-")
    const isFromPanel = rawId.startsWith('panel-')
    const id = isFromPanel ? rawId.replace('panel-', '') : rawId

    setActiveId(id)

    if (isFromPanel) {
      // Card do painel - apenas marcar que vem do painel, NÃO adicionar ainda
      setPanelDragId(id)

      // Tamanho padrão para card 1x1
      const defaultSize = gridDimensions
        ? { width: gridDimensions.cellWidth, height: gridDimensions.cellHeight }
        : { width: 150, height: 100 }
      setActiveDragSize(defaultSize)

      const activatorEvent = event.activatorEvent as MouseEvent | TouchEvent
      let clientX = 0
      let clientY = 0

      if (activatorEvent instanceof MouseEvent) {
        clientX = activatorEvent.clientX
        clientY = activatorEvent.clientY
      } else if (activatorEvent instanceof TouchEvent && activatorEvent.touches.length > 0) {
        clientX = activatorEvent.touches[0].clientX
        clientY = activatorEvent.touches[0].clientY
      }

      setActiveDragOffset({ x: defaultSize.width / 2, y: defaultSize.height / 2 })
      setCursorPosition({ x: clientX, y: clientY })
    } else {
      // Card existente no grid
      const element = document.querySelector(`[data-metric-id="${id}"]`)
      if (element) {
        const rect = element.getBoundingClientRect()
        setActiveDragSize({ width: rect.width, height: rect.height })

        const activatorEvent = event.activatorEvent as MouseEvent | TouchEvent
        let clientX = 0
        let clientY = 0

        if (activatorEvent instanceof MouseEvent) {
          clientX = activatorEvent.clientX
          clientY = activatorEvent.clientY
        } else if (activatorEvent instanceof TouchEvent && activatorEvent.touches.length > 0) {
          clientX = activatorEvent.touches[0].clientX
          clientY = activatorEvent.touches[0].clientY
        }

        const offsetX = clientX - rect.left
        const offsetY = clientY - rect.top

        setActiveDragOffset({ x: offsetX, y: offsetY })
        setCursorPosition({ x: clientX, y: clientY })
      }
    }
  }

  // Handler para drag move
  const handleDragMove = (_event: DragMoveEvent) => {
    if (!gridRef.current || !activeId || !cursorPosition) return

    const gridRect = gridRef.current.getBoundingClientRect()
    const gap = 12
    const cellWidth = (gridRect.width - (GRID_COLS - 1) * gap) / GRID_COLS
    const cellHeight = 100

    const relativeX = cursorPosition.x - gridRect.left
    const relativeY = cursorPosition.y - gridRect.top

    const col = Math.floor(relativeX / (cellWidth + gap))
    const row = Math.floor(relativeY / (cellHeight + gap))

    if (row >= 0 && row < MAX_GRID_ROWS && col >= 0 && col < GRID_COLS) {
      setDragOverCell({ row, col })

      // Buscar métrica no grid, ou criar uma temporária se for do painel
      let metrica = metricasAtivas.find(m => m.id === activeId)

      // Se é do painel e ainda não está em metricasAtivas, usar tamanho padrão
      if (!metrica && panelDragId === activeId) {
        metrica = { id: activeId, size: '1x1', row: -1, col: -1 }
      }

      if (metrica) {
        const { cols: cardCols, rows: cardRows } = parseCardSize(metrica.size)

        if (col + cardCols <= GRID_COLS && row + cardRows <= MAX_GRID_ROWS) {
          // Se é do painel e não está em metricasAtivas, criar o preview incluindo o card
          const cardExistsInGrid = metricasAtivas.some(m => m.id === activeId)
          let preview: MetricaAtiva[]

          if (cardExistsInGrid) {
            preview = metricasAtivas.map(m =>
              m.id === activeId
                ? { ...m, row, col }
                : { ...m }
            )
          } else {
            // Card do painel - adicionar ao preview
            preview = [
              ...metricasAtivas.map(m => ({ ...m })),
              { id: activeId, size: '1x1', row, col }
            ]
          }

          // Encontrar cards sobrepostos (usando metricasAtivas originais, não preview)
          const overlappingCards: string[] = []
          for (let r = 0; r < cardRows; r++) {
            for (let c = 0; c < cardCols; c++) {
              const cellRow = row + r
              const cellCol = col + c

              for (const m of metricasAtivas) {
                if (m.id === activeId) continue
                const { cols: mCols, rows: mRows } = parseCardSize(m.size)
                if (
                  cellRow >= m.row && cellRow < m.row + mRows &&
                  cellCol >= m.col && cellCol < m.col + mCols
                ) {
                  if (!overlappingCards.includes(m.id)) {
                    overlappingCards.push(m.id)
                  }
                }
              }
            }
          }

          for (const cardId of overlappingCards) {
            const cardToMove = preview.find(m => m.id === cardId)
            if (!cardToMove) continue

            const metricasSemCard = preview.filter(m => m.id !== cardId)
            const newPosition = findNextAvailablePosition(metricasSemCard, cardToMove.size)

            if (newPosition) {
              preview = preview.map(m =>
                m.id === cardId ? { ...m, row: newPosition.row, col: newPosition.col } : m
              )
            }
          }

          setPreviewMetricas(preview)
        } else {
          setPreviewMetricas(null)
        }
      }
    } else {
      setDragOverCell(null)
      setPreviewMetricas(null)
    }
  }

  // Handler para drag end
  const handleDragEnd = (_event: DragEndEvent) => {
    if (previewMetricas && activeId) {
      // Verificar se o card foi solto em posição válida
      const droppedCard = previewMetricas.find(m => m.id === activeId)
      if (droppedCard && droppedCard.row >= 0 && droppedCard.col >= 0) {
        // Posição válida - aplicar preview (funciona tanto para cards existentes quanto do painel)
        setMetricasAtivas(previewMetricas)
      }
      // Se não tem posição válida, não faz nada - o card do painel simplesmente não é adicionado
    }

    setActiveId(null)
    setActiveDragSize(null)
    setActiveDragOffset(null)
    setDragOverCell(null)
    setPreviewMetricas(null)
    setCursorPosition(null)
    setPanelDragId(null)
  }

  // Adicionar nova métrica
  const handleAddMetrica = (metricaId: string, targetRow?: number, targetCol?: number) => {
    if (!metricasAtivas.find(m => m.id === metricaId)) {
      // Se posição específica foi fornecida, usar ela
      if (targetRow !== undefined && targetCol !== undefined) {
        // Verificar se cabe na posição
        if (canPlaceCard(targetRow, targetCol, '1x1', metricasAtivas)) {
          setMetricasAtivas(prev => [...prev, {
            id: metricaId,
            size: '1x1',
            row: targetRow,
            col: targetCol
          }])
        } else {
          // Se não cabe, encontrar posição mais próxima
          const position = findFirstAvailablePosition(metricasAtivas)
          if (position) {
            setMetricasAtivas(prev => [...prev, {
              id: metricaId,
              size: '1x1',
              row: position.row,
              col: position.col
            }])
          }
        }
      } else {
        const position = findFirstAvailablePosition(metricasAtivas)
        if (position) {
          setMetricasAtivas(prev => [...prev, {
            id: metricaId,
            size: '1x1',
            row: position.row,
            col: position.col
          }])
        }
      }
    }
  }

  // Remover métrica
  const handleRemoveMetrica = (metricaId: string) => {
    setMetricasAtivas(prev => prev.filter(m => m.id !== metricaId))
  }

  // Remover todas as métricas
  const handleClearAllMetricas = () => {
    setMetricasAtivas([])
  }

  // Otimizar grid
  const handleOptimizeGrid = () => {
    const sortedMetricas = [...metricasAtivas].sort((a, b) => {
      const areaA = parseCardSize(a.size).cols * parseCardSize(a.size).rows
      const areaB = parseCardSize(b.size).cols * parseCardSize(b.size).rows
      return areaB - areaA
    })

    const optimizedMetricas: MetricaAtiva[] = []

    for (const metrica of sortedMetricas) {
      const { cols: cardCols, rows: cardRows } = parseCardSize(metrica.size)
      let placed = false

      for (let row = 0; row < MAX_GRID_ROWS && !placed; row++) {
        for (let col = 0; col <= GRID_COLS - cardCols && !placed; col++) {
          let canPlace = true

          for (let r = 0; r < cardRows && canPlace; r++) {
            for (let c = 0; c < cardCols && canPlace; c++) {
              for (const placed of optimizedMetricas) {
                const { cols: pCols, rows: pRows } = parseCardSize(placed.size)
                if (
                  row + r >= placed.row && row + r < placed.row + pRows &&
                  col + c >= placed.col && col + c < placed.col + pCols
                ) {
                  canPlace = false
                  break
                }
              }
            }
          }

          if (canPlace) {
            optimizedMetricas.push({
              ...metrica,
              row,
              col
            })
            placed = true
          }
        }
      }

      if (!placed) {
        optimizedMetricas.push(metrica)
      }
    }

    setMetricasAtivas(optimizedMetricas)
  }

  // Resize handler
  const handleResizeMetrica = (metricaId: string, newSize: string) => {
    if (resizePreviewMetricas) {
      setMetricasAtivas(resizePreviewMetricas)
      return
    }

    const metrica = metricasAtivas.find(m => m.id === metricaId)
    if (!metrica) return

    const { cols: newCols, rows: newRows } = parseCardSize(newSize)

    if (metrica.col + newCols > GRID_COLS) return
    if (metrica.row + newRows > MAX_GRID_ROWS) return

    let updatedMetricas = metricasAtivas.map(m =>
      m.id === metricaId ? { ...m, size: newSize } : { ...m }
    )

    const overlappingCards: string[] = []
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const cellRow = metrica.row + r
        const cellCol = metrica.col + c

        for (const m of updatedMetricas) {
          if (m.id === metricaId) continue
          const { cols: mCols, rows: mRows } = parseCardSize(m.size)
          if (
            cellRow >= m.row && cellRow < m.row + mRows &&
            cellCol >= m.col && cellCol < m.col + mCols
          ) {
            if (!overlappingCards.includes(m.id)) {
              overlappingCards.push(m.id)
            }
          }
        }
      }
    }

    const tempMetricas = [...updatedMetricas]
    let canResize = true

    for (const cardId of overlappingCards) {
      const cardToMove = tempMetricas.find(m => m.id === cardId)
      if (!cardToMove) continue

      const metricasSemCard = tempMetricas.filter(m => m.id !== cardId)
      const newPosition = findNextAvailablePosition(metricasSemCard, cardToMove.size)

      if (newPosition) {
        const idx = tempMetricas.findIndex(m => m.id === cardId)
        if (idx !== -1) {
          tempMetricas[idx] = { ...tempMetricas[idx], row: newPosition.row, col: newPosition.col }
        }
      } else {
        canResize = false
        break
      }
    }

    if (canResize) {
      setMetricasAtivas(tempMetricas)
    }
  }

  // Calcular preview de resize
  const calculateResizePreview = useCallback((info: ResizeInfo | null) => {
    setResizingInfo(info)

    if (!info) {
      setResizePreviewMetricas(null)
      return
    }

    const { id: metricaId, cols: newCols, rows: newRows } = info
    const metrica = metricasAtivas.find(m => m.id === metricaId)
    if (!metrica) return

    if (metrica.col + newCols > GRID_COLS || metrica.row + newRows > MAX_GRID_ROWS) {
      setResizePreviewMetricas(null)
      return
    }

    const newSize = createCardSize(newCols, newRows)

    let previewMetricasTemp = metricasAtivas.map(m =>
      m.id === metricaId ? { ...m, size: newSize } : { ...m }
    )

    const overlappingCards: string[] = []
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const cellRow = metrica.row + r
        const cellCol = metrica.col + c

        for (const m of previewMetricasTemp) {
          if (m.id === metricaId) continue
          const { cols: mCols, rows: mRows } = parseCardSize(m.size)
          if (
            cellRow >= m.row && cellRow < m.row + mRows &&
            cellCol >= m.col && cellCol < m.col + mCols
          ) {
            if (!overlappingCards.includes(m.id)) {
              overlappingCards.push(m.id)
            }
          }
        }
      }
    }

    let canResize = true
    for (const cardId of overlappingCards) {
      const cardToMove = previewMetricasTemp.find(m => m.id === cardId)
      if (!cardToMove) continue

      const metricasSemCard = previewMetricasTemp.filter(m => m.id !== cardId)
      const newPosition = findNextAvailablePosition(metricasSemCard, cardToMove.size)

      if (newPosition) {
        const idx = previewMetricasTemp.findIndex(m => m.id === cardId)
        if (idx !== -1) {
          previewMetricasTemp[idx] = { ...previewMetricasTemp[idx], row: newPosition.row, col: newPosition.col }
        }
      } else {
        canResize = false
        break
      }
    }

    if (canResize) {
      setResizePreviewMetricas(previewMetricasTemp)
    } else {
      setResizePreviewMetricas(null)
    }
  }, [metricasAtivas, findNextAvailablePosition])

  // Layout atual exibido
  const layoutMetricas = resizePreviewMetricas ?? previewMetricas ?? metricasAtivas

  // Calcular linhas necessárias
  const currentGridRows = useMemo(() => {
    let maxRow = 0

    for (const m of layoutMetricas) {
      const { rows } = parseCardSize(m.size)
      const bottomRow = m.row + rows
      if (bottomRow > maxRow) maxRow = bottomRow
    }

    if (resizingInfo) {
      const bottomRow = resizingInfo.row + resizingInfo.rows
      if (bottomRow > maxRow) maxRow = bottomRow
    }

    return Math.min(MAX_GRID_ROWS, Math.max(1, maxRow))
  }, [layoutMetricas, resizingInfo])

  // Wrapper condicional baseado na variante
  const Wrapper = variant === 'card' ? Card : 'div'
  const ContentWrapper = variant === 'card' ? CardContent : 'div'
  const wrapperClassName = variant === 'card'
    ? `card-modern ${className}`
    : className
  const contentClassName = variant === 'card' ? 'pt-4' : ''

  return (
    <Wrapper className={wrapperClassName}>
      <ContentWrapper className={contentClassName}>
        {/* Header com botões de ação */}
        <div className="flex items-start justify-end gap-2 mb-3">
          {/* Botão de otimizar grid */}
          <button
            onClick={handleOptimizeGrid}
            className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-all duration-200 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Otimizar layout"
            disabled={metricasAtivas.length === 0}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          {/* Botão de adicionar */}
          <button
            onClick={() => setShowMetricasModal(true)}
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 shrink-0"
            title="Adicionar métrica"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          {/* Grid dinâmico */}
          <div
            ref={gridRef}
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${currentGridRows}, 100px)`,
              gap: '12px',
              transition: 'grid-template-rows 0.3s ease, min-height 0.3s ease',
              minHeight: `${currentGridRows * 100 + (currentGridRows - 1) * 12}px`
            }}
          >
            {/* Células de feedback durante drag */}
            {activeId && Array.from({ length: currentGridRows * GRID_COLS }).map((_, index) => {
              const row = Math.floor(index / GRID_COLS)
              const col = index % GRID_COLS
              const isDragOver = dragOverCell?.row === row && dragOverCell?.col === col
              const activeMetrica = metricasAtivas.find(m => m.id === activeId)

              if (!activeMetrica) return null

              const { cols: cardCols, rows: cardRows } = parseCardSize(activeMetrica.size)
              const fitsInGrid = col + cardCols <= GRID_COLS && row + cardRows <= MAX_GRID_ROWS
              const positionIsFree = canPlaceCard(row, col, activeMetrica.size, metricasAtivas, activeId)
              const willReorganize = fitsInGrid && !positionIsFree

              if (!isDragOver) return null

              let feedbackClass = ''
              if (!fitsInGrid) {
                feedbackClass = 'border-red-300 bg-red-50'
              } else if (willReorganize) {
                feedbackClass = 'border-amber-400 bg-amber-50'
              } else {
                feedbackClass = 'border-primary bg-primary/10'
              }

              return (
                <div
                  key={`cell-${row}-${col}`}
                  className={`rounded-xl border-2 border-dashed transition-all duration-200 ${feedbackClass}`}
                  style={{
                    gridRow: `${row + 1} / span ${cardRows}`,
                    gridColumn: `${col + 1} / span ${cardCols}`,
                    pointerEvents: 'none'
                  }}
                />
              )
            })}

            {/* Indicador de resize */}
            {resizingInfo && (
              <div
                className={`rounded-xl border-2 border-dashed transition-all duration-150 ${resizePreviewMetricas
                  ? 'border-primary bg-primary/10'
                  : 'border-slate-400 bg-slate-200/50'
                  }`}
                style={{
                  gridRow: `${resizingInfo.row + 1} / span ${resizingInfo.rows}`,
                  gridColumn: `${resizingInfo.col + 1} / span ${resizingInfo.cols}`,
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
            )}

            {/* Renderizar os cards */}
            {layoutMetricas.map((metricaAtiva) => {
              const metrica = allMetrics.find(m => m.id === metricaAtiva.id)
              if (!metrica) return null

              const isBeingResized = resizingInfo?.id === metrica.id
              const originalMetrica = metricasAtivas.find(m => m.id === metricaAtiva.id)
              const displayMetrica = isBeingResized && originalMetrica ? originalMetrica : metricaAtiva

              const sizeConfig = parseCardSize(displayMetrica.size)
              const isBeingDragged = activeId === metrica.id

              const isBeingRelocated = Boolean(
                (previewMetricas || resizePreviewMetricas) && originalMetrica &&
                (originalMetrica.row !== metricaAtiva.row || originalMetrica.col !== metricaAtiva.col) &&
                !isBeingDragged && !isBeingResized
              )

              const hasGridDimensions = gridDimensions !== null
              const cellWidth = gridDimensions?.cellWidth ?? 0
              const cellHeight = gridDimensions?.cellHeight ?? 100
              const gap = gridDimensions?.gap ?? 12
              const x = metricaAtiva.col * (cellWidth + gap)
              const y = metricaAtiva.row * (cellHeight + gap)
              const width = sizeConfig.cols * cellWidth + (sizeConfig.cols - 1) * gap
              const height = sizeConfig.rows * cellHeight + (sizeConfig.rows - 1) * gap

              return (
                <SortableMetricCard
                  key={metrica.id}
                  metrica={metrica}
                  data={data}
                  size={displayMetrica.size}
                  sizeConfig={sizeConfig}
                  row={metricaAtiva.row}
                  col={metricaAtiva.col}
                  onRemove={() => handleRemoveMetrica(metrica.id)}
                  onEdit={() => setEditCardId(metrica.id)}
                  onResize={(newSize) => handleResizeMetrica(metrica.id, newSize)}
                  onResizePreview={calculateResizePreview}
                  isRelocating={isBeingRelocated}
                  useAbsolutePosition={hasGridDimensions}
                  pixelPosition={hasGridDimensions ? { x, y, width, height } : undefined}
                  customConfig={undefined}
                  style={{
                    opacity: isBeingDragged ? 0.3 : 1,
                    zIndex: isBeingRelocated ? 50 : isBeingDragged ? 1000 : 1
                  }}
                />
              )
            })}
          </div>

          <DragOverlay dropAnimation={null} />

          {/* Fantasma customizado durante drag */}
          {activeId && activeDragSize && cursorPosition && (() => {
            // Buscar metrica ativa - se não encontrar, pode ser card do painel
            let activeMetricaAtiva = metricasAtivas.find(m => m.id === activeId)

            // Se é um card do painel sendo arrastado, criar metrica temporária
            if (!activeMetricaAtiva && panelDragId === activeId) {
              activeMetricaAtiva = { id: activeId, size: '1x1', row: -1, col: -1 }
            }

            if (!activeMetricaAtiva) return null
            const activeMetrica = allMetrics.find(m => m.id === activeId)
            if (!activeMetrica) return null

            const activeSizeConfig = parseCardSize(activeMetricaAtiva.size)
            const activeMinDimension = Math.min(activeSizeConfig.cols, activeSizeConfig.rows)
            const activeTitleSize = Math.round(10 + (activeMinDimension - 1) * 5)
            const activeValueSize = Math.round(24 + (activeMinDimension - 1) * 20)
            const activeDescSize = Math.round(10 + (activeMinDimension - 1) * 4)
            const activeIconSize = Math.round(14 + (activeMinDimension - 1) * 10)
            const activePadding = Math.round(10 + (activeMinDimension - 1) * 6)
            const ActiveIcon = activeMetrica.icon

            const ghostX = cursorPosition.x - (activeDragOffset?.x || 0)
            const ghostY = cursorPosition.y - (activeDragOffset?.y || 0)

            return createPortal(
              <div
                className={`card-modern border ${activeMetrica.borderColor} flex flex-col overflow-hidden pointer-events-none`}
                style={{
                  position: 'fixed',
                  left: `${ghostX}px`,
                  top: `${ghostY}px`,
                  width: `${activeDragSize.width}px`,
                  height: `${activeDragSize.height}px`,
                  opacity: 0.95,
                  zIndex: 2147483647,
                  willChange: 'left, top',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  transform: 'scale(1.02)',
                  background: 'white'
                }}
              >
                <div
                  className="flex flex-col h-full overflow-hidden"
                  style={{ padding: `${activePadding}px` }}
                >
                  <div className="flex flex-row items-center justify-between">
                    <span
                      className="text-neutral-600 truncate font-medium"
                      style={{ fontSize: `${activeTitleSize}px`, marginRight: `${activePadding / 2}px` }}
                    >
                      {activeMetrica.titulo}
                    </span>
                    <ActiveIcon
                      className={`${activeMetrica.cor} shrink-0`}
                      style={{ width: `${activeIconSize}px`, height: `${activeIconSize}px` }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center overflow-hidden min-h-0">
                    <div
                      className={`font-bold ${activeMetrica.cor} truncate`}
                      style={{ fontSize: `${activeValueSize}px`, lineHeight: 1 }}
                    >
                      {activeMetrica.getValue(data)}
                    </div>
                    <p
                      className="text-neutral-500 truncate"
                      style={{ fontSize: `${activeDescSize}px`, marginTop: `${activePadding / 3}px` }}
                    >
                      {activeMetrica.descricao}
                    </p>
                  </div>
                </div>
              </div>,
              document.body
            )
          })()}

          {/* Painel Lateral - Adicionar Métrica */}
          {showMetricasModal && createPortal(
            <>
              {/* Painel - colado na direita, 4px maior que a sidebar expandida */}
              <div
                className="fixed top-4 bottom-4 right-0 w-[304px] bg-white/95 backdrop-blur-xl border-l border-t border-b border-white/20 rounded-l-2xl shadow-2xl shadow-black/10 z-[9999] flex flex-col overflow-hidden"
                style={{
                  animation: 'panelSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                {/* Header */}
                <div className="flex-shrink-0 px-4 py-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-semibold text-neutral-800">
                      Adicionar Card
                    </h2>
                    <button
                      onClick={() => setShowMetricasModal(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Arraste para o grid ou clique para adicionar
                  </p>
                  {/* Botão Criar Novo Card + Caixa de Pesquisa */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsCreatingNewCard(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Criar novo card
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar card..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de métricas */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-5">
                    {/* Seção: Meus Cards (cards personalizados) */}
                    {(() => {
                      const searchLower = searchTerm.toLowerCase()
                      const customCardsFiltered = customCards.filter(m => {
                        const matchSearch = searchTerm === '' ||
                          m.titulo.toLowerCase().includes(searchLower) ||
                          m.descricao.toLowerCase().includes(searchLower) ||
                          'meus cards'.includes(searchLower) ||
                          'personalizado'.includes(searchLower)
                        return matchSearch
                      })

                      if (customCardsFiltered.length === 0) return null

                      return (
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Meus Cards
                          </h3>
                          <div className="space-y-1.5">
                            {customCardsFiltered.map(metrica => {
                              const isActive = metricasAtivas.some(m => m.id === metrica.id)

                              return (
                                <DraggablePanelItem
                                  key={metrica.id}
                                  metrica={metrica}
                                  isActive={isActive}
                                  isDragging={panelDragId === metrica.id}
                                  onRemove={() => handleRemoveMetrica(metrica.id)}
                                  onAdd={() => handleAddMetrica(metrica.id)}
                                  onPreview={() => setPreviewCardId(metrica.id)}
                                  onEdit={() => setEditCardId(metrica.id)}
                                />
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Categorias padrão */}
                    {['filas', 'investigadores', 'performance', 'financeiro'].map(categoria => {
                      const categoriaLabels: Record<string, string> = {
                        filas: 'Filas & Regras',
                        investigadores: 'Investigadores',
                        performance: 'Performance',
                        financeiro: 'Financeiro'
                      }

                      const searchLower = searchTerm.toLowerCase()
                      const categoriaLabel = categoriaLabels[categoria]

                      // Filtrar métricas pela categoria e pelo termo de pesquisa (título, descrição ou nome do segmento)
                      const metricasCategoria = availableMetrics.filter(m => {
                        const matchCategoria = m.categoria === categoria
                        const matchSearch = searchTerm === '' ||
                          m.titulo.toLowerCase().includes(searchLower) ||
                          m.descricao.toLowerCase().includes(searchLower) ||
                          categoriaLabel.toLowerCase().includes(searchLower)
                        return matchCategoria && matchSearch
                      })
                      if (metricasCategoria.length === 0) return null

                      return (
                        <div key={categoria} className="space-y-2">
                          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
                            {categoriaLabels[categoria]}
                          </h3>
                          <div className="space-y-1.5">
                            {metricasCategoria.map(metrica => {
                              const isActive = metricasAtivas.some(m => m.id === metrica.id)

                              return (
                                <DraggablePanelItem
                                  key={metrica.id}
                                  metrica={metrica}
                                  isActive={isActive}
                                  isDragging={panelDragId === metrica.id}
                                  onRemove={() => handleRemoveMetrica(metrica.id)}
                                  onAdd={() => handleAddMetrica(metrica.id)}
                                  onPreview={() => setPreviewCardId(metrica.id)}
                                  onEdit={() => setEditCardId(metrica.id)}
                                />
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllMetricas}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    disabled={metricasAtivas.length === 0}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover todos ({metricasAtivas.length})
                  </Button>
                </div>
              </div>
            </>,
            document.body
          )}

          {/* Modal de Preview do Card */}
          {previewCardId && createPortal(
            <>
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
                onClick={() => setPreviewCardId(null)}
              />
              <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto animate-scaleIn">
                  {(() => {
                    const metrica = allMetrics.find(m => m.id === previewCardId)
                    if (!metrica) return null
                    const Icon = metrica.icon
                    const value = metrica.getValue(data)

                    return (
                      <div className="relative">
                        <button
                          onClick={() => setPreviewCardId(null)}
                          className="absolute -top-3 -right-3 p-1.5 rounded-full bg-white shadow-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div
                          className={`card-modern border ${metrica.borderColor} p-6 min-w-[200px]`}
                          style={{ width: '280px', height: '180px' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-neutral-600 font-medium text-base">
                              {metrica.titulo}
                            </span>
                            <Icon className={`h-6 w-6 ${metrica.cor}`} />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className={`font-bold ${metrica.cor} text-4xl`}>
                              {value}
                            </div>
                            <p className="text-neutral-500 text-sm mt-2">
                              {metrica.descricao}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </>,
            document.body
          )}

          {/* Modal Editor de Card - SEMPRE usar CardCreatorModal */}
          {editCardId && (() => {
            const cardToEdit = allMetrics.find(m => m.id === editCardId)
            if (!cardToEdit) return null

            const isCustomCard = editCardId.startsWith('custom-')

            return createPortal(
              <CardCreatorModal
                editCard={cardToEdit}
                onClose={() => setEditCardId(null)}
                onCreate={(updatedCard) => {
                  if (isCustomCard) {
                    // Atualizar card na lista de customCards
                    setCustomCards(prev => prev.map(c =>
                      c.id === updatedCard.id ? updatedCard : c
                    ))
                  }
                  // Cards padrão terão suas configurações visuais salvas no canvasComponents
                  setEditCardId(null)
                }}
              />,
              document.body
            )
          })()}

          {/* Modal Criar Novo Card */}
          {isCreatingNewCard && createPortal(
            <CardCreatorModal
              onClose={() => setIsCreatingNewCard(false)}
              onCreate={(newCard) => {
                // Adicionar novo card à lista de cards personalizados
                setCustomCards(prev => [...prev, newCard])

                // Também adicionar automaticamente ao grid
                const position = findFirstAvailablePosition(metricasAtivas)
                if (position) {
                  setMetricasAtivas(prev => [...prev, {
                    id: newCard.id,
                    size: '1x1',
                    row: position.row,
                    col: position.col
                  }])
                }

                setIsCreatingNewCard(false)
              }}
            />,
            document.body
          )}
        </DndContext>
      </ContentWrapper>
    </Wrapper>
  )
}

// ============================================
// COMPONENTE SORTABLE METRIC CARD
// ============================================

interface SortableMetricCardProps {
  metrica: MetricaConfig
  data: MetricaData
  size: string
  sizeConfig: CardSizeConfig
  row: number
  col: number
  onRemove: () => void
  onEdit: () => void
  onResize: (newSize: string) => void
  onResizePreview?: (info: ResizeInfo | null) => void
  style?: React.CSSProperties
  isRelocating?: boolean
  useAbsolutePosition?: boolean
  pixelPosition?: { x: number; y: number; width: number; height: number }
  customConfig?: any
}

function SortableMetricCard({
  metrica,
  data,
  size: _size,
  sizeConfig,
  row,
  col,
  onRemove,
  onEdit,
  onResize,
  onResizePreview,
  style,
  isRelocating = false,
  useAbsolutePosition = false,
  pixelPosition,
  customConfig
}: SortableMetricCardProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizePreview, setResizePreview] = useState<{ cols: number; rows: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const resizePreviewRef = useRef<{ cols: number; rows: number } | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({ id: metrica.id })

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node)
      ; (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node
  }, [setNodeRef])

  const containerCols = resizePreview?.cols ?? sizeConfig.cols
  const containerRows = resizePreview?.rows ?? sizeConfig.rows

  const basePositionStyle: React.CSSProperties = useAbsolutePosition && pixelPosition
    ? {
      position: 'absolute',
      left: 0,
      top: 0,
      width: `${pixelPosition.width}px`,
      height: `${pixelPosition.height}px`,
      transform: `translate3d(${pixelPosition.x}px, ${pixelPosition.y}px, 0) ${isRelocating ? 'scale(0.98)' : 'scale(1)'}`,
      transition: isDragging || isResizing
        ? 'none'
        : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease, box-shadow 0.3s ease',
    }
    : {
      gridRow: `${row + 1} / span ${containerRows}`,
      gridColumn: `${col + 1} / span ${containerCols}`,
    }

  const dragStyle: React.CSSProperties = {
    zIndex: style?.zIndex ?? (isDragging ? 1000 : isResizing ? 100 : isRelocating ? 50 : 1),
    opacity: style?.opacity ?? (isDragging ? 0.3 : 1),
    ...basePositionStyle,
    ...style
  }

  const IconComponent = metrica.icon
  const value = metrica.getValue(data)

  const minDimension = Math.min(sizeConfig.cols, sizeConfig.rows)

  // Valores base para tamanhos
  const baseTitleSize = Math.round(10 + (minDimension - 1) * 5)
  const baseValueSize = Math.round(24 + (minDimension - 1) * 20)
  const baseDescSize = Math.round(10 + (minDimension - 1) * 4)
  const iconSize = Math.round(14 + (minDimension - 1) * 10)
  const padding = Math.round(10 + (minDimension - 1) * 6)

  // Aplicar configurações personalizadas
  const displayTitle = customConfig?.titulo || metrica.titulo
  const displayDesc = customConfig?.descricao || metrica.descricao
  const displayColor = customConfig?.colorScheme || metrica.cor

  // Calcular tamanhos de fonte baseado em customConfig
  const fontSizeMultipliers = {
    sm: 0.7,
    md: 0.85,
    lg: 1,
    xl: 1.2
  }
  const fontMultiplier = (fontSizeMultipliers as any)[customConfig?.fontSize || 'lg']
  const titleSize = Math.round(baseTitleSize * fontMultiplier)
  const valueSize = Math.round(baseValueSize * fontMultiplier)
  const descSize = Math.round(baseDescSize * fontMultiplier)

  // Determinar cor de borda baseada na cor do tema
  const colorToBorderMap: Record<string, string> = {
    'text-blue-600': 'border-blue-200',
    'text-emerald-600': 'border-emerald-200',
    'text-amber-600': 'border-amber-200',
    'text-rose-600': 'border-rose-200',
    'text-purple-600': 'border-purple-200',
    'text-slate-600': 'border-slate-200',
    'text-slate-700': 'border-slate-200',
    'text-sky-600': 'border-sky-100',
    'text-green-600': 'border-green-100',
    'text-indigo-600': 'border-indigo-100',
    'text-red-600': 'border-red-100',
    'text-cyan-600': 'border-cyan-100',
    'text-orange-600': 'border-orange-100',
    'text-teal-600': 'border-teal-100'
  }
  const displayBorderColor = customConfig ? (colorToBorderMap[displayColor] || 'border-slate-200') : metrica.borderColor

  // Determinar cor de fundo para gráficos
  const colorToBgMap: Record<string, string> = {
    'text-blue-600': 'bg-blue-100',
    'text-emerald-600': 'bg-emerald-100',
    'text-amber-600': 'bg-amber-100',
    'text-rose-600': 'bg-rose-100',
    'text-purple-600': 'bg-purple-100',
    'text-slate-600': 'bg-slate-100',
    'text-slate-700': 'bg-slate-100',
    'text-sky-600': 'bg-sky-100',
    'text-green-600': 'bg-green-100',
    'text-indigo-600': 'bg-indigo-100',
    'text-red-600': 'bg-red-100',
    'text-cyan-600': 'bg-cyan-100',
    'text-orange-600': 'bg-orange-100',
    'text-teal-600': 'bg-teal-100'
  }
  const chartBgColor = colorToBgMap[displayColor] || 'bg-blue-100'

  // Renderizar componente do canvas
  const renderCanvasComponentContent = (comp: CanvasComponent, scale: number) => {
    const { type, props } = comp

    switch (type) {
      case 'title':
        return (
          <div
            className="font-semibold text-slate-800 truncate"
            style={{ fontSize: `${Math.max(10, 14 * scale)}px` }}
          >
            {String(props.text || 'Título')}
          </div>
        )
      case 'value':
        return (
          <div
            className={`font-bold ${displayColor}`}
            style={{ fontSize: `${Math.max(16, 28 * scale)}px`, lineHeight: 1 }}
          >
            {String(props.text || '0')}
          </div>
        )
      case 'description':
        return (
          <div
            className="text-slate-500 truncate"
            style={{ fontSize: `${Math.max(8, 11 * scale)}px` }}
          >
            {String(props.text || 'Descrição')}
          </div>
        )
      case 'trend':
        return (
          <div className="flex items-center gap-1">
            {props.direction === 'up' ? (
              <TrendingUp className="text-emerald-500" style={{ width: `${12 * scale}px`, height: `${12 * scale}px` }} />
            ) : (
              <TrendingDown className="text-rose-500" style={{ width: `${12 * scale}px`, height: `${12 * scale}px` }} />
            )}
            <span
              className={props.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'}
              style={{ fontSize: `${Math.max(8, 11 * scale)}px`, fontWeight: 500 }}
            >
              {String(props.value || '+0%')}
            </span>
          </div>
        )
      case 'progress':
        return (
          <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height: `${Math.max(4, 8 * scale)}px` }}>
            <div
              className={`h-full ${chartBgColor}`}
              style={{ width: `${Number(props.value) || 50}%` }}
            />
          </div>
        )
      case 'chart-bar':
        const barData = (props.data as number[]) || [30, 45, 28, 55, 42, 60, 48]
        const barHeight = Math.max(24, 50 * scale)
        const barMax = Math.max(...barData)
        const barGradId = `bar-${comp.id}-${Date.now()}`
        return (
          <div className="flex flex-col w-full" style={{ height: `${barHeight}px` }}>
            <div className="flex-1 flex items-end gap-[2px] relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                <div className="border-b border-dashed border-slate-300" />
                <div className="border-b border-dashed border-slate-300" />
                <div className="border-b border-slate-300" />
              </div>
              <svg className="absolute" width="0" height="0">
                <defs>
                  <linearGradient id={barGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
              {barData.map((v, i) => {
                const heightPct = (v / barMax) * 100
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm ${chartBgColor} shadow-sm relative z-10 transition-all hover:opacity-80`}
                    style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '2px' : '0' }}
                  />
                )
              })}
            </div>
          </div>
        )
      case 'chart-line':
      case 'chart-area':
        const lineData = (props.data as number[]) || [30, 45, 28, 55, 42, 60, 48]
        const lineHeight = Math.max(24, 50 * scale)
        const lineMax = Math.max(...lineData)
        const lineMin = Math.min(...lineData)
        const lineRange = lineMax - lineMin || 1
        const linePad = 8
        const lineChartW = 100 - linePad * 2
        const lineChartH = 100 - linePad * 2
        const lineGradId = `line-${comp.id}-${Date.now()}`

        // Pontos para curva suave
        const linePts = lineData.map((v, i) => ({
          x: linePad + (i / (lineData.length - 1)) * lineChartW,
          y: linePad + (1 - (v - lineMin) / lineRange) * lineChartH
        }))

        // Path suave com bezier
        const createPath = (pts: { x: number; y: number }[]) => {
          if (pts.length < 2) return ''
          let p = `M ${pts[0].x} ${pts[0].y}`
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)]
            const p1 = pts[i]
            const p2 = pts[i + 1]
            const p3 = pts[Math.min(pts.length - 1, i + 2)]
            const t = 0.3
            const cx1 = p1.x + (p2.x - p0.x) * t
            const cy1 = p1.y + (p2.y - p0.y) * t
            const cx2 = p2.x - (p3.x - p1.x) * t
            const cy2 = p2.y - (p3.y - p1.y) * t
            p += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`
          }
          return p
        }

        const linePath = createPath(linePts)
        const areaPath = linePath + ` L ${linePts[linePts.length - 1].x} ${100 - linePad} L ${linePad} ${100 - linePad} Z`

        return (
          <svg viewBox="0 0 100 100" className="w-full" style={{ height: `${lineHeight}px` }} preserveAspectRatio="none">
            <defs>
              <linearGradient id={lineGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Grid sutil */}
            <g className="text-slate-200" opacity="0.5">
              {[25, 50, 75].map(pct => (
                <line key={pct} x1={linePad} y1={linePad + (pct / 100) * lineChartH} x2={100 - linePad} y2={linePad + (pct / 100) * lineChartH} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
              ))}
              <line x1={linePad} y1={100 - linePad} x2={100 - linePad} y2={100 - linePad} stroke="currentColor" strokeWidth="0.5" />
            </g>
            {/* Área */}
            {type === 'chart-area' && (
              <path d={areaPath} className={displayColor} fill={`url(#${lineGradId})`} />
            )}
            {/* Linha */}
            <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={displayColor} />
            {/* Pontos */}
            {scale > 0.6 && linePts.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="2.5" className={`${displayColor} fill-white stroke-current`} strokeWidth="1.5" />
            ))}
          </svg>
        )
      case 'chart-pie':
      case 'chart-donut':
        const pieValue = Number(props.value) || 65
        const pieSize = Math.max(28, 56 * scale)
        const pieRadius = 14
        const pieCirc = 2 * Math.PI * pieRadius
        const pieDash = `${(pieValue / 100) * pieCirc} ${pieCirc}`
        const pieGradId = `pie-${comp.id}-${Date.now()}`
        return (
          <div className="relative">
            <svg viewBox="0 0 36 36" style={{ width: `${pieSize}px`, height: `${pieSize}px` }} className="transform -rotate-90">
              <defs>
                <linearGradient id={pieGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r={pieRadius} fill="none" className="stroke-slate-100" strokeWidth={type === 'chart-donut' ? 3.5 : 14} />
              <circle
                cx="18" cy="18" r={pieRadius}
                fill="none"
                className={displayColor}
                stroke={`url(#${pieGradId})`}
                strokeWidth={type === 'chart-donut' ? 3.5 : 14}
                strokeDasharray={pieDash}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold ${displayColor}`} style={{ fontSize: `${Math.max(8, 12 * scale)}px` }}>
                {pieValue}<span className="text-slate-400" style={{ fontSize: `${Math.max(6, 8 * scale)}px` }}>%</span>
              </span>
            </div>
          </div>
        )
      case 'chart-gauge':
        const gaugeValue = Number(props.value) || 72
        const gaugeMax = Number(props.max) || 100
        const gaugePct = (gaugeValue / gaugeMax) * 100
        const gaugeSize = Math.max(36, 70 * scale)
        const gaugeGradId = `gauge-${comp.id}-${Date.now()}`

        // Cor baseada no valor
        const gColor = gaugePct >= 80 ? 'text-emerald-500' : gaugePct >= 50 ? 'text-amber-500' : 'text-rose-500'
        const gaugeR = 13
        const gaugeCirc = Math.PI * gaugeR
        const gaugeDash = `${(gaugePct / 100) * gaugeCirc} ${gaugeCirc}`

        return (
          <div className="flex flex-col items-center" style={{ width: `${gaugeSize}px` }}>
            <svg viewBox="0 0 36 22" className="w-full">
              <defs>
                <linearGradient id={gaugeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              {/* Track de fundo */}
              <path d="M 4 18 A 13 13 0 0 1 32 18" fill="none" stroke={`url(#${gaugeGradId})`} strokeWidth="2.5" strokeLinecap="round" opacity="0.15" />
              <path d="M 4 18 A 13 13 0 0 1 32 18" fill="none" className="stroke-slate-200" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arco de progresso */}
              <path
                d="M 4 18 A 13 13 0 0 1 32 18"
                fill="none"
                className={props.showGradient ? '' : gColor}
                stroke={props.showGradient ? `url(#${gaugeGradId})` : 'currentColor'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={gaugeDash}
              />
              {/* Ponteiro */}
              <g transform={`rotate(${-90 + (gaugePct / 100) * 180}, 18, 18)`}>
                <line x1="18" y1="18" x2="18" y2="8" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="2" fill="#334155" />
              </g>
            </svg>
            <span className={`font-bold ${gColor}`} style={{ fontSize: `${Math.max(10, 14 * scale)}px`, marginTop: '-2px' }}>
              {gaugeValue}
            </span>
          </div>
        )
      case 'badge':
        const badgeVariants: Record<string, string> = {
          success: 'bg-emerald-100 text-emerald-700',
          warning: 'bg-amber-100 text-amber-700',
          error: 'bg-rose-100 text-rose-700',
          info: 'bg-blue-100 text-blue-700'
        }
        return (
          <span
            className={`px-2 py-0.5 rounded-full ${badgeVariants[String(props.variant) || 'info']}`}
            style={{ fontSize: `${Math.max(8, 10 * scale)}px` }}
          >
            {String(props.text || 'Badge')}
          </span>
        )
      case 'chart-bar-h':
        const barHData2 = (props.data as number[]) || [30, 45, 28, 55]
        const barHLabels2 = (props.labels as string[]) || barHData2.map((_, i) => `${i + 1}`)
        const barHMax2 = Math.max(...barHData2)
        const barHHeight = Math.max(16, 30 * scale)
        return (
          <div className="flex flex-col w-full gap-1" style={{ height: `${barHHeight * barHData2.length}px` }}>
            {barHData2.slice(0, 5).map((v, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <span className="text-[8px] text-slate-500 w-6 truncate">{barHLabels2[i]}</span>
                <div className="flex-1 h-[60%] bg-slate-100 rounded-r overflow-hidden">
                  <div className={`h-full ${chartBgColor}`} style={{ width: `${(v / barHMax2) * 100}%` }} />
                </div>
                <span className="text-[8px] font-medium text-slate-600 w-6">{v}</span>
              </div>
            ))}
          </div>
        )
      case 'chart-heatmap':
        const hmData = (props.data as number[][]) || [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        const hmMax = Math.max(...hmData.flat())
        const hmRows = (props.rows as string[]) || hmData.map((_, i) => `${i}`)
        const cellH = Math.max(6, 12 * scale)
        return (
          <div className="flex flex-col w-full gap-[1px]" style={{ maxHeight: `${cellH * hmData.length + 20}px` }}>
            {hmData.slice(0, 7).map((row, ri) => (
              <div key={ri} className="flex items-center gap-[1px]">
                <span className="text-[6px] text-slate-400 w-4">{hmRows[ri]}</span>
                <div className="flex-1 flex gap-[1px]" style={{ height: `${cellH}px` }}>
                  {row.slice(0, 24).map((v, ci) => {
                    const int = hmMax > 0 ? v / hmMax : 0
                    const bg = int === 0 ? 'bg-blue-50' : int < 0.33 ? 'bg-blue-200' : int < 0.66 ? 'bg-blue-400' : 'bg-blue-600'
                    return <div key={ci} className={`flex-1 rounded-[1px] ${bg}`} />
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      case 'table':
        const tCols = (props.columns as string[]) || ['Col 1', 'Col 2']
        const tRows = (props.rows as string[][]) || [['A', '1'], ['B', '2']]
        const rowH = Math.max(12, 16 * scale)
        return (
          <div className="flex flex-col w-full" style={{ fontSize: `${Math.max(7, 9 * scale)}px` }}>
            <div className="flex border-b border-slate-200 pb-0.5 mb-0.5">
              {tCols.map((c, i) => (
                <div key={i} className={`font-medium text-slate-600 ${i === 0 ? 'flex-1' : 'w-12 text-right'}`}>{c}</div>
              ))}
            </div>
            {tRows.slice(0, 4).map((r, ri) => (
              <div key={ri} className="flex border-b border-slate-100" style={{ height: `${rowH}px` }}>
                {r.map((c, ci) => (
                  <div key={ci} className={`${ci === 0 ? 'flex-1 text-slate-600' : 'w-12 text-right font-medium text-slate-800'}`}>{c}</div>
                ))}
              </div>
            ))}
          </div>
        )
      case 'divider':
        return <div className="w-full border-t border-slate-200" />
      case 'spacer':
        return <div style={{ height: `${Number(props.height) || 8}px` }} />
      case 'icon':
        return <Activity className={displayColor} style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />

      // ========== RECHARTS - Renderização COMPLETA no card principal ==========
      case 'recharts-bar': {
        const rechartsBarData = (props.data as Array<{ name: string; value: number }>) || []
        const barColors = (props.chartColors as string[]) || ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const showLegend = props.showLegend !== false
        const showTooltip = props.showTooltip !== false
        const showGrid = props.showGrid !== false
        const legendSize = (props.legendSize as number) || 9
        const animDuration = (props.animationDuration as number) ?? 800
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={rechartsBarData} margin={{ top: 5, right: 10, left: -10, bottom: showLegend ? 10 : 5 }}>
                <defs>
                  <linearGradient id={`barGrad-main-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={barColors[0]} stopOpacity={1} />
                    <stop offset="100%" stopColor={barColors[0]} stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                {showTooltip && <RechartsTooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']} labelFormatter={(label) => `📊 ${label}`} />}
                {showLegend && <RechartsLegend wrapperStyle={{ fontSize: `${legendSize}px`, paddingTop: '0px' }} iconType="circle" iconSize={6} />}
                <RechartsBar dataKey="value" name="Valor" radius={[4, 4, 0, 0]} animationDuration={animDuration} animationEasing="ease-out">
                  {rechartsBarData.map((_, index) => (
                    <RechartsCell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </RechartsBar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-line': {
        const rechartsLineData = (props.data as Array<{ name: string; value: number }>) || []
        const lineColor = (props.primaryColor as string) || '#8b5cf6'
        const showLegendL = props.showLegend !== false
        const showTooltipL = props.showTooltip !== false
        const showGridL = props.showGrid !== false
        const legendSizeL = (props.legendSize as number) || 9
        const animDurationL = (props.animationDuration as number) ?? 1000
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={rechartsLineData} margin={{ top: 5, right: 10, left: -10, bottom: showLegendL ? 10 : 5 }}>
                <defs>
                  <linearGradient id={`lineGrad-main-${comp.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={1} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={1} />
                  </linearGradient>
                </defs>
                {showGridL && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                {showTooltipL && <RechartsTooltip cursor={{ stroke: lineColor, strokeDasharray: '5 5' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']} labelFormatter={(label) => `📈 ${label}`} />}
                {showLegendL && <RechartsLegend wrapperStyle={{ fontSize: `${legendSizeL}px`, paddingTop: '0px' }} iconType="line" iconSize={10} />}
                <RechartsLine type="monotone" dataKey="value" name="Valor" stroke={lineColor} strokeWidth={3} dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: lineColor, stroke: '#fff', strokeWidth: 2 }} animationDuration={animDurationL} animationEasing="ease-out" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-area': {
        const rechartsAreaData = (props.data as Array<{ name: string; value: number }>) || []
        const areaColor = (props.primaryColor as string) || '#10b981'
        const showLegendA = props.showLegend !== false
        const showTooltipA = props.showTooltip !== false
        const showGridA = props.showGrid !== false
        const legendSizeA = (props.legendSize as number) || 9
        const animDurationA = (props.animationDuration as number) ?? 1000
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={rechartsAreaData} margin={{ top: 5, right: 10, left: -10, bottom: showLegendA ? 10 : 5 }}>
                <defs>
                  <linearGradient id={`areaGrad-main-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={areaColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={areaColor} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                {showGridA && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                {showTooltipA && <RechartsTooltip cursor={{ stroke: areaColor, strokeDasharray: '5 5' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']} labelFormatter={(label) => `📉 ${label}`} />}
                {showLegendA && <RechartsLegend wrapperStyle={{ fontSize: `${legendSizeA}px`, paddingTop: '0px' }} iconType="rect" iconSize={8} />}
                <RechartsArea type="monotone" dataKey="value" name="Valor" stroke={areaColor} fill={`url(#areaGrad-main-${comp.id})`} strokeWidth={2} dot={{ r: 3, fill: areaColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: areaColor, stroke: '#fff', strokeWidth: 2 }} animationDuration={animDurationA} animationEasing="ease-out" />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-pie': {
        const rechartsPieData = (props.data as Array<{ name: string; value: number; color?: string }>) || []
        const pieColors = (props.chartColors as string[]) || ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const showLegendP = props.showLegend !== false
        const showTooltipP = props.showTooltip !== false
        const legendSizeP = (props.legendSize as number) || 8
        const animDurationP = (props.animationDuration as number) ?? 800
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart margin={{ top: 0, right: 5, bottom: showLegendP ? 10 : 0, left: 5 }}>
                <defs>
                  {pieColors.map((color, i) => (
                    <linearGradient key={i} id={`pieGrad-main-${comp.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <RechartsPie data={rechartsPieData} cx="50%" cy={showLegendP ? "45%" : "50%"} innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }} animationDuration={animDurationP} animationEasing="ease-out">
                  {rechartsPieData.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </RechartsPie>
                {showTooltipP && <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]} />}
                {showLegendP && <RechartsLegend wrapperStyle={{ fontSize: `${legendSizeP}px`, paddingTop: '0px' }} iconType="circle" iconSize={6} layout="horizontal" align="center" />}
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-radar': {
        const radarData = (props.data as Array<{ subject: string; A: number; B: number; fullMark: number }>) || []
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData} margin={{ top: 0, right: 5, bottom: 10, left: 5 }}>
                <defs>
                  <linearGradient id={`radarGradA-main-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id={`radarGradB-main-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#6b7280' }} tickLine={false} />
                <PolarRadiusAxis tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickCount={5} />
                <RechartsRadar name="Série A" dataKey="A" stroke="#3b82f6" fill={`url(#radarGradA-main-${comp.id})`} strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} animationDuration={800} />
                <RechartsRadar name="Série B" dataKey="B" stroke="#8b5cf6" fill={`url(#radarGradB-main-${comp.id})`} strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} animationDuration={800} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number) => [`${value}`, '']} />
                <RechartsLegend wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }} iconType="circle" iconSize={6} />
              </RechartsRadarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-radial': {
        const radialData = (props.data as Array<{ name: string; value: number; fill: string }>) || []
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadialBarChart cx="50%" cy="55%" innerRadius="25%" outerRadius="85%" barSize={18} data={radialData} startAngle={180} endAngle={0}>
                <defs>
                  <linearGradient id={`radialGrad-main-${comp.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <RechartsRadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={15} animationDuration={1000} animationEasing="ease-out" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number, name: string) => [`${value}%`, name]} />
                <RechartsLegend wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }} iconType="circle" iconSize={6} layout="horizontal" align="center" verticalAlign="bottom" />
              </RechartsRadialBarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-scatter': {
        const scatterData = (props.data as Array<{ x: number; y: number; z: number }>) || []
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsScatterChart margin={{ top: 5, right: 10, bottom: 10, left: 0 }}>
                <defs>
                  <linearGradient id={`scatterGrad-main-${comp.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="x" name="X" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis type="number" dataKey="y" name="Y" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Tamanho" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3', stroke: '#8b5cf6' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number, name: string) => [`${value}`, name]} labelFormatter={() => '📍 Ponto'} />
                <RechartsLegend wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }} iconType="circle" iconSize={6} />
                <RechartsScatter name="Dados" data={scatterData} fill={`url(#scatterGrad-main-${comp.id})`} animationDuration={800} />
              </RechartsScatterChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-composed': {
        const composedData = (props.data as Array<{ name: string; bar: number; line: number }>) || []
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsComposedChart data={composedData} margin={{ top: 5, right: 10, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id={`composedBarGrad-main-${comp.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                <RechartsTooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number) => [`${value.toLocaleString()}`, '']} labelFormatter={(label) => `📊 ${label}`} />
                <RechartsLegend wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }} iconSize={8} />
                <RechartsBar dataKey="bar" name="Barras" fill={`url(#composedBarGrad-main-${comp.id})`} radius={[4, 4, 0, 0]} animationDuration={800} />
                <RechartsLine type="monotone" dataKey="line" name="Linha" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1000} />
              </RechartsComposedChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-treemap': {
        const treemapData = (props.data as Array<{ name: string; size: number; color: string }>) || []
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsTreemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                animationDuration={800}
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-funnel': {
        const funnelData = (props.data as Array<{ name: string; value: number; fill: string }>) || []
        return (
          <div className="w-full h-full p-1">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsFunnelChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <RechartsTooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }} formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]} />
                <RechartsFunnel dataKey="value" data={funnelData} isAnimationActive animationDuration={800} animationEasing="ease-out">
                  <LabelList position="right" fill="#374151" stroke="none" fontSize={9} dataKey="name" formatter={(value: string) => value} />
                  <LabelList position="center" fill="#fff" stroke="none" fontSize={11} fontWeight="bold" dataKey="value" formatter={(value: number) => value.toLocaleString()} />
                </RechartsFunnel>
              </RechartsFunnelChart>
            </ResponsiveContainer>
          </div>
        )
      }

      default:
        return null
    }
  }

  // Renderizar card com canvas components
  const renderCanvasLayout = () => {
    if (!metrica.canvasComponents || !metrica.canvasConfig) return null

    const { gridCols, gridRows } = metrica.canvasConfig
    const components = metrica.canvasComponents

    // Calcular escala baseado no tamanho do card
    const cardWidth = pixelPosition?.width || 200
    const cardHeight = pixelPosition?.height || 150
    const scaleX = cardWidth / (gridCols * 40)
    const scaleY = cardHeight / (gridRows * 40)
    const scale = Math.min(scaleX, scaleY, 1.5)

    return (
      <div
        className="relative w-full h-full"
        style={{
          padding: `${Math.max(8, padding * 0.6)}px`
        }}
      >
        {components.map(comp => {
          const left = (comp.x / gridCols) * 100
          const top = (comp.y / gridRows) * 100
          const width = (comp.width / gridCols) * 100
          const height = (comp.height / gridRows) * 100

          return (
            <div
              key={comp.id}
              className="absolute flex items-center justify-start overflow-hidden"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                padding: `${2 * scale}px`
              }}
            >
              {renderCanvasComponentContent(comp, scale)}
            </div>
          )
        })}
      </div>
    )
  }

  // Renderizar mini gráfico
  const renderMiniChart = () => {
    if (!customConfig?.chartType || customConfig.chartType === 'none') return null

    const chartHeight = Math.min(40, Math.round(30 * minDimension))
    const chartData = [30, 45, 28, 55, 42, 60, 48]

    if (customConfig.chartType === 'bar') {
      return (
        <div className="flex items-end gap-0.5 mt-1" style={{ height: `${chartHeight}px` }}>
          {chartData.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${chartBgColor}`}
              style={{ height: `${(v / 60) * chartHeight}px` }}
            />
          ))}
        </div>
      )
    }

    if (customConfig.chartType === 'line' || customConfig.chartType === 'area') {
      const points = chartData.map((v, i) => `${(i / (chartData.length - 1)) * 100},${100 - (v / 60) * 100}`).join(' ')
      return (
        <svg viewBox="0 0 100 100" className="w-full mt-1" style={{ height: `${chartHeight}px` }} preserveAspectRatio="none">
          {customConfig.chartType === 'area' && (
            <polygon
              points={`0,100 ${points} 100,100`}
              className={`${chartBgColor} opacity-50`}
              fill="currentColor"
            />
          )}
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={displayColor}
          />
        </svg>
      )
    }

    if (customConfig.chartType === 'pie') {
      return (
        <div className="flex justify-center mt-1">
          <svg viewBox="0 0 32 32" style={{ width: `${chartHeight}px`, height: `${chartHeight}px` }}>
            <circle r="16" cx="16" cy="16" className="fill-slate-100" />
            <circle
              r="8"
              cx="16"
              cy="16"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="16"
              strokeDasharray="35 65"
              transform="rotate(-90 16 16)"
              className={displayColor}
            />
          </svg>
        </div>
      )
    }

    return null
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const cardRect = cardRef.current?.getBoundingClientRect()

    if (!cardRect) return

    const gap = 12
    const cellWidth = (cardRect.width - (sizeConfig.cols - 1) * gap) / sizeConfig.cols
    const cellHeight = (cardRect.height - (sizeConfig.rows - 1) * gap) / sizeConfig.rows

    onResizePreview?.({ id: metrica.id, row, col, cols: sizeConfig.cols, rows: sizeConfig.rows })

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      const maxCols = GRID_COLS - col
      const maxRows = MAX_GRID_ROWS - row
      const newCols = Math.max(1, Math.min(maxCols, sizeConfig.cols + Math.round(deltaX / (cellWidth + gap))))
      const newRows = Math.max(1, Math.min(maxRows, sizeConfig.rows + Math.round(deltaY / (cellHeight + gap))))

      const preview = { cols: newCols, rows: newRows }
      resizePreviewRef.current = preview
      setResizePreview(preview)

      onResizePreview?.({ id: metrica.id, row, col, cols: newCols, rows: newRows })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      const finalPreview = resizePreviewRef.current
      if (finalPreview) {
        const newSize = createCardSize(finalPreview.cols, finalPreview.rows)
        onResize(newSize)
      }

      setIsResizing(false)
      setResizePreview(null)
      resizePreviewRef.current = null

      onResizePreview?.(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={setRefs}
      data-metric-id={metrica.id}
      style={dragStyle}
      className={`card-modern border ${displayBorderColor} relative group flex flex-col overflow-hidden min-h-0 ${isResizing ? 'ring-2 ring-primary ring-opacity-50' : ''} ${isRelocating ? 'ring-2 ring-amber-400 ring-opacity-70 shadow-lg shadow-amber-200/50' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 z-10"
      >
        <GripVertical className="h-3 w-3 text-slate-400" />
      </div>

      {/* Resize preview indicator */}
      {isResizing && resizePreview && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary text-white text-xs font-medium z-20">
          {resizePreview.cols}x{resizePreview.rows}
        </div>
      )}

      {/* Resize handle - canto inferior direito */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: '16px',
          height: '16px',
          cursor: 'se-resize',
          zIndex: 50
        }}
        title="Arraste para redimensionar"
      >
        <svg
          style={{
            width: '12px',
            height: '12px',
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            pointerEvents: 'none'
          }}
          className="text-slate-400 opacity-40"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
        </svg>
      </div>

      {/* Botões de ação no hover - sempre visíveis */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-1 rounded hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors bg-white/80"
          title="Editar"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors bg-white/80"
          title="Remover"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Card Content - Canvas ou Layout Padrão */}
      {metrica.canvasComponents && metrica.canvasComponents.length > 0 ? (
        // Renderizar layout do canvas
        renderCanvasLayout()
      ) : (
        // Layout padrão
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ padding: `${padding}px` }}
        >
          <div className="flex flex-row items-center justify-between">
            <span
              className="text-neutral-600 truncate font-medium"
              style={{ fontSize: `${titleSize}px`, marginRight: `${padding / 2}px` }}
            >
              {displayTitle}
            </span>
            <div className="relative shrink-0 flex items-center gap-1">
              {/* Ícone normal */}
              <IconComponent
                className={`${displayColor}`}
                style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center overflow-hidden min-h-0">
            <div
              className={`font-bold ${displayColor} truncate`}
              style={{ fontSize: `${valueSize}px`, lineHeight: 1 }}
            >
              {value}
            </div>

            {/* Indicador de Tendência */}
            {customConfig?.showTrend && (
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 text-xs font-medium">+12%</span>
              </div>
            )}

            {/* Mini Gráfico */}
            {renderMiniChart()}

            <p
              className="text-neutral-500 truncate"
              style={{ fontSize: `${descSize}px`, marginTop: `${padding / 3}px` }}
            >
              {displayDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPONENTE CARD EDITOR MODAL (CANVAS)
// ============================================



// ============================================
// COMPONENTE DRAGGABLE PANEL ITEM (MINIATURA)
// ============================================

interface DraggablePanelItemProps {
  metrica: MetricaConfig
  isActive: boolean
  isDragging: boolean
  onRemove: () => void
  onAdd: () => void
  onPreview: () => void
  onEdit: () => void
}

function DraggablePanelItem({
  metrica,
  isActive,
  isDragging,
  onRemove,
  onAdd,
  onPreview,
  onEdit
}: DraggablePanelItemProps) {
  // Usar prefixo "panel-" para evitar conflito de IDs com cards no grid
  const panelItemId = `panel-${metrica.id}`
  const [showPreviewTooltip, setShowPreviewTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const previewButtonRef = useRef<HTMLButtonElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging: isCurrentlyDragging,
  } = useDraggable({ id: panelItemId, disabled: isActive })

  const Icon = metrica.icon

  // Valor de exemplo para a miniatura
  const exampleValue = metrica.id.includes('taxa') || metrica.id.includes('eficiencia') || metrica.id.includes('reincidencia')
    ? '78%'
    : metrica.id.includes('sla') || metrica.id.includes('medio')
      ? '4.2h'
      : metrica.id.includes('valor') || metrica.id.includes('pendente')
        ? 'R$ 45K'
        : '24'

  const handlePreviewMouseEnter = () => {
    if (previewButtonRef.current) {
      const rect = previewButtonRef.current.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left - 12, // 12px de margem
        y: rect.top + rect.height / 2
      })
      setShowPreviewTooltip(true)
    }
  }

  const handlePreviewMouseLeave = () => {
    setShowPreviewTooltip(false)
    setTooltipPosition(null)
  }

  return (
    <div
      ref={setNodeRef}
      {...(isActive ? {} : { ...attributes, ...listeners })}
      onClick={() => {
        if (isActive) {
          onRemove()
        } else {
          onAdd()
        }
      }}
      className={`group relative transition-all duration-200 ${isActive
        ? 'cursor-pointer'
        : 'cursor-grab active:cursor-grabbing'
        } ${(isDragging || isCurrentlyDragging) ? 'opacity-40 scale-95' : 'hover:scale-[1.02]'}`}
    >
      {/* Miniatura do Card */}
      <div
        className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${isActive
          ? 'border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          height: '72px'
        }}
      >
        {/* Botões de ação (Visualizar e Editar) */}
        <div className="absolute top-1.5 right-1.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            ref={previewButtonRef}
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
            className="p-1.5 rounded-lg bg-white/90 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-500 hover:text-blue-600 transition-all shadow-sm"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 rounded-lg bg-white/90 border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-500 hover:text-amber-600 transition-all shadow-sm"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tooltip com Preview do Card - renderizado via portal */}
        {showPreviewTooltip && tooltipPosition && createPortal(
          <div
            className="fixed z-[99999] animate-fadeIn"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-100%, -50%)',
              pointerEvents: 'none'
            }}
          >
            <div
              className={`card-modern border ${metrica.borderColor} p-5 shadow-2xl`}
              style={{ width: '280px', height: '160px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-neutral-600 font-medium text-base truncate pr-2">
                  {metrica.titulo}
                </span>
                <Icon className={`h-6 w-6 ${metrica.cor} shrink-0`} />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className={`font-bold ${metrica.cor} text-4xl`}>
                  {exampleValue}
                </div>
                <p className="text-neutral-500 text-sm mt-2">
                  {metrica.descricao}
                </p>
              </div>
            </div>
            {/* Arrow */}
            <div
              className="absolute top-1/2 right-0 translate-x-1 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-slate-200 shadow-sm"
            />
          </div>,
          document.body
        )}

        {/* Indicador de ativo */}
        {isActive && (
          <div className="absolute top-1.5 left-1.5 z-10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        )}

        {/* Conteúdo da miniatura */}
        <div className="flex items-center h-full p-3 gap-3">
          {/* Ícone */}
          <div className={`shrink-0 p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-slate-100 group-hover:bg-slate-50'
            }`}>
            <Icon className={`h-5 w-5 ${metrica.cor}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-[11px] text-neutral-500 truncate leading-tight">
              {metrica.titulo}
            </span>
            <span className={`text-lg font-bold ${metrica.cor} leading-tight`}>
              {exampleValue}
            </span>
          </div>
        </div>

        {/* Overlay de hover para remover (quando ativo) */}
        {isActive && (
          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 rounded-lg px-2 py-1 shadow-sm border border-red-200">
              <span className="text-xs text-red-600 font-medium">Clique para remover</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE CARD CREATOR MODAL (CANVAS ESTILO INTERCOM)
// ============================================

interface CardCreatorModalProps {
  onClose: () => void
  onCreate: (card: MetricaConfig) => void
  // Card existente para edição (opcional)
  editCard?: MetricaConfig
}

function CardCreatorModal({ onClose, onCreate, editCard }: CardCreatorModalProps) {
  // Se está editando, usar dados do card existente
  const isEditing = !!editCard

  const [cardName, setCardName] = useState(editCard?.titulo || 'Novo Card')
  const [categoria] = useState<string>(editCard?.categoria || 'performance')

  // Extrair colorScheme do card existente
  const getColorSchemeFromCard = (card?: MetricaConfig): string => {
    if (!card?.canvasConfig?.colorScheme) return 'blue'
    return card.canvasConfig.colorScheme
  }
  const [colorScheme, setColorScheme] = useState(getColorSchemeFromCard(editCard))
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  // Canvas config - grid 12x8 (largura x altura)
  const GRID_COLS = 12
  const GRID_ROWS = 8
  const CELL_SIZE = 40 // pixels por célula

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)



  // Componentes no canvas com posição 2D - usar do card existente ou vazio para novo
  const [components, setComponents] = useState<CanvasComponent[]>(
    editCard?.canvasComponents || []
  )

  // Estado para teste de conexão de dados
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; data?: ChartDataPoint[]; error?: string } | null>(null)

  const colorOptions = [
    { id: 'blue', text: 'text-blue-600', bg: 'bg-blue-100', bgSolid: 'bg-blue-500', border: 'border-blue-200', label: 'Azul' },
    { id: 'emerald', text: 'text-emerald-600', bg: 'bg-emerald-100', bgSolid: 'bg-emerald-500', border: 'border-emerald-200', label: 'Verde' },
    { id: 'amber', text: 'text-amber-600', bg: 'bg-amber-100', bgSolid: 'bg-amber-500', border: 'border-amber-200', label: 'Âmbar' },
    { id: 'rose', text: 'text-rose-600', bg: 'bg-rose-100', bgSolid: 'bg-rose-500', border: 'border-rose-200', label: 'Rosa' },
    { id: 'purple', text: 'text-purple-600', bg: 'bg-purple-100', bgSolid: 'bg-purple-500', border: 'border-purple-200', label: 'Roxo' },
    { id: 'slate', text: 'text-slate-600', bg: 'bg-slate-100', bgSolid: 'bg-slate-500', border: 'border-slate-200', label: 'Cinza' },
    { id: 'cyan', text: 'text-cyan-600', bg: 'bg-cyan-100', bgSolid: 'bg-cyan-500', border: 'border-cyan-200', label: 'Ciano' },
    { id: 'orange', text: 'text-orange-600', bg: 'bg-orange-100', bgSolid: 'bg-orange-500', border: 'border-orange-200', label: 'Laranja' }
  ]

  const currentColor = colorOptions.find(c => c.id === colorScheme) || colorOptions[0]

  // Componentes disponíveis para adicionar
  const availableComponents: { type: CanvasComponentType; label: string; icon: React.ReactNode; category: string }[] = [
    { type: 'title', label: 'Título', icon: <Type className="h-4 w-4" />, category: 'Texto' },
    { type: 'value', label: 'Valor', icon: <Hash className="h-4 w-4" />, category: 'Texto' },
    { type: 'description', label: 'Descrição', icon: <FileText className="h-4 w-4" />, category: 'Texto' },
    { type: 'icon', label: 'Ícone', icon: <Activity className="h-4 w-4" />, category: 'Visual' },
    { type: 'trend', label: 'Tendência', icon: <TrendingUp className="h-4 w-4" />, category: 'Indicadores' },
    { type: 'progress', label: 'Progresso', icon: <Minus className="h-4 w-4" />, category: 'Indicadores' },
    { type: 'badge', label: 'Badge', icon: <Tag className="h-4 w-4" />, category: 'Indicadores' },
    { type: 'recharts-bar', label: 'Barras', icon: <BarChart3 className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-line', label: 'Linha', icon: <LineChart className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-area', label: 'Área', icon: <AreaChart className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-pie', label: 'Pizza', icon: <PieChart className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-radar', label: 'Radar', icon: <Target className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-radial', label: 'Radial', icon: <Activity className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-scatter', label: 'Dispersão', icon: <Activity className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-composed', label: 'Composto', icon: <BarChart3 className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-treemap', label: 'Treemap', icon: <Grid3X3 className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'recharts-funnel', label: 'Funil', icon: <ListCollapse className="h-4 w-4" />, category: 'Gráficos' },
    { type: 'table', label: 'Tabela', icon: <Table2 className="h-4 w-4" />, category: 'Dados' },
    { type: 'divider', label: 'Divisor', icon: <Minus className="h-4 w-4" />, category: 'Layout' },
    { type: 'spacer', label: 'Espaçador', icon: <MoreVertical className="h-4 w-4" />, category: 'Layout' }
  ]

  // Encontrar posição livre no grid
  const findFreePosition = (width: number, height: number): { x: number; y: number } => {
    for (let y = 0; y <= GRID_ROWS - height; y++) {
      for (let x = 0; x <= GRID_COLS - width; x++) {
        const occupied = components.some(c =>
          x < c.x + c.width && x + width > c.x &&
          y < c.y + c.height && y + height > c.y
        )
        if (!occupied) return { x, y }
      }
    }
    return { x: 0, y: 0 } // fallback
  }

  // Tamanhos padrão por tipo de componente
  const getDefaultSize = (type: CanvasComponentType): { width: number; height: number } => {
    switch (type) {
      case 'title': return { width: 6, height: 1 }
      case 'value': return { width: 4, height: 2 }
      case 'description': return { width: 6, height: 1 }
      case 'icon': return { width: 2, height: 2 }
      case 'trend': return { width: 3, height: 1 }
      case 'progress': return { width: 6, height: 1 }
      case 'badge': return { width: 2, height: 1 }
      case 'chart-bar':
      case 'chart-line':
      case 'chart-area': return { width: 6, height: 3 }
      case 'chart-bar-h': return { width: 6, height: 4 }
      case 'chart-pie':
      case 'chart-donut': return { width: 4, height: 4 }
      case 'chart-gauge': return { width: 4, height: 3 }
      case 'chart-heatmap': return { width: 10, height: 5 }
      case 'recharts-bar':
      case 'recharts-line':
      case 'recharts-area':
      case 'recharts-pie':
      case 'recharts-radar':
      case 'recharts-radial':
      case 'recharts-scatter':
      case 'recharts-composed':
      case 'recharts-treemap':
      case 'recharts-funnel': return { width: 12, height: 8 } // Tamanho cheio do canvas
      case 'table': return { width: 8, height: 4 }
      case 'divider': return { width: 12, height: 1 }
      case 'spacer': return { width: 12, height: 1 }
      default: return { width: 4, height: 2 }
    }
  }

  const addComponent = (type: CanvasComponentType) => {
    const newId = `comp-${Date.now()}`
    const defaultProps: Record<string, unknown> = {}
    const defaultSize = getDefaultSize(type)

    switch (type) {
      case 'title': defaultProps.text = 'Novo Título'; break
      case 'value': defaultProps.text = '0'; defaultProps.size = 'xl'; break
      case 'description': defaultProps.text = 'Nova descrição'; break
      case 'icon': defaultProps.iconType = 'activity'; break
      case 'trend': defaultProps.value = '+12%'; defaultProps.direction = 'up'; break
      case 'progress': defaultProps.value = 75; break
      case 'badge': defaultProps.text = 'Novo'; defaultProps.variant = 'success'; break
      case 'chart-bar':
      case 'chart-bar-h':
      case 'chart-line':
      case 'chart-area':
        defaultProps.data = [30, 45, 28, 55, 42, 60, 48]
        defaultProps.labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        break
      case 'chart-pie':
      case 'chart-donut':
        defaultProps.value = 65; break
      case 'chart-gauge':
        defaultProps.value = 72; defaultProps.max = 100; break
      case 'chart-heatmap':
        // Dados: matriz 7x24 (dias x horas)
        defaultProps.data = Array(7).fill(null).map(() => Array(24).fill(null).map(() => Math.floor(Math.random() * 10)))
        defaultProps.rows = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        defaultProps.cols = Array.from({ length: 24 }, (_, i) => i.toString())
        break
      case 'recharts-bar':
      case 'recharts-line':
      case 'recharts-area':
        defaultProps.data = [
          { name: 'Jan', value: 400 },
          { name: 'Fev', value: 300 },
          { name: 'Mar', value: 500 },
          { name: 'Abr', value: 280 },
          { name: 'Mai', value: 590 },
          { name: 'Jun', value: 430 }
        ]
        break
      case 'recharts-pie':
        defaultProps.data = [
          { name: 'Produto A', value: 400, color: '#3b82f6' },
          { name: 'Produto B', value: 300, color: '#8b5cf6' },
          { name: 'Produto C', value: 200, color: '#10b981' },
          { name: 'Produto D', value: 100, color: '#f59e0b' }
        ]
        break
      case 'recharts-radar':
        defaultProps.data = [
          { subject: 'Vendas', A: 120, B: 110, fullMark: 150 },
          { subject: 'Marketing', A: 98, B: 130, fullMark: 150 },
          { subject: 'Tecnologia', A: 86, B: 130, fullMark: 150 },
          { subject: 'Suporte', A: 99, B: 100, fullMark: 150 },
          { subject: 'Operações', A: 85, B: 90, fullMark: 150 },
          { subject: 'RH', A: 65, B: 85, fullMark: 150 }
        ]
        break
      case 'recharts-radial':
        defaultProps.data = [
          { name: 'Meta', value: 100, fill: '#e5e7eb' },
          { name: 'Atual', value: 78, fill: '#3b82f6' }
        ]
        break
      case 'recharts-scatter':
        defaultProps.data = [
          { x: 100, y: 200, z: 200 },
          { x: 120, y: 100, z: 260 },
          { x: 170, y: 300, z: 400 },
          { x: 140, y: 250, z: 280 },
          { x: 150, y: 400, z: 500 },
          { x: 110, y: 280, z: 200 }
        ]
        break
      case 'recharts-composed':
        defaultProps.data = [
          { name: 'Jan', bar: 400, line: 240 },
          { name: 'Fev', bar: 300, line: 139 },
          { name: 'Mar', bar: 500, line: 380 },
          { name: 'Abr', bar: 280, line: 390 },
          { name: 'Mai', bar: 590, line: 480 },
          { name: 'Jun', bar: 430, line: 380 }
        ]
        break
      case 'recharts-treemap':
        defaultProps.data = [
          { name: 'Categoria A', size: 400, color: '#3b82f6' },
          { name: 'Categoria B', size: 300, color: '#8b5cf6' },
          { name: 'Categoria C', size: 200, color: '#10b981' },
          { name: 'Categoria D', size: 150, color: '#f59e0b' },
          { name: 'Categoria E', size: 100, color: '#ef4444' }
        ]
        break
      case 'recharts-funnel':
        defaultProps.data = [
          { name: 'Visitantes', value: 5000, fill: '#3b82f6' },
          { name: 'Leads', value: 3500, fill: '#8b5cf6' },
          { name: 'Qualificados', value: 2000, fill: '#10b981' },
          { name: 'Propostas', value: 1000, fill: '#f59e0b' },
          { name: 'Clientes', value: 500, fill: '#ef4444' }
        ]
        break
      case 'table':
        defaultProps.columns = ['Período', 'Valor']
        defaultProps.rows = [
          ['Semana 1', '120'],
          ['Semana 2', '85'],
          ['Semana 3', '143'],
          ['Semana 4', '98']
        ]
        break
      case 'divider': break
      case 'spacer': defaultProps.height = 16; break
    }

    const position = findFreePosition(defaultSize.width, defaultSize.height)

    setComponents(prev => [...prev, {
      id: newId,
      type,
      x: position.x,
      y: position.y,
      width: defaultSize.width,
      height: defaultSize.height,
      props: defaultProps
    }])
    setSelectedComponentId(newId)
  }

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id))
    if (selectedComponentId === id) setSelectedComponentId(null)
  }

  const updateComponentProps = (id: string, newProps: Record<string, unknown>) => {
    setComponents(prev => prev.map(c =>
      c.id === id ? { ...c, props: { ...c.props, ...newProps } } : c
    ))
  }

  // Converter pixel para grid position
  const pixelToGrid = (px: number, cellSize: number): number => {
    return Math.round(px / cellSize)
  }

  // Handlers de drag
  const handleDragStart = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation()
    const comp = components.find(c => c.id === compId)
    if (!comp || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    setIsDragging(true)
    setSelectedComponentId(compId)
    setDragStart({
      x: e.clientX - rect.left - comp.x * CELL_SIZE,
      y: e.clientY - rect.top - comp.y * CELL_SIZE
    })
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedComponentId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const comp = components.find(c => c.id === selectedComponentId)
    if (!comp) return

    const newX = pixelToGrid(e.clientX - rect.left - dragStart.x, CELL_SIZE)
    const newY = pixelToGrid(e.clientY - rect.top - dragStart.y, CELL_SIZE)

    // Clamp para dentro do grid
    const clampedX = Math.max(0, Math.min(GRID_COLS - comp.width, newX))
    const clampedY = Math.max(0, Math.min(GRID_ROWS - comp.height, newY))

    setComponents(prev => prev.map(c =>
      c.id === selectedComponentId ? { ...c, x: clampedX, y: clampedY } : c
    ))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Handlers de resize
  const handleResizeStart = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation()
    const comp = components.find(c => c.id === compId)
    if (!comp || !canvasRef.current) return

    setIsResizing(true)
    setSelectedComponentId(compId)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: comp.width, y: comp.height })
  }

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !selectedComponentId) return

    const comp = components.find(c => c.id === selectedComponentId)
    if (!comp) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    const newWidth = Math.max(1, Math.min(GRID_COLS - comp.x, dragOffset.x + pixelToGrid(deltaX, CELL_SIZE)))
    const newHeight = Math.max(1, Math.min(GRID_ROWS - comp.y, dragOffset.y + pixelToGrid(deltaY, CELL_SIZE)))

    setComponents(prev => prev.map(c =>
      c.id === selectedComponentId ? { ...c, width: newWidth, height: newHeight } : c
    ))
  }

  // Mouse move handler combinado
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleDragMove(e)
    else if (isResizing) handleResizeMove(e)
  }

  const selectedComponent = components.find(c => c.id === selectedComponentId)

  // Renderizar conteúdo do componente baseado no tipo
  const renderComponentContent = (comp: CanvasComponent) => {
    switch (comp.type) {
      case 'title':
        return (
          <span className="text-neutral-600 font-medium text-sm truncate">
            {comp.props.text as string}
          </span>
        )
      case 'value':
        const sizeClasses: Record<string, string> = {
          sm: 'text-lg',
          md: 'text-xl',
          lg: 'text-2xl',
          xl: 'text-3xl'
        }
        return (
          <span className={`font-bold ${currentColor.text} ${sizeClasses[comp.props.size as string] || 'text-2xl'}`}>
            {comp.props.text as string}
          </span>
        )
      case 'description':
        return (
          <p className="text-neutral-500 text-xs truncate">
            {comp.props.text as string}
          </p>
        )
      case 'icon':
        return (
          <div className={`p-2 rounded-lg ${currentColor.bg} h-full w-full flex items-center justify-center`}>
            <Activity className={`h-6 w-6 ${currentColor.text}`} />
          </div>
        )
      case 'trend':
        const isUp = comp.props.direction === 'up'
        return (
          <div className={`flex items-center gap-1 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="text-sm font-medium">{comp.props.value as string}</span>
          </div>
        )
      case 'progress':
        return (
          <div className="w-full flex flex-col justify-center h-full">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${currentColor.bgSolid} rounded-full transition-all`}
                style={{ width: `${comp.props.value}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 mt-1">{String(comp.props.value)}%</span>
          </div>
        )
      case 'badge':
        const badgeVariants: Record<string, string> = {
          success: 'bg-emerald-100 text-emerald-700',
          warning: 'bg-amber-100 text-amber-700',
          error: 'bg-rose-100 text-rose-700',
          info: 'bg-blue-100 text-blue-700'
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeVariants[comp.props.variant as string] || badgeVariants.info}`}>
            {comp.props.text as string}
          </span>
        )
      case 'chart-bar':
        const barData = comp.props.data as number[]
        const barMax = Math.max(...barData)
        const barGradientId = `bar-grad-${comp.id}`
        return (
          <div className="flex flex-col h-full w-full p-2">
            {/* Eixo Y com labels */}
            <div className="flex-1 flex">
              <div className="flex flex-col justify-between text-[8px] text-slate-400 pr-1 py-1">
                <span>{barMax}</span>
                <span>{Math.round(barMax / 2)}</span>
                <span>0</span>
              </div>
              {/* Barras */}
              <div className="flex-1 flex items-end gap-[3px] relative">
                {/* Grid lines horizontais */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-dashed border-slate-100" />
                  <div className="border-b border-dashed border-slate-100" />
                  <div className="border-b border-slate-200" />
                </div>
                <svg className="absolute" width="0" height="0">
                  <defs>
                    <linearGradient id={barGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>
                {barData.map((v, i) => {
                  const heightPercent = (v / barMax) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end group/bar relative z-10"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {v}
                      </div>
                      <div
                        className={`w-full rounded-t-sm ${currentColor.bgSolid} transition-all duration-300 hover:opacity-90 shadow-sm`}
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: heightPercent > 0 ? '2px' : '0'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Eixo X */}
            <div className="flex mt-1 pl-4">
              {barData.map((_, i) => (
                <div key={i} className="flex-1 text-center text-[8px] text-slate-400">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )
      case 'chart-line':
      case 'chart-area':
        const lineData = comp.props.data as number[]
        const lineMax = Math.max(...lineData)
        const lineMin = Math.min(...lineData)
        const lineRange = lineMax - lineMin || 1
        const padding = 10
        const chartWidth = 100 - padding * 2
        const chartHeight = 100 - padding * 2
        const gradientId = `area-grad-${comp.id}`

        // Criar pontos para curva suave usando Catmull-Rom spline
        const linePoints = lineData.map((v, i) => ({
          x: padding + (i / (lineData.length - 1)) * chartWidth,
          y: padding + (1 - (v - lineMin) / lineRange) * chartHeight
        }))

        // Path com curvas bezier suaves
        const createSmoothPath = (pts: { x: number; y: number }[]) => {
          if (pts.length < 2) return ''
          let path = `M ${pts[0].x} ${pts[0].y}`
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)]
            const p1 = pts[i]
            const p2 = pts[i + 1]
            const p3 = pts[Math.min(pts.length - 1, i + 2)]
            const tension = 0.3
            const cp1x = p1.x + (p2.x - p0.x) * tension
            const cp1y = p1.y + (p2.y - p0.y) * tension
            const cp2x = p2.x - (p3.x - p1.x) * tension
            const cp2y = p2.y - (p3.y - p1.y) * tension
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
          }
          return path
        }

        const smoothPath = createSmoothPath(linePoints)
        const areaPath = smoothPath + ` L ${linePoints[linePoints.length - 1].x} ${100 - padding} L ${padding} ${100 - padding} Z`

        return (
          <div className="w-full h-full p-1 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                </linearGradient>
                <filter id={`shadow-${comp.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Grid lines */}
              <g className="text-slate-200">
                {[0, 25, 50, 75, 100].map(pct => (
                  <line
                    key={pct}
                    x1={padding}
                    y1={padding + (pct / 100) * chartHeight}
                    x2={100 - padding}
                    y2={padding + (pct / 100) * chartHeight}
                    stroke="currentColor"
                    strokeWidth="0.3"
                    strokeDasharray={pct === 100 ? "0" : "2,2"}
                  />
                ))}
              </g>

              {/* Área preenchida */}
              {comp.type === 'chart-area' && (
                <path
                  d={areaPath}
                  className={currentColor.text}
                  fill={`url(#${gradientId})`}
                />
              )}

              {/* Linha principal */}
              <path
                d={smoothPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={currentColor.text}
                filter={`url(#shadow-${comp.id})`}
              />

              {/* Pontos nos dados */}
              {linePoints.map((pt, i) => (
                <g key={i} className="group/point">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    className={`${currentColor.text} fill-white stroke-current`}
                    strokeWidth="1.5"
                  />
                  {/* Ponto hover maior */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6"
                    className="fill-transparent hover:fill-current opacity-0 hover:opacity-20 cursor-pointer transition-opacity"
                  />
                </g>
              ))}
            </svg>

            {/* Labels nos eixos */}
            <div className="absolute left-0 top-1 bottom-1 w-4 flex flex-col justify-between text-[7px] text-slate-400">
              <span>{lineMax}</span>
              <span>{lineMin}</span>
            </div>
          </div>
        )
      case 'chart-pie':
      case 'chart-donut':
        const pieValue = comp.props.value as number
        const isDonut = comp.type === 'chart-donut'
        const pieGradientId = `pie-grad-${comp.id}`
        const radius = 15.915
        const circumference = 2 * Math.PI * radius
        const strokeDasharray = `${(pieValue / 100) * circumference} ${circumference}`

        return (
          <div className="flex items-center justify-center h-full w-full p-2">
            <div className="relative">
              <svg viewBox="0 0 40 40" className="w-full h-full max-w-[100px] max-h-[100px] transform -rotate-90">
                <defs>
                  <linearGradient id={pieGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
                  </linearGradient>
                  <filter id={`pie-shadow-${comp.id}`}>
                    <feDropShadow dx="0" dy="0" stdDeviation="1" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* Track de fundo */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  className="stroke-slate-100"
                  strokeWidth={isDonut ? 4 : 15}
                />

                {/* Arco de progresso */}
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="none"
                  className={currentColor.text}
                  stroke={`url(#${pieGradientId})`}
                  strokeWidth={isDonut ? 4 : 15}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  filter={`url(#pie-shadow-${comp.id})`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />

                {/* Segmentos decorativos para pizza */}
                {!isDonut && pieValue < 100 && (
                  <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="none"
                    className="stroke-slate-200"
                    strokeWidth={15}
                    strokeDasharray={`${((100 - pieValue) / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-((pieValue / 100) * circumference)}
                  />
                )}
              </svg>

              {/* Valor central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-lg font-bold ${currentColor.text}`}>{pieValue}</span>
                  <span className="text-[10px] text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'chart-gauge':
        const gaugeValue = comp.props.value as number
        const gaugeMax = (comp.props.max as number) || 100
        const gaugePercent = (gaugeValue / gaugeMax) * 100
        const gaugeGradientId = `gauge-grad-${comp.id}`

        // Gauge com arco de 180 graus
        const gaugeRadius = 14
        const gaugeCircumference = Math.PI * gaugeRadius // semicírculo
        const gaugeDasharray = `${(gaugePercent / 100) * gaugeCircumference} ${gaugeCircumference}`

        // Cor baseada no valor
        const getGaugeColor = (pct: number) => {
          if (pct >= 80) return 'text-emerald-500'
          if (pct >= 50) return 'text-amber-500'
          return 'text-rose-500'
        }

        return (
          <div className="flex flex-col items-center justify-center h-full w-full p-2">
            <div className="relative w-full max-w-[120px]">
              <svg viewBox="0 0 36 22" className="w-full">
                <defs>
                  <linearGradient id={gaugeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <filter id={`gauge-shadow-${comp.id}`}>
                    <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodOpacity="0.2" />
                  </filter>
                </defs>

                {/* Track de fundo com gradiente */}
                <path
                  d="M 4 18 A 14 14 0 0 1 32 18"
                  fill="none"
                  stroke={`url(#${gaugeGradientId})`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.2"
                />

                {/* Track cinza */}
                <path
                  d="M 4 18 A 14 14 0 0 1 32 18"
                  fill="none"
                  className="stroke-slate-200"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Arco de progresso */}
                <path
                  d="M 4 18 A 14 14 0 0 1 32 18"
                  fill="none"
                  className={comp.props.showGradient ? '' : getGaugeColor(gaugePercent)}
                  stroke={comp.props.showGradient ? `url(#${gaugeGradientId})` : 'currentColor'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={gaugeDasharray}
                  filter={`url(#gauge-shadow-${comp.id})`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />

                {/* Marcadores */}
                <g className="text-slate-300">
                  <line x1="4" y1="18" x2="4" y2="20" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="18" y1="4" x2="18" y2="6" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="32" y1="18" x2="32" y2="20" stroke="currentColor" strokeWidth="0.5" />
                </g>

                {/* Ponteiro */}
                <g transform={`rotate(${-90 + (gaugePercent / 100) * 180}, 18, 18)`}>
                  <line
                    x1="18"
                    y1="18"
                    x2="18"
                    y2="7"
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="18" cy="18" r="2" fill="#334155" />
                </g>
              </svg>

              {/* Labels */}
              <div className="flex justify-between text-[8px] text-slate-400 px-1 -mt-1">
                <span>0</span>
                <span>{gaugeMax}</span>
              </div>
            </div>

            {/* Valor */}
            <div className="text-center mt-1">
              <span className={`text-xl font-bold ${getGaugeColor(gaugePercent)}`}>{gaugeValue}</span>
              <span className="text-xs text-slate-400 ml-0.5">/ {gaugeMax}</span>
            </div>
          </div>
        )
      case 'chart-bar-h':
        // Gráfico de barras horizontais estilo Intercom
        const barHData = comp.props.data as number[]
        const barHLabels = (comp.props.labels as string[]) || barHData.map((_, i) => `Item ${i + 1}`)
        const barHMax = Math.max(...barHData)
        return (
          <div className="flex flex-col w-full h-full p-2 gap-1">
            {barHData.map((v, i) => {
              const widthPct = (v / barHMax) * 100
              return (
                <div key={i} className="flex items-center gap-2 flex-1 min-h-0">
                  <span className="text-[10px] text-slate-500 w-10 text-right truncate">{barHLabels[i]}</span>
                  <div className="flex-1 h-full flex items-center">
                    <div
                      className={`h-[70%] rounded-r ${currentColor.bgSolid} transition-all relative group/bar`}
                      style={{ width: `${widthPct}%`, minWidth: v > 0 ? '4px' : '0' }}
                    >
                      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-medium text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {v}
                      </span>
                    </div>
                    <span className="ml-2 text-[10px] font-medium text-slate-600">{v}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      case 'chart-heatmap':
        // Heatmap estilo Intercom (dia da semana x hora)
        const heatmapData = comp.props.data as number[][]
        const heatmapRows = (comp.props.rows as string[]) || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        const heatmapMax = Math.max(...heatmapData.flat())

        // Função para cor baseada no valor
        const getHeatColor = (val: number) => {
          if (heatmapMax === 0) return 'bg-slate-100'
          const intensity = val / heatmapMax
          if (intensity === 0) return 'bg-blue-50'
          if (intensity < 0.25) return 'bg-blue-100'
          if (intensity < 0.5) return 'bg-blue-200'
          if (intensity < 0.75) return 'bg-blue-400'
          return 'bg-blue-600'
        }

        return (
          <div className="flex flex-col w-full h-full p-2">
            {/* Header com horas (apenas alguns) */}
            <div className="flex mb-1">
              <div className="w-8" />
              <div className="flex-1 flex">
                {[0, 6, 12, 18, 23].map(h => (
                  <div key={h} className="text-[7px] text-slate-400" style={{ width: `${100 / 24}%`, marginLeft: h === 0 ? 0 : `${(h - (h === 6 ? 0 : h === 12 ? 6 : h === 18 ? 12 : 18)) * (100 / 24)}%` }}>
                    {h}
                  </div>
                ))}
              </div>
            </div>
            {/* Grid */}
            <div className="flex-1 flex flex-col gap-[2px]">
              {heatmapData.map((row, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-1 flex-1 min-h-0">
                  <span className="text-[8px] text-slate-500 w-7 text-right">{heatmapRows[rowIdx]}</span>
                  <div className="flex-1 flex gap-[1px] h-full">
                    {row.map((val, colIdx) => (
                      <div
                        key={colIdx}
                        className={`flex-1 rounded-[2px] ${getHeatColor(val)} flex items-center justify-center group/cell relative`}
                        title={`${heatmapRows[rowIdx]} ${colIdx}h: ${val}`}
                      >
                        {val > 0 && heatmapData[0].length <= 12 && (
                          <span className="text-[7px] font-medium text-slate-700 opacity-0 group-hover/cell:opacity-100">
                            {val}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Legenda */}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[7px] text-slate-400">0</span>
              <div className="flex gap-[1px]">
                {['bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600'].map((c, i) => (
                  <div key={i} className={`w-3 h-2 rounded-[1px] ${c}`} />
                ))}
              </div>
              <span className="text-[7px] text-slate-400">{heatmapMax}</span>
            </div>
          </div>
        )
      case 'recharts-bar': {
        const rechartsBarData = (comp.props.data as Array<{ name: string; value: number }>) || []
        const barColors = (comp.props.chartColors as string[]) || ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const showLegend = comp.props.showLegend !== false
        const showTooltip = comp.props.showTooltip !== false
        const showGrid = comp.props.showGrid !== false

        if (!rechartsBarData || rechartsBarData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsBarChart data={rechartsBarData} margin={{ top: 5, right: 10, left: -10, bottom: showLegend ? 10 : 5 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                {showTooltip && (
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
                    labelFormatter={(label) => `📊 ${label}`}
                  />
                )}
                {showLegend && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="circle"
                    iconSize={6}
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
                <RechartsBar dataKey="value" name="Valor" radius={[4, 4, 0, 0]} animationDuration={0} animationEasing="ease-out">
                  {rechartsBarData.map((_, index) => (
                    <RechartsCell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </RechartsBar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-line': {
        const rechartsLineData = (comp.props.data as Array<{ name: string; value: number }>) || []
        const lineColor = (comp.props.primaryColor as string) || '#8b5cf6'
        const showLegendLine = comp.props.showLegend !== false
        const showTooltipLine = comp.props.showTooltip !== false
        const showGridLine = comp.props.showGrid !== false

        if (!rechartsLineData || rechartsLineData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsLineChart data={rechartsLineData} margin={{ top: 5, right: 10, left: -10, bottom: showLegendLine ? 10 : 5 }}>
                {showGridLine && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                {showTooltipLine && (
                  <RechartsTooltip
                    cursor={{ stroke: lineColor, strokeDasharray: '5 5' }}
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
                    labelFormatter={(label) => `📈 ${label}`}
                  />
                )}
                {showLegendLine && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="line"
                    iconSize={10}
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
                <RechartsLine
                  type="monotone"
                  dataKey="value"
                  name="Valor"
                  stroke={lineColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={0}
                  animationEasing="ease-out"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-area': {
        const rechartsAreaData = (comp.props.data as Array<{ name: string; value: number }>) || []
        const areaColor = (comp.props.primaryColor as string) || '#10b981'
        const showLegendArea = comp.props.showLegend !== false
        const showTooltipArea = comp.props.showTooltip !== false
        const showGridArea = comp.props.showGrid !== false

        if (!rechartsAreaData || rechartsAreaData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsAreaChart data={rechartsAreaData} margin={{ top: 5, right: 10, left: -10, bottom: showLegendArea ? 10 : 5 }}>
                <defs>
                  <linearGradient id={`areaGrad-${comp.id}-${areaColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={areaColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={areaColor} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                {showGridArea && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} stroke="#e5e7eb" axisLine={false} tickLine={false} tickFormatter={(value) => value.toLocaleString()} />
                {showTooltipArea && (
                  <RechartsTooltip
                    cursor={{ stroke: areaColor, strokeDasharray: '5 5' }}
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
                    labelFormatter={(label) => `📉 ${label}`}
                  />
                )}
                {showLegendArea && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="rect"
                    iconSize={8}
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
                <RechartsArea
                  type="monotone"
                  dataKey="value"
                  name="Valor"
                  stroke={areaColor}
                  fill={`url(#areaGrad-${comp.id}-${areaColor.replace('#', '')})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: areaColor, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5, fill: areaColor, stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={0}
                  animationEasing="ease-out"
                />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-pie': {
        const rechartsPieData = (comp.props.data as Array<{ name: string; value: number }>) || []
        const defaultPieColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const pieColors = (comp.props.chartColors as string[]) || defaultPieColors
        const showLegendPie = comp.props.showLegend !== false
        const showTooltipPie = comp.props.showTooltip !== false

        if (!rechartsPieData || rechartsPieData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsPieChart margin={{ top: 0, right: 5, bottom: showLegendPie ? 10 : 0, left: 5 }}>
                <RechartsPie
                  data={rechartsPieData}
                  cx="50%"
                  cy={showLegendPie ? "45%" : "50%"}
                  innerRadius="35%"
                  outerRadius="70%"
                  paddingAngle={3}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  animationDuration={0}
                  animationEasing="ease-out"
                >
                  {rechartsPieData.map((_, index) => {
                    const cellColor = pieColors[index] || defaultPieColors[index % defaultPieColors.length]
                    return (
                      <RechartsCell
                        key={`pie-cell-${index}`}
                        fill={cellColor}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                  })}
                </RechartsPie>
                {showTooltipPie && (
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', padding: '8px 12px' }}
                    formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]}
                  />
                )}
                {showLegendPie && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="circle"
                    iconSize={6}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-radar': {
        const radarData = (comp.props.data as Array<{ subject: string; A: number; B: number; fullMark: number }>) || []
        const colorA = (comp.props.colorA as string) || '#3b82f6'
        const colorB = (comp.props.colorB as string) || '#8b5cf6'
        const showLegendRadar = comp.props.showLegend !== false
        const showTooltipRadar = comp.props.showTooltip !== false

        if (!radarData || radarData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData} margin={{ top: 0, right: 5, bottom: showLegendRadar ? 10 : 0, left: 5 }}>
                <defs>
                  <linearGradient id={`radarGradA-${comp.id}-${colorA.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorA} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={colorA} stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id={`radarGradB-${comp.id}-${colorB.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorB} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={colorB} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 8, fill: '#6b7280' }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  tick={{ fontSize: 7, fill: '#9ca3af' }}
                  axisLine={false}
                  tickCount={5}
                />
                <RechartsRadar
                  name="Série A"
                  dataKey="A"
                  stroke={colorA}
                  fill={`url(#radarGradA-${comp.id}-${colorA.replace('#', '')})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colorA }}
                  animationDuration={0}
                />
                <RechartsRadar
                  name="Série B"
                  dataKey="B"
                  stroke={colorB}
                  fill={`url(#radarGradB-${comp.id}-${colorB.replace('#', '')})`}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colorB }}
                  animationDuration={0}
                />
                {showTooltipRadar && (
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }}
                  />
                )}
                {showLegendRadar && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="circle"
                    iconSize={6}
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
              </RechartsRadarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-radial': {
        const radialData = (comp.props.data as Array<{ name: string; value: number; fill: string }>) || []
        const defaultRadialColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const radialColors = (comp.props.chartColors as string[]) || defaultRadialColors
        const showLegendRadial = comp.props.showLegend !== false
        const showTooltipRadial = comp.props.showTooltip !== false

        if (!radialData || radialData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        // Map colors to data
        const radialDataWithColors = radialData.map((item, index) => ({
          ...item,
          fill: radialColors[index] || defaultRadialColors[index % defaultRadialColors.length]
        }))
        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsRadialBarChart
                cx="50%"
                cy={showLegendRadial ? "50%" : "55%"}
                innerRadius="25%"
                outerRadius="85%"
                barSize={18}
                data={radialDataWithColors}
                startAngle={180}
                endAngle={0}
              >
                <RechartsRadialBar
                  background={{ fill: '#f1f5f9' }}
                  dataKey="value"
                  cornerRadius={15}
                  animationDuration={0}
                  animationEasing="ease-out"
                />
                {showTooltipRadial && (
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }}
                  />
                )}
                {showLegendRadial && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="circle"
                    iconSize={6}
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                  />
                )}
              </RechartsRadialBarChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-scatter': {
        const scatterData = (comp.props.data as Array<{ x: number; y: number; z: number }>) || []
        const scatterColor = (comp.props.primaryColor as string) || '#8b5cf6'
        const showLegendScatter = comp.props.showLegend !== false
        const showTooltipScatter = comp.props.showTooltip !== false
        const showGridScatter = comp.props.showGrid !== false

        if (!scatterData || scatterData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsScatterChart margin={{ top: 5, right: 10, bottom: showLegendScatter ? 10 : 5, left: 0 }}>
                <defs>
                  <linearGradient id={`scatterGrad-${comp.id}-${scatterColor.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={scatterColor} stopOpacity={1} />
                    <stop offset="100%" stopColor={scatterColor} stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                {showGridScatter && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                <XAxis
                  type="number"
                  dataKey="x"
                  name="X"
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Y"
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                  axisLine={false}
                  tickLine={false}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Tamanho" />
                {showTooltipScatter && (
                  <RechartsTooltip
                    cursor={{ strokeDasharray: '3 3', stroke: scatterColor }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }}
                  />
                )}
                {showLegendScatter && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconType="circle"
                    iconSize={6}
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
                <RechartsScatter
                  name="Dados"
                  data={scatterData}
                  fill={`url(#scatterGrad-${comp.id}-${scatterColor.replace('#', '')})`}
                  animationDuration={0}
                />
              </RechartsScatterChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-composed': {
        const composedData = (comp.props.data as Array<{ name: string; bar: number; line: number }>) || []
        const composedBarColor = (comp.props.barColor as string) || '#3b82f6'
        const composedLineColor = (comp.props.lineColor as string) || '#ef4444'
        const showLegendComposed = comp.props.showLegend !== false
        const showTooltipComposed = comp.props.showTooltip !== false
        const showGridComposed = comp.props.showGrid !== false

        if (!composedData || composedData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsComposedChart data={composedData} margin={{ top: 5, right: 10, left: -10, bottom: showLegendComposed ? 10 : 5 }}>
                <defs>
                  <linearGradient id={`composedBarGrad-${comp.id}-${composedBarColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={composedBarColor} stopOpacity={1} />
                    <stop offset="100%" stopColor={composedBarColor} stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                {showGridComposed && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  stroke="#e5e7eb"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                {showTooltipComposed && (
                  <RechartsTooltip
                    cursor={{ fill: `${composedBarColor}20` }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }}
                  />
                )}
                {showLegendComposed && (
                  <RechartsLegend
                    wrapperStyle={{ fontSize: '8px', paddingTop: '0px' }}
                    iconSize={8}
                    verticalAlign="bottom"
                    align="center"
                  />
                )}
                <RechartsBar
                  dataKey="bar"
                  name="Barras"
                  fill={`url(#composedBarGrad-${comp.id}-${composedBarColor.replace('#', '')})`}
                  radius={[4, 4, 0, 0]}
                  animationDuration={0}
                />
                <RechartsLine
                  type="monotone"
                  dataKey="line"
                  name="Linha"
                  stroke={composedLineColor}
                  strokeWidth={3}
                  dot={{ r: 4, fill: composedLineColor, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  animationDuration={0}
                />
              </RechartsComposedChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-treemap': {
        const treemapData = (comp.props.data as Array<{ name: string; size: number; color: string }>) || []
        const defaultTreemapColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const treemapColors = (comp.props.chartColors as string[]) || defaultTreemapColors

        if (!treemapData || treemapData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        // Map colors to data
        const treemapDataWithColors = treemapData.map((item, index) => ({
          ...item,
          color: treemapColors[index] || defaultTreemapColors[index % defaultTreemapColors.length]
        }))
        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsTreemap
                data={treemapDataWithColors}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                animationDuration={0}
                content={<CustomTreemapContent2 treemapColors={treemapColors} />}
              />
            </ResponsiveContainer>
          </div>
        )
      }
      case 'recharts-funnel': {
        const funnelData = (comp.props.data as Array<{ name: string; value: number; fill: string }>) || []
        const defaultFunnelColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
        const funnelColors = (comp.props.chartColors as string[]) || defaultFunnelColors
        const showTooltipFunnel = comp.props.showTooltip !== false

        if (!funnelData || funnelData.length === 0) {
          return (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              Sem dados
            </div>
          )
        }

        // Map colors to data
        const funnelDataWithColors = funnelData.map((item, index) => ({
          ...item,
          fill: funnelColors[index] || defaultFunnelColors[index % defaultFunnelColors.length]
        }))
        return (
          <div className="w-full h-full p-1" style={{ minWidth: 100, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={80}>
              <RechartsFunnelChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                {showTooltipFunnel && (
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }}
                  />
                )}
                <RechartsFunnel
                  dataKey="value"
                  data={funnelDataWithColors}
                  isAnimationActive={false}
                  animationDuration={0}
                  animationEasing="ease-out"
                >
                  <LabelList
                    position="right"
                    fill="#374151"
                    stroke="none"
                    fontSize={9}
                    dataKey="name"
                    formatter={(value: string) => value}
                  />
                  <LabelList
                    position="center"
                    fill="#fff"
                    stroke="none"
                    fontSize={11}
                    fontWeight="bold"
                    dataKey="value"
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </RechartsFunnel>
              </RechartsFunnelChart>
            </ResponsiveContainer>
          </div>
        )
      }
      case 'table':
        // Tabela estilo Intercom
        const tableColumns = (comp.props.columns as string[]) || ['Coluna 1', 'Coluna 2']
        const tableRows = (comp.props.rows as string[][]) || [['Linha 1', 'Valor 1']]
        return (
          <div className="flex flex-col w-full h-full p-2 overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-slate-200 pb-1 mb-1">
              {tableColumns.map((col, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-medium text-slate-600 ${i === 0 ? 'flex-1 text-left' : 'w-20 text-right'}`}
                >
                  {col}
                </div>
              ))}
            </div>
            {/* Rows */}
            <div className="flex-1 overflow-auto">
              {tableRows.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex py-1 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                >
                  {row.map((cell, cellIdx) => (
                    <div
                      key={cellIdx}
                      className={`text-[10px] ${cellIdx === 0 ? 'flex-1 text-left text-slate-700' : 'w-20 text-right font-medium text-slate-900'}`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      case 'divider':
        return <div className="w-full h-px bg-slate-200 my-auto" />
      case 'spacer':
        return <div className="w-full h-full" />
      default:
        return null
    }
  }

  // Renderizar componente no canvas 2D
  const renderCanvasComponent = (comp: CanvasComponent) => {
    const isSelected = selectedComponentId === comp.id

    return (
      <div
        key={comp.id}
        className={`absolute group rounded-lg border-2 transition-all overflow-hidden ${isSelected
          ? 'border-primary shadow-lg shadow-primary/20 z-20'
          : 'border-transparent hover:border-slate-300 z-10'
          } ${isDragging && selectedComponentId === comp.id ? 'cursor-grabbing opacity-90' : 'cursor-grab'}`}
        style={{
          left: comp.x * CELL_SIZE,
          top: comp.y * CELL_SIZE,
          width: comp.width * CELL_SIZE - 4,
          height: comp.height * CELL_SIZE - 4,
          backgroundColor: 'white'
        }}
        onMouseDown={(e) => handleDragStart(e, comp.id)}
        onClick={(e) => { e.stopPropagation(); setSelectedComponentId(comp.id) }}
      >
        {/* Conteúdo do componente */}
        <div className="w-full h-full p-2 flex items-center justify-center overflow-hidden">
          {renderComponentContent(comp)}
        </div>

        {/* Handle de resize no canto inferior direito */}
        {isSelected && (
          <>
            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); removeComponent(comp.id) }}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-30"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Resize handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-30 flex items-center justify-center"
              onMouseDown={(e) => handleResizeStart(e, comp.id)}
            >
              <div className="w-2 h-2 border-r-2 border-b-2 border-primary rounded-br" />
            </div>

            {/* Size indicator */}
            <div className="absolute bottom-1 left-1 px-1 py-0.5 text-[9px] font-mono bg-slate-900/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {comp.width}x{comp.height}
            </div>
          </>
        )}
      </div>
    )
  }

  // Renderizar painel de propriedades do componente selecionado
  const renderPropertiesPanel = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center py-8 text-slate-400">
          <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Selecione um componente para editar</p>
        </div>
      )
    }

    const { type, props } = selectedComponent

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            {availableComponents.find(c => c.type === type)?.label || type}
          </span>
          <button
            onClick={() => removeComponent(selectedComponent.id)}
            className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Campos específicos por tipo */}
        {(type === 'title' || type === 'value' || type === 'description') && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Texto</label>
            <input
              type="text"
              value={props.text as string}
              onChange={(e) => updateComponentProps(selectedComponent.id, { text: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
            />
          </div>
        )}

        {type === 'value' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tamanho</label>
            <div className="flex gap-1">
              {['sm', 'md', 'lg', 'xl'].map(size => (
                <button
                  key={size}
                  onClick={() => updateComponentProps(selectedComponent.id, { size })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${props.size === size
                    ? 'bg-primary text-white border-primary'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'trend' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor</label>
              <input
                type="text"
                value={props.value as string}
                onChange={(e) => updateComponentProps(selectedComponent.id, { value: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Direção</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, { direction: 'up' })}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border transition-all ${props.direction === 'up' ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'border-slate-200'
                    }`}
                >
                  <TrendingUp className="h-3 w-3" /> Subindo
                </button>
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, { direction: 'down' })}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border transition-all ${props.direction === 'down' ? 'bg-rose-100 border-rose-300 text-rose-700' : 'border-slate-200'
                    }`}
                >
                  <TrendingDown className="h-3 w-3" /> Caindo
                </button>
              </div>
            </div>
          </>
        )}

        {(type === 'progress' || type === 'chart-pie' || type === 'chart-donut' || type === 'chart-gauge') && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Valor ({String(props.value)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={props.value as number}
              onChange={(e) => updateComponentProps(selectedComponent.id, { value: parseInt(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        )}

        {/* Opções específicas para gráficos de barras/linha/área */}
        {(type === 'chart-bar' || type === 'chart-line' || type === 'chart-area') && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dados (separados por vírgula)</label>
              <input
                type="text"
                value={(props.data as number[]).join(', ')}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => parseInt(v.trim()) || 0)
                  updateComponentProps(selectedComponent.id, { data: values })
                }}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none font-mono"
                placeholder="30, 45, 28, 55, 42"
              />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => updateComponentProps(selectedComponent.id, { data: [30, 45, 28, 55, 42, 60, 48] })}
                className="py-1.5 text-[10px] rounded border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                Padrão
              </button>
              <button
                onClick={() => updateComponentProps(selectedComponent.id, { data: [10, 25, 40, 55, 70, 85, 100] })}
                className="py-1.5 text-[10px] rounded border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                Crescente
              </button>
              <button
                onClick={() => updateComponentProps(selectedComponent.id, { data: [100, 85, 70, 55, 40, 25, 10] })}
                className="py-1.5 text-[10px] rounded border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                Decrescente
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={() => {
                  const random = Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 20)
                  updateComponentProps(selectedComponent.id, { data: random })
                }}
                className="py-1.5 text-[10px] rounded border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                Aleatório
              </button>
              <button
                onClick={() => updateComponentProps(selectedComponent.id, { data: [45, 52, 38, 65, 48, 72, 55, 80, 62, 90] })}
                className="py-1.5 text-[10px] rounded border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                + Pontos
              </button>
            </div>
          </>
        )}

        {/* Opções específicas para gauge */}
        {type === 'chart-gauge' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor máximo ({String(props.max || 100)})
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={(props.max as number) || 100}
                onChange={(e) => updateComponentProps(selectedComponent.id, { max: parseInt(e.target.value) || 100 })}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!props.showGradient}
                  onChange={(e) => updateComponentProps(selectedComponent.id, { showGradient: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                Usar gradiente colorido
              </label>
            </div>
          </>
        )}

        {type === 'badge' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Texto</label>
              <input
                type="text"
                value={props.text as string}
                onChange={(e) => updateComponentProps(selectedComponent.id, { text: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Variante</label>
              <div className="grid grid-cols-4 gap-1">
                {['success', 'warning', 'error', 'info'].map(v => (
                  <button
                    key={v}
                    onClick={() => updateComponentProps(selectedComponent.id, { variant: v })}
                    className={`py-1 text-xs rounded border ${props.variant === v ? 'ring-2 ring-primary ring-offset-1' : ''
                      } ${v === 'success' ? 'bg-emerald-100 text-emerald-700' :
                        v === 'warning' ? 'bg-amber-100 text-amber-700' :
                          v === 'error' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                      }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'spacer' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Altura ({String(props.height)}px)
            </label>
            <input
              type="range"
              min="4"
              max="48"
              value={props.height as number}
              onChange={(e) => updateComponentProps(selectedComponent.id, { height: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        {/* === RECHARTS PROPERTIES === */}
        {type.startsWith('recharts-') && (
          <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Configurações do Gráfico</span>
            </div>

            {/* Toggle Legenda */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 cursor-pointer">
                <span>Mostrar Legenda</span>
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, { showLegend: props.showLegend === false ? true : false })}
                  className={`w-10 h-5 rounded-full transition-all ${props.showLegend !== false ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${props.showLegend !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
            </div>

            {/* Toggle Tooltip */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 cursor-pointer">
                <span>Mostrar Tooltip</span>
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, { showTooltip: props.showTooltip === false ? true : false })}
                  className={`w-10 h-5 rounded-full transition-all ${props.showTooltip !== false ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${props.showTooltip !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
            </div>

            {/* Toggle Grid - só para gráficos com grade */}
            {(type === 'recharts-bar' || type === 'recharts-line' || type === 'recharts-area' || type === 'recharts-scatter' || type === 'recharts-composed') && (
              <div>
                <label className="flex items-center justify-between text-xs font-medium text-slate-600 cursor-pointer">
                  <span>Mostrar Grade</span>
                  <button
                    onClick={() => updateComponentProps(selectedComponent.id, { showGrid: props.showGrid === false ? true : false })}
                    className={`w-10 h-5 rounded-full transition-all ${props.showGrid !== false ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${props.showGrid !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>
            )}

            {/* Cores por Segmento - Bar, Pie, Radial, Treemap, Funnel */}
            {(type === 'recharts-bar' || type === 'recharts-pie' || type === 'recharts-radial' || type === 'recharts-treemap' || type === 'recharts-funnel') && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Cores dos Segmentos</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(() => {
                    const chartData = (props.data as Array<{ name: string; value?: number; size?: number }>) || []
                    const defaultColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
                    const currentColors = (props.chartColors as string[]) || defaultColors

                    if (chartData.length === 0) {
                      return <p className="text-xs text-slate-400 italic">Nenhum dado para colorir</p>
                    }

                    return chartData.map((item, index) => {
                      const itemColor = currentColors[index] || defaultColors[index % defaultColors.length]
                      const itemValue = item.value ?? item.size ?? 0
                      return (
                        <div key={`color-${index}`} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <label className="relative cursor-pointer group">
                            <div
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
                              style={{ backgroundColor: itemColor }}
                            />
                            <input
                              type="color"
                              defaultValue={itemColor}
                              onInput={(e) => {
                                const newColors = [...(currentColors.length >= chartData.length ? currentColors : defaultColors.slice(0, chartData.length))]
                                newColors[index] = e.currentTarget.value
                                updateComponentProps(selectedComponent.id, { chartColors: newColors })
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </label>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-700 truncate block">{item.name || `Item ${index + 1}`}</span>
                            <span className="text-[10px] text-slate-400">{itemValue.toLocaleString('pt-BR')}</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">{itemColor}</span>
                        </div>
                      )
                    })
                  })()}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Clique no círculo para escolher a cor</p>
              </div>
            )}

            {/* Cor Principal - Line, Area, Scatter */}
            {(type === 'recharts-line' || type === 'recharts-area' || type === 'recharts-scatter') && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Cor da Série</label>
                <div className="flex items-center gap-3">
                  <label className="relative cursor-pointer group">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: (props.primaryColor as string) || '#3b82f6' }}
                    />
                    <input
                      type="color"
                      defaultValue={(props.primaryColor as string) || '#3b82f6'}
                      onInput={(e) => {
                        updateComponentProps(selectedComponent.id, { primaryColor: e.currentTarget.value })
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                  <div>
                    <span className="text-xs font-medium text-slate-700 block">Cor da série</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{(props.primaryColor as string) || '#3b82f6'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2 Cores - Radar (Série A e B) */}
            {type === 'recharts-radar' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Cores das Séries</label>
                <div className="space-y-2">
                  {[
                    { key: 'colorA', label: 'Série A', default: '#3b82f6' },
                    { key: 'colorB', label: 'Série B', default: '#8b5cf6' }
                  ].map(serie => (
                    <div key={serie.key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <label className="relative cursor-pointer group">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
                          style={{ backgroundColor: (props[serie.key] as string) || serie.default }}
                        />
                        <input
                          type="color"
                          defaultValue={(props[serie.key] as string) || serie.default}
                          onInput={(e) => {
                            updateComponentProps(selectedComponent.id, { [serie.key]: e.currentTarget.value })
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-slate-700">{serie.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{(props[serie.key] as string) || serie.default}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2 Cores - Composed (Barras e Linha) */}
            {type === 'recharts-composed' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Cores do Gráfico</label>
                <div className="space-y-2">
                  {[
                    { key: 'barColor', label: 'Barras', default: '#3b82f6' },
                    { key: 'lineColor', label: 'Linha', default: '#ef4444' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <label className="relative cursor-pointer group">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110"
                          style={{ backgroundColor: (props[item.key] as string) || item.default }}
                        />
                        <input
                          type="color"
                          defaultValue={(props[item.key] as string) || item.default}
                          onInput={(e) => {
                            updateComponentProps(selectedComponent.id, { [item.key]: e.currentTarget.value })
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{(props[item.key] as string) || item.default}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Presets de Dados */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Dados de Exemplo</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, {
                    data: [
                      { name: 'Jan', value: 400 },
                      { name: 'Fev', value: 300 },
                      { name: 'Mar', value: 500 },
                      { name: 'Abr', value: 280 },
                      { name: 'Mai', value: 590 },
                      { name: 'Jun', value: 430 }
                    ]
                  })}
                  className="py-2 text-[10px] font-medium rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  Vendas Mensal
                </button>
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, {
                    data: [
                      { name: 'Seg', value: 120 },
                      { name: 'Ter', value: 180 },
                      { name: 'Qua', value: 150 },
                      { name: 'Qui', value: 210 },
                      { name: 'Sex', value: 190 },
                      { name: 'Sáb', value: 80 },
                      { name: 'Dom', value: 60 }
                    ]
                  })}
                  className="py-2 text-[10px] font-medium rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  Semanal
                </button>
                <button
                  onClick={() => updateComponentProps(selectedComponent.id, {
                    data: [
                      { name: 'Q1', value: 2400 },
                      { name: 'Q2', value: 3200 },
                      { name: 'Q3', value: 2800 },
                      { name: 'Q4', value: 3600 }
                    ]
                  })}
                  className="py-2 text-[10px] font-medium rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  Trimestral
                </button>
                <button
                  onClick={() => {
                    const random = Array.from({ length: 8 }, (_, i) => ({
                      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'][i],
                      value: Math.floor(Math.random() * 500) + 100
                    }))
                    updateComponentProps(selectedComponent.id, { data: random })
                  }}
                  className="py-2 text-[10px] font-medium rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  Aleatório
                </button>
              </div>
            </div>

            {/* Animação */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Duração da Animação: {(props.animationDuration as number) || 800}ms
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={(props.animationDuration as number) || 800}
                onChange={(e) => updateComponentProps(selectedComponent.id, { animationDuration: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Sem animação</span>
                <span>2s</span>
              </div>
            </div>
          </div>
        )}

        {/* === DATA SOURCE - Para componentes de gráfico e tabela === */}
        {(type.startsWith('chart-') || type === 'table') && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Fonte de Dados</span>
            </div>

            {/* Tipo de fonte */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { type: 'static', label: 'Manual', icon: <Hash className="h-3 w-3" /> },
                  { type: 'mock', label: 'Mock', icon: <Database className="h-3 w-3" /> },
                  { type: 'api', label: 'API', icon: <Globe className="h-3 w-3" /> },
                  { type: 'sql', label: 'SQL', icon: <Code className="h-3 w-3" /> }
                ].map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      const newDataSource: DataSourceConfig = {
                        type: opt.type as DataSourceType,
                        ...(opt.type === 'api' && { endpoint: '', method: 'GET' as const }),
                        ...(opt.type === 'sql' && { query: '', connection: 'default' }),
                        mapping: { labels: '', values: '' },
                        refreshInterval: 0
                      }
                      setComponents(prev => prev.map(c =>
                        c.id === selectedComponent.id ? { ...c, dataSource: newDataSource } : c
                      ))
                    }}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium rounded-lg border transition-all ${(selectedComponent.dataSource?.type || 'static') === opt.type
                      ? 'bg-primary text-white border-primary'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuração para MOCK DATA */}
            {selectedComponent.dataSource?.type === 'mock' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dataset de Exemplo</label>
                  <select
                    value={(selectedComponent.props.mockDatasetId as string) || ''}
                    onChange={(e) => {
                      const dataset = getMockDataset(e.target.value)
                      if (dataset) {
                        const chartData = dataset.data.map(d => d.value)
                        const chartLabels = dataset.data.map(d => d.label)
                        updateComponentProps(selectedComponent.id, {
                          mockDatasetId: e.target.value,
                          data: chartData,
                          labels: chartLabels
                        })
                        setTestResult({ success: true, data: dataset.data })
                      }
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  >
                    <option value="">Selecione um dataset...</option>
                    <optgroup label="Vendas">
                      {getMockDatasetsByCategory('vendas').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Usuários">
                      {getMockDatasetsByCategory('usuarios').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Métricas">
                      {getMockDatasetsByCategory('metricas').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Temporal">
                      {getMockDatasetsByCategory('temporal').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Categorias">
                      {getMockDatasetsByCategory('categorias').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Preview do dataset selecionado */}
                {(selectedComponent.props as any).mockDatasetId && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-1 text-emerald-700 font-medium text-xs mb-1">
                      <CheckCircle className="h-3 w-3" />
                      {(getMockDataset((selectedComponent.props as any).mockDatasetId as string) as any)?.name}
                    </div>
                    <p className="text-[10px] text-emerald-600 mb-2">
                      {(getMockDataset((selectedComponent.props as any).mockDatasetId as string) as any)?.description}
                    </p>
                    <div className="max-h-20 overflow-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-left text-emerald-600">
                            <th className="pr-2">Label</th>
                            <th>Valor</th>
                          </tr>
                        </thead>
                        <tbody className="text-emerald-800">
                          {(getMockDataset((selectedComponent.props as any).mockDatasetId as string) as any)?.data?.slice(0, 5).map((d: any, i: number) => (
                            <tr key={i}>
                              <td className="pr-2 text-emerald-999">{d.label}</td>
                              <td>{d.value?.toLocaleString() || '0'}</td>
                            </tr>
                          ))}
                          {((getMockDataset((selectedComponent.props as any).mockDatasetId as string) as any)?.data?.length || 0) > 5 && (
                            <tr className="text-emerald-500 italic">
                              <td colSpan={2}>...e mais {((getMockDataset((selectedComponent.props as any).mockDatasetId as string) as any)?.data?.length || 0) - 5} registros</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 italic">
                  Dados mockados para desenvolvimento. Substitua por API/SQL em produção.
                </p>
              </div>
            )}

            {/* Configuração para API */}
            {selectedComponent.dataSource?.type === 'api' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Endpoint URL</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={selectedComponent.dataSource.endpoint || ''}
                      onChange={(e) => {
                        setComponents(prev => prev.map(c =>
                          c.id === selectedComponent.id
                            ? { ...c, dataSource: { ...c.dataSource!, endpoint: e.target.value } }
                            : c
                        ))
                      }}
                      placeholder="https://api.exemplo.com/data"
                      className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Método</label>
                  <div className="flex gap-1">
                    {['GET', 'POST'].map(method => (
                      <button
                        key={method}
                        onClick={() => {
                          setComponents(prev => prev.map(c =>
                            c.id === selectedComponent.id
                              ? { ...c, dataSource: { ...c.dataSource!, method: method as 'GET' | 'POST' } }
                              : c
                          ))
                        }}
                        className={`flex-1 py-1 text-xs font-medium rounded border transition-all ${selectedComponent.dataSource?.method === method
                          ? 'bg-primary text-white border-primary'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Configuração para SQL */}
            {selectedComponent.dataSource?.type === 'sql' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Conexão</label>
                  <select
                    value={selectedComponent.dataSource.connection || 'default'}
                    onChange={(e) => {
                      setComponents(prev => prev.map(c =>
                        c.id === selectedComponent.id
                          ? { ...c, dataSource: { ...c.dataSource!, connection: e.target.value } }
                          : c
                      ))
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
                  >
                    <option value="default">Padrão (MySQL)</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Query SQL</label>
                  <textarea
                    value={selectedComponent.dataSource.query || ''}
                    onChange={(e) => {
                      setComponents(prev => prev.map(c =>
                        c.id === selectedComponent.id
                          ? { ...c, dataSource: { ...c.dataSource!, query: e.target.value } }
                          : c
                      ))
                    }}
                    placeholder="SELECT label, value FROM metrics ORDER BY date DESC LIMIT 10"
                    rows={3}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none font-mono resize-none"
                  />
                </div>
              </div>
            )}

            {/* Mapeamento de campos (para API e SQL) */}
            {(selectedComponent.dataSource?.type === 'api' || selectedComponent.dataSource?.type === 'sql') && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-medium text-slate-600">Mapeamento de Campos</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Labels (Eixo X)</label>
                    <input
                      type="text"
                      value={selectedComponent.dataSource?.mapping?.labels || ''}
                      onChange={(e) => {
                        setComponents(prev => prev.map(c =>
                          c.id === selectedComponent.id
                            ? { ...c, dataSource: { ...c.dataSource!, mapping: { ...c.dataSource?.mapping, labels: e.target.value } } }
                            : c
                        ))
                      }}
                      placeholder="nome"
                      className="w-full px-2 py-1 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Valores (Eixo Y)</label>
                    <input
                      type="text"
                      value={selectedComponent.dataSource?.mapping?.values || ''}
                      onChange={(e) => {
                        setComponents(prev => prev.map(c =>
                          c.id === selectedComponent.id
                            ? { ...c, dataSource: { ...c.dataSource!, mapping: { ...c.dataSource?.mapping, values: e.target.value } } }
                            : c
                        ))
                      }}
                      placeholder="total"
                      className="w-full px-2 py-1 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Refresh Interval */}
            {(selectedComponent.dataSource?.type === 'api' || selectedComponent.dataSource?.type === 'sql') && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Auto-refresh: {selectedComponent.dataSource?.refreshInterval || 0}s
                  {selectedComponent.dataSource?.refreshInterval === 0 && ' (manual)'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={selectedComponent.dataSource?.refreshInterval || 0}
                  onChange={(e) => {
                    setComponents(prev => prev.map(c =>
                      c.id === selectedComponent.id
                        ? { ...c, dataSource: { ...c.dataSource!, refreshInterval: parseInt(e.target.value) } }
                        : c
                    ))
                  }}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Manual</span>
                  <span>5min</span>
                </div>
              </div>
            )}

            {/* Botão de teste e preview */}
            {(selectedComponent.dataSource?.type === 'api' || selectedComponent.dataSource?.type === 'sql') && (
              <>
                <button
                  onClick={async () => {
                    const ds = selectedComponent.dataSource
                    if (!ds) return

                    setTestingConnection(true)
                    setTestResult(null)

                    try {
                      if (ds.type === 'api' && ds.endpoint) {
                        const response = await fetch(ds.endpoint, {
                          method: ds.method || 'GET',
                          headers: {
                            'Content-Type': 'application/json',
                            ...ds.headers
                          },
                          ...(ds.method === 'POST' && ds.body && { body: JSON.stringify(ds.body) })
                        })

                        if (!response.ok) {
                          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                        }

                        const rawData = await response.json()
                        const mappedData = transformApiData(rawData, ds.mapping)

                        // Atualizar os dados do componente com os dados buscados
                        if (mappedData.length > 0) {
                          const chartData = mappedData.map(d => d.value)
                          const chartLabels = mappedData.map(d => d.label)
                          updateComponentProps(selectedComponent.id, {
                            data: chartData,
                            labels: chartLabels
                          })
                        }

                        setTestResult({ success: true, data: mappedData })
                      } else if (ds.type === 'sql' && ds.query) {
                        // Para SQL, fazer requisição para endpoint backend
                        const response = await fetch('/api/query', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            connection: ds.connection || 'default',
                            query: ds.query
                          })
                        })

                        if (!response.ok) {
                          const errorText = await response.text()
                          throw new Error(`SQL Error: ${errorText}`)
                        }

                        const rawData = await response.json()
                        const mappedData = transformApiData(rawData, ds.mapping)

                        if (mappedData.length > 0) {
                          const chartData = mappedData.map(d => d.value)
                          const chartLabels = mappedData.map(d => d.label)
                          updateComponentProps(selectedComponent.id, {
                            data: chartData,
                            labels: chartLabels
                          })
                        }

                        setTestResult({ success: true, data: mappedData })
                      }
                    } catch (err) {
                      setTestResult({
                        success: false,
                        error: err instanceof Error ? err.message : 'Erro desconhecido'
                      })
                    } finally {
                      setTestingConnection(false)
                    }
                  }}
                  disabled={testingConnection}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${testingConnection
                    ? 'bg-slate-200 text-slate-400 cursor-wait'
                    : 'bg-primary/10 hover:bg-primary/20 text-primary'
                    }`}
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Testar e Aplicar Dados
                    </>
                  )}
                </button>

                {/* Resultado do teste */}
                {testResult && (
                  <div className={`mt-2 p-2 rounded-lg text-xs ${testResult.success
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-rose-50 border border-rose-200'
                    }`}>
                    {testResult.success ? (
                      <>
                        <div className="flex items-center gap-1 text-emerald-700 font-medium mb-1">
                          <CheckCircle className="h-3 w-3" />
                          Conexão OK - {testResult.data?.length || 0} registros
                        </div>
                        {testResult.data && testResult.data.length > 0 && (
                          <div className="mt-1 max-h-24 overflow-auto">
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="text-left text-emerald-600">
                                  <th className="pr-2">Label</th>
                                  <th>Valor</th>
                                </tr>
                              </thead>
                              <tbody className="text-emerald-800">
                                {testResult.data.slice(0, 5).map((d, i) => (
                                  <tr key={i}>
                                    <td className="pr-2">{d.label}</td>
                                    <td>{d.value}</td>
                                  </tr>
                                ))}
                                {testResult.data.length > 5 && (
                                  <tr className="text-emerald-500 italic">
                                    <td colSpan={2}>...e mais {testResult.data.length - 5} registros</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-start gap-1 text-rose-700">
                        <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{testResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  const handleCreate = () => {
    const titleComp = components.find(c => c.type === 'title')
    const valueComp = components.find(c => c.type === 'value')
    const descComp = components.find(c => c.type === 'description')

    // Manter o ID do card se estiver editando, senão criar novo
    const cardId = isEditing && editCard ? editCard.id : `custom-${Date.now()}`
    const newCard: MetricaConfig = {
      id: cardId,
      titulo: (titleComp?.props.text as string) || cardName,
      descricao: (descComp?.props.text as string) || 'Card personalizado',
      icon: Activity,
      cor: currentColor.text,
      borderColor: currentColor.border,
      getValue: () => (valueComp?.props.text as string) || '0',
      categoria: categoria,
      // Salvar os componentes do canvas
      canvasComponents: components,
      canvasConfig: {
        gridCols: GRID_COLS,
        gridRows: GRID_ROWS,
        colorScheme: colorScheme
      }
    }

    onCreate(newCard)
  }

  // Agrupar componentes por categoria
  const componentsByCategory = availableComponents.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = []
    acc[comp.category].push(comp)
    return acc
  }, {} as Record<string, typeof availableComponents>)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-3 md:inset-6 lg:inset-10 z-[10001] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-full h-full flex flex-col animate-scaleIn overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentColor.bg}`}>
                <LayoutGrid className={`h-5 w-5 ${currentColor.text}`} />
              </div>
              <div>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="text-lg font-semibold text-neutral-800 bg-transparent border-none outline-none focus:ring-0 p-0"
                  placeholder="Nome do card"
                />
                <p className="text-xs text-slate-500">
                  Canvas Builder - {isEditing ? 'Edite os componentes do seu card' : 'Arraste componentes para criar seu card'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isEditing ? (
                  <Pencil className="h-4 w-4 mr-1" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                {isEditing ? 'Salvar Alterações' : 'Criar Card'}
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content - 3 colunas */}
          <div className="flex-1 flex min-h-0 overflow-hidden">

            {/* Painel Esquerdo - Componentes disponíveis */}
            <div className="w-56 border-r border-slate-200 bg-white flex flex-col">
              <div className="p-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Componentes</h3>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-4">
                  {/* Cor do tema - Movido para cá */}
                  <div>
                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Cor do Card</h4>
                    <div className="grid grid-cols-4 gap-1.5">
                      {colorOptions.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setColorScheme(color.id)}
                          className={`w-full aspect-square rounded-lg border-2 transition-all ${colorScheme === color.id
                            ? `${color.border} ring-2 ring-offset-1 ring-slate-400`
                            : 'border-transparent hover:border-slate-200'
                            } ${color.bg}`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Componentes por categoria */}
                  {Object.entries(componentsByCategory).map(([category, comps]) => (
                    <div key={category}>
                      <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{category}</h4>
                      <div className="grid grid-cols-2 gap-1.5">
                        {comps.map(comp => (
                          <button
                            key={comp.type}
                            onClick={() => addComponent(comp.type)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div className="text-slate-400 group-hover:text-primary transition-colors">
                              {comp.icon}
                            </div>
                            <span className="text-[10px] text-slate-600 group-hover:text-primary">{comp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Canvas Central - Grid 2D estilo Power BI */}
            <div
              className="flex-1 bg-slate-100 p-6 overflow-auto"
              onMouseMove={handleMouseMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <div className="flex flex-col items-center">
                {/* Info do grid */}
                <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
                  <span>Grid: {GRID_COLS}x{GRID_ROWS}</span>
                  <span>Componentes: {components.length}</span>
                  {selectedComponent && (
                    <span className="text-primary font-medium">
                      Selecionado: {availableComponents.find(c => c.type === selectedComponent.type)?.label}
                    </span>
                  )}
                </div>

                {/* Canvas Grid */}
                <div
                  ref={canvasRef}
                  className={`relative rounded-xl border-2 ${currentColor.border} bg-white shadow-xl overflow-hidden`}
                  style={{
                    width: GRID_COLS * CELL_SIZE,
                    height: GRID_ROWS * CELL_SIZE
                  }}
                  onClick={() => setSelectedComponentId(null)}
                >
                  {/* Grid lines */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                      `,
                      backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                    }}
                  />

                  {/* Componentes */}
                  {components.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <Plus className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Clique em um componente para adicionar</p>
                        <p className="text-xs mt-1 opacity-60">Arraste para mover, arraste o canto para redimensionar</p>
                      </div>
                    </div>
                  ) : (
                    components.map(comp => renderCanvasComponent(comp))
                  )}
                </div>

                {/* Instruções */}
                <div className="mt-4 flex items-center gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <GripVertical className="h-3 w-3" />
                    <span>Arraste para mover</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-r-2 border-b-2 border-slate-400 rounded-br" />
                    <span>Arraste o canto para redimensionar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    <span>Clique no X para remover</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel Direito - Propriedades */}
            <div className="w-[480px] border-l border-slate-200 bg-white flex flex-col">
              <div className="p-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Propriedades</h3>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3">
                  {renderPropertiesPanel()}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default MiniCardsGrid
