import { useState } from 'react';
import { BookOpen, Target, Trophy, Settings } from 'lucide-react';
import { CoursesManager } from './courses/CoursesManager';
import { MissionsManager } from './missions/MissionsManager';
import { GamificationManager } from './gamification/GamificationManager';
import { cn } from '@/lib/utils';

type AdminTab = 'courses' | 'missions' | 'gamification';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('courses');

    const tabs = [
        { id: 'courses', label: 'Cursos e Aulas', icon: BookOpen },
        { id: 'missions', label: 'Missões', icon: Target },
        { id: 'gamification', label: 'Gamificação', icon: Trophy },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header do Admin */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        Painel Administrativo
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Gerencie o conteúdo e as regras do módulo de treinamento.
                    </p>
                </div>
            </div>

            {/* Navegação Interna */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-wrap gap-2 shadow-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Área de Conteúdo */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px] p-6">
                {activeTab === 'courses' && <CoursesManager />}
                {activeTab === 'missions' && <MissionsManager />}
                {activeTab === 'gamification' && <GamificationManager />}
            </div>
        </div>
    );
}
