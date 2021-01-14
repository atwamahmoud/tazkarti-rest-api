import dotenv from "dotenv";
import express from "express";
import { ConnectDB} from "./common";
import {AuthMiddleware, Login} from "./API/auth";
import {deleteUser, GetUsers, SignUp, UpdateUser, updateUserValidationStatus} from "./API/user";
import {CreateStadium, GetStadiums, UpdateStadium} from "./API/stadium";
import {GetTeams} from "./API/teams";
import {CreateMatch, GetMatches, updateMatch} from "./API/match";
import {buyTicket, getMyTickets, cancelTicket} from "./API/tickets";

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
app.put("/user", UpdateUser);
app.get("/users", GetUsers);
app.delete("/users/:id", deleteUser);
app.put("/users/:id/toggleValid", updateUserValidationStatus);

app.post("/stadium", CreateStadium);
app.put("/stadium/:id", UpdateStadium);
app.get("/stadium", GetStadiums);

app.get("/team", GetTeams);

app.post("/match", CreateMatch);
app.get("/match", GetMatches);
app.put("/match/:id", updateMatch);

app.post("/match/:id/ticket", buyTicket);
app.get("/tickets", getMyTickets);
app.put("/tickets/:id", cancelTicket);

const port: string = process.env.PORT || "1888";

app.listen(port);

 