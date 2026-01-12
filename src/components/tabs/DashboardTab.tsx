import { MiniCardsGrid } from '../MiniCardsGrid';
import { LayoutGrid } from 'lucide-react';

export function DashboardTab() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <LayoutGrid className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        </div>
        <p className="text-muted-foreground ml-11">
          Visão geral das métricas e indicadores do sistema.
        </p>
      </div>

      <MiniCardsGrid data={{
        totalRegras: 12,
        regrasAtivas: 8,
        casosPendentes: 5,
        prioridadeCritica: 2,
        investigadores: 4,
        taxaResolucao: '85%',
        slaMedio: '4h',
        valorPendente: 'R$ 12.500',
        eficiencia: '92%',
        reincidencia: '15%',
        tendencia: '+12%',
        casosConfirmados: 142
      }} />
    </div>
  );
}
