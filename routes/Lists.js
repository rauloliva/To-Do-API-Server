const express = require('express')
const mongoose = require('mongoose')
const List = require('../models').list
const common = require('./common/Common')
const router = express.Router()

router.get('/', (req, res) => {
    common.readResponseFile( response => {
        common.isAuthenticated(req, res, response, () => {
            const userId = mongoose.Types.ObjectId(req.user.id)
            List.find({user: userId}, (error, lists) => {
                if(err) {
                    response.code = 0
                    response.message = `${process.env.MSG_SERVER_ERROR} ${error}`
                } else {
                    response.data = lists
                    response.code = 1
                    response.message = 'Lists retrieved'
                }
                res.json(response)
            })
        })
    })
})

router.post('/create', (req, res) => {
    common.readResponseFile( response => {
        common.isAuthenticated(req, res, response, () => {
            const list = new List({
                name: req.body.name,
                description: req.body.description,
                user: req.user.id,
                items: []
            })

            list.save((error, newList) => {
                if(error) {
                    response.message = `${process.env.MSG_SERVER_ERROR} ${error}`
                    response.code = 2
                    res.status(500).json(response)
                } else {
                    response.message = `The list '${req.body.name}' has been created`
                    response.data = newList
                    response.code = 1
                    res.status(201).json(response)
                }
            })
        })
    })
})

router.put('/:listId', (req, res) => {
    common.readResponseFile( response => {
        common.isAuthenticated(req. res, response, () => {
            const listId = mongoose.Types.ObjectId(req.params.listId)
            List.findOne({_id: listId}, async (error, list) => {
                if(error) {
                    response.code = 0
                    response.message = `${process.env.MSG_SERVER_ERROR} ${error}`
                } else {
                    list.name = req.body.name
                    list.description = req.body.description
                    
                    await list.save()
                    response.message = `The list ${req.body.name} has been updated`
                    response.code = 1
                    response.data = list
                }
                res.json(response)
            })
        })
    })
})

router.delete('/:listId', (req, res) => {
    common.readResponseFile( response => {
        common.isAuthenticated(req, res, response, () => {
            const listId = mongoose.Types.ObjectId(req.params.listId)
            List.remove({_id: listId}, error => {
                if(error) {
                    response.message = `The List could not be deleted: ${error}`
                    response.code = 2
                } else {
                    response.message = "The List was deleted"
                    response.code = 1
                }
                res.json(response)
            })
        })
    })
})

module.exports = router