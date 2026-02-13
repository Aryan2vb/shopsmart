const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];

app.get('/api/items', (req, res) => {
  res.json({ items });
});

app.post('/api/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newItem = {
    id: items.length + 1,
    name
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
