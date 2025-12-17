/**
 * Academy Module - Main App Component
 * 
 * Componente principal que gerencia:
 * - Navegação entre abas (Progresso, Cursos, Missões)
 * - Layout responsivo
 * - Estado global do módulo
 */

import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Target, Trophy, Loader2 } from 'lucide-react';
import { useHubContext, useProgress } from './hooks';

// Layout Components
import { ModuleLayout } from './components/layout/ModuleLayout';

// Tab Components
import { ProgressTab } from './components/tabs/ProgressTab';
import { CoursesTab } from './components/tabs/CoursesTab';
import { MissionsTab } from './components/tabs/MissionsTab';

// Types
import type { ModuleTab, AcademyModuleConfig } from './types';

// ==================== MODULE CONFIG ====================

const academyConfig: AcademyModuleConfig = {
    id: 'academy',
    name: 'Academy',
    title: 'Academy - Treinamento Gamificado',
    description: 'Plataforma de treinamento gamificado para sua equipe',
    version: '1.0.0',
    icon: GraduationCap,
    tabs: [
        {
            id: 'progresso',
            label: 'Progresso',
            icon: GraduationCap,
            order: 0,
            color: '#06b6d4'
        },
        {
            id: 'cursos',
            label: 'Cursos',
            icon: BookOpen,
            order: 1,
            color: '#0891b2'
        },
        {
            id: 'missoes',
            label: 'Missões',
            icon: Target,
            order: 2,
            color: '#7c3aed'
        }
    ],
    colors: {
        primary: '#06b6d4',
        secondary: '#0f172a',
        accent: '#7c3aed',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444'
    },
    searchConfig: {
        placeholder: 'Buscar cursos, missões, badges...',
        categories: ['Todos', 'Cursos', 'Missões', 'Badges'],
        searchFields: ['title', 'description', 'category']
    }
};

// ==================== MAIN APP ====================

export default function App() {
    const [activeTab, setActiveTab] = useState('progresso');
    const { isLoading: hubLoading, isConnected, error: hubError } = useHubContext();
    const { progress, stats, streak, isLoading: progressLoading } = useProgress();

    // Loading inicial
    if (hubLoading && !window.hubContext) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center animate-pulse">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Conectando ao Hub.App...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Erro de conexão (em produção)
    if (hubError && import.meta.env.PROD) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Erro de Conexão</h2>
                    <p className="text-gray-600">{hubError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // Renderizar conteúdo baseado na aba ativa
    const renderTabContent = () => {
        switch (activeTab) {
            case 'progresso':
                return (
                    <ProgressTab
                        progress={progress}
                        stats={stats}
                        streak={streak}
                        isLoading={progressLoading}
                    />
                );

            case 'cursos':
                return <CoursesTab />;

            case 'missoes':
                return <MissionsTab />;

            default:
                return <ProgressTab progress={progress} stats={stats} streak={streak} isLoading={progressLoading} />;
        }
    };

    return (
        <ModuleLayout
            config={academyConfig}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isConnected={isConnected}
        >
            {renderTabContent()}
        </ModuleLayout>
    );
}
