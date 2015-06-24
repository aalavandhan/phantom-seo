//Lets require/import the HTTP module
var http = require('http'),
    phantom = require('phantom'),
    url = require('url'),
    fs = require('fs'),
    overlay;


//Lets define a port we want to listen to
const PORT=8000;
const WEBSITE_URL="http://viewora.com/";

//We need a function which handles requests and send response
function handleRequest(request, response){
  phantom.create(function (ph) {
    ph.createPage(function (page) {
      var queryObject = url.parse(request.url, true).query,
          fetchPage;

      fetchPage = function(fragmentPath){
        var getPageAndAppendScript, closeRead;
        getPageAndAppendScript = function(){
          var head = document.getElementsByTagName('head')[0].innerHTML,
              body = document.getElementsByTagName('body')[0].innerHTML;

          return "<html><head>" + head + "</head><body>" + body + "</body></html>";
        };

        closeRead = function(result){
          var res = result;
          // Sharable link
          if(queryObject._share){
            res = result.replace("<body>", overlay);
          };
          response.end(res);
          ph.exit();
        };

        page.open(WEBSITE_URL + fragmentPath, function(status){
          console.log("Request State :", status);
          page.evaluate(getPageAndAppendScript, closeRead);
        });
      };

      if(queryObject._escaped_fragment_ || queryObject._share){
        fetchPage(queryObject._escaped_fragment_ || queryObject._share);
      } else {
        response.end("Oops.. Nothing to find here!");
      };
    });
  });
};


function startServer(){
  //Create a server
  var server = http.createServer(handleRequest);

  //Lets start our server
  server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
  });
};



fs.readFile('views/overlay.html', 'utf8', function (err,data){
  if(err){
    throw "Unable to read overlay";
  };

  overlay = data;

  // start server
  startServer();
});
