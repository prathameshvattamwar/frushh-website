import { useCart } from '../../context/CartContext'

function CartSidebar() {
  const { cartItems, cartCount, cartTotal, isCartOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart()

  const whatsapp = "https://wa.me/919271981229"

  const productIcons = {
    'peanut-power': 'fa-solid fa-jar',
    'chocolate-muscle': 'fa-solid fa-mug-hot',
    'dry-fruit-deluxe': 'fa-solid fa-bowl-food',
    'muesli-energy': 'fa-solid fa-wheat-awn',
  }

  function handleCheckout() {
    if (cartItems.length === 0) return

    let message = "🥤 *FRUSHH ORDER*\n\n"
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.size}) x${item.quantity}\n`
      message += `   Price: Rs.${item.price * item.quantity}\n`
      if (item.addons.length > 0) {
        message += `   Add-ons: ${item.addons.map(a => a.name).join(', ')}\n`
        message += `   Add-ons Total: Rs.${item.addonsTotal * item.quantity}\n`
      }
      message += "\n"
    })

    message += `━━━━━━━━━━━━━━━━━━\n`
    message += `*TOTAL: Rs.${cartTotal}*\n\n`
    message += `Please confirm my order!`

    const encodedMessage = encodeURIComponent(message)
    window.open(`${whatsapp}?text=${encodedMessage}`, '_blank')
  }

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={closeCart}></div>

      {/* Cart Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-green-500 text-white">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-cart-shopping text-xl"></i>
            <h2 className="text-lg font-bold">Your Cart</h2>
            <span className="bg-white text-green-600 text-sm font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
          </div>
          <button onClick={closeCart} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-cart-shopping text-6xl text-gray-200 mb-4"></i>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add some delicious shakes!</p>
              <button onClick={closeCart} className="mt-4 px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition">
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${productIcons[item.slug] || 'fa-solid fa-glass-water'} text-xl text-green-600`}></i>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.size} • {item.protein}g protein</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition">
                          <i className="fa-solid fa-trash text-sm"></i>
                        </button>
                      </div>

                      {/* Addons */}
                      {item.addons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.addons.map((addon, idx) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              +{addon.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quantity & Price */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition">
                            <i className="fa-solid fa-minus text-xs"></i>
                          </button>
                          <span className="font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition">
                            <i className="fa-solid fa-plus text-xs"></i>
                          </button>
                        </div>
                        <p className="font-bold text-green-600">Rs.{item.totalPrice * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <button onClick={clearCart} className="w-full py-2 text-red-500 text-sm font-medium hover:text-red-600 transition">
                <i className="fa-solid fa-trash mr-2"></i>Clear Cart
              </button>
            </div>
          )}
        </div>

        {/* Footer - Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-black text-gray-900">Rs.{cartTotal}</span>
            </div>
            <button onClick={handleCheckout} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 text-lg">
              <i className="fa-brands fa-whatsapp text-xl"></i>
              Order on WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">Cash on Delivery available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartSidebar
