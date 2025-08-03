const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

let tickets = [];

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

app.post('/api/purchase', (req, res) => {
  const { players, leader } = req.body;
  const ticket = {
    id: Date.now(),
    players,
    leader
  };
  tickets.push(ticket);
  res.json({ success: true, ticket });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
