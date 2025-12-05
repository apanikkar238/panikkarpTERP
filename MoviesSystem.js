const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");


require("dotenv").config({
  path: path.resolve(__dirname, "credentialsDontPost/.env"),
});


const PORT = process.env.PORT || 7003;

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

const databaseName = "CMSC335DB";
const collectionName = "moviesCollection";
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

app.get("/", async (req, res) => {
  res.send(`My Deployment`);
});

app.get("/insertMovies", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db(databaseName).collection(collectionName);

    const moviesArray = [
      { name: "Batman", year: 2021, stars: 1.5 },
      { name: "Wonder Women", year: 2005, stars: 2.0 },
      { name: "When Harry Met Sally", year: 1985, stars: 5 },
      { name: "Hulk", year: 1985, stars: 5 },
    ];

    const result = await collection.insertMany(moviesArray);
    res.send(`<h2>Inserted ${result.insertedCount} movies</h2>`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error inserting movies");
  } finally {
    await client.close();
  }
});

app.get("/listMovies", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db(databaseName).collection(collectionName);

    const filter = {};
    const cursor = collection.find(filter);
    const result = await cursor.toArray();

    let answer = "";
    result.forEach((elem) => (answer += `${elem.name} (${elem.year})<br>`));
    answer += `Found: ${result.length} movies`;
    res.send(answer);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error listing movies");
  } finally {
    await client.close();
  }
});

app.get("/clearCollection", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db(databaseName).collection(collectionName);
    await collection.drop();
    res.send("<h2>Collection Cleared</h2>");
  } catch (e) {
    console.error(e);
    res.status(500).send("Error clearing collection");
  } finally {
    await client.close();
  }
});

app.get("/getSummary", (req, res) => {
  const variables = { year: 2025 };
  res.render("summary", variables);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});