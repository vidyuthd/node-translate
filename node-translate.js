var fs = require('fs');

var sys = require('sys')
    , http = require('http')
    , request = require('request');

//var languages = require('lib/languages').getLangs();

var URI = 'https://www.googleapis.com/language/translate/v2?key=<KEY>&source=en&target=de';

var file = "sample.properties";

var outputFile = "sample_de.properties";

var outputData = '';

fs.readFile(file,'utf8', function(err,data)
{
	if(err) throw err;

	var fileData = data;

	var array = fileData.split("\n");

  var url  = URI ;
  
  var keySet = new Array();

  var valueSet = new Array();

  var  requestOptions = {};

  var start = 0;
  var stop = 50;
	var max = -1;

  for(str in array)
	{
		if(array[str].indexOf('#') < 0 && array[str] !== '')
    {
      var word = array[str];
      var key = array[str].split('=')[0];
      var value = array[str].split('=')[1];
      
      keySet.push(key);
      valueSet.push(value);
    }
	}

  max = keySet.length; 
  stop = max > stop ? stop : max;

  function callRequest(start,stop)
  {
    url = URI;
    for(str in valueSet)
    {
        if(str < stop && str >= start)
            url = url + "&q=" + encodeURI(valueSet[str]);
    }

    requestOptions = {
    uri: url
  }; 
  
    makeRequest(keySet.splice(start,stop - start));
  }


  function makeRequest(keySet)
  {
    request(requestOptions, function(err, resp, body){
        if(err){
          console.log(err);
        }
        try {
          var response = JSON.parse(body);
          var dataArray  = new Array();
          var data = new Array();
          if(response.data)
          {
             dataArray = response["data"]["translations"];
             for(var text in dataArray)
             {
               data.push(dataArray[text]["translatedText"]);
             }
             writeFile(data,keySet);
          }
        }
        catch(e) {
          console.log(e);
        }
      });
  }

  function writeFile(values,keys)
  {
    var outputData = "";
    for(key in keys)
    {
        outputData += keys[key] + '=' + values[key] + "\n"  ;
    }
    fs.readFile(outputFile,"utf8",function(err,data)
    {
      if(err) 
      {
         fs.writeFile(outputFile, outputData,"utf8");
      }
      else
      {
        var toWriteData = data + outputData;
        fs.writeFile(outputFile, toWriteData,"utf8");
      }
    });
  }

    while(stop <= max && max > 0)
    {
      callRequest(start,stop);
      start = stop;
      stop += 50;
    }

});

  