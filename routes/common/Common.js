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
        response.message = "You must log in so you can use this endpoint"
        response.code = 2
        res.status(401).json(response)
    }
}

module.exports = {
    isAuthenticated: isAuthenticated
}