
/**
 * This module build xml from javascript objects
 * @module knmi_10min_actual_import
 */

"use strict"; // This is for your code to comply with the ECMAScript 5 standard.

var axios 							= require('axios');
var fs 			= require('fs');
//var ftp 		= require('ftp');
//var ftpClient 		= require('ftp-client');
var url			= require('url');

console.log('Module ' + 'knmi_10min_actual_import.js' + ' executed');

var api_url="https://api.dataplatform.knmi.nl/open-data"
var api_key = "5e554e19274a9600012a3eb1b626f95624124cf89e9b5d74c3304520"  // anonymousKey
var headers = {
  "Authorization": api_key
};
var dataset_name = "Actuele10mindataKNMIstations"
var dataset_version = "2"
var max_keys = "10"
var fileNamePrefix="KMDS__OPER_P___10M_OBS_L2_"
var dataDir = "../knmi_files/";
var dataFileName = dataDir + "knmi_tmp_10min_actual_data.nc";
var dataLastDateFile = dataDir + "knmi_last_date.json";

module.exports = {

init: function(req, res, query) {

	var self = this;

	console.log('Module ' + 'knmi_10min_actual_import.js' + ' init() executed');

	//this.ftp(query, function(tempFileName) {
  //  console.log('Ftp succes');
	//});

//  var currDate = new Date()


  var dateFile = JSON.parse(fs.readFileSync(dataLastDateFile,{encoding:'utf8'}))
  var lastDateIso = dateFile.lastDate  // yyyy-mm-ddThh:mm:ss
  var lastDateDate = new Date(lastDateIso)
  console.log(lastDateDate)
  var newDate = new Date(lastDateDate.getTime()+600000)   // plus 10 minutes
  var newDateIso = newDate.toISOString()
  console.log(newDateIso)

  var prefix = fileNamePrefix+ newDateIso.substr(0,4)+newDateIso.substr(5,2)+newDateIso.substr(8,2)+newDateIso.substr(11,2)+newDateIso.substr(14,2)


//  https://api.dataplatform.knmi.nl/open-data/datasets/%7BdatasetName%7D/versions/%7BversionId%7D/files/%7Bfilename%7D/url

/* list files available
  var tmpUrl = api_url+'/datasets/'+dataset_name+'/versions/'+dataset_version+'/files'
  axios.get(tmpUrl,{ headers: headers,params: {"maxKeys": max_keys, "startAfterFilename": prefix} })
  .then(response => {
    console.log("Records: "+response.data.length);
    console.info(response.data)
  })
*/

/*
curl --location --request GET "https://api.dataplatform.knmi.nl/open-data/datasets/Actuele10mindataKNMIstations/versions/2/files/KMDS__OPER_P___10M_OBS_L2_202007271000/url" --header "Authorization: 5e554e19274a9600012a3eb1b626f95624124cf89e9b5d74c3304520"
*/
  var knmiFileName = prefix+'.nc'
  var tmpUrl = api_url+'/datasets/'+dataset_name+'/versions/'+dataset_version+'/files/'+knmiFileName+'/url'
  console.log(tmpUrl)
  axios.get(tmpUrl,{ headers: headers })
  .then(response => {
    //console.log("url: "+response.data);
    //console.info(response.data.temporaryDownloadUrl)

    this.downloadFile(response.data.temporaryDownloadUrl,dataFileName)
    .then(response=> {
      console.log('download file succeeded')
//      console.log(response)
//      var dateFile = JSON.parse(fs.readFileSync(dataLastDateFile,{encoding:'utf8'}))
      dateFile.lastDate=newDateIso
      fs.writeFileSync(dataLastDateFile,JSON.stringify(dateFile))
    })
    .catch(error=> {
      console.error(error)
    })
  })
  .catch(error=> {
    console.error(error)
  })
},

downloadFile: async function (url,path) {
//  const url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true'
//  const path = Path.resolve(__dirname, 'images', 'code.jpg')
  const writer = fs.createWriteStream(path)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
},


/*
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
    //  conn.binary(function(){
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
      //});
			});

			//var _host = "83.247.110.3";
			//var _port = "21";
			console.log('FTP connect to: %s:%s', _url.hostname, _url.port );
			conn.connect( { host:_url.hostname, port:_url.port });
		}
}
*/

} // end of module.exports
