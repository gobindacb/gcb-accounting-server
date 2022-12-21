const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qt43ax4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('gcbAccounting').collection('services');
        const reviewCollection = client.db('gcbAccounting').collection('reviews');

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        app.get('/services', async (req, res) => {
            const date = new Date();
            const query = {}
            const cursor = serviceCollection.find(query).sort({ date: 1 });
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query).sort({ date: -1 });
            const reviews = await cursor.toArray();
            // const reviews = await reviewCollection.find(query).toArray();
            res.send(reviews);
            // console.log(reviews)
        });

        app.get('/service', async (req, res) => {
            let query = {};
            if (req.query.id) {
                query = {
                    id: req.query.id
                }
            }
            const cursor = reviewCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
            console.log(service)
        })



        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get('/reviews/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const reviews = await reviews.findOne({ _id: ObjectId(id) });
                req.send({
                    success: true,
                    data: reviews
                });

            } catch (error) {
                res.send({
                    success: false,
                    error: error.message
                });
            }
        });


        app.patch('/reviews/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await reviews.updateOne({ _id: ObjectId(id) }, { $set: req.body });

                if (result.matchedCount) {
                    res.send({
                        success: true,
                        message: 'Successfully Edited'
                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldnt edit the review",
                    })
                }
            } catch (error) {
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }

}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('gcb-accounting server is running')
})

app.listen(port, () => {
    console.log(`gcb-accounting server running on ${port}`);
})
