import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Quiz({ whatsapp }) {
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayQuestion()
    loadStreak()
  }, [])

  async function fetchTodayQuestion() {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (data) {
        setQuestion(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching question:', error)
      setLoading(false)
    }
  }

  function loadStreak() {
    const savedStreak = localStorage.getItem('frushh_streak')
    const lastAnswerDate = localStorage.getItem('frushh_last_answer')
    const today = new Date().toDateString()

    if (lastAnswerDate === today) {
      setIsAnswered(true)
      const wasCorrect = localStorage.getItem('frushh_today_correct') === 'true'
      setIsCorrect(wasCorrect)
    }

    if (savedStreak) {
      setStreak(parseInt(savedStreak))
    }
  }

  function handleAnswer(option) {
    if (isAnswered) return

    setSelectedAnswer(option)
    setIsAnswered(true)

    const correct = option === question.correct_option
    setIsCorrect(correct)

    const today = new Date().toDateString()
    localStorage.setItem('frushh_last_answer', today)
    localStorage.setItem('frushh_today_correct', correct.toString())

    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      localStorage.setItem('frushh_streak', newStreak.toString())
    } else {
      setStreak(0)
      localStorage.setItem('frushh_streak', '0')
    }
  }

  function getButtonStyle(option) {
    if (!isAnswered) {
      return 'bg-green-50 hover:bg-green-100 text-gray-800'
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
      <section className="py-16 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="text-4xl mb-4">🧠</div>
          <p>Loading Quiz...</p>
        </div>
      </section>
    )
  }

  if (!question) {
    return null
  }

  return (
    <section id="quiz" className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-500">
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="text-6xl mb-6">🧠</div>
        <h2 className="text-3xl md:text-4xl font-black mb-4">Daily Protein Quiz</h2>
        <p className="text-xl opacity-90 mb-2">
          Answer correctly for 7 days = <span className="font-bold underline">FREE ₹49 Shake!</span>
        </p>
        
        {/* Streak Display */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold">Streak: {streak}/7 days</span>
          {streak >= 7 && (
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold ml-2">
              🎉 FREE SHAKE EARNED!
            </span>
          )}
        </div>

        {/* Streak Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  day <= streak
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-white/20 text-white/60'
                }`}
              >
                {day <= streak ? '✓' : day}
              </div>
            ))}
          </div>
        </div>
        
        {/* Quiz Card */}
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

          {/* Result Message */}
          {isAnswered && (
            <div className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              {isCorrect ? (
                <div>
                  <p className="text-green-700 font-bold text-lg">✅ Correct! Well done!</p>
                  <p className="text-green-600 text-sm mt-1">{question.explanation}</p>
                  {streak >= 7 ? (
                    <div className="mt-3">
                      <p className="text-green-700 font-bold">🎉 Congratulations! You earned a FREE shake!</p>
                      
                        href={whatsapp + "&text=Hi!%20I%20completed%207-day%20quiz%20streak!%20Claim%20my%20FREE%20shake%20🎉"}
                        target="_blank"
                        className="inline-block mt-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
                      >
                        Claim FREE Shake 🥤
                      </a>
                    </div>
                  ) : (
                    <p className="text-green-600 mt-2">
                      🔥 {7 - streak} more correct answers for FREE shake!
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-700 font-bold text-lg">❌ Oops! Wrong answer</p>
                  <p className="text-red-600 text-sm mt-1">
                    Correct answer: {question.correct_option.toUpperCase()}) {question[`option_${question.correct_option}`]}
                  </p>
                  <p className="text-red-600 text-sm mt-1">{question.explanation}</p>
                  <p className="text-red-600 mt-2">Streak reset! Try again tomorrow 💪</p>
                </div>
              )}
            </div>
          )}

          {/* Already Answered Today */}
          {isAnswered && !selectedAnswer && (
            <div className="mt-6 p-4 rounded-xl bg-blue-100">
              <p className="text-blue-700">You already answered today! Come back tomorrow for a new question 🌅</p>
            </div>
          )}
        </div>

        <p className="text-white/70 text-sm mt-6">New question every day at 12:00 PM!</p>
      </div>
    </section>
  )
}

export default Quiz
