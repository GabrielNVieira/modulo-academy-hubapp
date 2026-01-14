/**
 * Academy Module - Main App Component
 * 
 * Componente principal que gerencia:
 * - Navegação entre abas (Progresso, Cursos, Missões)
 * - Layout responsivo
 * - Estado global do módulo
 */

import { useState } from 'react';
import { GraduationCap, BookOpen, Target, LayoutGrid, Settings } from 'lucide-react';
import { useHubContext, useProgress } from './hooks';

// Layout Components
import { ModuleLayout } from './components/layout/ModuleLayout';

// Tab Components
import { ProgressTab } from './components/tabs/ProgressTab';
import { CoursesTab } from './components/tabs/CoursesTab';
import { MissionsTab } from './components/tabs/MissionsTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Types
import type { AcademyModuleConfig } from './types';

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
        },
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
            order: 3,
            color: '#f59e0b'
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
    const [isAdminMode, setIsAdminMode] = useState(false); // Admin Mode State
    const { isConnected } = useHubContext();
    const { progress, stats, streak, currentLevel, isLoading: progressLoading } = useProgress();

    // Importar dinamicamente ou usar componente já importado (precisa importar no topo)
    // Para simplificar, vou assumir que AdminDashboard foi importado

    // Configuração Dinâmica baseada no modo Admin
    const activeConfig: AcademyModuleConfig = {
        ...academyConfig,
        tabs: isAdminMode
            ? [
                ...academyConfig.tabs,
                {
                    id: 'admin',
                    label: 'Admin',
                    icon: Settings, // Requer importação
                    order: 99,
                    color: '#0f172a'
                }
            ]
            : academyConfig.tabs
    };

    // Renderizar conteúdo baseado na aba ativa
    const renderTabContent = () => {
        // Se estiver na aba admin mas sair do modo admin, voltar para progresso
        if (activeTab === 'admin' && !isAdminMode) {
            setActiveTab('progresso');
            return null;
        }

        switch (activeTab) {
            case 'progresso':
                return (
                    <ProgressTab
                        progress={progress}
                        stats={stats}
                        streak={streak}
                        currentLevel={currentLevel}
                        isLoading={progressLoading}
                    />
                );

            case 'cursos':
                return <CoursesTab />;

            case 'missoes':
                return <MissionsTab />;

            case 'dashboard':
                return <DashboardTab />;

            case 'admin':
                return isAdminMode ? <AdminDashboard /> : null;

            default:
                return (
                    <ProgressTab
                        progress={progress}
                        stats={stats}
                        streak={streak}
                        currentLevel={currentLevel}
                        isLoading={progressLoading}
                    />
                );
        }
    };

    return (
        <ModuleLayout
            config={activeConfig}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isConnected={isConnected}
        >
            {renderTabContent()}

            {/* DEV TOOLS (Fixed Bottom Right) */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end">
                {/* Toggle Admin Mode */}
                <button
                    onClick={() => {
                        const newMode = !isAdminMode;
                        setIsAdminMode(newMode);
                        if (newMode) {
                            setActiveTab('admin');
                        } else if (activeTab === 'admin') {
                            setActiveTab('progresso');
                        }
                    }}
                    className={`px-4 py-2 rounded-full shadow-lg font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 ${isAdminMode
                        ? 'bg-slate-800 text-white hover:bg-slate-900 border-2 border-slate-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    title="Alternar Modo Administrador"
                >
                    {isAdminMode ? '👨‍💼 Admin Mode: ON' : '👤 Admin Mode: OFF'}
                </button>

                {/* Reset Local Data */}
                <button
                    onClick={() => {
                        if (confirm('Tem certeza? Isso apagará todo o progresso LOCAL deste navegador.')) {
                            Object.keys(localStorage).forEach(key => {
                                if (key.startsWith('academy_')) localStorage.removeItem(key);
                            });
                            window.location.reload();
                        }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs uppercase tracking-wider transition-all hover:scale-105"
                    title="Limpar dados locais e recarregar"
                >
                    🗑️ Reset Local
                </button>
            </div>
        </ModuleLayout>
    );
}
