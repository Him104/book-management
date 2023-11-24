require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.mongo_uri)
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

 
app.use('/', route);

app.get('/',(req,res) =>{
    res.status(200).send("Server is up and running on :" + process.env.PORT);
})

app.listen(process.env.PORT || 3000, function () {


    console.log('Express app running on port ' + (process.env.PORT || 3000))

    
});