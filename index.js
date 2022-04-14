require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

// JSON parser middleware
//
app.use(express.json())

// Frontend middleware
//
app.use(express.static('build'))

// morgan middleware
//
const morgan = require('morgan')
morgan.token('body', (req, res) => JSON.stringify(req.body) )
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// CORS middleware
//
const cors = require('cors')
app.use(cors())

// generate a unique random id
//  
const generateId = () => {
  const newId = Math.floor(Math.random()*100000)
  console.log(`newId: ${newId}`)
  return newId
}


app.get('/api/persons/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const people = persons.length
    const receivedDate = new Date()
    response.send(`<p>Phonebook has info for ${people} people</p>${receivedDate}<p></p>`)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
/*  Person.findById(request.params.id).then(person => {

  const person = persons.find(person => person.id === id)
  if (person)
    persons = persons.filter(person => person.id !== id)
*/
  response.status(204).end()  
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
/*
  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }
*/
  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId()
  })
  
  person.save().then(savedNote => {
    response.json(savedNote)
  })
})

// unknwon route middleware
//
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
    