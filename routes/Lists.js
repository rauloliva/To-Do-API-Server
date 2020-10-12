const express = require('express')
const List = require('../DBModels/models') [1]
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

module.exports = router