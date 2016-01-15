"use strict"
let l = require("./log")

module.exports = {

    sendResults(res) {
        return function (results) {
            l("Sending: " + l(results));
            res.send(results);
        };
    },

    error(res) {
        return function (err) {
            l("Error: " + l(err));
            res.send({error: true});
        }
    }
}