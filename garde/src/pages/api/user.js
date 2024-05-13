const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://asa_admin:gardeasa_admin@en-garde.d5nem9m.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function getFromMongo(req, res) {
    try {
        const data = req.body;

        await client.connect();

        const db = client.db("Garde");
        const collection = db.collection(data.type);

        let document = await collection.findOne({"_id": data._id});

        if(data.type === "fencer" && !document) {
            document = createFencer(data, collection);
        }
        else if(data.type === "coach" && !document) {
            document = createCoach(data, collection);
        }

        res.status(200).json({ "document": document });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createFencer(data, collection) {
    const result = await collection.insertOne({
        "_id": data._id,
        "name": data.name,
        "sessions": [],
        "cumulativeAccuracy": null,
        "averageTimes": {
            "advance": null,
            "lunge": null,
            "enGuarde": null,
            "retreat": null
        }
    });
    const document = await collection.findOne({ "_id": result.insertedId });

    console.log(document);

    return document;
}

async function createCoach(data, collection) {
    const result = await collection.insertOne({
        "_id": data._id,
        "name": data.name,
        "fencers": [],
    });
    const document = await collection.findOne({ "_id": result.insertedId });

    console.log(document);

    return document;
}