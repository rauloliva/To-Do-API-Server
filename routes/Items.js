const fs = require('fs')
const express = require('express')
const mongoose = require('mongoose')
const Item = require('../DBModels/models').item
const List = require('../DBModels/models').list
const isAuthenticated = require('./common/Common').isAuthenticated
const router = express.Router()

router.post('/create', (req, res) => {
    fs.readFile('response.json', {encoding: 'utf-8'}, (err, data) => {
        const response = JSON.parse(data)
        isAuthenticated(req, res, response, () => {
            const item = new Item({
                task: req.body.task,
                isDone: req.body.isDone
            })

            item.save((error, newItem) => {
                if(error) {
                    response.message = `Server Error: ${error}`
                    response.code = 2
                    res.status(500).json(response)
                } else {
                    const listId = mongoose.Types.ObjectId(req.body.listId)
                    updateItemsOnList(listId, newItem._id, () => {
                        response.message = `The Item '${req.body.task}' has been created`
                        response.data = newItem
                        response.code = 1
                        res.status(201).json(response)
                    })
                }
            })
        })
    })
})

router.get('/:itemId', (req, res) => {
    fs.readFile('response.json',{encoding: 'utf-8'}, (err, data) => {
        const response = JSON.parse(data)
        isAuthenticated(req, res, response, () => {
            const itemId = mongoose.Types.ObjectId(req.params.itemId)
            Item.findOne({_id: itemId}, (err, item) => {
                response.message = "Item retrieved"
                response.data = item
                response.code = 1
                res.status(201).json(response)
            })
        })
    })
})

const updateItemsOnList = (listId, itemId, sendResponse) => {
    List.findOne({_id: listId}, async (err, list) => {
        const currentItems = list.items
        const newItems = [...currentItems, itemId]
        list.items = newItems
        await list.save()
        sendResponse()
    })
}

module.exports = router