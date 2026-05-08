"use client"

import { useState, useEffect } from "react"
import { getQuizWords, saveStudyResult } from "@/app/actions/study"
import { Check, X, ArrowRight, Volume2 } from "lucide-react"
import Link from "next/link"

export default function StudyPage() {
  const [words, setWords] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getQuizWords()
      setWords(data)
      setLoading(false)
    }
    load()
  }, [])

  function handleCheck() {
    if (!selectedOption) return
    
    const correct = selectedOption === words[currentIndex].meaning
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
  }

  function handleNext() {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setIsCorrect(null)
    } else {
      setFinished(true)
      saveStudyResult(score + (isCorrect ? 1 : 0), words.length)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
          <p>Preparing your session...</p>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card animate-in">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</h1>
          <h2>Session Complete!</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '2rem 0', color: 'var(--primary)' }}>
            {score} / {words.length}
          </div>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
            {score === words.length ? "Perfect score! You're a pro." : "Keep practicing to improve!"}
          </p>
          <Link href="/" className="btn btn-primary" style={{ width: '100%' }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="container" style={{ maxWidth: '600px', padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card animate-in">
          <h2>Not enough words</h2>
          <p style={{ margin: '1rem 0 2rem', color: 'var(--muted-foreground)' }}>
            You need to add at least 4 words to start a study session.
          </p>
          <Link href="/" className="btn btn-primary">
            Go Add Words
          </Link>
        </div>
      </div>
    )
  }

  function handleSpeak() {
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = currentWord.language === 'ZH' ? 'zh-CN' : 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
      {/* Progress Bar */}
      <div style={{ height: '8px', backgroundColor: 'var(--secondary)', borderRadius: '4px', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          height: '100%', 
          backgroundColor: 'var(--primary)', 
          width: `${progress}%`,
          transition: 'width 0.4s ease'
        }}></div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          {currentWord.language === 'ZH' ? 'HSK LEVEL' : 'VOCABULARY'}
        </div>
        <h2 className="study-h2" style={{ fontSize: '2.5rem', fontWeight: 800 }}>What does this mean?</h2>
      </div>

      <div className="study-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
        <div className="card" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          aspectRatio: '1/1',
          position: 'relative',
          fontSize: currentWord.language === 'ZH' ? '5rem' : '3rem',
          fontWeight: 800
        }}>
          <button 
            onClick={handleSpeak}
            style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <Volume2 size={20} />
          </button>
          {currentWord.word}
          <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
            {currentWord.phonetic}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentWord.options.map((option: string) => (
            <button
              key={option}
              onClick={() => isCorrect === null && setSelectedOption(option)}
              className={`btn ${selectedOption === option ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                justifyContent: 'flex-start', 
                padding: '1.25rem', 
                border: '2px solid transparent',
                borderColor: selectedOption === option ? 'var(--primary)' : 'var(--border)',
                backgroundColor: 'white',
                color: 'var(--foreground)',
                fontSize: '1.125rem'
              }}
            >
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '8px', 
                border: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: selectedOption === option ? 'var(--primary)' : 'white',
                color: selectedOption === option ? 'white' : 'var(--muted-foreground)'
              }}>
                {currentWord.options.indexOf(option) + 1}
              </div>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="study-footer" style={{ 
        marginTop: '4rem', 
        paddingTop: '2rem', 
        borderTop: '2px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button className="btn btn-secondary" style={{ color: 'var(--muted-foreground)' }}>SKIP</button>
        
        {isCorrect === null ? (
          <button 
            className="btn btn-primary" 
            style={{ minWidth: '150px' }}
            disabled={!selectedOption}
            onClick={handleCheck}
          >
            CHECK
          </button>
        ) : (
          <div className="study-footer" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem', 
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div className="study-result-msg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCorrect ? '#22c55e' : '#ef4444', fontWeight: 800 }}>
              {isCorrect ? <Check /> : <X />}
              {isCorrect ? 'EXCELLENT!' : 'NOT QUITE...'}
            </div>
            <button 
              className="btn btn-primary" 
              style={{ minWidth: '150px', backgroundColor: isCorrect ? '#22c55e' : '#ef4444' }}
              onClick={handleNext}
            >
              CONTINUE
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
