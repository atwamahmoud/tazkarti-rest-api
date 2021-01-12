import dotenv from "dotenv";
import express from "express";
import { ConnectDB} from "./common";
import {AuthMiddleware, Login} from "./API/auth";
import {SignUp} from "./API/user";

const app = express();

app.use(express.json());


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Expose-Headers", "*");
    next();
})

// app.use(AuthMiddleware)

dotenv.config();
// app.use("/lecture", express.static(join(process.env.BASE_DIR, "lectures")));
ConnectDB();


app.post("/login", Login);
app.post("/user", SignUp);

const port: string = process.env.PORT || "1888";

app.listen(port);

 