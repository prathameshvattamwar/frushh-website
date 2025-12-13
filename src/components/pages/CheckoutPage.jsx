import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isFirstTimeCustomer } = useAuth()
  const { cartItems, cartSubtotal, cartTotalProtein, clearCart } = useCart()

  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [step, setStep] = useState(1) // 1: address, 2: slot, 3: coupon, 4: confirm

  // Data
  const [addresses, setAddresses] = useState([])
  const [deliverySlots, setDeliverySlots] = useState([])
  const [gyms, setGyms] = useState([])
  const [isFirstOrder, setIsFirstOrder] = useState(false)

  // Selections
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [deliveryDate, setDeliveryDate] = useState('')

  // New Address Form
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    full_address: '',
    landmark: '',
    area: 'Hadapsar'
  })

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // Notes
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }
    fetchData()
  }, [user, cartItems])

  async function fetchData() {
    try {
      // Fetch user addresses
      const { data: addressData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (addressData) {
        setAddresses(addressData)
        if (addressData.length > 0) {
          setSelectedAddress(addressData[0])
        } else {
          setShowAddressForm(true)
        }
      }

      // Fetch delivery slots
      const { data: slotsData } = await supabase
        .from('delivery_slots')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (slotsData) {
        setDeliverySlots(slotsData)
        if (slotsData.length > 0) {
          setSelectedSlot(slotsData[0])
        }
      }

      // Fetch gyms
      const { data: gymsData } = await supabase
        .from('gyms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (gymsData) setGyms(gymsData)

      // Check if first order
      const firstOrder = await isFirstTimeCustomer()
      setIsFirstOrder(firstOrder)

      // Set default delivery date (tomorrow)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDeliveryDate(tomorrow.toISOString().split('T')[0])

      setLoading(false)
    } catch (error) {
      console.error('Error fetching checkout data:', error)
      setLoading(false)
    }
  }

  async function handleSaveAddress() {
    if (!newAddress.full_address.trim()) {
      alert('Please enter your address')
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          label: newAddress.label,
          full_address: newAddress.full_address,
          landmark: newAddress.landmark,
          area: newAddress.area,
          is_default: addresses.length === 0
        })
        .select()
        .single()

      if (error) throw error

      setAddresses(prev => [...prev, data])
      setSelectedAddress(data)
      setShowAddressForm(false)
      setNewAddress({ label: 'Home', full_address: '', landmark: '', area: 'Hadapsar' })
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address')
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return

    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)

    const code = couponCode.trim().toUpperCase()

    try {
      // Check regular coupons first
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (coupon) {
        // Check first order only
        if (coupon.is_first_order_only && !isFirstOrder) {
          setCouponError('This coupon is only valid for first orders')
          setCouponLoading(false)
          return
        }

        // Check minimum order
        if (cartSubtotal < coupon.min_order) {
          setCouponError(`Minimum order ₹${coupon.min_order} required`)
          setCouponLoading(false)
          return
        }

        // Check usage limit
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
          setCouponError('This coupon has expired')
          setCouponLoading(false)
          return
        }

        // Calculate discount
        let discount = 0
        if (coupon.discount_type === 'flat') {
          discount = coupon.discount_value
        } else if (coupon.discount_type === 'percent') {
          discount = Math.round((cartSubtotal * coupon.discount_value) / 100)
          if (coupon.max_discount) {
            discount = Math.min(discount, coupon.max_discount)
          }
        }

        setAppliedCoupon({
          type: 'coupon',
          code: coupon.code,
          discount: discount,
          coupon_id: coupon.id
        })
        setCouponLoading(false)
        return
      }

      // Check referral codes
      const { data: referral } = await supabase
        .from('referral_codes')
        .select('*, users(name)')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (referral) {
        // Can't use own referral code
        if (referral.user_id === user.id) {
          setCouponError("You can't use your own referral code")
          setCouponLoading(false)
          return
        }

        // Calculate discount (20% max ₹25)
        let discount = Math.round((cartSubtotal * referral.discount_percent) / 100)
        discount = Math.min(discount, referral.max_discount)

        setAppliedCoupon({
          type: 'referral',
          code: referral.code,
          discount: discount,
          referral_code_id: referral.id,
          referrer_user_id: referral.user_id,
          referrer_name: referral.users?.name || 'Friend'
        })
        setCouponLoading(false)
        return
      }

      setCouponError('Invalid coupon code')
    } catch (error) {
      setCouponError('Invalid coupon code')
    }
    setCouponLoading(false)
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  function generateOrderNumber() {
    const prefix = 'FRS'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${timestamp}${random}`
  }

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }
    if (!selectedSlot) {
      alert('Please select a delivery slot')
      return
    }

    setPlacing(true)

    try {
      const orderNumber = generateOrderNumber()
      const discount = appliedCoupon?.discount || 0
      const total = cartSubtotal - discount
      const pointsEarned = 10 // Base points for order

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          items: cartItems,
          subtotal: cartSubtotal,
          discount: discount,
          discount_code: appliedCoupon?.code || null,
          delivery_fee: 0,
          total: total,
          points_earned: pointsEarned,
          delivery_address: selectedAddress.full_address + (selectedAddress.landmark ? `, ${selectedAddress.landmark}` : ''),
          delivery_area: selectedAddress.area,
          delivery_slot: `${selectedSlot.name} (${selectedSlot.start_time} - ${selectedSlot.end_time})`,
          delivery_date: deliveryDate,
          customer_name: user.name,
          customer_phone: user.phone,
          customer_email: user.email,
          notes: orderNotes,
          payment_method: 'cod',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: order.id,
          status: 'pending',
          notes: 'Order placed successfully'
        })

      // Update coupon usage
      if (appliedCoupon?.type === 'coupon') {
        await supabase
          .from('coupons')
          .update({ used_count: supabase.raw('used_count + 1') })
          .eq('id', appliedCoupon.coupon_id)

        await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: appliedCoupon.coupon_id,
            user_id: user.id,
            order_id: order.id,
            discount_applied: appliedCoupon.discount
          })
      }

      // Track referral
      if (appliedCoupon?.type === 'referral') {
        await supabase
          .from('referral_tracking')
          .insert({
            referral_code_id: appliedCoupon.referral_code_id,
            referrer_user_id: appliedCoupon.referrer_user_id,
            referred_user_id: user.id,
            referred_discount: appliedCoupon.discount,
            status: 'completed',
            referred_order_id: order.id
          })

        // Update referral code usage count
        await supabase.rpc('increment_referral_count', { code_id: appliedCoupon.referral_code_id })
      }

      // Track first order usage
      if (isFirstOrder) {
        await supabase
          .from('first_order_tracking')
          .insert({
            email: user.email,
            phone: user.phone
          })
      }

      // Award loyalty points
      const { data: loyaltyData } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (loyaltyData) {
        const multiplier = loyaltyData.tier_multiplier || 1
        const finalPoints = Math.round(pointsEarned * multiplier)

        await supabase
          .from('loyalty_points')
          .update({
            points_balance: loyaltyData.points_balance + finalPoints,
            total_earned: loyaltyData.total_earned + finalPoints
          })
          .eq('user_id', user.id)

        await supabase
          .from('points_transactions')
          .insert({
            user_id: user.id,
            points: finalPoints,
            type: 'order',
            description: `Points earned from order #${orderNumber}`,
            reference_id: order.id
          })
      }

      // Send WhatsApp notification
      const itemsList = cartItems.map(item => 
        `• ${item.name} (${item.size}) x${item.quantity}${item.addons.length > 0 ? ` +${item.addons.map(a => a.name).join(', ')}` : ''}`
      ).join('\n')

      const whatsappMessage = `🧾 *NEW ORDER - #${orderNumber}*

👤 *Customer:* ${user.name}
📞 *Phone:* ${user.phone}

📦 *Items:*
${itemsList}

💰 *Subtotal:* ₹${cartSubtotal}
${discount > 0 ? `🎫 *Discount:* -₹${discount} (${appliedCoupon.code})\n` : ''}💵 *Total:* ₹${total}

📍 *Address:* ${selectedAddress.full_address}${selectedAddress.landmark ? `, ${selectedAddress.landmark}` : ''}
🕐 *Slot:* ${selectedSlot.name} (${selectedSlot.start_time} - ${selectedSlot.end_time})
📅 *Date:* ${new Date(deliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}

${orderNotes ? `📝 *Notes:* ${orderNotes}` : ''}

💳 *Payment:* Cash on Delivery`

      const whatsappUrl = `https://wa.me/919271981229?text=${encodeURIComponent(whatsappMessage)}`
      
      // Clear cart
      clearCart()

      // Navigate to success page with WhatsApp link
      navigate('/order-success', { 
        state: { 
          orderNumber, 
          total, 
          whatsappUrl,
          pointsEarned
        } 
      })

    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  const discount = appliedCoupon?.discount || 0
  const total = cartSubtotal - discount

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-green-500 mb-4"></i>
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-40">
      {/* Header */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/cart')} className="text-gray-500 hover:text-gray-700">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h1 className="text-xl font-black text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-location-dot text-green-500"></i>
            Delivery Address
          </h2>

          {!showAddressForm && addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition ${
                    selectedAddress?.id === addr.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {addr.label}
                      </span>
                      <p className="text-gray-900 mt-1">{addr.full_address}</p>
                      {addr.landmark && <p className="text-sm text-gray-500">{addr.landmark}</p>}
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <i className="fa-solid fa-check-circle text-green-500"></i>
                    )}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 transition"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Add New Address
              </button>
            </div>
          )}

          {showAddressForm && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {['Home', 'Gym', 'Work', 'Other'].map((label) => (
                  <button
                    key={label}
                    onClick={() => setNewAddress(prev => ({ ...prev, label }))}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      newAddress.label === label
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Full Address *"
                value={newAddress.full_address}
                onChange={(e) => setNewAddress(prev => ({ ...prev, full_address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />

              <input
                type="text"
                placeholder="Landmark (Optional)"
                value={newAddress.landmark}
                onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />

              <select
                value={newAddress.area}
                onChange={(e) => setNewAddress(prev => ({ ...prev, area: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="Hadapsar">Hadapsar</option>
                <option value="Fursungi">Fursungi</option>
                <option value="Magarpatta">Magarpatta</option>
                <option value="Amanora">Amanora</option>
              </select>

              <div className="flex gap-2">
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSaveAddress}
                  className="flex-1 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Slot */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-clock text-green-500"></i>
            Delivery Slot
          </h2>

          <div className="mb-3">
            <label className="text-sm text-gray-500 mb-1 block">Delivery Date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {deliverySlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-xl border-2 text-center transition ${
                  selectedSlot?.id === slot.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <i className={`fa-solid ${slot.icon || 'fa-clock'} text-xl mb-1 ${
                  selectedSlot?.id === slot.id ? 'text-green-600' : 'text-gray-400'
                }`}></i>
                <p className="font-medium text-gray-900">{slot.name}</p>
                <p className="text-xs text-gray-500">{slot.start_time} - {slot.end_time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Coupon Code */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-ticket text-green-500"></i>
            Apply Coupon
          </h2>

          {/* First Order Suggestion */}
          {isFirstOrder && !appliedCoupon && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <i className="fa-solid fa-gift mr-2"></i>
                <strong>First Order?</strong> Use code <button onClick={() => setCouponCode('WELCOME25')} className="font-bold text-yellow-900 underline">WELCOME25</button> for ₹25 off!
              </p>
            </div>
          )}

          {appliedCoupon ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">
                  <i className="fa-solid fa-check-circle mr-2"></i>
                  {appliedCoupon.code}
                </p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.type === 'referral' 
                    ? `Referred by ${appliedCoupon.referrer_name}` 
                    : 'Coupon applied'
                  } - ₹{appliedCoupon.discount} off
                </p>
              </div>
              <button onClick={removeCoupon} className="text-red-500 hover:text-red-600">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition disabled:opacity-50"
              >
                {couponLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Apply'}
              </button>
            </div>
          )}

          {couponError && (
            <p className="text-red-500 text-sm mt-2">
              <i className="fa-solid fa-exclamation-circle mr-1"></i>
              {couponError}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2">
            Have a referral code? Enter it above to get 20% off!
          </p>
        </div>

        {/* Order Notes */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-note-sticky text-green-500"></i>
            Order Notes (Optional)
          </h2>
          <textarea
            placeholder="Any special instructions for your order..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-receipt text-green-500"></i>
            Order Summary
          </h2>

          <div className="space-y-2 mb-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} ({item.size}) x{item.quantity}
                  {item.addons.length > 0 && <span className="text-xs text-green-600"> +{item.addons.length} add-ons</span>}
                </span>
                <span className="font-medium">₹{item.itemPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-green-600">₹{total}</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-700">
              <i className="fa-solid fa-dumbbell mr-1"></i>
              Total Protein: <strong>{cartTotalProtein}g</strong>
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-wallet text-green-500"></i>
            Payment Method
          </h2>
          <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-money-bill text-green-600"></i>
            </div>
            <div>
              <p className="font-medium text-gray-900">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when you receive your order</p>
            </div>
            <i className="fa-solid fa-check-circle text-green-500 ml-auto"></i>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">₹{total}</p>
            </div>
            {discount > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Saving ₹{discount}
              </span>
            )}
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !selectedAddress || !selectedSlot}
            className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {placing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Placing Order...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check"></i>
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
