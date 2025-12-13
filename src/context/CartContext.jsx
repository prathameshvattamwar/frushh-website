import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('frushh_cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        localStorage.removeItem('frushh_cart')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('frushh_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Add item to cart
  function addToCart(product, size, addons = [], quantity = 1) {
    const price = size === '250ml' ? product.price_250ml : product.price_350ml
    const protein = size === '250ml' ? product.protein_250ml : product.protein_350ml
    const calories = size === '250ml' ? product.calories_250ml : product.calories_350ml
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0)

    const cartItem = {
      id: `${product.id}-${size}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      icon: product.icon,
      size: size,
      price: price,
      protein: protein,
      calories: calories,
      addons: addons,
      addonsTotal: addonsTotal,
      itemPrice: price + addonsTotal,
      quantity: quantity
    }

    setCartItems(prev => [...prev, cartItem])
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
    if (newQuantity > 10) return

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
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0)
  const cartTotalProtein = cartItems.reduce((sum, item) => sum + (item.protein * item.quantity), 0)

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    cartTotalProtein,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
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
