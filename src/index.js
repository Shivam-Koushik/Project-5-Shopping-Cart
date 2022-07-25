const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const route = require('./routes/route');
const mongoose = require('mongoose');
const app = express();

app.use(multer().any())

app.use(bodyParser.json()); 


mongoose.connect("mongodb+srv://ShivamKoushik:s%40H9663334444@cluster0.k1qkf.mongodb.net/group25Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});