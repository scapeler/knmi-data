
/**
 * This module build xml from javascript objects
 * @module knmi_10min_actual_import
 */

"use strict"; // This is for your code to comply with the ECMAScript 5 standard.

var axios 							= require('axios');
var fs 			= require('fs');
var url			= require('url');
var apiKey		= require('../config/knmi-api-key.js');

console.log('Module ' + 'knmi_10min_actual_import.js' + ' executed');

var api_url="https://api.dataplatform.knmi.nl/open-data"
var api_key = "5e554e19274a9600012a3eb1b626f95624124cf89e9b5d74c3304520"  // anonymousKey
api_key = apiKey.apiKey

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
    this.downloadFile(response.data.temporaryDownloadUrl,dataFileName)
    .then(response=> {
      console.log('download file succeeded')
      dateFile.lastDate=newDateIso
      fs.writeFileSync(dataLastDateFile,JSON.stringify(dateFile))
    })
    .catch(error=> {
      console.error(error)
    })
  })
  .catch(error=> {
    console.error(error.response.status)
    console.error(error.response.statusText)
  })
},

downloadFile: async function (url,path) {
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
}

} // end of module.exports
