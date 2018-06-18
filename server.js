const express = require('express')
const app = express()
const analyze = require('./analyze')
const cors = require('cors')

const port = process.env.PORT || 3000

app.use(cors())

// Serve frontend
app.use(express.static(__dirname + '/public'))

// Serve API
app.get('/api', async function(req, res){
  const stepSize = req.query.stepSize
  const data = await analyze(stepSize)
  res.json(data)
})

app.listen(port)
