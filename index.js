const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// //middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0kaol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Premium-Autos");
    const carCollection = database.collection("car-details");
    // const orderCollection = database.collection("order-details");
    const usersCollection = database.collection("users")

    // posting brand new user
    // app.post("/premium-autos/users", async (req, res) => {
    //   const addUser = req.body;
    //   const result = await userCollection.insertOne(addUser);
    //   res.json(result);
    // })

    //====================================================

    // posting car data to the server
    app.post("/premium-autos/cars", async (req, res) => {
      const addCar = req.body;
      const result = await carCollection.insertOne(addCar);
      res.json(result);
      console.log(result);
      // res.send('hitted the post api...');
      // console.log("server: Got the car data...")
    });

    // Public: fecthing 6 car data from server
    app.get("/premium-autos/cars", async (req, res) => {
      const cursor = carCollection.find({}).limit(6);
      const result = await cursor.toArray();
      res.json(result);
    });

    // see details car data
    app.get("/premium-autos/details/:id", async (req, res) => {
      // console.log('detail:',req);
      const detailCarId = req.params.id;
      const query = { _id: ObjectId(detailCarId) };
      console.log(query);
      const result = await carCollection.findOne(query);
      res.json(result);
    });

    // Public: fecthing all cars data from server
    app.get("/premium-autos/explore", async (req, res) => {
      const cursor = carCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // Admin: fetching all added cars to manage (update/delete)
    app.get("/premium-autos/manage-cars", async (req, res) => {
      const cursor = carCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // Admin : deleteing car from database
    app.delete("/premium-autos/delete-car/:carId", async (req, res) => {
      const deletingCarId = req.params.carId;
      console.log(deletingCarId);
      const query = { _id: ObjectId(deletingCarId) };
      const result = await carCollection.deleteOne(query);
      res.json(result);
    });

    // updating car data
    app.get("/premium-autos/selected-car/:eId", async (req, res) => {
      const selectedCarData = req.params.eId;
      console.log("updating: ", selectedCarData);
      const query = { _id: ObjectId(selectedCarData) };
      // console.log(query);
      // res.send({'got data':query});
      const result = await carCollection.findOne(query);
      res.json(result);
    });

    app.put("/premium-autos/update-car/:eId", async (req, res) => {
      const updatedCarId = req.params.eId;
      const filter = { _id: ObjectId(req.params.eId) };
      console.log(filter);
      console.log("put:", req.body);
      const updatedCarData = req.body;
      // const options = { upsert: true };
      const updateDoc = {
        $set: {
          id_num: updatedCarData.id_num,
          brand: updatedCarData.brand,
          url: updatedCarData.url,
          model: updatedCarData.model,
          type: updatedCarData.type,
          miles: updatedCarData.miles,
          exterior: updatedCarData.exterior,
          interior: updatedCarData.interior,
          engine: updatedCarData.engine,
          fuel: updatedCarData.fuel,
          transmission: updatedCarData.transmission,
          drive: updatedCarData.drive,
          price: updatedCarData.price,
        },
      };
      const result = await carCollection.updateOne(filter, updateDoc);
      res.json(result);
    });


// auth data
app.post('/premium-autos/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  console.log(result);
  res.json(result);
});

app.put('/premium-autos/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running with the premium-autos server...");
});

app.listen(port, () => {
  console.log("App listening from http://localhost:", port);
});
