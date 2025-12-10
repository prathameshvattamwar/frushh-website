import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('frushh_cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('frushh_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Add item to cart
  function addToCart(product, size, addons = []) {
    const price = size === '250ml' ? product.price_250ml : product.price_350ml
    const protein = size === '250ml' ? product.protein_250ml : product.protein_350ml
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0)

    const cartItem = {
      id: `${product.id}-${size}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      size: size,
      price: price,
      protein: protein,
      addons: addons,
      addonsTotal: addonsTotal,
      totalPrice: price + addonsTotal,
      quantity: 1
    }

    setCartItems(prev => [...prev, cartItem])
    setIsCartOpen(true)
  }

  // Remove item from cart
  function removeFromCart(itemId) {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Update quantity
  function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  // Clear cart
  function clearCart() {
    setCartItems([])
  }

  // Calculate totals
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)

  // Open/Close cart
  function openCart() { setIsCartOpen(true) }
  function closeCart() { setIsCartOpen(false) }

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export default CartContext
