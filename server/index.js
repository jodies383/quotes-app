// const pg = require("pg")
// const PgPromise = require("pg-promise")
// const express = require('express');
// const fs = require('fs');
// require('dotenv').config()
// const cors = require('cors')
// const { default: axios } = require('axios');
// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// const {ConnectionString} = require('connection-string');
// const { DATABASE_URL } = process.env;
// const cs = new ConnectionString(DATABASE_URL);
// const jwt = require('jsonwebtoken');
// const { get } = require("http");
// app.use(express.static('public'));
// app.use(cors());
// function get_PostgreSQL_connection() {
//     return {
//         host: cs.hostname,
//         port: cs.port,
//         database: cs.path?.[0],
//         user: cs.user,
//         password: cs.password,
//         ssl: DATABASE_URL.includes('localhost') ? false : {rejectUnauthorized: false},
//         application_name: cs.params?.application_name
//     };
// }

// const pgp = PgPromise({});

// const db = pgp(get_PostgreSQL_connection());

// app.use(express.static('public'))



const express = require('express');
const app = express();
const cors = require('cors');
const PgPromise = require('pg-promise');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const initOptions = {/* initialization options */};
const pgp = PgPromise(initOptions);

const DATABASE_URL= process.env.DATABASE_URL || "postgresql://jodie@localhost:5432/hearts_app";

const config = { 
    connectionString : DATABASE_URL
}

if (process.env.NODE_ENV == 'production') {
    config.ssl = { 
        rejectUnauthorized : false
	}
}

const db = pgp(config);

// const FruitEaterService = require('./fruit-eater-service');
// const fruitEaterService = FruitEaterService(db);

// enable the req.body object - to allow us to use HTML forms
// and when using POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const API = require('./api');
API(app, db);





//configure the port number using and environment number
var portNumber = process.env.PORT || 4000;

//start everything up
app.listen(portNumber, async function () {
    console.log('server listening on:', portNumber);
    async function testConnection() {
        const c = await db.connect(); // try to connect
        c.done(); // success, release connection
        return c.client.serverVersion; // return server version
    }
    await testConnection()
});