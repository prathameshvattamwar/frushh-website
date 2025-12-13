import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Selection state
  const [selectedSize, setSelectedSize] = useState('250ml')
  const [selectedAddons, setSelectedAddons] = useState([])
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${slug}` } })
      return
    }
    fetchData()
  }, [slug, user])

  async function fetchData() {
    try {
      // Fetch product
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !productData) {
        navigate('/menu')
        return
      }

      setProduct(productData)

      // Fetch addons
      const { data: addonsData } = await supabase
        .from('addons')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true })

      if (addonsData) setAddons(addonsData)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/menu')
    }
  }

  function toggleAddon(addon) {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id)
      if (exists) {
        return prev.filter(a => a.id !== addon.id)
      } else {
        return [...prev, addon]
      }
    })
  }

  function calculatePrice() {
    const basePrice = selectedSize === '250ml' ? product.price_250ml : product.price_350ml
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
    return (basePrice + addonsTotal) * quantity
  }

  function handleAddToCart() {
    setAdding(true)
    
    addToCart(product, selectedSize, selectedAddons, quantity)
    
    setTimeout(() => {
      setAdding(false)
      // Reset selections
      setSelectedAddons([])
      setQuantity(1)
      // Show success and navigate
      navigate('/cart')
    }, 500)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-glass-water text-5xl text-green-500 animate-pulse mb-4"></i>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  const currentPrice = selectedSize === '250ml' ? product.price_250ml : product.price_350ml
  const currentProtein = selectedSize === '250ml' ? product.protein_250ml : product.protein_350ml
  const currentCalories = selectedSize === '250ml' ? product.calories_250ml : product.calories_350ml
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
  const totalPrice = calculatePrice()

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* Header */}
      <div className="bg-green-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => navigate('/menu')} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to Menu
          </button>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <i className={`fa-solid ${product.icon || 'fa-glass-water'} text-4xl`}></i>
            </div>
            <div>
              <h1 className="text-2xl font-black">{product.name}</h1>
              <p className="text-white/80 text-sm">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Size Selection */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-glass-water text-green-500"></i>
            Select Size
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedSize('250ml')}
              className={`p-4 rounded-xl border-2 transition text-left ${
                selectedSize === '250ml'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">250ml</span>
                {selectedSize === '250ml' && (
                  <i className="fa-solid fa-check-circle text-green-500"></i>
                )}
              </div>
              <p className="text-2xl font-black text-green-600">₹{product.price_250ml}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span><i className="fa-solid fa-dumbbell mr-1"></i>{product.protein_250ml}g protein</span>
                {product.calories_250ml && (
                  <span><i className="fa-solid fa-fire mr-1"></i>{product.calories_250ml} cal</span>
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedSize('350ml')}
              className={`p-4 rounded-xl border-2 transition text-left ${
                selectedSize === '350ml'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">350ml</span>
                {selectedSize === '350ml' && (
                  <i className="fa-solid fa-check-circle text-green-500"></i>
                )}
              </div>
              <p className="text-2xl font-black text-green-600">₹{product.price_350ml}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span><i className="fa-solid fa-dumbbell mr-1"></i>{product.protein_350ml}g protein</span>
                {product.calories_350ml && (
                  <span><i className="fa-solid fa-fire mr-1"></i>{product.calories_350ml} cal</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Add-ons Selection */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <i className="fa-solid fa-plus-circle text-green-500"></i>
            Add Natural Boosters
          </h2>
          <p className="text-sm text-gray-500 mb-4">Optional - Enhance your shake</p>

          <div className="grid grid-cols-2 gap-2">
            {addons.map((addon) => {
              const isSelected = selectedAddons.find(a => a.id === addon.id)
              return (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon)}
                  className={`p-3 rounded-xl border-2 transition text-left flex items-center gap-3 ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-green-600'
                  }`}>
                    {isSelected ? (
                      <i className="fa-solid fa-check text-sm"></i>
                    ) : (
                      <i className={`fa-solid ${addon.icon || 'fa-plus'} text-sm`}></i>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{addon.name}</p>
                    <p className="text-green-600 font-bold text-sm">+₹{addon.price}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-hashtag text-green-500"></i>
            Quantity
          </h2>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
              <i className="fa-solid fa-minus"></i>
            </button>
            <span className="text-3xl font-black w-16 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>

        {/* Summary */}
        {selectedAddons.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h2 className="font-bold text-gray-900 mb-3">Selected Add-ons</h2>
            <div className="flex flex-wrap gap-2">
              {selectedAddons.map((addon) => (
                <span 
                  key={addon.id} 
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1"
                >
                  {addon.name}
                  <button onClick={() => toggleAddon(addon)} className="ml-1 hover:text-green-900">
                    <i className="fa-solid fa-times text-xs"></i>
                  </button>
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Add-ons total: <span className="font-bold text-green-600">+₹{addonsTotal}</span>
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-black text-gray-900">₹{totalPrice}</p>
              <p className="text-xs text-gray-500">
                {quantity} x {selectedSize} • {currentProtein}g protein
                {selectedAddons.length > 0 && ` • +${selectedAddons.length} add-ons`}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="px-8 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {adding ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cart-plus"></i>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
