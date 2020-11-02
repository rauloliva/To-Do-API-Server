const fs = require('fs')
const express = require('express')
const mongoose = require('mongoose')
const List = require('../DBModels/models').list
const router = express.Router()

router.get('/', (req, res) => {
    fs.readFile('response.json', {encoding: 'utf-8'}, (err, data) => {
        const response = JSON.parse(data)
        if(req.isAuthenticated()){
            const userId = mongoose.Types.ObjectId(req.user.id)
            List.find({user: userId}, (error, lists) => {
                if(err) {
                    response.code = 0
                    response.message = "Error " + error
                } else {
                    response.data = lists
                    response.code = 1
                    response.message = 'Lists retrieved'
                }
                res.json(response)
            })
        } else {
            res.json(response)
        }
    })
    
})

router.post('/create', (req, res) => {
    fs.readFile("response.json",{encoding: 'utf-8'}, (err, data) => {
        const response = JSON.parse(data)
        if(req.isAuthenticated()) {        
            const list = new List({
                name: req.body.name,
                description: req.body.description,
                user: req.user.id,
                items: []
            })

            list.save((error, newList) => {
                if(error) res.json({error: error})
                response.message = `The list ${newList.name} has been created`
                response.data = newList
                response.code = 1
                res.status(201).json(response)
            })
        } else {
            response.message = "You must log in so you can use this endpoint"
            response.code = 2
            res.status(401).json(response)
        }
    })
})

module.exports = router