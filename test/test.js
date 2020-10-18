const assert = require('assert')
const axios = require('axios')

describe('Testing API Endpoints', function() {
    describe('Path /', function() {
        it('The home path should return a reponse', async function() {
            axios.get('http://localhost:3000/').then(result => {
                assert.equal(result.data.response, 'Welcome to my endpoint')  
            })
        })
    })
})