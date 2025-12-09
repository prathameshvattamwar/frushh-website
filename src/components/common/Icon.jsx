// Icon Component - FontAwesome wrapper
function Icon({ name, className = "", size = "base", onClick }) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm", 
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  }

  return (
    <i 
      className={`${name} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    />
  )
}

// Pre-defined icons for easy use
export const Icons = {
  // Navigation
  cart: "fa-solid fa-cart-shopping",
  user: "fa-solid fa-user",
  menu: "fa-solid fa-bars",
  close: "fa-solid fa-xmark",
  back: "fa-solid fa-arrow-left",
  
  // Actions
  plus: "fa-solid fa-plus",
  minus: "fa-solid fa-minus",
  check: "fa-solid fa-check",
  edit: "fa-solid fa-pen",
  delete: "fa-solid fa-trash",
  search: "fa-solid fa-magnifying-glass",
  
  // Contact
  whatsapp: "fa-brands fa-whatsapp",
  phone: "fa-solid fa-phone",
  email: "fa-solid fa-envelope",
  
  // Delivery
  location: "fa-solid fa-location-dot",
  clock: "fa-solid fa-clock",
  delivery: "fa-solid fa-motorcycle",
  morning: "fa-solid fa-sun",
  evening: "fa-solid fa-moon",
  
  // Products
  shake: "fa-solid fa-glass-water",
  leaf: "fa-solid fa-leaf",
  fire: "fa-solid fa-fire",
  
  // Categories
  fitness: "fa-solid fa-dumbbell",
  energy: "fa-solid fa-bolt",
  weightGain: "fa-solid fa-arrow-trend-up",
  weightLoss: "fa-solid fa-arrow-trend-down",
  refresh: "fa-solid fa-seedling",
  
  // Loyalty
  star: "fa-solid fa-star",
  starHalf: "fa-solid fa-star-half-stroke",
  starEmpty: "fa-regular fa-star",
  coins: "fa-solid fa-coins",
  gift: "fa-solid fa-gift",
  trophy: "fa-solid fa-trophy",
  medal: "fa-solid fa-medal",
  crown: "fa-solid fa-crown",
  
  // Tiers
  bronze: "fa-solid fa-award",
  silver: "fa-solid fa-award",
  gold: "fa-solid fa-award", 
  platinum: "fa-solid fa-gem",
  
  // Status
  pending: "fa-solid fa-clock",
  confirmed: "fa-solid fa-check-circle",
  preparing: "fa-solid fa-blender",
  outForDelivery: "fa-solid fa-motorcycle",
  delivered: "fa-solid fa-circle-check",
  cancelled: "fa-solid fa-circle-xmark",
  
  // Misc
  heart: "fa-solid fa-heart",
  share: "fa-solid fa-share-nodes",
  copy: "fa-solid fa-copy",
  info: "fa-solid fa-circle-info",
  warning: "fa-solid fa-triangle-exclamation",
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-xmark",
  quiz: "fa-solid fa-brain",
  calendar: "fa-solid fa-calendar-days",
  receipt: "fa-solid fa-receipt",
  wallet: "fa-solid fa-wallet",
  percent: "fa-solid fa-percent",
  tag: "fa-solid fa-tag",
  verified: "fa-solid fa-circle-check",
  
  // Arrows
  arrowRight: "fa-solid fa-arrow-right",
  arrowLeft: "fa-solid fa-arrow-left",
  arrowUp: "fa-solid fa-arrow-up",
  arrowDown: "fa-solid fa-arrow-down",
  chevronRight: "fa-solid fa-chevron-right",
  chevronLeft: "fa-solid fa-chevron-left",
  chevronDown: "fa-solid fa-chevron-down",
  chevronUp: "fa-solid fa-chevron-up",
}

export default Icon
