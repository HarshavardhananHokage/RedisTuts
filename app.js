const express = require('express');
const bodyParser = require('body-parser');
const exphb = require('express-handlebars');
const method = require('method-override');
const dotenv = require('dotenv');
const redis = require('redis');

dotenv.config();

const app = express();

const client = redis.createClient(6379, 'localhost');

client.on('connect', function() {
    console.log("Connected to Redis");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', exphb({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(method('_method'));

app.get('/', function(req, res) {
    res.render('search');
});

app.post('/users/search', function(req, res) {
    let id = req.body.id;
    client.hgetall(id, function(err, obj) {
        if(!obj) {
            res.render('search', {
                error: 'User does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                user: obj
            });
        }
    })
});

app.get('/users/add', function(req, res) {
    res.render('adduser');
});

app.post('/users/add', function(req, res) {
    let id = req.body.id;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'firstName', firstName,
        'lastName', lastName,
        'email', email,
        'phone', phone
    ], function(err, obj) {
        if(err) {
            console.log(err);
        } else {
            console.log(obj);
            res.redirect('/');
        }
    });

});

app.delete('/users/delete/:id', function(req, res) {
    console.log(req.params.id);
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(process.env.PORT, () => {
    console.log("Server Started at port: " +process.env.PORT);
});