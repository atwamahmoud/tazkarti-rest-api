const fs = require("fs");
const mongo = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const json = fs.readFileSync(__dirname + "/admins.json", {encoding: "utf8"});
const parsed = JSON.parse(json);

(async () => {
    const client = await mongo.connect(process.env.DB_URI);
    const db = client.db("test");
    const collection = db.collection("users");
    for(const admin of parsed) {
        const password = await bcrypt.hash(admin.password, Number(process.env.NUM_ROUNDS));
        await collection.insertOne({
            ...admin,
            password,
            isValid: true,
        });
    }
    console.log("finished creating admins!");
    client.close();
})();


