var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

var apiHost = process.env.API_HOST;
var apiToken = process.env.API_TOKEN;
var requestToken = process.env.REQUEST_TOKEN;
var projectId = parseInt(process.env.PROJECT_ID, 10);

app.get('/', function(req, response) {
  response.end('OK');
});

app.post('/bug', function(req, response) {
    var body = req.body;
    console.log('~~BODY', body);
    if (requestToken && body.token !== requestToken) {
        response.end('Token required');
        return;
    }
    
    var bugName = body.text;
    if (!bugName) {
        response.end('Bug name expected');
    }
    
    console.log('~~NAME', bugName);
    
    var requestOptions = {
        url: apiHost + '/api/v1/bugs?token=' + apiToken,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: {
            name: bugName,
            project: {
                id: projectId
            }
        }
    };
    
    console.log('~~~REQUEST PAYLOAD', JSON.stringify(requestOptions));
    
    request(requestOptions, function(error, apiResponse) {
        if (error) {
            console.log('~~RESPONSE ERROR', error);
            response.end('Error occurred: ' + error);
            return;
        }
        
        console.log('~~RESPONSE BODY', apiResponse.body);
                
        var id = apiResponse.body.Id;
        var url = apiHost + '/entity/' + id;
        
        response.end('Created bug <' + url + '> ' + apiResponse.body.Name);
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


