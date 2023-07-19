const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewire
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcauzmf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        const houseCollection = client.db("hunterDB").collection("houses")
        const usersCollection = client.db("hunterDB").collection("users")

        //   apis of the users
       
        app.get('/users', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        app.post('/houses', async (req, res) => {
            const house = req.body;
            const result = await houseCollection.insertOne(house);
            res.send(result);
        })
        app.get('/houses', async (req, res) => {
            let query = {}
            if (req.query?.userEmail) {
                query = { userEmail: req.query.userEmail }
            }
            else if(req.query?.renterEmail){
                query = { renterEmail: req.query.renterEmail }
            }
            const cursor = houseCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });
        app.get('/houses/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const house = await houseCollection.findOne(query);
            res.send(house);
          })
          app.put('/houses/:id', async(req,res)=>{
            const id = req.params.id;
            const house = req.body;
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true}
            const updatedHouse= {
              $set:{
                hname: house.hname, 
                address: house.address, 
                city: house.city, 
                img: house.img, 
                bed: house.bed, 
                bath: house.bath, 
                size: house.size, 
                date: house.date, 
                rent: house.rent, 
                phone: house.phone, 
                description: house.description
              }
            }
            const result = await houseCollection.updateOne(filter, updatedHouse, options)
            res.send(result)
          })
          app.patch('/houses/:id', async (req, res) => {
            const id = req.params.id;
            const theBooking = req.body;
            const filter = { _id: new ObjectId(id) };
            console.log(theBooking)
            const updateDoc = {
              $set: {
                renterName: theBooking.renterName,
                renterEmail: theBooking.renterEmail,
                renterPhone: theBooking.renterPhone,
                status: theBooking.status
              },
            };
            const result = await houseCollection.updateOne(filter, updateDoc);
            res.send(result)
          })
          app.delete('/houses/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await houseCollection.deleteOne(query);
           
            res.send(result);
          })
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("house hunter server is running")
})

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})