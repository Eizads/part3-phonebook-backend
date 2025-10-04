require('dotenv').config()

const express = require('express')
const cors = require('cors') 
const morgan = require('morgan')

const app = express()

const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.use(express.static('build'))

morgan.token('postObj', function (req, res) { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postObj '))

// let persons = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons',(request,response)=> {
  Person.find({}).then(
(persons) => {response.json(persons)}
)}
)

app.get('/info', (req,res)=>{
  Person.countDocuments({}).then(count => {
    const info = {
      length: `Phonebook has info for ${count} people`,
      date: new Date()
    }
    res.json(info)
  }).catch(error => {
    res.status(500).json({error: 'Failed to get person count'})
  })
})

app.get('/api/persons/:id', (req,res,next)=>{
  Person.findById(req.params.id)
  .then(p => {
    if(p){
      res.json(p)
    } else{
      res.status(404).end()
    }
  })
  .catch(error =>{ next(error)
    
  })
   
})

app.delete('/api/persons/:id', (req,res,next)=>{
  Person.findByIdAndDelete(req.params.id).then(result => {
    res.status(200).end()
  })
  .catch(error => {
 next(error)
   
  })
  
})



app.post('/api/persons', (req,res, next)=>{
    const body = req.body;
    if(!body.name || !body.number){
        return res.status(400).json({error: 'name or number is missing'})
    }
    
    // Check if person with this name already exists
    Person.findOne({name: body.name}).then(existingPerson => {
      if(existingPerson) {
        return res.status(400).json({error: 'name must be unique'})
      }
      
      // Create new person if name is unique
      const person = new Person({
        name: body.name,
        number: body.number  
      })
      
      return person.save().then((savedPerson) => {
        res.json(savedPerson)
      })
    }).catch(error => {
      next(error)
    })
 
})

app.put('/api/persons/:id', (req,res, next)=>{
  const {name, number} = req.body
  
  // Validation
  if(!name || !number){
    return res.status(400).json({error: 'name and number are required'})
  }
  
  Person.findById(req.params.id).then(person => {
    if(!person){
      return res.status(404).json({error: 'person not found'})
    }
    
    // Check if name is being changed and if new name already exists
    if(person.name !== name) {
      return Person.findOne({name: name}).then(existingPerson => {
        if(existingPerson) {
          return res.status(400).json({error: 'name must be unique'})
        }
        
        // Update and save
        person.name = name
        person.number = number
        return person.save().then(updatedPerson => {
          res.json(updatedPerson)
        })
      })
    } else {
      // Name not changed, just update number
      person.number = number
      return person.save().then(updatedPerson => {
        res.json(updatedPerson)
      })
    }
  }).catch(error => {
    next(error)
  })
})
// Error handling middleware (must have 4 parameters)
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.code === 11000) {
    return response.status(400).json({ error: 'name must be unique' })
  } 

  next(error) // Pass to next error handler if not handled
}

// Unknown endpoint handler
const unknownEndpoint = (req,res)=>{
res.status(404).send({error: 'unknown endpoint'})
}

// Apply middleware in order
app.use(unknownEndpoint)
app.use(errorHandler) // Error handler must be last


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

