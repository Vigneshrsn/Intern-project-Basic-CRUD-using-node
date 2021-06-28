const express = require('express');
const app = express();
const fetch = require('node-fetch');
const band = require('../modal/band');
const { findOneAndUpdate } = require('../modal/modal');
const user = require('../modal/modal');
const sendgmail = require('@sendgrid/mail');
const bcrypt = require('bcryptjs');
var salt = 10;



const router = express.Router();

function sendOTP(email, otp) {

    sendgmail.setApiKey('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');


    const msg = {
        to: 'princegaming1001@gmail.com',
        from: 'vigneshrsn5@gmail.com',
        subject: 'My Bands - Reset Password OTP',
        html: `Your OTP for password reset is : <strong>${otp}</strong>`,
    };

    sendgmail.send(msg).catch(err => console.log(err))
}

function getOTP() {
    const max = 1000;

    return Math.floor(Math.random() * Math.floor(max)) + max;
}

router.get('/user/profile/:uid', (req, res) => {
    let uid = req.params.uid;
    user.findOne({ uid: uid }).then((user) => {
        // console.log(user);
        // res.send(user);
        res.render('profile', { user });
    })
})
router.post('/us', (req, res) => {
    // let user = req.body;

    user.findOne({
        uid: req.body.uid,
    }).then((user) => {
        if (user) {
            res.send(user);
        } else {
            throw new Error();
        }
    });
});
router.put('/user/send-otp', (req, res) => {
    let otp = getOTP();
    console.log(otp);
    // sendOTP(req.body.email, otp);

    user.findOneAndUpdate({ uid: req.body.uid }, {
        otp: otp,
    }).then((user) => {

        res.send(user);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
})
router.put('/users/reset-pswd', (req, res) => {
    // console.log('ood');
    // console.log(req.body.newPassword);
    bcrypt.hash(req.body.newPassword, salt, (err, hash) => {

        user.findOneAndUpdate({ email: req.body.email }, { password: hash }).then((user) => {
            res.send(user);
        }).catch((err) => {
            res.send(err);
        })
    })
})
router.put('/users/:uid/bands/band/:bid', (req, res) => {

    band.findOneAndUpdate({
            uid: req.params.uid,
            bid: req.params.bid,

        }, {
            name: req.body.name,
            description: req.body.description,
            origin: req.body.origin,
            rating: req.body.rating
        })
        .then((Updated) => {
            res.send(Updated);
        })
        .catch((err) => {
            console.log(err);
            res.status(404).send({
                error: 'Cound\'nt update band.'
            })
        })

})
router.put('/users/user/:uid', (req, res) => {
    let uid = req.params.uid;
    user.findOneAndUpdate({
            uid: uid
        }, {
            name: req.body.name,
            email: req.body.email,
            organisation: req.body.organisation,
            dob: req.body.dob
        }).then((updated) => {
            // console.log(updated);
            res.send(update);
        })
        .catch((err) => {
            res.send(err);
        })


})
router.delete('/users/:uid/bands/band/:bid', (req, res) => {
    // console.log('gg');
    band.findOneAndDelete({
            bid: req.params.bid,
            uid: req.params.uid
        })
        .then((deleted) => {
            if (deleted) {
                res.sendStatus(200);
            } else {
                res.send({
                    error: 'Error in deleteting Band'
                });
            }
        }).catch((err) => {
            console.log(err);

            res.send({
                error: 'Could\'nt delete Band'
            });
        })

})
module.exports = router