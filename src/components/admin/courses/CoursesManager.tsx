import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, Video, FileText, HelpCircle, Save, X } from 'lucide-react';
import { useAdminCourses } from '@/hooks/useAdminCourses'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Course, Lesson } from '@/types';

export function CoursesManager() {
    const {
        courses,
        createCourse,
        updateCourse,
        deleteCourse,
        getCourseLessons,
        createLesson,
        updateLesson,
        deleteLesson
    } = useAdminCourses();

    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    // Auto-select first course when courses load
    useEffect(() => {
        if (!selectedCourseId && courses.length > 0) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId]);

    // States for "New Course" or "Edit Course" could be handled here or via inline editing
    // For simplicity, we'll use a "Details Panel" that acts as the editor

    const activeCourse = courses.find(c => c.id === selectedCourseId);
    const activeLessons = selectedCourseId ? getCourseLessons(selectedCourseId) : [];

    return (
        <div className="flex h-[calc(100vh-280px)] gap-6">
            {/* LEFT SIDEBAR: COURSE LIST */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Cursos</h2>
                    <Button onClick={() => createCourse({ title: 'Novo Curso' })} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Novo
                    </Button>
                </div>

                <ScrollArea className="flex-1 bg-slate-50/50 rounded-xl border border-slate-200">
                    <div className="p-3 space-y-3">
                        {courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedCourseId === course.id
                                    ? 'bg-white border-primary shadow-md ring-1 ring-primary/20'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-slate-800 line-clamp-1">{course.title}</h3>
                                    <Badge variant="secondary" className="text-xs">{course.level === 1 ? 'Básico' : 'Avançado'}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description || 'Sem descrição'}</p>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                                    <span>{course.estimatedTime}</span>
                                    <span>+{course.xpReward} XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT PANEL: EDITOR */}
            <div className="flex-1 flex flex-col">
                {activeCourse ? (
                    <Card className="flex-1 flex flex-col border-slate-200 shadow-sm overflow-hidden">
                        {/* Course Header Editor */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                                    <Edit2 className="h-4 w-4" /> Editando Curso
                                </h2>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        deleteCourse(activeCourse.id);
                                        setSelectedCourseId(null);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Curso
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Título</label>
                                    <Input
                                        value={activeCourse.title}
                                        onChange={(e) => updateCourse(activeCourse.id, { title: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Descrição</label>
                                    <Input
                                        value={activeCourse.description}
                                        onChange={(e) => updateCourse(activeCourse.id, { description: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">XP Reward</label>
                                    <Input
                                        type="number"
                                        value={activeCourse.xpReward}
                                        onChange={(e) => updateCourse(activeCourse.id, { xpReward: parseInt(e.target.value) || 0 })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Est. Time</label>
                                    <Input
                                        value={activeCourse.estimatedTime}
                                        onChange={(e) => updateCourse(activeCourse.id, { estimatedTime: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lessons List */}
                        <div className="flex-1 flex flex-col p-6 bg-white min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700">Conteúdo do Curso ({activeLessons.length} Aulas)</h3>
                                <Button size="sm" onClick={() => createLesson(activeCourse.id, {})} className="gap-2">
                                    <Plus className="h-3 w-3" /> Adicionar Aula
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 -mr-4 pr-4">
                                <div className="space-y-2">
                                    {activeLessons.map((lesson, idx) => (
                                        <div key={lesson.id} className="group flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                {editingLesson?.id === lesson.id ? (
                                                    <div className="flex flex-col gap-2">
                                                        <Input
                                                            value={editingLesson.title}
                                                            onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                                            placeholder="Título da Aula"
                                                            className="h-8"
                                                        />
                                                        <Input
                                                            value={editingLesson.videoUrl || ''}
                                                            onChange={e => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                                                            placeholder="URL do Vídeo"
                                                            className="h-8 text-xs font-mono"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="ghost" onClick={() => setEditingLesson(null)} className="h-6 text-xs">Cancelar</Button>
                                                            <Button size="sm" onClick={() => {
                                                                updateLesson(lesson.id, editingLesson);
                                                                setEditingLesson(null);
                                                            }} className="h-6 text-xs">Salvar</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-medium text-slate-800 text-sm">{lesson.title}</h4>
                                                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[300px]">{lesson.videoUrl || 'Sem vídeo configurado'}</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!editingLesson && (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingLesson(lesson)}>
                                                            <Edit2 className="h-4 w-4 text-slate-500" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => deleteLesson(lesson.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {activeLessons.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                            Nenhuma aula cadastrada neste curso.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                        <p className="font-medium">Selecione um curso para editar</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Temporary Icon for Empty State
function BookOpen(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}
