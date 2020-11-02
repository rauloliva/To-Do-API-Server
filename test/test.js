const assert = require('assert')
const axios = require('axios')
const fs = require('fs')
const { dirname } = require('path')
const request = require('request')
const qs = require('qs')
const url = "http://localhost:3000"

describe('Testing API Endpoints', function() {
    describe('Path /', function() {
        it('The home path should return a 200 status code', async function() {
            request(url + '/', (err, response, body) => {
                assert.equal(response.statusCode, 200)
             
            })
        })
    })

    describe('Path /auth/register', () => {
        it('Register a new User', async () => {
            const user = {
                username: "Test",
                password: "testing100",
                email: "test@gmail.com"
            }
            const options = {
                method: 'POST',
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                data: qs.stringify(user),
                url: url + '/auth/register'
            }
            axios(options)
                .then(response => {
                    assert(response.status, 201)
                })
        })
    })

    describe('Path /auth/login', () => {
        it('Login a new User', () => {
            const user = {
                username: "Test",
                password: "testing100"
            }
            const options = {
                method: 'POST',
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                data: qs.stringify(user),
                url: url + '/auth/login'
            }
            axios(options)
                .then(response => {
                    assert.equal(response.data.message, 'The User is Logged In')
                })
        })
    })

    describe("Reading the response.json file", () => {
        it('the Message must be empty',() => {
            fs.readFile('response.json',{encoding: 'utf-8'}, (err, data) => {
                var object = JSON.parse(data)
                assert.equal(object.message, "")
            })
        })

        it('the Code must be 0',() => {
            fs.readFile('response.json',{encoding: 'utf-8'}, (err, data) => {
                var object = JSON.parse(data)
                assert.equal(object.code, 0)
            })
        })
    })
})