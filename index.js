const express = require('express');
const {
    config
} = require('dotenv');
config();
const {
    gql,
    ApolloServer
} = require('apollo-server-express');
const {
    connect,
    Schema,
    model
} = require('mongoose');

const PORT = process.env.PORT || 8080;
const URI_DB = process.env.URI__MONGO;
// init aplication

const app = express();

app.get('/', (req, res) => {
    res.send('hello world <a href="/graphql"> go graphql</a>');
});

// schema

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    done: Boolean,
});

const Task = model('Task', taskSchema);

// db

async function db() {
    await connect(URI_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(console.log('db connected'))
        .catch((err) => console.log(err));
}
db();
// resolvers

const resolvers = {
    Query: {
        hello() {
            'hello world from apollo server!'
        },
        async getAllTasks() {
            const tasks = await Task.find();
            return tasks;
        },
        async getTask(root, args) {
            const {
                id
            } = args;
            const task = await Task.findById(id);
            return task;
        }

    },
    Mutation: {
        createTask: async (root, args) => {
            const {
                title,
                description,
                done
            } = args
            const newTask = new Task({
                title,
                description,
                done
            })
            await newTask.save();
            console.log(newTask);
            return newTask;
        },
        async deleteTask(root, args) {
            const {
                id
            } = args;
            await Task.findByIdAndDelete(id);
            return "Task deleted successfully";
        },
        async updateTask(root, args) {
            const {
                id,
                title,
                description,
                done
            } = args;
            const updateTask = await Task.findByIdAndUpdate(
                id, {
                title,
                description,
                done
            }, {
                new: true
            });
            return updateTask;
        }
    }
};
// typeDefs

const typeDefinitions = gql`
    type Task {
        id: ID,
        title: String,
        description:String,
        done:Boolean
    }
    type Query{
        hello: String
        getAllTasks: [Task]
        getTask(id: ID): Task
    }
    type Mutation{
        createTask (
            title: String,
            description: String,
            done: Boolean
        ): Task
        deleteTask(id: ID): String
        updateTask(
            id:ID,
            title:String, 
            description:String, 
            done:Boolean
        ): Task
    }
`;

//main
async function main() {
    const apolloServer = new ApolloServer({
        typeDefs: typeDefinitions,
        resolvers,
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app
    });

    app.use('*', (req, res) => {
        res.status(404).send('404 not found');
    });

    app.listen(PORT, () => {
        console.log(`sever is runnig on port :  ${PORT}`);
    });
}

main();



// description title : type String bizzarrap