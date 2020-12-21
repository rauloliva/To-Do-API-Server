const fs = require('fs')

const getPhoto = (user, cb) => {
    if(user == null) {
        cb(user)
        return
    }

    if(user.photo !== undefined) {
        var photo = user.photo.filename
        if(!photo.includes('https')) {
            fs.readFile('photos/'+user.photo.filename, (err, data) => {
                user.photo.filename = `data:${user.photo.mimetype};base64,${data.toString('base64')}`
                cb(user)
            })
        } else{
            cb(user)
        }
    } else {
        cb(user)
    }
    
}

module.exports = { getPhoto }