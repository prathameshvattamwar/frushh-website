import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function QuizPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [recommendation, setRecommendation] = useState(null)
  const [alreadyTaken, setAlreadyTaken] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [user])

  async function fetchQuiz() {
    try {
      // Check if user already took quiz
      if (user) {
        const { data: existing } = await supabase
          .from('quiz_responses')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
        
        if (existing && existing.length > 0) {
          setAlreadyTaken(true)
        }
      }

      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data) setQuestions(data)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  function handleAnswer(questionId, answer) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
    } else {
      calculateResult()
    }
  }

  async function calculateResult() {
    setShowResult(true)

    // Simple recommendation logic based on answers
    let recommendedProduct = 'classic-peanut-power'
    let reason = 'Perfect balance of protein and taste'

    const answerValues = Object.values(answers)
    
    // Check for fitness goals
    if (answerValues.some(a => a.toLowerCase().includes('muscle') || a.toLowerCase().includes('bulk'))) {
      recommendedProduct = 'chocolate-muscle'
      reason = 'High protein for muscle building'
    } else if (answerValues.some(a => a.toLowerCase().includes('weight loss') || a.toLowerCase().includes('lean'))) {
      recommendedProduct = 'banana-protein-blast'
      reason = 'Low calorie, high protein for weight management'
    } else if (answerValues.some(a => a.toLowerCase().includes('energy') || a.toLowerCase().includes('morning'))) {
      recommendedProduct = 'coffee-protein-kick'
      reason = 'Natural caffeine boost with protein'
    } else if (answerValues.some(a => a.toLowerCase().includes('natural') || a.toLowerCase().includes('healthy'))) {
      recommendedProduct = 'dry-fruit-deluxe'
      reason = 'All natural dry fruits, no added sugar'
    }

    // Fetch recommended product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('slug', recommendedProduct)
      .single()

    if (product) {
      setRecommendation(product)
    }

    // Save quiz response if logged in
    if (user) {
      await supabase.from('quiz_responses').insert({
        user_id: user.id,
        answers: answers,
        recommended_product: recommendedProduct
      })

      // Award points for first quiz
      if (!alreadyTaken) {
        const { data: pointsData } = await supabase
          .from('loyalty_points')
          .select('points_balance, total_earned')
          .eq('user_id', user.id)
          .single()

        if (pointsData) {
          await supabase
            .from('loyalty_points')
            .update({
              points_balance: pointsData.points_balance + 15,
              total_earned: pointsData.total_earned + 15
            })
            .eq('user_id', user.id)

          await supabase.from('points_transactions').insert({
            user_id: user.id,
            points: 15,
            type: 'quiz',
            description: 'Completed shake finder quiz!'
          })
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500"></i>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <i className="fa-solid fa-clipboard-question text-5xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Coming Soon!</h2>
          <p className="text-gray-500 mb-4">We're preparing questions for you</p>
          <button onClick={() => navigate('/menu')} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold">
            Browse Menu Instead
          </button>
        </div>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fa-solid fa-wand-magic-sparkles text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Your Perfect Shake!</h1>
            {!alreadyTaken && user && (
              <p className="text-green-600 font-medium"><i className="fa-solid fa-star mr-1"></i>+15 points earned!</p>
            )}
          </div>

          {recommendation && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className={`fa-solid ${recommendation.icon || 'fa-glass-water'} text-4xl`}></i>
                </div>
                <h2 className="text-2xl font-bold mb-1">{recommendation.name}</h2>
                <p className="text-green-100">{reason}</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{recommendation.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-green-600">{recommendation.protein_250ml || 0}g</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-blue-600">{recommendation.calories_250ml || 0}</p>
                    <p className="text-xs text-gray-500">Calories</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-orange-600">₹{recommendation.price_250ml}</p>
                    <p className="text-xs text-gray-500">250ml</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/product/${recommendation.slug}`)}
                  className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
                >
                  <i className="fa-solid fa-cart-plus mr-2"></i>Order Now
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setShowResult(false); setCurrentIndex(0); setAnswers({}); }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl"
            >
              <i className="fa-solid fa-rotate-right mr-2"></i>Retake
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl"
            >
              <i className="fa-solid fa-utensils mr-2"></i>View All
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Find Your Shake</h1>
          <p className="text-gray-500">Answer {questions.length} quick questions</p>
        </div>

        <div className="bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Question {currentIndex + 1}/{questions.length}</span>
            {!alreadyTaken && user && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <i className="fa-solid fa-star mr-1"></i>+15 pts
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options && question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition ${
                  answers[question.id] === option
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>Previous
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizPage
