const express = require('express')
const cors = require('cors') 
const morgan = require('morgan')

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.use(express.static('build'))

morgan.token('postObj', function (req, res) { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postObj '))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(request,response)=> response.json(persons))



app.get('/info', (req,res)=>{
    let html = `<div>
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
        </div>`
    res.send(html)
})

app.get('/api/persons/:id', (req,res)=>{
    const id = req.params.id;
    const individualId =  persons.find(p => p.id === id)
    individualId ?  res.json(individualId) : res.status(404).json({error: 'person not found'})
})

app.delete('/api/persons/:id', (req,res)=>{
    const id = req.params.id;
    persons =  persons.filter(p => p.id !== id)
    res.status(200).end()
})

const generateId = () =>{
    const maxId = persons.length > 0 ? Math.max(...persons.map(p => Number(p.id))) : 0
   return String(maxId+1)
}
app.post('/api/persons', (req,res)=>{
    const body = req.body;
    if(!body.name || !body.number){
        return res.status(400).json({error: 'name or numebr is missing'})
    }
    
    const personExists = persons.find(p => p.name === body.name)
    
    if(personExists){
        return res.status(400).json({error: 'name must be unique!'})
    }

    const personObj = {
        id: generateId(),
        name: body.name,
        number: body.number  
    }
    persons = persons.concat(personObj)
    res.json(personObj)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

