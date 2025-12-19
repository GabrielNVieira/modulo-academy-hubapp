/**
 * Academy Module - Progress Tab
 *
 * Aba principal mostrando o progresso do usuário:
 * - Hero section com avatar, nível e XP
 * - Stats cards
 * - Árvore de progressão
 * - Streak card
 */

import type { UserProgress, UserStats, Streak } from '../../types';

interface ProgressTabProps {
    progress: UserProgress | null;
    stats: UserStats | null;
    streak: Streak | null;
    isLoading: boolean;
}

export function ProgressTab({ progress, stats, isLoading }: ProgressTabProps) {
    if (isLoading) {
        return <ProgressTabSkeleton />;
    }

    if (!progress || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Nenhum dado de progresso encontrado.</p>
            </div>
        );
    }

    return (
        <div className="h-full p-4">
            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">ABA PROGRESSO</h1>

            {/* Layout com 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: 'calc(100% - 60px)' }}>
                {/* Coluna Esquerda */}
                <div className="lg:col-span-4 flex flex-col gap-3 h-full">
                    {/* Card Principal - Engloba Avatar + Estatísticas */}
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        {/* Seção Avatar + Nível + XP */}
                        <div className="flex gap-4 mb-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-gray-400 overflow-hidden">
                                    <img
                                        src="https://via.placeholder.com/64"
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="text-xs text-blue-600 font-semibold mt-1 text-center">Avatar</p>
                            </div>

                            {/* Nível e XP */}
                            <div className="flex-1 space-y-3">
                                {/* Nível */}
                                <div>
                                    <p className="text-sm font-semibold text-blue-600 mb-1">Nível</p>
                                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: '60%' }}></div>
                                    </div>
                                </div>

                                {/* XP */}
                                <div>
                                    <p className="text-sm font-semibold text-green-600 mb-1">XP</p>
                                    <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção Estatísticas */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Card 1 - Cursos */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-3 flex flex-col items-center">
                                <div className="text-center mb-2">
                                    <p className="text-xs font-semibold text-gray-700">4-8</p>
                                    <p className="text-xs font-semibold text-gray-700">Cursos</p>
                                </div>
                                <div className="w-0.5 h-4 bg-gray-300"></div>
                                <div className="bg-white border-2 border-gray-300 rounded px-4 py-2 mt-2 min-w-[60px]">
                                    <p className="text-xs font-bold text-gray-900 text-center">Curso</p>
                                </div>
                            </div>

                            {/* Card 2 - Missões */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-3 flex flex-col items-center">
                                <div className="text-center mb-2">
                                    <p className="text-xs font-semibold text-gray-700">12</p>
                                    <p className="text-xs font-semibold text-gray-700">Missões</p>
                                </div>
                                <div className="w-0.5 h-4 bg-gray-300"></div>
                                <div className="bg-white border-2 border-gray-300 rounded px-2 py-2 mt-2 w-full max-w-[90px] mx-auto">
                                    <p className="text-[9px] font-bold text-gray-900 text-center break-words leading-tight">Próxima missão</p>
                                </div>
                            </div>

                            {/* Card 3 - Conquistas */}
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-3 flex flex-col items-center">
                                <div className="text-center mb-2">
                                    <p className="text-xs font-semibold text-gray-700">5</p>
                                    <p className="text-xs font-semibold text-gray-700">Conquistas</p>
                                </div>
                                <div className="w-0.5 h-4 bg-gray-300"></div>
                                <div className="bg-white border-2 border-gray-300 rounded px-2 py-2 mt-2 w-full max-w-[90px] mx-auto">
                                    <p className="text-[9px] font-bold text-gray-900 text-center break-words leading-tight">Conquista atual</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Dias Consecutivos */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6 flex-1 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🔥</span>
                            Dias consecutivos
                        </h3>

                        {/* Streak Atual */}
                        <div className="flex items-center justify-center mb-6 bg-white/80 rounded-2xl p-6 shadow-md">
                            <div className="text-center">
                                <div className="text-7xl mb-3 animate-pulse">🔥</div>
                                <p className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">7</p>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">dias de sequência</p>
                            </div>
                        </div>

                        {/* Recordes */}
                        <div className="space-y-3">
                            {/* Recorde de dias */}
                            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🏆</span>
                                    <span className="text-sm font-semibold text-gray-700">Recorde de dias</span>
                                </div>
                                <span className="text-xl font-bold text-orange-600">15</span>
                            </div>

                            {/* Recorde semanal */}
                            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📅</span>
                                    <span className="text-sm font-semibold text-gray-700">Recorde semanal</span>
                                </div>
                                <span className="text-xl font-bold text-orange-600">7/7</span>
                            </div>

                            {/* Recorde mensal */}
                            <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-orange-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🗓️</span>
                                    <span className="text-sm font-semibold text-gray-700">Recorde mensal</span>
                                </div>
                                <span className="text-xl font-bold text-orange-600">28/30</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita */}
                <div className="lg:col-span-8 h-full">
                    <div className="bg-white border-2 border-gray-300 rounded-lg relative overflow-hidden h-full flex items-center justify-center">
                        {/* Mensagem de desenvolvimento futuro */}
                        <div className="text-center p-8">
                            <div className="text-6xl mb-4">🚧</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Árvore de Progresso</h3>
                            <p className="text-gray-600">Este recurso será desenvolvido futuramente</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== SKELETON ====================

function ProgressTabSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-6 h-40" />
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl h-24" />
                    <div className="bg-white rounded-xl h-24" />
                    <div className="bg-white rounded-xl h-24" />
                </div>
                <div className="bg-white rounded-2xl h-32" />
            </div>
            <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl h-80" />
            </div>
        </div>
    );
}
