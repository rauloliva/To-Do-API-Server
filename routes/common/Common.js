const fs = require('fs')

/**
 * 
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {JSON} response the JSON file
 * @param {Function} cb the callback function
 */
const isAuthenticated = (req, res, response, cb) => {
    if(req.isAuthenticated()) {
        cb()
    } else {
        response.message = process.env.MSG_ERROR_AUTH
        response.code = 2
        res.status(401).json(response)
    }
}

/**
 * 
 * @param {Function} cb the callback function 
 */
const readResponseFile = async (cb) => { 
    const data = fs.readFileSync(process.env.RESPONSE_FILE, {encoding: 'utf-8'})
    const response = JSON.parse(data)
    cb(response)
}

module.exports = {
    isAuthenticated: isAuthenticated,
    readResponseFile: readResponseFile 
}