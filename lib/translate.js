// Andrew Lunny and Marak Squires
// Mit yo, copy paste us some credit

// simple fn to get the path given text to translate
var getEnglishTranslatePath = function (lang, text) {

  // set the default input and output languages to English and Spanish
  var input = languages[lang.input] || 'en',
  output = languages[lang.output] || 'es';

  return '/language/translate/v2?key=AIzaSyCS971fgd8Vj2coDihoiLPXBofYEhC86iw' + 
        '&source=' + encodeURIComponent(input) + '&target=' + encodeURIComponent(output)
        + '&q=' + encodeURIComponent(text);

 //   https://www.googleapis.com/language/translate/v2?key=AIzaSyCS971fgd8Vj2coDihoiLPXBofYEhC86iw&source=en&target=de&q=hi
}

// stupid if else statement, i felt like actually making his library dual-sided instead of bashing my head against gemini.js 
if(typeof exports === 'undefined'){

  //var languages = window.getLangs();
  var translate = {
    text: function( lang, text, callback) {

      // this is not a good curry recipe. needs moar spice
      if(typeof lang !== 'object'){
        callback = text;
        text = lang;
      }

      var src = "https://www.googleapis.com" + getEnglishTranslatePath(lang, text) + '&callback=translate._callback';
      console.log('url is ',src);
      var script = document.createElement("script");
      script.setAttribute("src", src);
      
      script.onload = function() {
        try{
          var rsp = translate._data.shift();
          callback(rsp.translatedText);
          document.body.removeChild(script);  
        } 
        catch(e) {
          //console.log(e)
        }
      };
      document.body.appendChild(script);
    },
    _data: [],
    _callback: function(rsp) {
      translate._data.push(rsp.responseData);
    }
  };
}
else{

  var sys = require('sys')
    , http = require('http')
    , request = require('request');

  var languages = require('./languages').getLangs();
  var translates = exports;

  // translate the text
  exports.text = function (lang, text, callback) {
    // this is not a good curry recipe. needs moar spice
    if(typeof lang !== 'object'){
      callback = text;
      text = lang;
    }
    
    
    var requestOptions = {
      uri: 'https://www.googleapis.com' + getEnglishTranslatePath(lang, text)
    };

         console.log('url is ',requestOptions.uri);

    request(requestOptions, function(err, resp, body){
      if(err){
	console.log('error is ',err);
        return callback(err);
      }
      try {
	console.log('response body is ',body);
        var data = JSON.parse(body);
  console.log('data is ',data);
      }
      catch(e) {
	console.log('exception is ',e);
        return callback(e)
      }
      if (!data || !data.responseData || data.responseStatus != 200) {
          return callback(new Error(data && data.responseDetails ? data.responseDetails : 'No response data'));
      }

      callback(null, data.responseData.translatedText);
    });
  }
}
