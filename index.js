const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

const shower = (req, res, next) => {
  console.log(req.method, req.path, req.query);
  next();
}

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser({ extended: false }));
app.use(shower);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let counter = 0;

app.route('/api/users')
  .post((req, res) => {
    users.push({ _id: (++counter).toString(), username: req.body.username, count: 0, log: [] });
    res.json({ _id: counter.toString(), username: req.body.username });
  })
  .get((req, res) => res.json(users.map(user => ({ _id: user._id, username: user.username }))));

app.post('/api/users/:id/exercises', (req, res) => {
  let exercise = {
    date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString(),
    duration: parseInt(req.body.duration),
    description: req.body.description
  };

  users[req.params.id-1].log.push(exercise);
  users[req.params.id-1].count++;

  res.json({ 
    _id: users[req.params.id-1]._id, 
    username: users[req.params.id-1].username, 
    ...exercise
  });
});

app.get('/api/users/:id/logs', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    console.log("we have queries");
    const from = req.query.from ? new Date(req.query.from) : new Date(0);
    const to = req.query.to ?  new Date(req.query.to) : new Date(Date.now());
    const limit = parseInt(req.query.limit);
    let logs = users[req.params.id-1].log.filter(ex => (new Date(ex.date) > from && new Date(ex.date) < to));
    logs = limit ? logs.slice(0, limit) : logs;
    res.json({
      _id: users[req.params.id-1]._id,
      username: users[req.params.id-1].username,
      from: from.toDateString(),
      to: to.toDateString(),
      count: logs.length,
      log: logs
    });
  } else {
    res.json(users[req.params.id-1]);
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
