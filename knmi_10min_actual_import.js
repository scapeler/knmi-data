
/**
 * This module build xml from javascript objects
 * @module knmi_10min_actual_import
 */

"use strict"; // This is for your code to comply with the ECMAScript 5 standard.

var fs 			= require('fs');
var ftp 		= require('ftp');
//var ftpClient 		= require('ftp-client');
var url			= require('url');
var sax 		= require('sax'),
  strict = true; // set to false for html-mode

console.log('Module ' + 'knmi_10min_actual_import.js' + ' executed');

module.exports = {

init: function(req, res, query) {

	var self = this;

	console.log('Module ' + 'knmi_10min_actual_import.js' + ' init() executed');

	this.ftp(query, function(tempFileName) {
    console.log('Ftp succes');
	});
},


ftp: function (query, callback) {

		//var _url = url.parse(query.url);
    var _url = {}
    var curr_date = new Date(new Date().getTime()-6*600000); // download file of 50 minutes old, this one is validated or last updated.
    var curr_month = curr_date.getUTCMonth()+1;
    var monthStr = curr_month<10?'0'+curr_month:''+curr_month;
    var dayStr = curr_date.getUTCDate()<10?'0'+curr_date.getUTCDate():''+curr_date.getUTCDate();
    var download_date = '/'+ curr_date.getUTCFullYear() + '/' + monthStr + '/' + dayStr + '/'
    var hourStr = curr_date.getUTCHours()<10?'0'+curr_date.getUTCHours():''+curr_date.getUTCHours();
    var min10 = curr_date.getUTCMinutes()-(curr_date.getUTCMinutes()%10);
    var min10Str = min10<10?'0'+min10:''+min10;

    _url.path = "/download/Actuele10mindataKNMIstations/1/noversion"+download_date;
    _url.filename="KMDS__OPER_P___10M_OBS_L2_"+hourStr+min10Str+".nc";
//    _url.path = "/download/Actuele10mindataKNMIstations/1/noversion"+download_date+"KMDS*OPER*P*10M*OBS*L2*"+hourStr+min10Str+".nc";
//    _url.path = "/download/Actuele10mindataKNMIstations/1/noversion"+download_date+"KMDS*";
    //ftp://data.knmi.nl/download/Actuele10mindataKNMIstations/1/noversion/2018/05/25/KMDS__OPER_P___10M_OBS_L2_2000.nc
    _url.port = 21;
    _url.hostname = "data.knmi.nl"
    _url.protocol = 'ftp:';

		console.log('url: ' + _url.hostname + ' ' + _url.port + ' ' + _url.path + ' ' + _url.filename );

		var tempFileName = "../knmi_files/" + "knmi_tmp_10min_actual_data.nc";
		var writeStream = fs.createWriteStream(tempFileName);
		// This is here incase any errors occur
  		writeStream.on('error', function (err) {
    		console.log(err);
  		});

		if (_url.protocol == 'ftp:') {
			console.log('Ftp request: ' + _url.href);

			var files = [];

      var conn = new ftp();
			conn.on('ready', function () {
      conn.binary(function(){
       conn.cwd(_url.path,function(){
				conn.get(_url.filename, function (err, stream) {
					console.log('download file callback ' + _url.path);
					//var i=0, j=0;
					//var elementObjectStack = [];
					if (err) throw err;
					stream.once('close', function () {
						console.log('FTP connection end');
            conn.end();});
          stream.pipe(fs.createWriteStream(tempFileName));
				});
      });
      });
			});

			//var _host = "83.247.110.3";
			//var _port = "21";
			console.log('FTP connect to: %s:%s', _url.hostname, _url.port );
			conn.connect( { host:_url.hostname, port:_url.port });
		}
}

} // end of module.exports
