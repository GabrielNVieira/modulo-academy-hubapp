/**
 * Academy Module - Video Player
 *
 * Player de vídeo com controles completos, hotspots interativos,
 * sistema de notas e integração com quiz
 */

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Edit3,
  Trash2,
  Clock,
  Save,
  PenLine,
  AlertCircle,
  Award,
  RefreshCw,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

interface VideoPlayerProps {
  lessonTitle?: string;
  lessonNumber?: number;
  totalLessons?: number;
  courseTitle?: string;
  xpReward?: number;
  videoUrl?: string;
  lessonId?: string;
  onBack?: () => void;
  onComplete?: () => void; // Mantido para compatibilidade, mas idealmente usaria onStatusChange
  onStatusChange?: (status: LessonStatus) => void;
  status?: LessonStatus;
  initialTime?: number; // Tempo inicial em segundos
  onProgressUpdate?: (currentTime: number, percentage: number) => void;
}

// Interface para notas do vídeo
interface Note {
  id: string;
  content: string;
  timestamp: number;  // Momento do vídeo em segundos
  createdAt: string;
}

// Interfaces do Quiz
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizState {
  isCompleted: boolean;
  score: number;
  answers: Record<string, number>; // questionId -> optionIndex
  bestScore: number;
}

export function VideoPlayer({
  lessonTitle: _lessonTitle = "Introdução ao Sistema",
  lessonNumber: _lessonNumber = 3,
  totalLessons: _totalLessons = 8,
  courseTitle: _courseTitle = "Curso: Introdução ao Webhook",
  xpReward = 100,
  videoUrl = "",
  lessonId = "lesson-default",
  onBack,
  onComplete,
  onStatusChange,
  status = 'not_started',
  initialTime = 0,
  onProgressUpdate
}: VideoPlayerProps) {
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeTab, setActiveTab] = useState<'notas' | 'quiz'>('notas');

  // Estados do sistema de notas
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Estados do Quiz
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    isCompleted: false,
    score: 0,
    answers: {},
    bestScore: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const hasSeekedRef = useRef(false);

  // Forçar recarga do vídeo quando a URL mudar
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setHasStarted(false);
      setIsPlaying(false);
      hasSeekedRef.current = false;
    }
  }, [videoUrl]);

  // Seek inicial quando o vídeo estiver pronto
  useEffect(() => {
    if (initialTime > 0 && videoRef.current && !hasSeekedRef.current) {
      // Tentar settar imediatamente se ref estiver disponível
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
      hasSeekedRef.current = true;
    }
  }, [initialTime]);

  // Chave do localStorage para esta lição
  const storageKey = `academy_notes_${lessonId}`;
  const quizStorageKey = `academy_quiz_${lessonId}`;

  // Mock de perguntas (idealmente viria de uma prop ou API)
  const QUESTIONS: Question[] = [
    {
      id: 'q1',
      question: 'Qual é o principal objetivo do Webhook no sistema?',
      options: [
        'Apenas enviar emails de notificação',
        'Permitir integração em tempo real entre sistemas',
        'Armazenar dados de clientes no banco',
        'Criar relatórios mensais automaticamente'
      ],
      correctAnswer: 1
    },
    {
      id: 'q2',
      question: 'Quando o evento de "Venda Aprovada" é disparado?',
      options: [
        'Assim que o cliente clica em comprar',
        'Quando o boleto é gerado',
        'Apenas quando a plataforma confirma o pagamento',
        'Quando o cliente recebe o produto'
      ],
      correctAnswer: 2
    },
    {
      id: 'q3',
      question: 'Qual status HTTP indica sucesso no recebimento do Webhook?',
      options: [
        '404 Not Found',
        '500 Server Error',
        '200 OK',
        '301 Redirect'
      ],
      correctAnswer: 2
    }
  ];

  // Carregar notas e quiz do localStorage ao montar
  useEffect(() => {
    // Notas
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Erro ao carregar notas:', e);
      }
    }

    // Quiz
    const savedQuiz = localStorage.getItem(quizStorageKey);
    if (savedQuiz) {
      try {
        const parsed = JSON.parse(savedQuiz);
        setQuizState(prev => ({
          ...prev,
          isCompleted: parsed.isCompleted || false,
          bestScore: parsed.bestScore || 0,
          answers: parsed.answers || {}
        }));

        // Se já completou, manter desbloqueado
        if (parsed.isCompleted) {
          setQuizUnlocked(true);
        }
      } catch (e) {
        console.error('Erro ao carregar quiz:', e);
      }
    }
  }, [storageKey, quizStorageKey]);

  // Salvar notas no localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, storageKey]);

  // Salvar progresso do Quiz
  useEffect(() => {
    if (quizState.isCompleted || quizState.bestScore > 0) {
      localStorage.setItem(quizStorageKey, JSON.stringify({
        isCompleted: quizState.isCompleted,
        bestScore: quizState.bestScore,
        answers: quizState.answers
      }));
    }
  }, [quizState, quizStorageKey]);

  // Verificar desbloqueio do Quiz (quando vídeo > 90%)
  useEffect(() => {
    if (!quizUnlocked && duration > 0) {
      const progress = (currentTime / duration) * 100;
      if (progress > 90) {
        setQuizUnlocked(true);
      }
    }
  }, [currentTime, duration, quizUnlocked]);

  // Funções do sistema de notas
  const addNote = () => {
    if (!newNoteContent.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim(),
      timestamp: currentTime,
      createdAt: new Date().toISOString()
    };

    setNotes(prev => [...prev, newNote].sort((a, b) => a.timestamp - b.timestamp));
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  // Funções do Quiz
  const handleAnswer = (optionIndex: number) => {
    if (showQuizResult) return;

    const currentQuestion = QUESTIONS[currentQuestionIndex];

    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: optionIndex
      }
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    let correctCount = 0;
    QUESTIONS.forEach(q => {
      if (quizState.answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / QUESTIONS.length) * 100);
    const isPassed = finalScore >= 70; // Passou com 70%

    setQuizState(prev => ({
      ...prev,
      score: finalScore,
      isCompleted: true,
      bestScore: Math.max(prev.bestScore, finalScore)
    }));

    setShowQuizResult(true);

    if (isPassed) {
      if (onStatusChange) {
        onStatusChange('completed');
      }
      if (onComplete) {
        onComplete();
      }
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setShowQuizResult(false);
    setQuizState(prev => ({
      ...prev,
      score: 0,
      answers: {}
    }));
  };

  const updateNote = (id: string) => {
    if (!editingContent.trim()) return;

    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, content: editingContent.trim() }
        : note
    ));
    setEditingNoteId(null);
    setEditingContent('');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => {
      const newNotes = prev.filter(note => note.id !== id);
      if (newNotes.length === 0) {
        localStorage.removeItem(storageKey);
      }
      return newNotes;
    });
  };

  const jumpToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  // Formata tempo em MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (!hasStarted && onStatusChange) {
          setHasStarted(true);
          onStatusChange('in_progress');
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Avançar/retroceder 10 segundos
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;

      // Bloquear avanço se não completou
      if (seconds > 0 && status !== 'completed' && newTime > maxWatchedTime) {
        // Permitir ir até o máximo assistido apenas
        videoRef.current.currentTime = maxWatchedTime;
        return;
      }

      videoRef.current.currentTime = newTime;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Atualizar progresso
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Atualizar máximo assistido
      if (time > maxWatchedTime) {
        setMaxWatchedTime(time);
      }

      // Notificar parente a cada 5 segundos
      if (onProgressUpdate && Math.abs(time - lastProgressUpdateRef.current) > 5) {
        const percent = (time / duration) * 100;
        onProgressUpdate(time, percent);
        lastProgressUpdateRef.current = time;
      }
    }
  };

  // Atualizar duração quando o vídeo carregar
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0 && !hasSeekedRef.current) {
        videoRef.current.currentTime = initialTime;
        setCurrentTime(initialTime);
        setMaxWatchedTime(Math.max(maxWatchedTime, initialTime));
        hasSeekedRef.current = true;
      }
    }
  };

  // Click na barra de progresso
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      // Bloquear seek se não completou
      if (status !== 'completed' && newTime > maxWatchedTime) {
        // Opcional: Visual feedback ou just clamp
        videoRef.current.currentTime = maxWatchedTime;
        return;
      }

      videoRef.current.currentTime = newTime;
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar atalhos quando estiver digitando em campos de texto
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement)?.isContentEditable;

      if (isTyping) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          skip(-5);
          break;
        case 'ArrowRight':
          skip(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          videoRef.current?.requestFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume]);

  // Porcentagem de progresso
  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div className="h-screen flex flex-col bg-transparent relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-center relative z-50 shadow-sm">
        <button
          onClick={onBack}
          className="absolute left-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>
        <h1 className="text-lg font-bold text-gray-900 tracking-wide">VÍDEOAULA</h1>
      </div>

      {/* Player Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Video Container */}
          <div
            className="relative bg-black rounded-lg overflow-hidden aspect-video"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(isPlaying ? false : true)}
          >
            {/* Video Element (placeholder) */}
            <video
              ref={videoRef}
              className="w-full h-full"
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              playsInline
            />

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                >
                  <Play className="h-10 w-10 text-gray-900 ml-1" />
                </button>
              </div>
            )}

            {/* Controls Overlay */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200">
                {/* Progress Bar */}
                <div
                  ref={progressBarRef}
                  className="w-full h-1.5 bg-gray-300 cursor-pointer group hover:h-2 transition-all"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-blue-500 relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"></div>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="px-4 py-3 flex items-center justify-between">
                  {/* Left Controls */}
                  <div className="flex items-center gap-1.5">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors rounded"
                      title={isPlaying ? "Pausar" : "Reproduzir"}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>

                    {/* Skip Back */}
                    <button
                      onClick={() => skip(-10)}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Retroceder 10s"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>

                    {/* Skip Forward */}
                    <button
                      onClick={() => skip(10)}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Avançar 10s"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>

                    {/* Time Display */}
                    <div className="h-9 flex items-center justify-center px-3 bg-gray-50 rounded border border-gray-200">
                      <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {formatTime(currentTime)}/{formatTime(duration)}
                      </span>
                    </div>

                    {/* Volume */}
                    <button
                      onClick={toggleMute}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors rounded"
                      title={isMuted ? "Ativar som" : "Silenciar"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>

                    {/* Notas Button */}
                    <button
                      onClick={() => setActiveTab('notas')}
                      className={`h-9 px-4 flex items-center justify-center text-sm font-semibold rounded transition-all ${activeTab === 'notas'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                    >
                      Notas
                    </button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-1.5">
                    {/* Settings */}
                    <button
                      className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors rounded"
                      title="Configurações padrão de vídeos"
                    >
                      <Settings className="h-5 w-5" />
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={() => videoRef.current?.requestFullscreen()}
                      className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors rounded"
                      title="Tela cheia"
                    >
                      <Maximize className="h-5 w-5" />
                    </button>

                    {/* Quiz Button */}
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="h-9 px-5 flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all"
                    >
                      QUIZ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Área de Conteúdo Abaixo do Player */}
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6 min-h-[200px]">
            {activeTab === 'notas' ? (
              <div className="space-y-4">
                {/* Header da seção */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Notas {notes.length > 0 && <span className="text-gray-500 font-normal">({notes.length})</span>}
                    </h3>
                  </div>
                  {!isAddingNote && (
                    <button
                      onClick={() => {
                        setIsAddingNote(true);
                        setTimeout(() => noteInputRef.current?.focus(), 100);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Nova Nota
                    </button>
                  )}
                </div>

                {/* Formulário de adicionar nota */}
                {isAddingNote && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                      <Clock className="h-4 w-4" />
                      <span>Nota em {formatTime(currentTime)}</span>
                    </div>
                    <textarea
                      ref={noteInputRef}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Digite sua anotação aqui..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          addNote();
                        }
                        if (e.key === 'Escape') {
                          setIsAddingNote(false);
                          setNewNoteContent('');
                        }
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Ctrl + Enter para salvar</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNoteContent('');
                          }}
                          className="px-3 py-1.5 text-gray-600 text-xs font-semibold hover:bg-gray-100 rounded transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={addNote}
                          disabled={!newNoteContent.trim()}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de notas */}
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        {editingNoteId === note.id ? (
                          // Modo de edição
                          <div className="space-y-3">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              rows={3}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  updateNote(note.id);
                                }
                                if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1.5 text-gray-600 text-xs font-semibold hover:bg-gray-100 rounded transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => updateNote(note.id)}
                                disabled={!editingContent.trim()}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <Save className="h-3.5 w-3.5" />
                                Salvar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <button
                                  onClick={() => jumpToTimestamp(note.timestamp)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors mb-2"
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(note.timestamp)}
                                </button>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => startEditing(note)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar nota"
                                >
                                  <PenLine className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir esta nota?')) {
                                      deleteNote(note.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Excluir nota"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : !isAddingNote ? (
                  // Estado vazio
                  <div className="text-center py-8 text-gray-500">
                    <Edit3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">Nenhuma nota ainda</p>
                    <p className="text-sm mt-1 text-gray-500">
                      Crie anotações durante o vídeo para guardar conhecimento!
                    </p>
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Criar primeira nota
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              // Seção do Quiz
              <div className="h-full">
                {!quizUnlocked ? (
                  // Bloqueado
                  <div className="text-center py-12 text-gray-500">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Quiz Bloqueado</h3>
                    <p className="text-sm max-w-xs mx-auto mb-6">
                      Assista pelo menos 90% da aula para desbloquear o teste de conhecimento e ganhar XP.
                    </p>
                    <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(90, (currentTime / duration) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 font-semibold">
                      {Math.round((currentTime / duration) * 100)}% assistido
                    </p>
                  </div>
                ) : showQuizResult ? (
                  // Resultado do Quiz
                  <div className="text-center py-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${quizState.score >= 70 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                      {quizState.score >= 70 ? (
                        <Award className="h-10 w-10 text-green-600" />
                      ) : (
                        <AlertCircle className="h-10 w-10 text-red-600" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {quizState.score >= 70 ? 'Parabéns!' : 'Tente Novamente'}
                    </h3>

                    <p className="text-gray-600 mb-6">
                      Você acertou <span className="font-bold text-gray-900">{quizState.score}%</span> das questões
                    </p>

                    {quizState.score >= 70 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xs mx-auto mb-8">
                        <p className="text-sm text-blue-800 font-medium mb-1">Recompensa</p>
                        <p className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                          +{xpReward} XP 💎
                        </p>
                      </div>
                    )}

                    <button
                      onClick={restartQuiz}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Refazer Quiz
                    </button>
                  </div>
                ) : (
                  // Quiz Ativo
                  <div className="max-w-2xl mx-auto py-4">
                    {/* Header Quiz */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm font-medium text-gray-500">
                        Pergunta {currentQuestionIndex + 1} de {QUESTIONS.length}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        Valendo {xpReward} XP
                      </span>
                    </div>

                    {/* Pergunta */}
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      {QUESTIONS[currentQuestionIndex].question}
                    </h3>

                    {/* Opções */}
                    <div className="space-y-3 mb-8">
                      {QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = quizState.answers[QUESTIONS[currentQuestionIndex].id] === idx;
                        const isCorrect = idx === QUESTIONS[currentQuestionIndex].correctAnswer;
                        const showFeedback = quizState.answers[QUESTIONS[currentQuestionIndex].id] !== undefined;

                        let buttonStyle = "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                        if (showFeedback) {
                          if (isSelected && isCorrect) buttonStyle = "border-green-500 bg-green-50 text-green-700";
                          else if (isSelected && !isCorrect) buttonStyle = "border-red-500 bg-red-50 text-red-700";
                          else if (!isSelected && isCorrect) buttonStyle = "border-green-500 bg-green-50 text-green-700 opacity-75"; // Mostra a correta se errou
                          else buttonStyle = "border-gray-200 opacity-50";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={showFeedback}
                            className={`w-full p-4 text-left border-2 rounded-xl transition-all flex items-center justify-between group ${buttonStyle}`}
                          >
                            <span className="font-medium">{option}</span>
                            {showFeedback && (isSelected || isCorrect) && (
                              isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : isSelected ? (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                              ) : null
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer Quiz */}
                    <div className="flex justify-end">
                      <button
                        onClick={nextQuestion}
                        disabled={quizState.answers[QUESTIONS[currentQuestionIndex].id] === undefined}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {currentQuestionIndex < QUESTIONS.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
