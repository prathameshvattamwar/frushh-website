import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function MenuPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (categoriesData) setCategories(categoriesData)

      // Fetch all products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true })

      if (productsData) setProducts(productsData)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  function handleCategoryChange(slug) {
    setSelectedCategory(slug)
    if (slug === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: slug })
    }
  }

  function handleProductClick(product) {
    if (!user) {
      navigate('/login', { state: { from: `/product/${product.slug}` } })
      return
    }
    navigate(`/product/${product.slug}`)
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_slug === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-glass-water text-5xl text-green-500 animate-pulse mb-4"></i>
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-black text-gray-900 mb-4">Our Menu</h1>
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition flex-shrink-0 ${
                  selectedCategory === category.slug
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`fa-solid ${category.icon || 'fa-circle'}`}></i>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Category Info */}
        {selectedCategory !== 'all' && (
          <div className="mb-6">
            {categories.filter(c => c.slug === selectedCategory).map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${cat.icon || 'fa-circle'} text-2xl text-green-600`}></i>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{cat.name}</h2>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Count */}
        <p className="text-sm text-gray-500 mb-4">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'shake' : 'shakes'} available
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-glass-water text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No shakes in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-lg transition group"
              >
                {/* Product Icon */}
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                  <i className={`fa-solid ${product.icon || 'fa-glass-water'} text-3xl text-green-600`}></i>
                </div>

                {/* Product Info */}
                <h3 className="font-bold text-gray-900 text-center text-sm mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 text-center mb-3 line-clamp-2 h-8">
                  {product.description}
                </p>

                {/* Nutrition */}
                <div className="flex justify-center gap-4 mb-3 text-xs">
                  <div className="text-center">
                    <span className="text-gray-400">250ml</span>
                    <p className="font-bold text-green-600">₹{product.price_250ml}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400">350ml</span>
                    <p className="font-bold text-green-600">₹{product.price_350ml}</p>
                  </div>
                </div>

                {/* Protein Badge */}
                <div className="flex justify-center mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <i className="fa-solid fa-dumbbell mr-1"></i>
                    {product.protein_250ml}-{product.protein_350ml}g protein
                  </span>
                </div>

                {/* Add Button */}
                <button
                  className="w-full py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-1"
                >
                  <i className="fa-solid fa-plus"></i>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Spacing for Mobile Nav */}
      <div className="h-8"></div>
    </div>
  )
}

export default MenuPage
