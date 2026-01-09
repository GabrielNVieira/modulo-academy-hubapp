/**
 * Academy Module - Main App Component
 * 
 * Componente principal que gerencia:
 * - Navegação entre abas (Progresso, Cursos, Missões)
 * - Layout responsivo
 * - Estado global do módulo
 */

import { useState } from 'react';
import { GraduationCap, BookOpen, Target } from 'lucide-react';
import { useHubContext, useProgress } from './hooks';

// Layout Components
import { ModuleLayout } from './components/layout/ModuleLayout';

// Tab Components
import { ProgressTab } from './components/tabs/ProgressTab';
import { CoursesTab } from './components/tabs/CoursesTab';
import { MissionsTab } from './components/tabs/MissionsTab';

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
    const { isConnected } = useHubContext();
    const { progress, stats, streak, currentLevel, isLoading: progressLoading } = useProgress();




    // Renderizar conteúdo baseado na aba ativa
    const renderTabContent = () => {
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
            config={academyConfig}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isConnected={isConnected}
        >
            {renderTabContent()}
        </ModuleLayout>
    );
}
