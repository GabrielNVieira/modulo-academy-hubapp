/**
 * Academy Module - Layout Principal
 * 
 * Layout responsivo que se adapta entre mobile e desktop
 * Inclui header, navegação e área de conteúdo
 */

import { ReactNode, useState, useEffect } from 'react';
import { Bell, Settings, Search, Menu, GraduationCap } from 'lucide-react';
import type { AcademyModuleConfig } from '../../types';
import { cn } from '../../lib/utils';

interface ModuleLayoutProps {
    config: AcademyModuleConfig;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isConnected: boolean;
    children: ReactNode;
}

export function ModuleLayout({
    config,
    activeTab,
    onTabChange,
    isConnected,
    children
}: ModuleLayoutProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Detectar mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentTab = config.tabs.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-transparent">
            {/* ==================== DESKTOP LAYOUT ==================== */}
            {!isMobile && (
                <>
                    {/* Header Desktop */}
                    <header className={cn(
                        "fixed top-4 left-4 z-40 transition-all duration-300",
                        sidebarCollapsed ? "right-32" : "right-80"
                    )}>
                        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 h-16 px-4 flex items-center justify-between">
                            {/* Logo e Título */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">{config.name}</h1>
                                    <p className="text-xs text-gray-500">{currentTab?.label || 'Dashboard'}</p>
                                </div>
                            </div>

                            {/* Status Conexão */}
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    isConnected ? "bg-green-500" : "bg-yellow-500"
                                )} />
                                <span className="text-xs text-gray-500">
                                    {isConnected ? 'Conectado ao Hub' : 'Modo Standalone'}
                                </span>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <Search className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors relative"
                                >
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                                <button className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Sidebar Desktop */}
                    <aside className={cn(
                        "fixed top-4 right-4 bottom-4 z-50 transition-all duration-300",
                        "bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10",
                        sidebarCollapsed ? "w-24" : "w-72"
                    )}>
                        {/* Sidebar Header */}
                        <div className={cn(
                            "h-16 flex items-center border-b border-gray-100",
                            sidebarCollapsed ? "justify-center px-2" : "px-4"
                        )}>
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="w-10 h-10 rounded-xl hover:bg-primary/10 transition-all flex items-center justify-center group"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                                    {sidebarCollapsed ? (
                                        <Menu className="h-4 w-4 text-white" />
                                    ) : (
                                        <span className="text-white font-bold text-sm">🎓</span>
                                    )}
                                </div>
                            </button>
                            {!sidebarCollapsed && (
                                <span className="ml-3 font-semibold text-gray-900">{config.name}</span>
                            )}
                        </div>

                        {/* Navigation Items */}
                        <nav className="p-4 space-y-2">
                            {config.tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => onTabChange(tab.id)}
                                        className={cn(
                                            "w-full rounded-xl transition-all duration-300 relative group",
                                            sidebarCollapsed
                                                ? "flex items-center justify-center p-3"
                                                : "flex items-center gap-3 px-3 py-3",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className={cn(
                                            "rounded-xl flex items-center justify-center transition-all shrink-0",
                                            sidebarCollapsed ? "w-11 h-11" : "w-10 h-10",
                                            isActive
                                                ? "text-white shadow-lg"
                                                : "bg-gray-100 group-hover:bg-gray-200"
                                        )}
                                            style={isActive && tab.color ? { backgroundColor: tab.color } : {}}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {/* Label */}
                                        {!sidebarCollapsed && (
                                            <span className="font-medium">{tab.label}</span>
                                        )}

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                                style={{ backgroundColor: tab.color }}
                                            />
                                        )}

                                        {/* Tooltip (collapsed) */}
                                        {sidebarCollapsed && (
                                            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900/95 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                                {tab.label}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content Desktop */}
                    <main className={cn(
                        "h-screen overflow-auto pt-24 p-6 transition-all duration-300",
                        sidebarCollapsed ? "pr-36" : "pr-80"
                    )}>
                        <div className="w-full max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>
                </>
            )}

            {/* ==================== MOBILE LAYOUT ==================== */}
            {isMobile && (
                <>
                    {/* Header Mobile */}
                    <header className="fixed top-4 left-4 right-4 z-40">
                        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 h-14 px-4 flex items-center justify-between">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-semibold text-gray-900">{config.name}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                                    <Search className="h-4 w-4 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                                    <Bell className="h-4 w-4 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Main Content Mobile */}
                    <main className="pt-20 pb-24 px-4">
                        {children}
                    </main>

                    {/* Bottom Tab Bar Mobile */}
                    <nav className="fixed bottom-4 left-4 right-4 z-50">
                        <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-black/10 flex items-center justify-around px-2 py-2 h-16">
                            {config.tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => onTabChange(tab.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[70px]",
                                            isActive
                                                ? "text-white shadow-lg scale-105"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                        style={isActive && tab.color ? { backgroundColor: tab.color } : {}}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                </>
            )}
        </div>
    );
}
