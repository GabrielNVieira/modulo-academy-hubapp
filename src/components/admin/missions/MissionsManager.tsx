
import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, CheckSquare } from 'lucide-react';
import { useAdminMissions } from '@/hooks/useAdminMissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MissionsManager() {
    const {
        missions,
        createMission,
        updateMission,
        deleteMission,
        addChecklistItem,
        removeChecklistItem
    } = useAdminMissions();

    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
    const [newChecklistText, setNewChecklistText] = useState('');

    const activeMission = missions.find(m => m.id === selectedMissionId);

    // Sort missions by order
    const sortedMissions = [...missions].sort((a, b) => a.order - b.order);

    return (
        <div className="flex h-[calc(100vh-280px)] gap-6">
            {/* LEFT SIDEBAR: MISSION LIST */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Missões</h2>
                    <Button onClick={() => createMission({ title: 'Nova Missão' })} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Nova
                    </Button>
                </div>

                <ScrollArea className="flex-1 bg-slate-50/50 rounded-xl border border-slate-200">
                    <div className="p-3 space-y-3">
                        {sortedMissions.map(mission => (
                            <div
                                key={mission.id}
                                onClick={() => setSelectedMissionId(mission.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedMissionId === mission.id
                                    ? 'bg-white border-primary shadow-md ring-1 ring-primary/20'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-800 line-clamp-1">{mission.title}</h3>
                                    <Badge variant={(mission.status === 'locked' ? 'secondary' : 'default')} className="text-xs">
                                        {mission.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mission.description || 'Sem descrição'}</p>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                                    <span>{mission.estimatedTime} min</span>
                                    <span>+{mission.xpReward} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT PANEL: EDITOR */}
            <div className="flex-1 flex flex-col">
                {activeMission ? (
                    <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden">
                        {/* Mission Header Editor */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                                    <Edit2 className="h-4 w-4" /> Editando Missão
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateMission(activeMission.id, {
                                            status: activeMission.status === 'locked' ? 'available' : 'locked'
                                        })}
                                    >
                                        {activeMission.status === 'locked' ? '🔓 Desbloquear' : '🔒 Bloquear'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            deleteMission(activeMission.id);
                                            setSelectedMissionId(null);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Título</label>
                                    <Input
                                        value={activeMission.title}
                                        onChange={(e) => updateMission(activeMission.id, { title: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Descrição</label>
                                    <Input
                                        value={activeMission.description}
                                        onChange={(e) => updateMission(activeMission.id, { description: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Tipo</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={activeMission.type}
                                        onChange={(e) => updateMission(activeMission.id, { type: e.target.value as any })}
                                    >
                                        <option value="tutorial">Tutorial</option>
                                        <option value="livre">Livre</option>
                                        <option value="problema">Problema</option>
                                        <option value="otimizacao">Otimização</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Categoria</label>
                                    <Input
                                        value={activeMission.category}
                                        onChange={(e) => updateMission(activeMission.id, { category: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">XP Reward</label>
                                    <Input
                                        type="number"
                                        value={activeMission.xpReward}
                                        onChange={(e) => updateMission(activeMission.id, { xpReward: parseInt(e.target.value) || 0 })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Est. Time (min)</label>
                                    <Input
                                        type="number"
                                        value={activeMission.estimatedTime}
                                        onChange={(e) => updateMission(activeMission.id, { estimatedTime: parseInt(e.target.value) || 0 })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="flex-1 flex flex-col p-6 bg-white min-h-0">
                            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" /> Checklist de Etapas
                            </h3>

                            <div className="flex gap-2 mb-4">
                                <Input
                                    value={newChecklistText}
                                    onChange={(e) => setNewChecklistText(e.target.value)}
                                    placeholder="Adicionar nova etapa..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newChecklistText.trim()) {
                                            addChecklistItem(activeMission.id, newChecklistText);
                                            setNewChecklistText('');
                                        }
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        if (newChecklistText.trim()) {
                                            addChecklistItem(activeMission.id, newChecklistText);
                                            setNewChecklistText('');
                                        }
                                    }}
                                >
                                    Adicionar
                                </Button>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="space-y-2">
                                    {activeMission.requirements.items.map((item, idx) => (
                                        <div key={item.id} className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-primary/50 text-primary opacity-50">
                                                <span className="text-[10px] font-bold">{idx + 1}</span>
                                            </div>
                                            <span className="flex-1 text-sm text-slate-700">{item.text}</span>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeChecklistItem(activeMission.id, item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {activeMission.requirements.items.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                            Nenhuma etapa cadastrada.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Target className="h-16 w-16 mb-4 opacity-20" />
                        <p className="font-medium">Selecione uma missão para editar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
