const express = require('express');
const app = express();
app.use(express.static(__dirname));
app.listen(3000);

const arr = [];
for (let i = 1; i <= 20; i++) {
  arr.push(`http://localhost:3000/images/${i}.jpg`);
}
app.get('/api/img', (req, res) => {
  res.json(arr);
})