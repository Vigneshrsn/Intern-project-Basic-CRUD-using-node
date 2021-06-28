const express = require('express');
const bodyParser = require('body-parser');
// const { Mongoose } = require('mongoose');
// const fetch = require('node-fetch');
const session = require('express-session');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');


const url = "mongodb://localhost:27017/banddb";
const port = 4000;
mongoose.connect(url, { useNewUrlParser: true });
const con = mongoose.connection;
const route = require('./routes/user');
const bandroute = require('./routes/band');
const apiroute = require('./routes/api');


const ensureAuthentication = require('./routes/auth');

con.on('open', () => {
    console.log('connected');
});

app.use(session({
    secret: 'nobody should guess this',
    saveUninitialized: true,
    resave: false,
    cookie: {
        secure: false
    }
}))

app.use(expressLayouts);
// app.use(fetch);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/', route);
app.use('/api', apiroute);
app.use((req, res, next) => {

    // console.log('req.session.user.uid : ' + req.session.user.uid)

    if (req.session.user && req.session.user.uid) {
        return next();
    } else {
        const alerts = [];
        alerts.push({ msg: 'You need to login first.' })
        res.render('login', {
            alerts
        })
    }
});
app.use('/bands', bandroute);




app.listen(port, () => {
    console.log("running");
})