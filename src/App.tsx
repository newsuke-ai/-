/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Gamepad2, 
  Sparkles, 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  XCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  PencilLine,
  Trash2,
  Undo2
} from 'lucide-react';
import { ALPHABET_DATA, AlphabetItem } from './constants';

type GameMode = 'home' | 'flashcards' | 'quiz' | 'trace';

export default function App() {
  const [mode, setMode] = useState<GameMode>('home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizQuestion, setQuizQuestion] = useState<AlphabetItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<AlphabetItem[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Quiz
  useEffect(() => {
    if (mode === 'quiz') {
      generateQuiz();
    }
  }, [mode]);

  const generateQuiz = () => {
    const correct = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    const options = [correct];
    while (options.length < 4) {
      const random = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
      if (!options.find(o => o.letter === random.letter)) {
        options.push(random);
      }
    }
    setQuizQuestion(correct);
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setFeedback('none');
  };

  const handleQuizAnswer = (item: AlphabetItem) => {
    if (item.letter === quizQuestion?.letter) {
      setFeedback('correct');
      setScore(s => s + 1);
      setTimeout(() => {
        generateQuiz();
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 1000);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4ade80';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 selection:bg-pink-200 overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 4 + i, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: i * 0.5 
            }}
            className="absolute opacity-20"
            style={{ 
              top: `${10 + i * 15}%`, 
              left: `${5 + (i % 3) * 35}%`,
            }}
          >
            <div className={`w-40 h-40 rounded-full blur-3xl ${i % 2 === 0 ? 'bg-pink-300' : 'bg-yellow-300'}`} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-md w-full p-10 rounded-[40px] bg-white border-8 border-pink-300 bubble-shadow-pink"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="mb-4 inline-block"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-pink-400 shadow-md text-5xl">
                ✨
              </div>
            </motion.div>
            <h1 className="text-5xl font-bold text-pink-500 mb-2 tracking-tight uppercase">Alphabet Adventure</h1>
            <p className="text-pink-400 mb-8 font-medium tracking-wide">Ready for a colorful journey?</p>

            <div className="grid gap-6">
              <button
                onClick={() => setMode('flashcards')}
                className="group relative overflow-hidden p-6 rounded-3xl bg-vibrant-blue-light border-4 border-vibrant-blue-dark text-white font-bold text-2xl flex items-center justify-between transition-all bubble-shadow-blue btn-vibrant-press"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white/20 rounded-2xl"><BookOpen className="w-8 h-8" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-80">Phase 1</div>
                    <span>Learn Letters</span>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setMode('quiz')}
                className="group relative overflow-hidden p-6 rounded-3xl bg-vibrant-orange-light border-4 border-vibrant-orange-dark text-white font-bold text-2xl flex items-center justify-between transition-all bubble-shadow-orange btn-vibrant-press"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white/20 rounded-2xl"><Gamepad2 className="w-8 h-8" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-80">Phase 2</div>
                    <span>Letter Quiz</span>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setMode('trace')}
                className="group relative overflow-hidden p-6 rounded-3xl bg-vibrant-green-light border-4 border-vibrant-green-dark text-white font-bold text-2xl flex items-center justify-between transition-all bubble-shadow-green btn-vibrant-press"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white/20 rounded-2xl"><PencilLine className="w-8 h-8" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-80">Phase 3</div>
                    <span>Trace & Draw</span>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'flashcards' && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full flex flex-col gap-8"
          >
            <div className="flex items-center justify-between px-4">
              <button 
                onClick={() => setMode('home')}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-pink-400 bubble-shadow-pink btn-vibrant-press text-pink-500"
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
              <div className="bg-white px-8 py-3 rounded-full border-4 border-pink-400 text-pink-600 text-2xl font-bold flex items-center gap-2 bubble-shadow-pink">
                Progress: <span className="text-pink-400">{currentIndex + 1}/26</span>
              </div>
            </div>

            <div className="relative aspect-[16/9] w-full bouncy-card">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={ALPHABET_DATA[currentIndex].letter}
                  initial={{ x: 300, opacity: 0, rotate: 5 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  exit={{ x: -300, opacity: 0, rotate: -5 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-full h-full bg-white rounded-[60px] border-8 border-pink-300 shadow-2xl flex flex-row items-center justify-around p-12 gap-8 relative overflow-hidden"
                >
                  <div className="absolute top-8 left-12 text-pink-300 text-2xl tracking-widest uppercase italic">What is this?</div>
                  
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[16rem] font-bold leading-none text-pink-500 select-none drop-shadow-xl"
                  >
                    {ALPHABET_DATA[currentIndex].letter}
                  </motion.span>

                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="text-[10rem] select-none filter drop-shadow-lg">
                      {currentIndex === 0 ? '🍎' : 
                       currentIndex === 1 ? '⚽' : 
                       currentIndex === 2 ? '🐱' : 
                       '📦'} 
                    </div>
                    <div className="text-5xl font-bold text-white bg-pink-500 px-10 py-3 rounded-full border-4 border-pink-600 bubble-shadow-pink">
                      {ALPHABET_DATA[currentIndex].word.toUpperCase()}
                    </div>
                    <button 
                      onClick={() => speak(`${ALPHABET_DATA[currentIndex].letter}, for, ${ALPHABET_DATA[currentIndex].word}`)}
                      className="p-6 rounded-full bg-vibrant-yellow-light text-vibrant-yellow-dark border-4 border-vibrant-yellow-dark bubble-shadow-yellow btn-vibrant-press"
                    >
                      <Volume2 className="w-10 h-10" />
                    </button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center items-center gap-12 bg-white/50 rounded-full border-4 border-dashed border-pink-300 p-8">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
                className="w-24 h-24 bg-vibrant-blue-light border-4 border-vibrant-blue-dark rounded-xl flex items-center justify-center text-white bubble-shadow-blue btn-vibrant-press disabled:opacity-50"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
              <button
                disabled={currentIndex === ALPHABET_DATA.length - 1}
                onClick={() => setCurrentIndex(i => i + 1)}
                className="w-24 h-24 bg-vibrant-green-light border-4 border-vibrant-green-dark rounded-xl flex items-center justify-center text-white bubble-shadow-green btn-vibrant-press disabled:opacity-50"
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl w-full flex flex-col gap-10"
          >
            <div className="flex items-center justify-between px-4">
              <button 
                onClick={() => setMode('home')}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-pink-400 bubble-shadow-pink btn-vibrant-press text-pink-500"
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
              <div className="bg-white px-8 py-3 rounded-full border-4 border-vibrant-yellow-dark text-vibrant-yellow-dark text-2xl font-bold flex items-center gap-3 bubble-shadow-yellow">
                <Trophy className="w-8 h-8" />
                <span>Score: {score}</span>
              </div>
            </div>

            <div className="text-center bg-white rounded-[50px] border-8 border-pink-200 p-12 shadow-2xl relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-8 py-2 rounded-full font-bold uppercase tracking-widest text-lg border-4 border-pink-600">
                Quiz Time!
              </div>
              <h2 className="text-4xl font-bold text-stone-700 mb-10 flex flex-col gap-4">
                <span className="text-pink-400 text-xl tracking-[0.2em] uppercase italic">Where is the letter...</span>
                <span className="text-8xl text-pink-500 drop-shadow-lg">{quizQuestion?.letter}</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-8">
                {quizOptions.map((item, idx) => (
                  <motion.button
                    key={`${item.letter}-${idx}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuizAnswer(item)}
                    className={`aspect-square rounded-[40px] text-8xl font-bold flex items-center justify-center text-white transition-all relative overflow-hidden active:translate-y-1 
                      ${item.color === 'bg-red-400' ? 'bg-vibrant-orange-light border-4 border-vibrant-orange-dark bubble-shadow-orange' : 
                        item.color === 'bg-blue-400' ? 'bg-vibrant-blue-light border-4 border-vibrant-blue-dark bubble-shadow-blue' :
                        item.color === 'bg-green-300' ? 'bg-vibrant-green-light border-4 border-vibrant-green-dark bubble-shadow-green' :
                        'bg-vibrant-pink-regular border-4 border-vibrant-pink-dark bubble-shadow-pink'}`}
                  >
                    {item.letter}
                    {feedback !== 'none' && quizQuestion?.letter === item.letter && feedback === 'correct' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-vibrant-green-dark/90 flex items-center justify-center p-4"
                      >
                        <CheckCircle2 className="w-full h-full text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <footer className="flex justify-center h-12">
              <AnimatePresence>
                {feedback === 'wrong' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="bg-red-500 text-white px-10 py-3 rounded-full border-4 border-red-700 font-bold text-2xl bubble-shadow-orange"
                  >
                    Try again!
                  </motion.div>
                )}
                {feedback === 'correct' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 2 }}
                    className="bg-vibrant-green-light text-white px-10 py-3 rounded-full border-4 border-vibrant-green-dark font-bold text-2xl bubble-shadow-green"
                  >
                    Awesome!
                  </motion.div>
                )}
              </AnimatePresence>
            </footer>
          </motion.div>
        )}

        {mode === 'trace' && (
          <motion.div
            key="trace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full flex flex-col gap-8"
          >
            <div className="flex items-center justify-between px-4">
              <button 
                onClick={() => setMode('home')}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-pink-400 bubble-shadow-pink btn-vibrant-press text-pink-500"
              >
                <ArrowLeft className="w-8 h-8" />
              </button>
              <div className="bg-white px-8 py-3 rounded-full border-4 border-vibrant-green-dark text-vibrant-green-dark text-2xl font-bold bubble-shadow-green uppercase">
                Let's Draw!
              </div>
            </div>

            <div className="relative bg-white rounded-[60px] border-8 border-pink-300 shadow-2xl p-10 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-[35rem] font-bold text-pink-900">{ALPHABET_DATA[currentIndex].letter}</span>
              </div>
              
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full aspect-square bg-transparent rounded-[40px] touch-none cursor-crosshair relative z-10 border-4 border-dashed border-pink-100"
              />

              <div className="absolute bottom-10 right-10 flex gap-4 z-20">
                <button 
                  onClick={clearCanvas}
                  className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full border-4 border-pink-300 flex items-center justify-center bubble-shadow-pink btn-vibrant-press"
                >
                  <Trash2 className="w-8 h-8" />
                </button>
              </div>
            </div>

            <div className="flex justify-center items-center gap-12 bg-white/50 rounded-full border-4 border-dashed border-pink-300 p-8">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex(i => i - 1);
                  clearCanvas();
                }}
                className="w-24 h-24 bg-vibrant-blue-light border-4 border-vibrant-blue-dark rounded-xl flex items-center justify-center text-white bubble-shadow-blue btn-vibrant-press disabled:opacity-50"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
              <button
                disabled={currentIndex === ALPHABET_DATA.length - 1}
                onClick={() => {
                  setCurrentIndex(i => i + 1);
                  clearCanvas();
                }}
                className="w-24 h-24 bg-vibrant-green-light border-4 border-vibrant-green-dark rounded-xl flex items-center justify-center text-white bubble-shadow-green btn-vibrant-press disabled:opacity-50"
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
