import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { playCutePopSound, playSparkleSound } from '../utils/audioAlert';
import { ArrowLeft, Check } from 'lucide-react';

export default function QuizView() {
  const { handleFinishQuiz, setCurrentView } = useOrder();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const totalSteps = QUIZ_QUESTIONS.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const currentAnswer = selectedAnswers[currentQuestion.id];

  const handleSelectOption = (optionId) => {
    playCutePopSound();

    const updated = {
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    };
    setSelectedAnswers(updated);

    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        playSparkleSound();
        setIsSubmitting(true);
        setTimeout(() => {
          handleFinishQuiz(updated);
        }, 350);
      }
    }, 240);
  };

  const handleBack = () => {
    playCutePopSound();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setCurrentView('landing');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-16 pt-4 lg:pt-8 space-y-6 animate-fade-in">
      {/* Top Header & Minimalist Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="py-1.5 px-3 -ml-1 rounded-full text-stone-600 hover:text-[#2C1810] hover:bg-stone-200/60 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
            Langkah 0{currentStep + 1} / 0{totalSteps}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2C1810] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Editorial Question Card Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-300/80 space-y-6">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#C83E4D] tracking-widest uppercase block">
            Pertanyaan 0{currentStep + 1}
          </span>
          <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-[#2C1810] leading-snug">
            {currentQuestion.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {currentQuestion.subtitle}
          </p>
        </div>

        {/* Options List (1 col on Mobile, 2 cols on Laptop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQuestion.options.map(option => {
            const isSelected = currentAnswer === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all duration-150 flex items-center justify-between border active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#FAF6F0] border-[#2C1810] ring-1 ring-[#2C1810]'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-center gap-3.5 pr-2">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                      isSelected ? 'bg-white border-stone-300' : 'bg-[#FAF6F0] border-stone-200/70'
                    }`}
                  >
                    <span>{option.emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-fredoka font-bold text-sm sm:text-base text-[#2C1810]">
                      {option.label}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {option.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#2C1810] border-[#2C1810] text-white'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isSubmitting && (
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200/70 text-[#2C1810] text-xs font-semibold">
            <span>Menyiapkan rekomendasi varian rasa...</span>
          </div>
        </div>
      )}
    </div>
  );
}
