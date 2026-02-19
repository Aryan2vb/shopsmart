import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCart()
  }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products)
  }

  const fetchCart = async () => {
    const res = await fetch('/api/cart')
    const data = await res.json()
    setCart(data.cart)
  }

  const addToCart = async (productId) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    })
    fetchCart()
  }

  const removeFromCart = async (productId) => {
    await fetch(`/api/cart/${productId}`, { method: 'DELETE' })
    fetchCart()
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="app">
      <header>
        <h1>ShopSmart</h1>
        <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </header>

      {showCart ? (
        <div className="cart-view">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p>${item.price} x {item.quantity}</p>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <h3>Total: ${cartTotal.toFixed(2)}</h3>
              </div>
            </>
          )}
          <button className="back-btn" onClick={() => setShowCart(false)}>
            Back to Shop
          </button>
        </div>
      ) : (
        <div className="products-view">
          <h2>Products</h2>
          <div className="products">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
                <button onClick={() => addToCart(product.id)}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
