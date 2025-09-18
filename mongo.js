const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://sogolizad:${password}@cluster0.etzoh8a.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4]
})
if(process.argv.length ===3){
    Person.find({}).then(result =>{
        console.log('phonebook:'),
        result.map(p=> console.log(`${p.name} ${p.number}`))
        
        mongoose.connection.close()
    })
} else {
    person.save().then(result => {
      console.log(`added ${person.name} number ${person.number} to phonebook`)
      mongoose.connection.close()
    })
}