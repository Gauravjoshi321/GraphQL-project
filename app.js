const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { mongoose } = require('mongoose');
const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event{
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    input EventInput{
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    type RootQuery{
      events: [Event!]!
    }
    type RootMutation{
      createEvent(eventInput: EventInput):Event
    }
    schema{
      query: RootQuery
      mutation: RootMutation
    }
    `),
  rootValue: {
    events: () => {
      return Event.find();
    },
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: args.eventInput.price,
        date: new Date(args.eventInput.date),
        // date: args.eventInput.date,  // both will work
      })
      return event.save().then(result => {
        console.log(result);
        return { ...result._doc };
      }).catch(err => {
        console.log(err);
        throw err;
      })
    }
  },
  graphiql: true
}))

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.majes.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is listening on port 3000");
    })
  })
  .catch((err) => {
    console.log(err)
  })

