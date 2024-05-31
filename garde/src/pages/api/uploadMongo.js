const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function uploadToMongo(req, res) {
    try {
        const data = req.body;

        await client.connect();

        const db = client.db("Garde");
        const collection = db.collection("videos");

        const count = await collection.countDocuments();

        let document;
        if (count === 0) {
            // Collection is empty, create a new document with a unique id
            document = {
                _id: new ObjectId(),
                userAngles: [
                    {
                        "speed": data.speed,
                        "name": data.pose,
                        "left-elbow": data.left_elbow,
                        "right-elbow": data.right_elbow,
                        "left-hip": data.left_hip,
                        "right-hip": data.right_hip,
                        "left-knee": data.left_knee,
                        "right-knee": data.right_knee,
                        "feet-distance": data.feet_distance,
                        "accuracy": data.accuracy
                    }
                ],
            };
            await collection.insertOne(document);
        } else {
            // Collection is not empty, append to the userAngles of the first document
            const firstDocument = await collection.findOne();
            const update = {
                $push: {
                    userAngles: {
                        "speed": data.speed,
                        "name": data.pose,
                        "left-elbow": data.left_elbow,
                        "right-elbow": data.right_elbow,
                        "left-hip": data.left_hip,
                        "right-hip": data.right_hip,
                        "left-knee": data.left_knee,
                        "right-knee": data.right_knee,
                        "feet-distance": data.feet_distance,
                        "accuracy": data.accuracy
                    }
                }
            };
            await collection.updateOne({ _id: firstDocument._id }, update);
            document = await collection.findOne({ _id: firstDocument._id });
        }        

        res.status(200).json({ document });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
}