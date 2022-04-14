require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

// Frontend middleware
app.use(express.static('build'))

// JSON parser middleware
app.use(express.json())

// morgan middleware
const morgan = require('morgan')
morgan.token('body', (req, res) => JSON.stringify(req.body) )
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// CORS middleware
const cors = require('cors')
app.use(cors())

// generate a unique random id
const generateId = () => {
  const newId = Math.floor(Math.random()*100000)
  console.log(`newId: ${newId}`)
  return newId
}

// ROUTES
// info
app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const people = persons.length
    const receivedDate = new Date()
    response.send(`<p>Phonebook has info for ${people} people</p>${receivedDate}<p></p>`)
  })
})

// all persons
app.get('/api/persons/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// find by id
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {        
      response.json(person)
    } else {
      response.status(404).end()      
    }    
  })
  .catch(error => next(error))
})

// delete a person by id
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})

// create a new person, duplicates allowed
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

  const person = new Person({
    name: body.name,
    number: body.number,
    id: generateId()
  })
  person.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

// update a person
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  // only the number can be updated
  const person = {
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      //Update    
      console.log('update', person)
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// unknwon route middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// error middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  next(error)
}
app.use(errorHandler)

// listen to requests
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
    