
var d = console.dir;
var l = console.log;
var j = JSON.stringify;


module.exports = function(item) {

    if (typeof(item) == 'string') {
        console.log(item);
    } else {
        return JSON.stringify(item);
    }
}