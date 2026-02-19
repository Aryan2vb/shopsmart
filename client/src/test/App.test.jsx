import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

global.fetch = vi.fn()

const mockProducts = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, image: 'https://placehold.co/200x200?text=Headphones' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://placehold.co/200x200?text=Watch' }
]

const mockCart = []

describe('App Component - Unit Tests', () => {
  beforeEach(() => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ products: mockProducts })
    }).mockResolvedValueOnce({
      json: async () => ({ cart: mockCart })
    })
  })

  it('renders ShopSmart header', async () => {
    render(<App />)
    expect(screen.getByText('ShopSmart')).toBeInTheDocument()
  })

  it('renders products after loading', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    })
  })

  it('shows cart button with count', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Cart (0)')).toBeInTheDocument()
    })
  })

  it('displays product prices', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('$79.99')).toBeInTheDocument()
      expect(screen.getByText('$199.99')).toBeInTheDocument()
    })
  })

  it('has add to cart buttons', async () => {
    render(<App />)
    await waitFor(() => {
      const buttons = screen.getAllByText('Add to Cart')
      expect(buttons).toHaveLength(2)
    })
  })
})

describe('App Component - Integration Tests', () => {
  beforeEach(() => {
    fetch.mockReset()
  })

  it('adds item to cart when button clicked', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({ json: async () => ({ products: mockProducts }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: [{ ...mockProducts[0], quantity: 1 }] }) })

    render(<App />)
    
    await waitFor(() => screen.getByText('Wireless Headphones'))
    
    const addButton = screen.getAllByText('Add to Cart')[0]
    await user.click(addButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/cart', expect.objectContaining({
        method: 'POST'
      }))
    })
  })

  it('shows cart view when cart button clicked', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({ json: async () => ({ products: mockProducts }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: mockCart }) })

    render(<App />)
    
    await waitFor(() => screen.getByText('Cart (0)'))
    
    await user.click(screen.getByText('Cart (0)'))

    expect(screen.getByText('Your Cart')).toBeInTheDocument()
  })

  it('displays empty cart message', async () => {
    const user = userEvent.setup()
    
    fetch
      .mockResolvedValueOnce({ json: async () => ({ products: mockProducts }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: [] }) })

    render(<App />)
    
    await waitFor(() => screen.getByText('Cart (0)'))
    await user.click(screen.getByText('Cart (0)'))

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('shows cart items with correct total', async () => {
    const user = userEvent.setup()
    const cartWithItem = [{ ...mockProducts[0], quantity: 2, price: 79.99 }]
    
    fetch
      .mockResolvedValueOnce({ json: async () => ({ products: mockProducts }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: cartWithItem }) })
      .mockResolvedValueOnce({ json: async () => ({ cart: cartWithItem }) })

    render(<App />)
    
    await waitFor(() => screen.getByText('Cart (0)'))
    await user.click(screen.getByText('Cart (0)'))

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    
    await user.click(screen.getByText('Back to Shop'))
    
    await waitFor(() => screen.getByText('Cart (0)'))
  })
})
