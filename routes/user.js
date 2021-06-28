const express = require('express');
const app = express();
const session = require('express-session');
const fetch = require('node-fetch');

const router = express.Router();
const user = require('../modal/modal');
const band = require('../modal/band');
const bcrypt = require('bcryptjs');
var salt = 10;



// const uid = 0;


router.get('/', (req, res) => {
    res.end(';sucess;');
})
router.get('/register', (req, res) => {
    res.render('register');
    // res.end();
})
router.get('/login', (req, res) => {
    res.render('login');
})
router.get('/user/:uid/bands', (req, res) => {
    band.find({ uid: req.params.uid }).then((bands) => {
        res.render('bands', { bands });
    })

})
router.get('/reset-pswd', (req, res) => {
    res.render('reset-pswd-send-otp');
})



router.get('/users/logout', (req, res) => {
    const alerts = [];
    alerts.push({ msg: 'You were logged out!' })
    req.session.user = {};

    res.render('login', {
        alerts
    })
})
router.post('/register', (req, res) => {
    let alerts = []
        // const { name, email, organization, dob, password, confirmPassword } = req.body;
    if (req.body.name != "" || req.body.email != "" || req.body.organization != "" || req.body.dob != "" || req.body.password != 0 || req.body.confirmPassword != "") {

        var uid = 0;


        if (req.body.password == req.body.confirmPassword) {
            user.findOne({}, {}, {
                sort: { 'uid': -1 }
            }).then((data) => {

                // console.log(data);
                if (data != null) {
                    uid = data.uid + 1;
                } else {
                    uid = 0;
                }

            })



            const mail = req.body.email;
            user.findOne({
                email: mail

            }).then((data) => {
                if (data == null) {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        console.log(hash);
                        const newuser = new user({
                            uid: uid,
                            name: req.body.name,
                            email: req.body.email,
                            organisation: req.body.organization,
                            dob: req.body.dob,
                            password: hash


                        })

                        // console.log(newuser);
                        newuser.save().then(() => {
                                alerts.push({ msg: "Registrtion sucessfull" });
                                res.render('login', { alerts })
                            })
                            // uid = uid + 1;

                    })
                } else {
                    alerts.push({ msg: "User already exist" })
                    res.render('register', { alerts });
                }


            })



            // console.log(dbuser);

        } else {
            alerts.push({ msg: "Password must match" })
            res.render('register', { alerts });
        }
    } else {
        // console.log("no");
        alerts.push({ msg: "All FIELDS REQUIRED" })
        res.render('register', { alerts });
    }




    //user id function






});
router.post('/login', (req, res) => {
    let alerts = [];
    if (req.body.email != "" || req.body.password != "") {


        user.findOne({
            email: req.body.email,

        }).then((data) => {
            // console.log(data)
            if (data != null) {


                // console.log(req.session.user.uid);
                fetch('http://localhost:4000/api/us', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify(data)

                    })
                    .then(response => response.json())
                    .then((user) => {
                        bcrypt.compare(req.body.password, user.password, function(err, match) {
                            if (match) {
                                req.session.user = {
                                    uid: data.uid
                                };
                                res.redirect('/bands');

                            } else {
                                res.send("error");
                            }
                        })


                    })
                    .catch((err) => {
                        alerts.push({ msg: "no" });
                        res.render('home', {
                            alerts
                        })
                    })
                    // console.log("sucess");
            } else {
                alerts.push({ msg: "Invalid Credintials" });
                res.render('login', { alerts });
            }
        })

    }
})

router.post('/users/reset-pswd-send-otp', (req, res) => {
    let alerts = [];
    let email = req.body.email;

    user.findOne({ email: email }).then((user) => {
        if (user) {
            console.log(user);

            fetch('http://localhost:4000/api/user/send-otp', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(user),

            }).then((user) => {

                alerts.push({ msg: 'Otp sent Sucessfully' });
                res.render('reset-pswd-verify-otp', { email, alerts });
            })
        } else {
            alerts.push({ msg: 'Email not registered' });
            res.render('reset-pswd-send-otp', { alerts });
        }
    })

})
router.post('/users/verify-otp', (req, res) => {
    let alerts = [];
    user.findOne({ email: req.body.email, otp: req.body.otp }).then((user) => {
        alerts.push({ msg: "otp verified" })
        res.render('reset-pswd', { email: user.email });
    }).catch(() => {
        alerts.push({ msg: 'invalid otp' });
    })
})
router.post('/users/reset-pswd', (req, res) => {
    let alerts = [];
    if (req.body.newPassword == req.body.confirmPassword) {
        const resetpass = {
            email: req.body.email,
            newPassword: req.body.newPassword,
            confirmPassword: req.body.confirmPassword
        }
        fetch('http://localhost:4000/api/users/reset-pswd', {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(resetpass)
        }).then(() => {
            alerts.push({ msg: "password changed sucessfully" });
            res.render('login', { alerts });
        })
    } else {
        alerts.push({ msg: 'Please fill all field or both password must be same' })
        res.render('reset-pswd', { alerts })
    }


})
module.exports = router;