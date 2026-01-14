
import { useState } from 'react';
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react';
import { useAdminBadges } from '@/hooks/useAdminBadges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge as UiBadge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GamificationManager() {
    const { badges, createBadge, updateBadge, deleteBadge } = useAdminBadges();
    const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

    const activeBadge = badges.find(b => b.id === selectedBadgeId);

    return (
        <div className="flex h-[calc(100vh-280px)] gap-6">
            {/* LEFT SIDEBAR: BADGE LIST */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Conquistas (Badges)</h2>
                    <Button onClick={() => createBadge({ name: 'Nova Badge' })} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Nova
                    </Button>
                </div>

                <ScrollArea className="flex-1 bg-slate-50/50 rounded-xl border border-slate-200">
                    <div className="p-3 space-y-3">
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                onClick={() => setSelectedBadgeId(badge.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedBadgeId === badge.id
                                    ? 'bg-white border-primary shadow-md ring-1 ring-primary/20'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{badge.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-slate-800 line-clamp-1">{badge.name}</h3>
                                            <UiBadge variant="outline" className={`text-[10px] ${badge.rarity === 'legendary' ? 'border-amber-500 text-amber-600 bg-amber-50' :
                                                badge.rarity === 'epic' ? 'border-purple-500 text-purple-600 bg-purple-50' :
                                                    badge.rarity === 'rare' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                                                        'border-slate-200 text-slate-600 bg-slate-50'
                                                }`}>
                                                {badge.rarity}
                                            </UiBadge>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{badge.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT PANEL: EDITOR */}
            <div className="flex-1 flex flex-col">
                {activeBadge ? (
                    <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                                    <Edit2 className="h-4 w-4" /> Editando Badge
                                </h2>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        deleteBadge(activeBadge.id);
                                        setSelectedBadgeId(null);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Nome</label>
                                    <Input
                                        value={activeBadge.name}
                                        onChange={(e) => updateBadge(activeBadge.id, { name: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Ícone (Emoji)</label>
                                    <Input
                                        value={activeBadge.icon}
                                        onChange={(e) => updateBadge(activeBadge.id, { icon: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Descrição</label>
                                    <Input
                                        value={activeBadge.description}
                                        onChange={(e) => updateBadge(activeBadge.id, { description: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Categoria</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={activeBadge.category}
                                        onChange={(e) => updateBadge(activeBadge.id, { category: e.target.value as any })}
                                    >
                                        <option value="curso">Curso</option>
                                        <option value="missao">Missão</option>
                                        <option value="streak">Streak</option>
                                        <option value="especial">Especial</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Raridade</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={activeBadge.rarity}
                                        onChange={(e) => updateBadge(activeBadge.id, { rarity: e.target.value as any })}
                                    >
                                        <option value="common">Comum (Cinza)</option>
                                        <option value="rare">Rara (Azul)</option>
                                        <option value="epic">Épica (Roxo)</option>
                                        <option value="legendary">Lendária (Dourado)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">XP Bônus</label>
                                    <Input
                                        type="number"
                                        value={activeBadge.xpBonus}
                                        onChange={(e) => updateBadge(activeBadge.id, { xpBonus: parseInt(e.target.value) || 0 })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-6 bg-white flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-sm font-medium text-slate-500 mb-6">Preview Visual</h3>

                            <div className="relative group perspective-1000">
                                <div className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl shadow-xl transform transition-transform group-hover:scale-110 ${activeBadge.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-200 to-yellow-500 text-yellow-900 border-4 border-yellow-300' :
                                    activeBadge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-200 to-indigo-500 text-indigo-900 border-4 border-indigo-300' :
                                        activeBadge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-200 to-cyan-500 text-cyan-900 border-4 border-cyan-300' :
                                            'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border-4 border-slate-300'
                                    }`}>
                                    {activeBadge.icon}
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <h2 className="text-xl font-bold text-slate-800">{activeBadge.name}</h2>
                                <p className="text-slate-500 mt-1 max-w-xs">{activeBadge.description}</p>
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                    +{activeBadge.xpBonus} XP
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Trophy className="h-16 w-16 mb-4 opacity-20" />
                        <p className="font-medium">Selecione uma badge para editar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
