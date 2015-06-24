//Lets require/import the HTTP module
var http = require('http'),
    phantom = require('phantom'),
    url = require('url');

//Lets define a port we want to listen to
const PORT=8000;
const WEBSITE_URL="http://viewora.com/#!";

//We need a function which handles requests and send response
function handleRequest(request, response){
  phantom.create(function (ph) {
    ph.createPage(function (page) {
      var queryObject = url.parse(request.url, true).query,
          fetchPage;

      fetchPage = function(fragmentPath){
        var getPage, closeRead;
        getPage = function(){
          return document.getElementsByTagName('html')[0].innerHTML;
        };

        closeRead = function(result){
          response.end(result);
          ph.exit();
        };

        page.open(WEBSITE_URL + fragmentPath, function(status){
          console.log("Request State Success? ", status);
          page.evaluate(getPage, closeRead);
        });
      };

      if(queryObject._escaped_fragment_){
        fetchPage(queryObject._escaped_fragment_);
      } else {
        response.end("Oops.. Nothing to find here!");
      };
    });
  });
};

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
  //Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});
