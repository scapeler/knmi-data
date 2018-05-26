
"use strict"; // This is for your code to comply with the ECMAScript 5 standard.

var moduleKnmiPath = require('path').resolve(__dirname, '.');
var knmiStart 	= require(moduleKnmiPath + '/knmi-start');
knmiStart.start();
