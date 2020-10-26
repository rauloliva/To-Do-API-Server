const express = require('express')
const List = require('../DBModels/models').list
const router = express.Router()

router.get('/', (req, res) => {
    const response = { message: 'You are not authenticated', status: 403 }
    if(req.isAuthenticated()){
        List.find({}, (err, lists) => {
            if(err) {
                response.status = 500
            } else {
                response.res = lists
                response.status = 200
                response.message = 'Authenticated succesfully'
            }
            res.json(response)
        })
    } else {
        res.json(response)
    }
})

router.post('/', (req, res) => {
    console.log(req.body.name);
    console.log(req.user.id);
    const list = new List({
        name: req.body.name,
        user: req.user.id,
        items: []
    })

    list.save((error, newList) => {
        if(error) res.json({error: error})

        res.status(201)
           .json({list: newList})
    })
})

module.exports = router