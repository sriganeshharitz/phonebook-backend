const express = require("express");
var morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

morgan.token('request-body-log', function (req, res) { return JSON.stringify(req.body) })

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['request-body-log'](req, res)
  ].join(' ')
}))

const BASE_URI = '/api/persons'

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  },
  {
    "id": 5,
    "name": "Sriganesh",
    "number": "39-23-6423125"
  }
]

const getErrorObject = (message) => {
  return {error: message}
}

app.get(BASE_URI, (request, response) => {
  return response.json(persons)
})

app.get(`${BASE_URI}/:id`, (request, response) => {
  const personId = Number(request.params.id)
  const person = persons.find(p => p.id === personId)
  return person ? response.json(person) : response.status(404).send()
})

app.delete(`${BASE_URI}/:id`, (request, response) => {
  const personId = Number(request.params.id)
  persons = persons.filter(p => p.id !== personId)
  return response.send()
})

app.post(BASE_URI, (request, response) => {
  const person = request.body;

  if (!person) {
    return response.status(400).json(getErrorObject('Request body missing'))
  }

  if (!person.name) {
    return response.status(400).json(getErrorObject('Person name required'))
  }

  if (!person.number) {
    return response.status(400).json(getErrorObject('Person number required'))
  }

  if (persons.some(p => p.name === person.name)) {
    return response.status(400).json(getErrorObject('Person\'s name must be unique'))
  }

  person.id = parseInt(parseInt(Math.random() * 10000))
  persons = persons.concat(person)
  return response.status(201).json(person) 
})

app.get('/info', (request, response) => {
  return response.send(`
  <p>Phonebook currently has ${persons.length} entries </p>
  <p>Current date time is ${Date()}</p>
  `)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('Server running on port 3001')
})