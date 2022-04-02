const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> [<name> <number>]')
  process.exit(1)
}

const password = process.argv[2]

if (process.argv.length === 4 || process.argv.length > 5) {
  console.log('Usage: node mongo.js <password> [<name> <number>]')
  process.exit(1)
}

// might be undefined
const newname = process.argv[3]
const newnumber = process.argv[4]

const url =
  `mongodb+srv://selfscrum:${password}@cluster0.mrf1b.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date
})

const Person = mongoose.model('Person', personSchema)

if (newname) {
  const person = new Person({
    name: newname,
    number: newnumber,
    date: new Date()
  })

  person.save().then(result => {
    console.log(`person saved. name: ${result.name}, number: ${result.number}`)
    mongoose.connection.close()
  })
}
else {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

