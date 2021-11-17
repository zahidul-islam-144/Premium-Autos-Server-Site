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
    const ordersCollection = database.collection("all-orders");
    const usersCollection = database.collection("users");
    const feedbackCollection = database.collection("all-feedbacks");

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

    // rating api
    app.post("/premium-autos/feedbacks", async (req, res) => {
      const addFeedback = req.body;
      console.log(addFeedback);
      const result = await feedbackCollection.insertOne(addFeedback);
      res.json(result);
    });

    app.get("/premium-autos/all-feedbacks", async (req, res) => {
      const getAllFeedbacks = await feedbackCollection.find({}).toArray();
      res.json(getAllFeedbacks);
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

    // Admin: updating car data
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

    // Make Admin api:
    app.put("/premium-autos/users/make-admin", async (req, res) => {
      const user = req.body;
      console.log(user);
      const setAdmin = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const makeAdmin = await usersCollection.updateOne(setAdmin, updateDoc);
      console.log(setAdmin);
      res.json(makeAdmin);
    });

    // get admin data to set admin
    app.get("/premium-autos/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // Manage All orders api
    app.get("/premium-autos/manage-all-orders", async (req, res) => {
      const allOrders = await ordersCollection.find({});
      const result = await allOrders.toArray();
      res.json(result);
    });
// manage all order deletion api
    app.delete("/premium-autos/delete-user-order/:delUserId", async (req, res) => {
      const getUserId = req.params.delUserId;
      console.log(getUserId);
      const query = { _id: ObjectId(getUserId) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // USER PANEL TASKS:

    // select-now car api (place order api)
    app.get("/premium-autos/select-now/:sId", async (req, res) => {
      // console.log(req);
      const selectedCarId = req.params.sId;
      console.log(selectedCarId);
      const query = { _id: ObjectId(selectedCarId) };
      const result = await carCollection.findOne(query);
      res.json(result);
    });

    // confirm order form api
    app.post("/premium-autos/orders", async (req, res) => {
      const addOrder = req.body;
      addOrder["status"] = false;
      console.log(addOrder);
      const result = await ordersCollection.insertOne(addOrder);
      res.json(result);
    });

    // status changing api
    app.put("/premium-autos/orders/:id", async (req, res) => {
      const id = { _id: ObjectId(req.params.id) };
      const data = req.body;
      delete data["_id"];
      data["status"] = !data.status;
      const result = await ordersCollection.updateOne(id, {
        $set: data,
      });
      res.json(result);
    });

    // User : see order api
    app.get("/premium-autos/my-orders/:email", async (req, res) => {
      const loggedInEmail = req.params.email;
      const query = { client_email: loggedInEmail };
      console.log(query);
      const result = await ordersCollection.find(query).toArray();
      res.json(result);
    });

    // edit my order api (review order)
    // get selected order data
    app.get("/premium-autos/selected-order/:id", async (req, res) => {
      const selectedOrder = req.params.id;
      const query = { _id: ObjectId(selectedOrder) };
      const result = await ordersCollection.findOne(query);
      res.json(result);
    });
    // updating selected order
    app.put("/premium-autos/update-order/:eoId", async (req, res) => {
      const updatedOrderId = req.params.eoId;
      const filter = { _id: ObjectId(updatedOrderId) };
      // console.log(filter);
      // console.log("put:", req.body);
      const options = { upsert: true };
      delete req.body["_id"];
      const updateDoc = {
        $set: req.body,
      };

      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
      // console.log(result);
    });

    app.delete("/premium-autos/delete-order/:orderId", async (req, res) => {
      const getOrderId = req.params.orderId;
      console.log(getOrderId);
      const query = { _id: ObjectId(getOrderId) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // rating api
    app.get('/premium-autos/all-feedbacks', async (req, res) => {
      const ratings = await feedbackCollection.find({}).toArray();
      res.json(ratings);
    })
    
    // auth api (brand new user data)
    app.post("/premium-autos/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put("/premium-autos/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
