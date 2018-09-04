/*
 * Primary file for the HTTP REST homework1
 * Built upon the lessons in the course
 */

//Dependencies
var http = require('http');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./hw1config');

// Instantiating the HTTP server
var httpServer = http.createServer(function(req,res){
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort,function(){
  console.log("The server is listening on port " + config.httpPort + " in " + config.envName + " mode");
});

// All the logic for both the http and https server
var unifiedServer = function(req, res) {
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url,true);
  console.log("parsed ", parsedUrl);

  // Get the path
  var path = parsedUrl.pathname;
  console.log("Path ", path);
  // This RegEx trims away any leading and ending slashes, but not in the middle
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');
  console.log("Trimmad Path ", trimmedPath);

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Get the Header as an object
  var headers = req.headers;

  // Get the payload if there is any
  var decoder = new stringDecoder('utf-8');
  var buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });

  req.on('end',function(){

    buffer += decoder.end();
    // Choose the handler this request should go to, if one is not found use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data handler to send to the object
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload){
      // Use the status code called back from the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called backed by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // res.end('Hello World\n The request path was: ' + trimmedPath +'\n' + 'Method used was: ' +method +'\nQuery string was:  +queryStringObject \n');
      // Send the response
      //res.end('Hello World\n The request path was: ' + trimmedPath +'\n' + 'Method used was: ' +method +'\nQuery string was: ' +queryStringObject +'\n');

    });

  });

};

// Definer our handlers
var handlers = {};
// Ping handler
handlers.ping = function(data, callback){
  callback(200);
};

// Sample handler
handlers.hello = function(data, callback){
  // Callback a http status code, and a payload object
  callback(400, {'welcome' : 'Please vote in the upcoming Swedish election if you are eligable!'});
};

// Not Found (404) handler
handlers.notFound = function(data, callback){
  callback(404);

};
// Define a router function
var router = {
  'hello' : handlers.hello,
  'ping' : handlers.ping
};
