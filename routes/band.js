const express = require('express');
const app = express();
const fetch = require('node-fetch');
const band = require('../modal/band');
const user = require('../modal/modal');






const router = express.Router();
router.get('/', (req, res) => {
    user.findOne({ uid: req.session.user.uid }).then((user) => {
        band.find({ uid: req.session.user.uid }).then((bands) => {


            res.render('home', { user, bands });

        })
    })




})
router.get('/users/profile/', (req, res) => {
    let uid = req.session.user.uid;
    user.findOne({ uid: uid }).then((user) => {
        // console.log(user);
        // res.send(user);
        res.render('profile', { user });
    })


    // fetch(`http://localhost:4000/api/user/profile/${uid}`)

    // .then((response.json()))
    //     .then((user) => {
    //         console.log(user);
    //         res.render('profile', { user });
    //     }).catch((err) => {
    //         res.send(err);
    //     })


})
router.get('/band/:bid/user/:uid', (req, res) => {
    let uid = req.params.uid;
    let bid = req.params.bid;

    band.findOne({ uid: uid, bid: bid }).then((band) => {
        // console.log(band);
        res.render('editBand', { band });
    }).catch((err) => {
        res.send(err);
    })

})

router.get('/addBand', (req, res) => {
    res.render('addBand');
});
router.get('/band/del/:bid', (req, res) => {
    let uid = req.session.user.uid;
    let bid = req.params.bid;
    let alerts = [];

    fetch(`http://localhost:4000/api/users/${uid}/bands/band/${bid}`, {
            method: 'DELETE',
        })
        .then(() => {
            res.redirect('/bands');
        })
        .catch((err) => {
            alerts.push({ msg: 'Could\'nt delete your band' });

            console.log(err)
            res.render('editBand', {
                band,
                alerts
            })
        })


})




router.post('/addband', (req, res) => {
    let alerts = [];
    var bid = 0;
    if (req.body.name != "" || req.body.description != "" || req.body.orgin != "" || req.body.rating != "") {
        band.findOne({ uid: req.session.user.uid }, {}, { sort: { 'bid': -1 } }).
        then((data) => {

            if (data != null) {
                bid = data.bid + 1;
            } else {
                bid = 0;
            }
            const newband = new band({

                uid: req.session.user.uid,
                bid: bid,
                name: req.body.name,
                description: req.body.description,
                origin: req.body.origin,
                rating: req.body.rating,
            })


            newband.save().then(() => {
                res.redirect('/bands');

            })
        })

    } else {

        alerts.push({ msg: "fill all fields" });
        res.render('addBands', { alerts });
    }
})
router.post('/band/:bid', (req, res) => {
    let alerts = [];
    let uid = req.session.user.uid;


    let bid = req.params.bid;
    // console.log(bid);
    let sendband = {
        bid: bid,
        name: req.body.name,
        description: req.body.description,
        origin: req.body.origin,
        rating: req.body.rating
    }
    fetch(`http://localhost:4000/api/users/${uid}/bands/band/${bid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(sendband)
        }).then(() => {
            alerts.push({ msg: 'Band updated' })

            res.render('editBand', {
                band: sendband,
                alerts
            })
        }).catch((err) => {
            alerts.push({ msg: 'Could\'nt update your band' });

            console.log(err)
            res.render('editBand', {
                band: sendband,
                alerts
            })
        })
        // .then(() => {
        //     res.redirect('/bands');
        // })

})
router.post('/users/user/:uid', (req, res) => {
    let uid = req.params.uid;
    const update = {
        name: req.body.name,
        email: req.body.email,
        organisation: req.body.organization,
        dob: req.body.dob,

    }
    fetch(`http://localhost:4000/api/users/user/${uid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(update)

        }).then(response => response.json())
        .then(() => {
            res.render('profile', { user: update })
        }).catch((err) => {
            res.send(err);
        })


})

module.exports = router;