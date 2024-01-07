require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('post-data', function (req, res) { return req.method === 'POST' ? JSON.stringify(req.body) : "" })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

//let persons = [
//  { 
//    "id": 1,
//    "name": "Arto Hellas", 
//    "number": "040-123456"
//  },
//  { 
//    "id": 2,
//    "name": "Ada Lovelace", 
//    "number": "39-44-5323523"
//  },
//  { 
//    "id": 3,
//    "name": "Dan Abramov", 
//    "number": "12-43-234345"
//  },
//  { 
//    "id": 4,
//    "name": "Mary Poppendieck", 
//    "number": "39-23-6423122"
//  }
//]

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id)
  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.send(
        "Phonebook has info for " + persons.length + " people<br/>" + Date()
      )
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id)
  Person.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    const err = new Error('name missing')
    err.name = 'MissingName'
    next(err)
  }
  if (!body.number) {
    const err = new Error('number missing')
    err.name = 'MissingNumber'
    next(err)
  }

  //if (persons.find(n => n === body.name)) {
  //  return response.status(400).json({ 
  //    error: 'name must be unique' 
  //  })
  //}

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    const err = new Error('name missing')
    err.name = 'MissingName'
    next(err)
  }
  if (!body.number) {
    const err = new Error('number missing')
    err.name = 'MissingNumber'
    next(err)
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send(({ error: 'malformatted id' }))
  } else if (error.name = 'MissingName') {
    return response.status(400).send(({ error: 'name missing' }))
  } else if (error.name = 'MissingNumber') {
    return response.status(400).send(({ error: 'number missing' }))
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})