import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'

function ProductModal({ product, addons, isOpen, onClose }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('250ml')
  const [selectedAddons, setSelectedAddons] = useState([])

  const productIcons = {
    'peanut-power': 'fa-solid fa-jar',
    'chocolate-muscle': 'fa-solid fa-mug-hot',
    'dry-fruit-deluxe': 'fa-solid fa-bowl-food',
    'muesli-energy': 'fa-solid fa-wheat-awn',
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedSize('250ml')
      setSelectedAddons([])
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const basePrice = selectedSize === '250ml' ? product.price_250ml : product.price_350ml
  const protein = selectedSize === '250ml' ? product.protein_250ml : product.protein_350ml
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
  const totalPrice = basePrice + addonsTotal

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

  function handleAddToCart() {
    addToCart(product, selectedSize, selectedAddons)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-green-500 p-4 text-white relative">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <i className={`${productIcons[product.slug] || 'fa-solid fa-glass-water'} text-3xl`}></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p className="text-green-100 text-sm">{product.description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">
              <i className="fa-solid fa-glass-water mr-2 text-green-500"></i>
              Select Size
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSize('250ml')}
                className={`p-4 rounded-xl border-2 transition ${selectedSize === '250ml' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <p className="font-bold text-lg">250ml</p>
                <p className="text-green-600 font-bold">Rs.{product.price_250ml}</p>
                <p className="text-xs text-gray-500">{product.protein_250ml}g protein</p>
              </button>
              <button
                onClick={() => setSelectedSize('350ml')}
                className={`p-4 rounded-xl border-2 transition ${selectedSize === '350ml' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <p className="font-bold text-lg">350ml</p>
                <p className="text-green-600 font-bold">Rs.{product.price_350ml}</p>
                <p className="text-xs text-gray-500">{product.protein_350ml}g protein</p>
              </button>
            </div>
          </div>

          {/* Add-ons Selection */}
          {addons && addons.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">
                <i className="fa-solid fa-plus-circle mr-2 text-green-500"></i>
                Add Natural Boosters
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.find(a => a.id === addon.id)
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-3 rounded-xl border-2 transition text-left flex items-center gap-3 ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                        {isSelected ? <i className="fa-solid fa-check text-sm"></i> : <i className={`${addon.icon} text-green-600 text-sm`}></i>}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{addon.name}</p>
                        <p className="text-green-600 font-bold text-sm">+Rs.{addon.price}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-black text-gray-900">Rs.{totalPrice}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{selectedSize} • {protein}g protein</p>
              {selectedAddons.length > 0 && <p>+{selectedAddons.length} add-ons</p>}
            </div>
          </div>
          <button onClick={handleAddToCart} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 text-lg">
            <i className="fa-solid fa-cart-plus"></i>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
