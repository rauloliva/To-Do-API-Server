const express = require('express')
const mongoose = require('mongoose')
const Item = require('../models').item
const List = require('../models').list
const common = require('./common/Common')
const router = express.Router()

router.post('/create/:token', (req, res) => {
    const token = req.params.token
    common.readResponseFile( response => {
        common.isAuthenticated(token, res, response, () => {
            const item = new Item({
                task: req.body.task,
                isDone: req.body.isDone
            })

            item.save((error, newItem) => {
                if(error) {
                    response.message = `${process.env.MSG_SERVER_ERROR} ${error}`
                    response.code = 2
                    res.status(500).json(response)
                } else {
                    const listId = mongoose.Types.ObjectId(req.body.listId)
                    updateItemsOnList(listId, newItem, () => {
                        response.message = process.env.MSG_ITEM_RETRIEVED.replace('#', req.body.task)
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
    common.readResponseFile( response => {
        common.isAuthenticated(req, res, response, () => {
            common.findItem(req.params.itemId, res, response, item => {
                response.message = "Item retrieved"
                response.data = item
                response.code = 1
                res.status(200).json(response)
            })
        })
    })
})

router.patch('/:itemId', (req, res) => {
    common.readResponseFile( response => {
        common.isAuthenticated(req, res, response, () => {
            common.findItem(req.params.itemId, res, response, async item => {
                item[req.body.field] = req.body.value
                await item.save()

                response.message = "The Item has been updated"
                response.data = item
                response.code = 1
                res.status(200).json(response)
            })
        })
    })
})

router.delete('/:itemId', (req, res) => {
    common.readResponseFile( response => {
        common.isAuthenticated(req, res, response, () => {
            const itemId = mongoose.Types.ObjectId(req.params.itemId)
            Item.remove({_id: itemId}, err => {
                if(error) {
                    response.message = `The Item could not be deleted: ${error}`
                    response.code = 2
                } else {
                    response.message = "The Item was deleted"
                    response.code = 1
                }
                res.status(204).json(response)
            })
        })
    })
})

const updateItemsOnList = (listId, itemObject, sendResponse) => {
    List.findOne({_id: listId}, async (err, list) => {
        const currentItems = list.items
        const newItems = [...currentItems, itemObject]
        list.items = newItems
        await list.save()
        sendResponse()
    })
}

module.exports = router