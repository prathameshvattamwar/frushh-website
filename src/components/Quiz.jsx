import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Quiz() {
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayQuestion()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserStreak()
    } else {
      loadGuestStreak()
    }
  }, [user])

  async function fetchTodayQuestion() {
    try {
       const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        // Use date to get consistent daily question
        const today = new Date()
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
        const questionIndex = dayOfYear % data.length
        setQuestion(data[questionIndex])
      }
      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setLoading(false)
    }
  }

  async function loadUserStreak() {
    if (!user) return

    try {
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (streakData) {
        setStreak(streakData.current_streak || 0)
        
        const today = new Date().toDateString()
        const lastAnswer = streakData.last_answer_date ? new Date(streakData.last_answer_date).toDateString() : null

        if (lastAnswer === today) {
          setIsAnswered(true)
          setIsCorrect(streakData.today_correct || false)
          setSelectedAnswer(streakData.today_answer || null)
        }
      }
    } catch (err) {
      console.error('Error loading streak:', err)
    }
  }

  function loadGuestStreak() {
    const savedStreak = localStorage.getItem('frushh_guest_streak')
    const lastAnswerDate = localStorage.getItem('frushh_guest_last_answer')
    const today = new Date().toDateString()

    if (lastAnswerDate === today) {
      setIsAnswered(true)
      const wasCorrect = localStorage.getItem('frushh_guest_today_correct') === 'true'
      const savedAnswer = localStorage.getItem('frushh_guest_today_answer')
      setIsCorrect(wasCorrect)
      setSelectedAnswer(savedAnswer)
    } else {
      // New day - reset answered state but keep streak if consecutive
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (lastAnswerDate !== yesterday.toDateString()) {
        // Streak broken
        localStorage.setItem('frushh_guest_streak', '0')
        setStreak(0)
      }
    }

    if (savedStreak) {
      setStreak(parseInt(savedStreak))
    }
  }

  async function handleAnswer(option) {
    if (isAnswered) return

    setSelectedAnswer(option)
    setIsAnswered(true)

    const correct = option === question.correct_option
    setIsCorrect(correct)

    const today = new Date().toDateString()
    let newStreak = correct ? streak + 1 : 0

    if (correct) {
      setStreak(newStreak)
    } else {
      setStreak(0)
      newStreak = 0
    }

    if (user) {
      // Save to database for logged in users
      try {
        const { data: existing } = await supabase
          .from('user_streaks')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (existing) {
          await supabase
            .from('user_streaks')
            .update({
              current_streak: newStreak,
              longest_streak: newStreak > (existing.longest_streak || 0) ? newStreak : existing.longest_streak,
              last_answer_date: new Date().toISOString(),
              today_correct: correct,
              today_answer: option,
              total_correct: correct ? (existing.total_correct || 0) + 1 : existing.total_correct,
              total_answered: (existing.total_answered || 0) + 1
            })
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('user_streaks')
            .insert({
              user_id: user.id,
              current_streak: newStreak,
              longest_streak: newStreak,
              last_answer_date: new Date().toISOString(),
              today_correct: correct,
              today_answer: option,
              total_correct: correct ? 1 : 0,
              total_answered: 1
            })
        }

        // Award points for 7-day streak
        if (newStreak === 7) {
          const { data: pointsData } = await supabase
            .from('loyalty_points')
            .select('points_balance, total_earned')
            .eq('user_id', user.id)
            .single()

          if (pointsData) {
            await supabase
              .from('loyalty_points')
              .update({
                points_balance: pointsData.points_balance + 100,
                total_earned: pointsData.total_earned + 100
              })
              .eq('user_id', user.id)

            await supabase.from('points_transactions').insert({
              user_id: user.id,
              points: 100,
              type: 'quiz_streak',
              description: '7-day quiz streak! FREE shake earned!'
            })
          }
        }
      } catch (err) {
        console.error('Error saving streak:', err)
      }
    } else {
      // Save to localStorage for guests
      localStorage.setItem('frushh_guest_last_answer', today)
      localStorage.setItem('frushh_guest_today_correct', correct.toString())
      localStorage.setItem('frushh_guest_today_answer', option)
      localStorage.setItem('frushh_guest_streak', newStreak.toString())
    }
  }

  function getButtonStyle(option) {
    if (!isAnswered) {
      return 'bg-green-50 hover:bg-green-100 text-gray-800 cursor-pointer'
    }
    if (option === question.correct_option) {
      return 'bg-green-500 text-white'
    }
    if (option === selectedAnswer && option !== question.correct_option) {
      return 'bg-red-500 text-white'
    }
    return 'bg-gray-100 text-gray-400'
  }

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-3xl font-black mb-4">Daily Protein Quiz</h2>
          <p>Loading question...</p>
        </div>
      </section>
    )
  }

  if (!question) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-3xl font-black mb-4">Daily Protein Quiz</h2>
          <p className="text-xl mb-4">Answer 7 questions correctly = FREE Shake!</p>
          <div className="bg-white rounded-2xl p-6 max-w-md mx-auto text-gray-800">
            <p className="font-bold">Coming Soon!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-500">
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="text-6xl mb-6">🧠</div>
        <h2 className="text-3xl md:text-4xl font-black mb-4">Daily Protein Quiz</h2>
        <p className="text-xl opacity-90 mb-2">
          Answer correctly for 7 days = FREE ₹49 Shake!
        </p>
        
        <div className="flex justify-center items-center gap-2 mb-8">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold">Streak: {streak}/7 days</span>
          {streak === 7 && <span className="ml-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">🎉 FREE SHAKE!</span>}
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  day <= streak ? 'bg-yellow-400 text-yellow-900' : 'bg-white/20 text-white/60'
                }`}
              >
                {day <= streak ? '✓' : day}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl mx-auto text-gray-900 shadow-2xl">
          <div className="text-sm text-green-600 font-medium mb-2">TODAY'S QUESTION</div>
          <h3 className="text-lg md:text-xl font-bold mb-6">{question.question}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer('a')}
              disabled={isAnswered}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${getButtonStyle('a')}`}
            >
              A) {question.option_a}
            </button>
            <button
              onClick={() => handleAnswer('b')}
              disabled={isAnswered}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${getButtonStyle('b')}`}
            >
              B) {question.option_b}
            </button>
            <button
              onClick={() => handleAnswer('c')}
              disabled={isAnswered}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${getButtonStyle('c')}`}
            >
              C) {question.option_c}
            </button>
            <button
              onClick={() => handleAnswer('d')}
              disabled={isAnswered}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${getButtonStyle('d')}`}
            >
              D) {question.option_d}
            </button>
          </div>

          {isAnswered && isCorrect && (
            <div className="mt-6 p-4 rounded-xl bg-green-100">
              <p className="text-green-700 font-bold text-lg">✅ Correct!</p>
              {question.explanation && <p className="text-green-600 text-sm mt-1">{question.explanation}</p>}
              {streak < 7 ? (
                <p className="text-green-600 mt-2">🔥 {7 - streak} more days for FREE shake!</p>
              ) : (
                <p className="text-green-600 mt-2 font-bold">🎉 You earned a FREE ₹49 shake! Check Rewards.</p>
              )}
            </div>
          )}

          {isAnswered && !isCorrect && (
            <div className="mt-6 p-4 rounded-xl bg-red-100">
              <p className="text-red-700 font-bold text-lg">❌ Wrong!</p>
              {question.explanation && <p className="text-red-600 text-sm mt-1">{question.explanation}</p>}
              <p className="text-red-600 mt-2">Streak reset! Try again tomorrow 💪</p>
            </div>
          )}

          {!user && (
            <p className="mt-4 text-sm text-gray-500">
              <a href="/login" className="text-green-600 font-medium hover:underline">Login</a> to save your streak & earn rewards!
            </p>
          )}
        </div>

        <p className="text-white/70 text-sm mt-6">New question every day at midnight!</p>
      </div>
    </section>
  )
}

export default Quiz
