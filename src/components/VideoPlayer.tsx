/**
 * Academy Module - Video Player
 *
 * Player de vídeo com controles completos, hotspots interativos,
 * sistema de notas e integração com quiz
 */

import { useState, useRef, useEffect, useCallback } from 'react';
// Native HTML5 video - ReactPlayer removed due to compatibility issues

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

  // Estados de carregamento e erro
  const [isLoading, setIsLoading] = useState(true);

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
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const hasSeekedRef = useRef(false);

  // Forçar recarga e seek inicial quando URL mudar
  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
    hasSeekedRef.current = false;
    setIsLoading(true);
  }, [videoUrl]);

  // Sync play/pause state with native video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.warn('Failed to play video:', err);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Sync volume with native video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Sync mute with native video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

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
      videoRef.current.play();
      setIsPlaying(true);
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
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!hasStarted && !isPlaying && onStatusChange) {
      setHasStarted(true);
      onStatusChange('in_progress');
    }
  };

  // Avançar/retroceder 10 segundos
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const newTime = current + seconds;

      // Bloquear avanço se não completou
      if (seconds > 0 && status !== 'completed' && newTime > maxWatchedTime) {
        videoRef.current.currentTime = maxWatchedTime;
        return;
      }

      videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handler de progresso do video nativo
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const playedSeconds = videoRef.current.currentTime;
    setCurrentTime(playedSeconds);

    // Atualizar máximo assistido
    if (playedSeconds > maxWatchedTime) {
      setMaxWatchedTime(playedSeconds);
    }

    // Notificar parente a cada 5 segundos
    if (onProgressUpdate && Math.abs(playedSeconds - lastProgressUpdateRef.current) > 5) {
      const percent = duration > 0 ? (playedSeconds / duration) * 100 : 0;
      onProgressUpdate(playedSeconds, percent);
      lastProgressUpdateRef.current = playedSeconds;
    }
  }, [duration, maxWatchedTime, onProgressUpdate]);

  const DEFAULT_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const finalUrl = videoUrl && videoUrl.trim() !== '' ? videoUrl.trim() : DEFAULT_VIDEO;

  // Handler de Video Pronto (native video)
  const handleCanPlay = useCallback(() => {
    console.log("� VideoPlayer: CanPlay! URL:", finalUrl);
    setIsLoading(false);

    if (videoRef.current) {
      const d = videoRef.current.duration;
      console.log("⏱️ Duration from video:", d);
      if (d > 0 && isFinite(d)) setDuration(d);
    }

    if (initialTime > 0 && !hasSeekedRef.current && videoRef.current) {
      videoRef.current.currentTime = initialTime;
      setMaxWatchedTime(Math.max(maxWatchedTime, initialTime));
      hasSeekedRef.current = true;
    }
  }, [finalUrl, initialTime, maxWatchedTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      if (d > 0 && isFinite(d)) setDuration(d);
    }
  }, []);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("❌ Erro no player de vídeo:", e);
    console.error("❌ URL que falhou:", finalUrl);
    setIsLoading(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
  };

  // Safety Timeout for Loading State
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("Video loading timed out, forcing display.");
          setIsLoading(false);
        }
      }, 5000); // 5 segundos de limite
    }
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Click na barra de progresso
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      // Bloquear seek se não completou
      if (status !== 'completed' && newTime > maxWatchedTime) {
        videoRef.current.currentTime = maxWatchedTime;
        return;
      }

      videoRef.current.currentTime = newTime;
    }
  };

  // Request Fullscreen
  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume]);

  // Porcentagem de progresso
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

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
            ref={playerContainerRef}
            className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(isPlaying ? false : true)}
            onClick={togglePlay}
          >
            {/* Loading/Error States Visual Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-900 pointer-events-none">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-white text-base font-semibold">Carregando aula...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Native HTML5 Video Player */}
            <div className="absolute inset-0 z-10">
              <video
                ref={videoRef}
                src={finalUrl}
                className="w-full h-full object-cover"
                onCanPlay={handleCanPlay}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onError={handleVideoError}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onEnded={() => {
                  setIsPlaying(false);
                  if (onStatusChange) onStatusChange('completed');
                  if (onComplete) onComplete();
                }}
                playsInline
                preload="metadata"
              />
            </div>

            {/* Controls Overlay */}
            {
              showControls && (
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Progress Bar */}
                  <div
                    ref={progressBarRef}
                    className="w-full h-1.5 bg-gray-300 cursor-pointer group hover:h-2 transition-all relative"
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
                        onClick={toggleFullscreen}
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
              )
            }
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
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditing(note)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar nota"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteNote(note.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Excluir nota"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                              Criada em {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                    <Edit3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nenhuma nota criada</p>
                    <p className="text-xs text-gray-400 mt-1">Crie anotações para marcar momentos importantes da aula</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header do Quiz */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">Quiz de Fixação</h3>
                  </div>
                  {quizState.isCompleted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Concluído • Melhor nota: {quizState.bestScore}%
                    </span>
                  )}
                </div>

                {!quizUnlocked ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Bloqueado</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                      Assista a pelo menos 90% da aula para desbloquear o quiz de fixação e ganhar XP.
                    </p>
                    <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Progresso atual: {Math.round((currentTime / duration) * 100) || 0}%
                    </p>
                  </div>
                ) : showQuizResult ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                      <Award className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {quizState.score >= 70 ? 'Parabéns!' : 'Quase lá!'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Você acertou {quizState.score}% das questões
                    </p>

                    <div className="w-full max-w-md bg-gray-50 rounded-lg p-6 mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Resultado Final</span>
                        <span className={`font-bold ${quizState.score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                          {quizState.score >= 70 ? 'Aprovado' : 'Tente Novamente'}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${quizState.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${quizState.score}%` }}
                        ></div>
                      </div>
                      {quizState.score >= 70 && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-yellow-600 bg-yellow-50 py-2 rounded border border-yellow-200">
                          <Award className="h-4 w-4" />
                          <span>+{xpReward} XP Adicionados</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={restartQuiz}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refazer Quiz
                    </button>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto">
                    {/* Barra de progresso do quiz */}
                    <div className="mb-8">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Questão {currentQuestionIndex + 1} de {QUESTIONS.length}</span>
                        <span>{Math.round(((currentQuestionIndex) / QUESTIONS.length) * 100)}% concluído</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Questão */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-6">
                        {QUESTIONS[currentQuestionIndex].question}
                      </h3>
                      <div className="space-y-3">
                        {QUESTIONS[currentQuestionIndex].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${quizState.answers[QUESTIONS[currentQuestionIndex].id] === index
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${quizState.answers[QUESTIONS[currentQuestionIndex].id] === index
                                ? 'border-blue-600'
                                : 'border-gray-300'
                                }`}>
                                {quizState.answers[QUESTIONS[currentQuestionIndex].id] === index && (
                                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer / Botão Próximo */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        onClick={nextQuestion}
                        disabled={quizState.answers[QUESTIONS[currentQuestionIndex].id] === undefined}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finalizar Quiz' : 'Próxima Questão'}
                        <ChevronRight className="h-4 w-4" />
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
