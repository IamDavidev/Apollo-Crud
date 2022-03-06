const express = require('express')
const { config } = require('dotenv')
config()
const { gql, ApolloServer } = require('apollo-server-express')
const { connect, Schema, model } = require('mongoose')



const PORT = process.env.PORT || 8080
const URI_DB = process.env.URI__MONGO || 'mongodb://localhost/graphql'
// init aplication

const app = express()

app.get('/', (req, res) => {
    res.send('hello world')
})

// schema

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    done: Boolean,
})

const Task = model('Task', taskSchema)

// db 

async function db() {
    await connect(URI_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(
        console.log('db connected')
    ).catch(err => console.log(err))

}
db()
// resolvers 

const resolvers = {
    Query: {
        hello: () => 'hello world form apollo server!',

    },
}
// typeDefs

const typeDefinitions = gql`
    type Query{
        hello: String
    }
`

//main
async function main() {

    const apolloServer = new ApolloServer({
        typeDefs: typeDefinitions,
        resolvers,
    })


    await apolloServer.start()
    apolloServer.applyMiddleware({ app })

    app.use('*', (req, res) => {

        res.status(404).send('404 not found')
    })

    app.listen(PORT, () => {
        console.log(`sever is runnig on port :  ${PORT}`)
    })
}





main()  