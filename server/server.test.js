const request = require('supertest');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, image: 'https://placehold.co/200x200?text=Headphones' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://placehold.co/200x200?text=Watch' },
  { id: 3, name: 'Laptop Stand', price: 29.99, image: 'https://placehold.co/200x200?text=Stand' },
  { id: 4, name: 'USB-C Hub', price: 49.99, image: 'https://placehold.co/200x200?text=Hub' },
  { id: 5, name: 'Mechanical Keyboard', price: 129.99, image: 'https://placehold.co/200x200?text=Keyboard' },
  { id: 6, name: 'Wireless Mouse', price: 39.99, image: 'https://placehold.co/200x200?text=Mouse' }
];

let cart = [];

app.get('/api/products', (req, res) => {
  res.json({ products });
});

app.get('/api/cart', (req, res) => {
  res.json({ cart });
});

app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  res.json({ cart });
});

app.delete('/api/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  cart = cart.filter(item => item.id !== productId);
  res.json({ cart });
});

describe('API Endpoints', () => {
  beforeEach(() => {
    cart = [];
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(res.body.products).toHaveLength(6);
      expect(res.body.products[0]).toHaveProperty('name', 'Wireless Headphones');
    });
  });

  describe('GET /api/cart', () => {
    it('should return empty cart initially', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toEqual(200);
      expect(res.body.cart).toEqual([]);
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ productId: 1 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.cart).toHaveLength(1);
      expect(res.body.cart[0].name).toBe('Wireless Headphones');
      expect(res.body.cart[0].quantity).toBe(1);
    });

    it('should increment quantity for existing item', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app).post('/api/cart').send({ productId: 1 });
      expect(res.body.cart).toHaveLength(1);
      expect(res.body.cart[0].quantity).toBe(2);
    });

    it('should return 404 for invalid product', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ productId: 999 });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/cart/:id', () => {
    it('should remove item from cart', async () => {
      await request(app).post('/api/cart').send({ productId: 1 });
      const res = await request(app).delete('/api/cart/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.cart).toHaveLength(0);
    });

    it('should handle removing non-existent item', async () => {
      const res = await request(app).delete('/api/cart/999');
      expect(res.statusCode).toEqual(200);
      expect(res.body.cart).toHaveLength(0);
    });
  });
});
