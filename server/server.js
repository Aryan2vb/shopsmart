const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
