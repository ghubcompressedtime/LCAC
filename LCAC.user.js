// ==UserScript==
// @name           LCAC
// @namespace      compressedtime.com
// @version        3.231
// @run-at         document-end
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @grant          GM_xmlhttpRequest

// @downloadURL    https://github.com/ghubcompressedtime/LCAC/raw/master/LCAC.user.js

// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require        http://raw.github.com/kvz/phpjs/master/functions/strings/sprintf.js
// @require        http://raw.github.com/kvz/phpjs/master/functions/strings/vsprintf.js
// @require        http://raw.github.com/kvz/phpjs/master/functions/strings/sscanf.js
// @require        http://mottie.github.com/tablesorter/js/jquery.tablesorter.js
// @require        http://omnipotent.net/jquery.sparkline/2.1.2/jquery.sparkline.js
// @require        https://raw.github.com/yckart/jquery.storage.js/master/jquery.storage.js
// @require        http://raw.github.com/ghubcompressedtime/js-deflate/patch-2/rawdeflate.js
// @require        http://raw.github.com/ghubcompressedtime/js-deflate/patch-2/rawinflate.js
// @require        https://raw.github.com/tomkp/dates.js/master/src/dates.js

// @include        https://www.lendingclub.com/account/loanDetail.action?*
// @include        https://www.lendingclub.com/browse/loanDetail.action?*
// @include        https://www.lendingclub.com/browse/loanDetailFull.action?*

// @include        https://www.lendingclub.com/account/loanPerf.action?*
// @include        https://www.lendingclub.com/account/loans.action*
// @include        https://www.lendingclub.com/account/orderDetails.action*
// @include        https://www.lendingclub.com/account/summary.action*
// @include        https://www.lendingclub.com/browse/addToPortfolio.action*
// @include        https://www.lendingclub.com/browse/browse.action*
// @include        https://www.lendingclub.com/foliofn/cancelSellOrder.action*
// @include        https://www.lendingclub.com/foliofn/completeLoanPurchase.action*
// @include        https://www.lendingclub.com/foliofn/confirmLoansForSale*
// @include        https://www.lendingclub.com/foliofn/loanDetail.action?*
// @include        https://www.lendingclub.com/foliofn/loanPerf.action?*
// @include        https://www.lendingclub.com/foliofn/browseNotesLoanPerf.action?*
// @include        https://www.lendingclub.com/foliofn/loans.action*
// @include        https://www.lendingclub.com/foliofn/sellNotes.action*
// @include        https://www.lendingclub.com/foliofn/newLoanSearch.action*
// @include        https://www.lendingclub.com/foliofn/purchaseSuccess.action
// @include        https://www.lendingclub.com/foliofn/repriceSelectedNotes.action*
// @include        https://www.lendingclub.com/foliofn/saleSuccess.action
// @include        https://www.lendingclub.com/foliofn/selectLoansForSale.action*
// @include        https://www.lendingclub.com/foliofn/selectNotesToReprice.action*
// @include        https://www.lendingclub.com/foliofn/submitCompleteLoanPurchase.action*
// @include        https://www.lendingclub.com/foliofn/cart.action*
// @include        https://www.lendingclub.com/foliofn/traderStatement.action*
// @include        https://www.lendingclub.com/foliofn/tradingAccount.action*
// @include        https://www.lendingclub.com/foliofn/tradingInventory.action*
// @include        https://www.lendingclub.com/foliofn/yrEndTraderStatement.action*
// @include        https://www.lendingclub.com/portfolio/placeOrder.action*
// @include        https://www.lendingclub.com/portfolio/viewOrder.action*
// @include        https://www.lendingclub.com/public/about-us.action
// @include        https://www.lendingclub.com/account/lenderActivity.action
// @include        https://www.lendingclub.com/account/getLenderActivity.action

// @include        file://*/tradingAccount.action*

// ==/UserScript==

// @include        https://www.lendingclub.com/info/*.action*	// for including the extra links on the Statics page, etc.
// @include        https://www.lendingclub.com/account/lenderAccountDetail.action

/**
 * Copyright 2011-2015 Emery Lapinski
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* TODO:

FICO graph, indicate data out of date
loan performance, bring payment plan to main page
compress stored data for ffn export

 */

console.log("LCAC.user.js @version " + GM_info.script.version + " $Revision: 4607 $");	// automatically updated by svn

//unsafeWindow.GM_setValue = GM_setValue;
//unsafeWindow.GM_getValue = GM_getValue;

//GM_setValue("DEBUG", true);
//GM_setValue("TESTING", true);
//GM_setValue("LOADSUMMARYVALUESATSTARTUP", true);
//GM_setValue("LOADSUMMARYNOTESATSTARTUP", true);

var DEBUG = GM_getValue("DEBUG", false);
var DEBUG = true;	// for testing

//if(DEBUG)
//	unsafeWindow.jQuery = unsafeWindow.jQ = jQuery;

var GM_log;
try
{
	if(DEBUG && unsafeWindow.console)
		GM_log = function GM_log_impl()
		{
			if(false)
				arguments[0] = timeFormat() + ' ' + arguments[0];

			unsafeWindow.console.log.apply(unsafeWindow.console, arguments);	//YYY using "this" was causing problems in chrome
			//XXX fails in Firefox: Error: Permission denied to access property 'length'
		};
}
catch(ex)
{
	console.log("error in GM_log setup:");
	console.log("ex=", ex);
}

if(!GM_log)
	GM_log = function(){/*nothing*/};

localStorage.removeItem("notesAllPrev");	//YYY delete these since we don't use them anymore

var TESTING = GM_getValue("TESTING", false);
GM_log("TESTING=", TESTING);
var SCANBUTTONS = GM_getValue("SCANBUTTONS", true);
GM_log("SCANBUTTONS=", SCANBUTTONS);
var IRLINKS = GM_getValue("IRLINKS", false);
GM_log("IRLINKS=", IRLINKS);
var LOOKUPBUTTONS = GM_getValue("LOOKUPBUTTONS", true);
GM_log("LOOKUPBUTTONS=", LOOKUPBUTTONS);
var PAYMENTPLANONPERF = GM_getValue("PAYMENTPLANONPERF", true);
GM_log("PAYMENTPLANONPERF=", PAYMENTPLANONPERF);
var FEEOVERPAYMENT = GM_getValue("FEEOVERPAYMENT", true);
GM_log("FEEOVERPAYMENT=", FEEOVERPAYMENT);

var COPYVALUEBUTTONS = GM_getValue("COPYVALUEBUTTONS", TESTING);
GM_log("COPYVALUEBUTTONS=", COPYVALUEBUTTONS);
var TRADINGINVETORYPARAMS = GM_getValue("TRADINGINVETORYPARAMS", true);
GM_log("TRADINGINVETORYPARAMS=", TRADINGINVETORYPARAMS);
var AUTOFOLLOWLINK = GM_getValue("AUTOFOLLOWLINK", TESTING);
GM_log("AUTOFOLLOWLINK=", AUTOFOLLOWLINK);
var BUYORDERLINKONLOANPERF = GM_getValue("BUYORDERLINKONLOANPERF", true);
GM_log("BUYORDERLINKONLOANPERF=", BUYORDERLINKONLOANPERF);
var PRICESINURL = GM_getValue("PRICESINURL", true);
GM_log("PRICESINURL=", PRICESINURL);
var CANCELEDHIDE = GM_getValue("CANCELEDHIDE", true);
GM_log("CANCELEDHIDE=", CANCELEDHIDE);
var SAVEDSEARCHES = GM_getValue("SAVEDSEARCHES", true);
GM_log("SAVEDSEARCHES=", SAVEDSEARCHES);

//GM_setValue("SELLORDERLINKONLOANPERFENABLED", false);	// for testing

var SELLORDERLINKONLOANPERF = GM_getValue("SELLORDERLINKONLOANPERF", true);
GM_log("SELLORDERLINKONLOANPERF=", SELLORDERLINKONLOANPERF);
var SELLORDERLINKONLOANPERFENABLED = GM_getValue("SELLORDERLINKONLOANPERFENABLED", false);	// user must enable
GM_log("SELLORDERLINKONLOANPERFENABLED=", SELLORDERLINKONLOANPERFENABLED);

var AUTOSELLSELECT = GM_getValue("AUTOSELLSELECT", TESTING);
GM_log("AUTOSELLSELECT=", AUTOSELLSELECT);

var NOFOLIOFNWARNING = GM_getValue("NOFOLIOFNWARNING", false);
GM_log("NOFOLIOFNWARNING=", NOFOLIOFNWARNING);

var FICODROPPERCENT = GM_getValue("FICODROPPERCENT", 0.25);

GM_log("$.browser=", $.browser, " $.browser.mozilla=", $.browser.mozilla);
var LOADSUMMARYVALUESATSTARTUP = GM_getValue("LOADSUMMARYVALUESATSTARTUP", true);	//XXX compression is too slow on Firefox
var LOADSUMMARYNOTESATSTARTUP = GM_getValue("LOADSUMMARYNOTESATSTARTUP", $.browser.mozilla ? false : true);	//XXX compression is too slow on Firefox

var notesRawDataURL = '/account/notesRawDataExtended.action';	// available from https://www.lendingclub.com/account/loans.action

var printStackTrace;
if(DEBUG && unsafeWindow.console) {
	printStackTrace = function(message)
	{
		if(typeof message == 'undefined') message = "(no message)";

		try
		{
			throw new Error("!!!STACK TRACE!!! " + message);	// errors get stack traces
		}
		catch(ex)
		{
			GM_log(ex.message + "\n" + ex.stack);
		}
	};
}
else
	printStackTrace = function(){};


function DEBUGcall()
{
	try
	{
		GM_log("DEBUGcall() arguments=", Array.prototype.slice.call(arguments));

		var func = arguments[0];
		var arguments2 = Array.prototype.slice.call(arguments, 1);

		var retval = func.apply(this, arguments2);

		GM_log("DEBUGcall() retval=" + retval);

		return retval;
	}
	catch(ex)
	{
		console.log("DEBUGcall() ex=", ex);
	}

	return null;
}

function funcname(arguments2)
{
	try
	{
		if(!arguments2 || !arguments2.callee)
			return "anonymous()";

		return arguments2.callee.toString().match(/function (.*?)\(/)[1] + "()";
	}
	catch(ex)
	{
		console.log("funcname() ex=", ex);
	}

	return null;
}

function debug(DEBUG2, arguments2, printArgs)
{
	if(!(DEBUG2 && DEBUG))
		return false;

	if(typeof printArgs == 'undefined') printArgs = true;	// default arg

	try
	{
		var FUNCNAME = funcname(arguments2);

		if(arguments2 && arguments2.length > 0 && printArgs)
		{
			GM_log("DEBUG " + FUNCNAME + " args=", Array.prototype.slice.call(arguments2, 0));	//YYY clone array for GM_log since it might change before we print it

			return FUNCNAME;
		}
	}
	catch(ex)
	{
		console.log("debug() ex=", ex);
	}

	return null;
}

/*
 * funcnameOrArguments - name of function or the arguments object
 * messageOrReset - string to print, or boolean to reset
 */
function timestamp(funcnameOrArguments, messageOrReset)
{
	if(typeof funcnameOrArguments == 'object')
		funcnameOrArguments = funcname(funcnameOrArguments);

	var now = new Date().getTime();

	if(!timestamp.funcname2timestamp[funcnameOrArguments] || messageOrReset === true || messageOrReset === 'begin')
		timestamp.funcname2timestamp[funcnameOrArguments] = now;

	var elapsed = now - timestamp.funcname2timestamp[funcnameOrArguments];

	var elapsedprev = timestamp.funcname2timestampprev[funcnameOrArguments] != null ? now - timestamp.funcname2timestampprev[funcnameOrArguments] : null;

	GM_log("TIMESTAMP: " + funcnameOrArguments + " " + messageOrReset + " elapsed=" + elapsed + "ms" + (elapsedprev ? " elapsedprev=" + elapsedprev : ''));
	
	timestamp.funcname2timestampprev[funcnameOrArguments] = now;
}
timestamp.funcname2timestamp = {};
timestamp.funcname2timestampprev = {};
	
var MILLISECONDSPERDAY = 24 * 60 * 60 * 1000;

// XXX recalculate to handle case where the script in running a long time?
//XXX need to use date as day before opening of business "tomorrow" (7am PDT?)

function TODAY()
{
	if(typeof TODAY.TODAY0 == 'undefined')
	{
		var today = new Date();
		if(today.getHours() < 7)
			today.setMilliseconds(today.getMilliseconds() - MILLISECONDSPERDAY);

		// trunc to the date
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);

		TODAY.TODAY0 = today;
	}

	return TODAY.TODAY0;
}

function defaultArg(arg, defaultValue)
{
	return typeof arg !== 'undefined' ? arg : defaultValue;
}


/*
 * Examples:
 * <div class="yui-dt-liner">(0.08%)</div>
 * $23.26+3.9%
 * $0.01<br>(1.7m)
 * <div class="yui-dt-liner"><span class="master_pngfix B gradeTextWide">B<span class="gradeNumberB">3</span></span><span class="centerText"> 11.58%</span></div>
 * <div class="yui-dt-liner">--</div>
 * <input class="valid text asking-price" name="asking_price" value="26.0" type="text">
 */
function html2Value(value, debug)
{
var FUNCNAME = funcname(arguments);

	var valueOrig = value;	// remember it in case we have an error later

	if(debug) GM_log(FUNCNAME + " A value=" + value);

	value = value.replace(/<nobr>|<\/nobr>/gi, '');

	if(debug) GM_log("B value=" + value);

	value = value.replace(/.*value="(.*?)".*/, '$1');	// textfield input

	if(debug) GM_log("C value=" + value);


	/* remove extraneous html */
	value = value.replace(/<label>.*?<\/label>/gi, '');	// remove label that we might have added to asking price

	if(debug) GM_log("D value=" + value);

	value = value.replace(/.*?>([-+$\(]*[\d.,]+[%\)]*)<.*/, '$1');	// gotta have some digits in there someplace

	if(debug) GM_log("E value=" + value);

	return text2Value(value, debug);
}

//GM_log("HEREXXX ", text2Value("12.694121113196"));

function text2Value(value0, debug)
{
var FUNCNAME = funcname(arguments);

	var value = value0;	// remember it in case we have an error later

	try
		{

		if(debug) GM_log("A value=" + value);

		if(value == null)
			return null;

		value = value.trim();

		if(value == "" || value == '--')
			return null;

		/* remove any +xx% or -xx% we might have added, WARNING: can be "+-0%" for 0% */
		value = value.replace(/\+-0%/, '');
		value = value.replace(/[-+][\d\.]+%/, '');

		/* remove any (x.xm) we might have added */
		value = value.replace(/\([\d.]+m\)/, '');
		value = value.replace(/\-[\d.]+m/, '');

		if(debug) GM_log("C value=" + value);

		/* no commas */
		value = value.replace(/,/g, '');

		if(debug) GM_log("D value=" + value);

		/* parentheses to negative */
		value = value.replace(/\((.*)\)/, '-$1');

		if(debug) GM_log("E value=" + value);

		/* no dollar signs */
		value = value.replace(/\$/, '');

		if(debug) GM_log("F value=" + value);

		/* percent to decimal */
		if(value.match(/%/))
		{
			value = value.replace(/%/, '');
			value /= 100;
		}

		if(debug) GM_log("G value=" + value);

	//	if(!debug && isNaN(value))
	//		return text2Value(value0, true);	// on NaN rerun it with debugging turned on

		value = parseFloat(value);

		if(debug || value === null || value === '' || isNaN(value))
		{
			GM_log(FUNCNAME + " returning value=" + value + " value0=" + value0);
	//		DEBUG && printStackTrace(FUNCNAME + " returning value=" + value + " value0=" + value0);
		}

		return value;
	}
	catch(ex)
	{
		GM_log("ex=", ex, " value0=" + value0 + " typeof value0=" + typeof value0);
		return null;
	}
}

function text2Date(value)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(value == "--")
		return null;

DEBUG && GM_log(FUNCNAME + " value="+ value+ " typeof value="+ typeof value);

	//XXX adjust for PDT???

	value = sscanf(value, "%d/%d/%d");	// mm/dd/yy
	
	DEBUG && GM_log("BEFORE value=" + value);
	
	--value[0];	// January is 0

	if(value[2] < 2000)
		value[2] += 2000;
	
	DEBUG && GM_log("AFTER value=" + value);

	value = new Date(value[2], value[0], value[1], 0, 0, 0);

	DEBUG && GM_log("value=", value);

	return value;
}

/* WARNING: This changes the date object (unless it returns null) */
function Y2K(date)
{
var DEBUG = debug(false, arguments);

	if(date == null)
	{
		DEBUG && GM_log("date=", date, " returning null");
		return null;
	}

	if(date.getTime() == 0)
	{
		DEBUG && GM_log("date.getTime()=", date.getTime(), " returning null");
		return null;
	}

	var year = date.getFullYear();
	if(year < 1970)
    	date.setFullYear(year + 100);

	DEBUG && GM_log("returning date=", date);
	return date;
}

/*
 * XXX pass variables around in an object and make them local, but it's not working
 */
function obj2eval(obj)
{
var DEBUG = debug(false, arguments);

	var str = sprintf(''
		+ "var ___obj = unescape('%s');"
		+ "GM_log('___obj=', ___obj);"
		+ "___obj = $.parseJSON(___obj);"
		+ "GM_log('___obj=', ___obj);"
		, escape(JSON.stringify(obj)));

	for(var prop in obj)
	{
		var value = obj[prop];

		if(value instanceof Date)
			str += sprintf("var %s = new Date(___obj.%s);", prop, prop);
		else
			str += sprintf("var %s = ___obj.%s;", prop, prop);
	}

	DEBUG && GM_log("obj2eval() str=" + str);

	return str;
}

function queueTimeoutNull(callback)
{
	queueTimeout(callback, 0, 0);
}

function queueTimeoutPriority(callback)
{
	queueTimeout(callback, -1, true);
}

var QUEUETIMEOUTDELAY = 1;
var queueTimeoutCallbackList = [];
function queueTimeout(queueTimeout_callback, delay, priority)
{
	if(typeof delay == 'undefined' || delay < 0) delay = QUEUETIMEOUTDELAY;
	if(typeof priority == 'undefined') priority = false;

	if(priority)
		queueTimeoutCallbackList.unshift(queueTimeout_callback);	// priority insert
	else
		queueTimeoutCallbackList.push(queueTimeout_callback);

	if(delay == -1)
		queueTimeoutLoop();
	else
		setTimeout(queueTimeoutLoop, delay);	//XXX what's a good value here?
}

function queueTimeoutLoop()
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(queueTimeoutCallbackList.length == 0)
		return;

	var queueTimeoutLoop_callback = queueTimeoutCallbackList.shift();	// get from the front

	DEBUG && GM_log(FUNCNAME + " queueTimeoutLoop_callback=", queueTimeoutLoop_callback);

//	document.body.style.cursor = "wait";
	queueTimeoutLoop_callback();
//	document.body.style.cursor = "default";

	setTimeout(queueTimeoutLoop, QUEUETIMEOUTDELAY);	//XXX what's a good value here?
}
				
/* tries to optimize the sort by using strings */
function sortOptimizer(arr, toStringFunc, sortFunc, reverseFlag)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);
var DEBUG2 = false;

	DEBUG2 && timestamp(FUNCNAME, DEBUG2);

	//YYY optimize by using strings instead of funcs?
	if(toStringFunc)
	{
		for(var index = 0; index < arr.length; index++)
		{
			var obj = arr[index];

			if(obj.hasOwnProperty('toString'))
				obj.toStringOrig = obj.toString;
			obj.toString = toStringFunc;
		}
	
		DEBUG2 && timestamp(FUNCNAME, "BEFORE sort 1");
		arr.sort();
		DEBUG2 && timestamp(FUNCNAME, "AFTER sort 1");

		for(var index = 0; index < arr.length; index++)
		{
			var obj = arr[index];

			if(obj.toStringOrig)
			{
				obj.toString = obj.toStringOrig;
				delete obj.toStringOrig;
			}
			else
				delete obj.toString;
		}
	}
	else
	{
		DEBUG2 && timestamp(FUNCNAME, "BEFORE sort 2");
		arr.sort(sortFunc); // undefined as argument is the same as no argument, yes?
		DEBUG2 && timestamp(FUNCNAME, "AFTER sort 2");
	}

	if(reverseFlag)
		arr.reverse();

	DEBUG2 && timestamp(FUNCNAME, "DONE");
}
							
/**
 * remove extraneous properties from all the objects in an array
 */
function pruneArray(arr, propsToKeep)
{
	for(var index = 0; index < arr.length; index++)
	{
		var obj = arr[index];
		var obj2 = {};
		$.each(propsToKeep, function(index, prop)
		{
			obj2[prop] = obj[prop];
		});
		arr[index] = obj2;
	}
}

function eachAsync(jQset, funcwithcallback, callbackDone)
{
var DEBUG = debug(false, arguments);

	var arr = jQset.toArray();
	DEBUG && GM_log("arr=0", arr);

	var index = -1;

	function loop()
	{
		index++;

		DEBUG && GM_log("eachAsync$loop() index=" + index + " arr=", arr);

		if(index >= arr.length)
		{
			callbackDone();
			return;
		}

		var el = arr[index];
		funcwithcallback(index, el, loop);	// iterate
	}

	loop();	// start the loop
}


function ceil2Decimals(val, func)
{
	return round2Decimals(val, Math.ceil);
}

function floor2Decimals(val, func)
{
	return round2Decimals(val, Math.floor);
}

function round2Decimals(val, func)
{
	if(typeof func == 'undefined') func = Math.round;

	return func(val * 100) / 100;
}

function thousands(str)
{
	while(str.match(/\d\d\d\d[\.,]/))
	{
		str = str.replace(/(?:.*)(\d)(\d\d\d[\.,])/, "$1,$2");	// returns original string on failure
	}

	return str;
}

function negative2negative(format, value)
{
	if(value >= 0)
		return sprintf(format, value);
	else
		return '-' + sprintf(format, -value);
}

function negative2parens(format, value)
{
	if(value >= 0)
		return sprintf(format, value);
	else
		return '(' + sprintf(format, -value) + ')';
}

function dateShortFormat(date)
{
	if(typeof date == 'undefined') date = new Date();

	if(date == null)
		return null;

	return sprintf(
		"%d/%d/%d",
		date.getMonth() + 1, date.getDate(), date.getFullYear() % 100);
}

function dateFormat(date, separator)
{
	if(typeof date == 'undefined') date = new Date();
	if(typeof separator == 'undefined') separator = '/';

	if(date == null)
		return null;

	return sprintf(
		"%d%s%d%s%d",
		date.getFullYear(), separator, date.getMonth() + 1, separator, date.getDate());
}

function timeFormat(date)
{
	if(typeof date == 'undefined') date = new Date();

	if(date == null)
		return null;

	return sprintf(
		"%02d:%02d:%02d",
		date.getHours(), date.getMinutes(), date.getSeconds());
}

function dateTimeFormat(date)
{
	if(typeof date == 'undefined') date = new Date();

	if(date == null)
		return null;

	return dateFormat(date) + ' ' + timeFormat(date);
}

/* http://stackoverflow.com/questions/10191941/jquery-unique-on-an-array-of-strings */
function unique(array){
    return $.grep(array,function(el,index){
        return index == $.inArray(el,array);
    });
}

function setStoredValue(id, value)
{	
var DEBUG = debug(false || id == 'term', arguments), FUNCNAME = funcname(arguments);

	value = '' + value;	// stringify

	localStorage.setItem(id, value);

	DEBUG && GM_log(FUNCNAME + " id='" + id + "' localStorage.getItem(" + id + ")=", localStorage.getItem(id));
}

function getStoredValue(id, defaultValue)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);
DEBUG && GM_log(FUNCNAME + " id=" + id + " localStorage.getItem(" + id + ")=", localStorage.getItem(id));

	var value = localStorage.getItem(id);

	DEBUG && GM_log("value=", value);

	if(value == null || value == "undefined")
	{
		DEBUG && GM_log("returning defaultValue=", defaultValue);
		return defaultValue;
	}

	/* if there's a defaultValue cast to that type */
	var typeofdefaultValue = typeof defaultValue;
	if(typeofdefaultValue != 'undefined')	// NOTE: defaultValue could be false here
	{
		DEBUG && GM_log("typeof defaultValue=", typeofdefaultValue);

		value = castToType(value, typeofdefaultValue);
	}

	if(value == 'true' || value == 'false')
		return value == 'true';

	DEBUG && GM_log("returning value=", value, " typeof vaule=", typeof value);
	return value;
}

function castToType(value, type)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(typeof value == type)
		return value;

DEBUG && GM_log(DEBUG + " value=", value, " type=", type);

	var valueOrig = value;

	if(type == "boolean")
	{
		value = (value == "true");
		DEBUG && GM_log("new value=", value);
	}
	else if(type == "number")
	{
		value = parseFloat(value);
		DEBUG && GM_log("new value=", value);
	}
	else
	{
		GM_log(FUNCNAME + " CASTING ", value, " TO " + type + " UNHANDLED!!!!");
	}

	/*
	 * CAUTION! ("0.05" == 0.05) == true but ("true" == true) == false
	 */
	var equals = ('' + value) == ('' + valueOrig);

	if(!equals)
		GM_log(FUNCNAME + " WARNING!! casting ", valueOrig, " (" + typeof valueOrig + ")" + " TO ", value, " (" + type + ")");

	return value;
}

/*
 * adapted from http://www.8tiny.com/source/phpmyadmin/libraries/PHPExcel/PHPExcel/Calculation/Functions.php.html
 * Calculates the payment for a loan based on constant payments and a constant interest rate.
 * http://office.microsoft.com/en-ca/excel-help/pmt-HP005209215.aspx?CTT=1
 */
function PMT(rate, nper, pv, fv, type)
{
	if(typeof fv == 'undefined') fv = 0;
	if(typeof type == 'undefined') type = 0;

	return (-fv - pv * Math.pow(1 + rate, nper)) / (1 + rate * type) / ((Math.pow(1 + rate, nper) - 1) / rate);
}

function _interestAndPrincipal(rate, per, nper, pv, fv, type)
{
var DEBUG = debug(false, arguments);

	if(typeof rate == 'undefined') rate = 0;
	if(typeof per == 'undefined') per = 0;
	if(typeof nper == 'undefined') nper = 0;
	if(typeof pv == 'undefined') pv = 0;
	if(typeof fv == 'undefined') fv = 0;
	if(typeof type == 'undefined') type = 0;

	var pmt = PMT(rate, nper, pv, fv, type);

	var interest = 0, principal = 0;
	var capital = pv;
	for(var count = 1; count <= per; count++)
	{
		interest = (type && count == 0) ? 0 : -capital * rate;
        principal = pmt - interest;
        capital += principal;
	}

	DEBUG && GM_log("_interestAndPrincipal() returning interest=", interest, " principal=", principal);

	return [interest, principal];
}

/*
 * Returns the number of periods for a cash flow with constant periodic payments (annuities), and interest rate.
 * From http://www.8tiny.com/source/phpmyadmin/nav.html?libraries/PHPExcel/PHPExcel/Calculation/Functions.php.html
 */
/*YYY this wrong syntax ff ignores but causes unhelpful "Unexpected token =" error message in chrome
function NPER(rate = 0, pmt = 0, pv = 0, fv = 0, type = 0)	
*/
function NPER(rate, pmt, pv, fv, type)
{
var DEBUG = debug(false, arguments);

	if(typeof rate == 'undefined') rate = 0;
	if(typeof pmt == 'undefined') pmt = 0;
	if(typeof pv == 'undefined') pv = 0;
	if(typeof fv == 'undefined') fv = 0;
	if(typeof type == 'undefined') type = 0;

	if(rate != 0)
	{
		if(pmt == 0 && pv == 0)
			throw "pmt=" + pmt + " pv=" + pv;

		var value =
			Math.log((pmt * (1 + rate * type) / rate - fv) / (pv + pmt * (1 + rate * type) / rate))
				/ Math.log(1 + rate);

		DEBUG && GM_log("1 value=", value);
		return value;
	}
	else
	{
		if(pmt == 0)
			throw "rate=" + rate + " pmt=" + pmt;

		var value = (-pv - fv) / pmt;
		DEBUG && GM_log("2 value=", value);
		return value;
	}
}

/*
 * Returns the interest payment for a given period for an investment based on periodic, constant payments and a constant interest rate.
 * http://office.microsoft.com/en-ca/excel-help/ipmt-HP005209145.aspx?CTT=1
 */
function IPMT(rate, per, nper, pv, fv, type)
{
	if(typeof fv == 'undefined') fv = 0;
	if(typeof type == 'undefined') type = 0;

	if(type != 0 && type != 1)
	{
		printStackTrace("type=" + type + ", per=" + per + " nper=" + nper + " rate=" + rate + " pv=" + pv + " fv=" + fv);
		throw "type=" + type + ", per=" + per + " nper=" + nper + " rate=" + rate + " pv=" + pv + " fv=" + fv;
	}

	if(per <= 0 || per > nper)
	{
		printStackTrace("per=" + per + " nper=" + nper + ", rate=" + rate + " pv=" + pv + " fv=" + fv + " type=" + type);
		throw "per=" + per + " nper=" + nper + ", rate=" + rate + " pv=" + pv + " fv=" + fv + " type=" + type;
	}

	return _interestAndPrincipal(rate, per, nper, pv, fv, type)[0];
}

/*
 * Returns the payment on the principal for a given period for an investment based on periodic, constant payments and a constant interest rate.
 * http://office.microsoft.com/en-ca/excel-help/ppmt-HP005209218.aspx?CTT=1
 */
function PPMT(rate, per, nper, pv, fv, type)
{
	if(typeof fv == 'undefined') fv = 0;
	if(typeof type == 'undefined') type = 0;
	
	if(type != 0 && type != 1)
		throw "type=" + type;

	if(per <= 0 || per > nper)
	{
		printStackTrace("per=" + per + " nper=" + nper + ", rate=" + rate + " pv=" + pv + " fv=" + fv + " type=" + type);
		throw "per=" + per + " nper=" + nper + ", rate=" + rate + " pv=" + pv + " fv=" + fv + " type=" + type;
	}

	return _interestAndPrincipal(rate, per, nper, pv, fv, type)[1];
}

/*
 * Returns the cumulative principal paid on a loan between start_period and end_period.
 * http://office.microsoft.com/en-ca/excel-help/cumprinc-HP005209039.aspx
 */
function CUMPRINC(rate, nper, pv, start, end, type)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(typeof type == 'undefined') type = 0;
	if(typeof end == 'undefined') end = nper;

	if(type != 0 && type != 1)
		throw "type=" + type;
	
	if(start < 1 || start > end)
	{
		printStackTrace(FUNCNAME + " start=" + start + " end=" + end);
		throw FUNCNAME + " start=" + start + " end=" + end;
	}

	var principal = 0;
	var interest = 0;
	for(var per = start; per <= end; ++per)
	{
		var ppmt;

		principal += ppmt = PPMT(rate, per, nper, pv, 0, type);

		var ipmt;

		interest += ipmt = IPMT(rate, per, nper, pv, 0, type);
		
		DEBUG && GM_log("per=", per, " ppmt=", ppmt, " ipmt=", ipmt);
	}

	return principal;
}

/*
 * http://www.8tiny.com/source/phpmyadmin/nav.html?libraries/PHPExcel/PHPExcel/Calculation/Functions.php.html
 * Returns the cumulative interest paid on a loan between start_period and end_period.
 */
function CUMIPMT(rate, nper, pv, start, end, type)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(typeof type == 'undefined') type = 0;
	if(typeof end == 'undefined') end = nper;

	if(type != 0 && type != 1)
		throw "type=" + type;

	if(start < 1 || start > end)
	{
		printStackTrace(FUNCNAME + " start=" + start + " end=" + end);
//		throw FUNCNAME + " start=" + start + " end=" + end;
		return null;
	}

	var interest = 0;
	for (var per = start; per <= end; ++per) {
		var ipmt;

		interest += ipmt = IPMT(rate, per, nper, pv, 0, type);
		
//		DEBUG && GM_log("per=", per, " ipmt=", ipmt);
	}

	return interest;
}


function IRR(principal, accruedInterest, paymentAmount, interestRate, price, serviceFeePercent)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(typeof serviceFeePercent == 'undefined' || serviceFeePercent == null) serviceFeePercent = 0.01;

	if(principal <= 0)
	{
		printStackTrace(FUNCNAME + " principal=" + principal);
//		throw FUNCNAME + " principal=" + principal;
		return -1;
	}
	if(paymentAmount <= 0)
	{
		printStackTrace(FUNCNAME + " paymentAmount=" + paymentAmount);
//		throw FUNCNAME + " paymentAmount=" + paymentAmount;
		return null;
	}

	var interestRate = interestRate / 12;	// per period

	var discountRateLeft = -10;	// per period
	var discountRateRight = 10;	// per period

	var npvLeft = NPV(principal, accruedInterest, paymentAmount, interestRate, discountRateLeft, serviceFeePercent) - price;
	var npvRight = NPV(principal, accruedInterest, paymentAmount, interestRate, discountRateRight, serviceFeePercent) - price;

	for(var count = 0; true; count++)
	{
		DEBUG && GM_log("count=", count);
		DEBUG && GM_log(" discountRateLeft=", discountRateLeft * 12,  "  npvLeft=", npvLeft);
		DEBUG && GM_log("discountRateRight=", discountRateRight * 12, " npvRight=", npvRight);

		if(isNaN(npvLeft) || isNaN(npvRight))
		{
			GM_log(FUNCNAME + " !!!NaN!!!, count=", count);
			GM_log("arguments=", arguments);
			GM_log("npvLeft=", npvLeft, " npvRight=", npvRight);
			GM_log("discountRateLeft=", discountRateLeft * 12, " discountRateRight=", discountRateRight * 12);
			return null;
		}

		if(npvLeft * npvRight > 0)	// same sign, we made a mistake
		{
			GM_log(FUNCNAME + " npvLeft and npvRight SAME SIGN, count=", count);
			GM_log("arguments=", arguments);
			GM_log("npvLeft=", npvLeft, " npvRight=", npvRight);
			GM_log("discountRateLeft=", discountRateLeft * 12, " discountRateRight=", discountRateRight * 12);
			return null;
		}

		var rateDiff = discountRateRight - discountRateLeft;
		var npvDiff = npvLeft - npvRight;

		if(count > 30 || Math.abs(rateDiff) < 0.0001 || Math.abs(npvDiff) < 0.0001)	// close enough
		{
			DEBUG && GM_log("rateDiff=", rateDiff);
			DEBUG && GM_log("npvDiff=", npvDiff);
			DEBUG && GM_log("returning discountRateLeft * 12=", discountRateLeft * 12);
			return discountRateLeft * 12;	// per period * 12 = yearly
		}

		var discountRateMid = (discountRateLeft + discountRateRight) / 2;
		var npvMid = NPV(principal, accruedInterest, paymentAmount, interestRate, discountRateMid, serviceFeePercent) - price;

		DEBUG && GM_log("discountRateMid=", discountRateMid * 12, " npvMid=", npvMid);

		// adjust one of the guesses
		if(npvMid * npvRight > 0)	// same sign
		{
			DEBUG && GM_log("adjusting right end");
			discountRateRight = discountRateMid;
			npvRight = npvMid;
		}
		else
		{
			DEBUG && GM_log("adjusting left end");
			discountRateLeft = discountRateMid;
			npvLeft = npvMid;
		}
	}
}

function NPV(principal, accruedInterest, paymentAmount, interestRate, discountRate, serviceFeePercent)	// per period
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(principal <= 0 || paymentAmount <= 0)
	{
		printStackTrace(FUNCNAME + " principal=" + principal + " paymentAmount=" + paymentAmount);
//		throw FUNCNAME + " paymentAmount " + paymentAmount + " <= 0";
		return null;
	}

	var discountRateNegative = discountRate < 0;
	if(discountRateNegative)
		discountRate = -discountRate;

	discountRate = 1 + discountRate;

	/* multiply every time through the loop, POW(discountRate, count) */
//	var discountRatePOW = 1.0;		// first payment at begining of period
	var discountRatePOW = discountRate;		// first payment at begining of period
		
	var totalPaymentsPV = 0;
	var count = 0;
	while(principal > 0 && ++count < 100)
	{
		if((DEBUG && count < 3) || count > 90)
			GM_log("count=", count, " principal=", principal, " discountRateNegative=", discountRateNegative, " discountRate=", discountRate, " discountRatePOW=", discountRatePOW);
		
		var oneMonthsInterest = principal * interestRate;

		principal += oneMonthsInterest;
		
		var paymentAmount2 = Math.min(principal, paymentAmount);
		
		principal -= paymentAmount2;
		
		if(false)
		if(accruedInterest > oneMonthsInterest)	// assume first payment pays off all accrued interest
		{
			var count2 = 0;
			var accruedInterestAdjustment = 0;
			while(accruedInterest > oneMonthsInterest)
			{
				if(++count2 > 100)
				{
					GM_log("count2=", count2, " arguments=", arguments);
					break;
				}

				accruedInterestAdjustment += oneMonthsInterest;
				accruedInterest -= oneMonthsInterest;
			}

			DEBUG && GM_log(FUNCNAME + " accruedInterest adjustment=", accruedInterestAdjustment);
			paymentAmount2 += accruedInterestAdjustment;
					
			accruedInterest = 0;	// throw away the remainder, since it will be included in first payment
		}

		var paymentAmountPV = discountRateNegative ? (paymentAmount2 * discountRatePOW) : (paymentAmount2 / discountRatePOW);
		DEBUG && GM_log("paymentAmount2=", paymentAmount2, " paymentAmountPV=", paymentAmountPV);

		paymentAmountPV *= (1.0 - serviceFeePercent);

		totalPaymentsPV += paymentAmountPV;
		
		discountRatePOW *= discountRate;
	}

	DEBUG && GM_log("totalPaymentsPV=", totalPaymentsPV);
	return totalPaymentsPV;
}

//function dayOfYear(date)
//{
//	date = new Date(date);
//	date.setFullYear(0);
//	return date.getTime() / ( 24 * 60 * 60 * 1000 );
//}

function daysBetween(date1, date2)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(date1 == null || date2 == null)
	{
		printStackTrace("date1=", date1, " date2=", date2);
		return null;
	}

	return Math.floor((date1.getTime() - date2.getTime()) / MILLISECONDSPERDAY);
}

function monthsBetween(date1, date2)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(date1 == null || date2 == null)
	{
		printStackTrace("date1=", date1, " date2=", date2);
		return null;
	}

	var months =
		(date2.getFullYear() * 12 + date2.getMonth())
		- (date1.getFullYear() * 12 + date1.getMonth());
	
	DEBUG && GM_log("BEFORE months=", months);

	// adjust for days in the month
	var dom1 = date1.getDate();
	var dom2 = date2.getDate();
	while(dom2 < dom1 && dom1 > 28)
		dom1--;
	while(dom2 < dom1 && dom2 > 28)
		dom2--;
	if(dom2 < dom1)
		months--;
	
	DEBUG && GM_log("AFTER months=", months);
		
	return months;
}
			
/* Object array to csv (using the keys of the first element as the columns) */
function array2csv(doc, separator, arr, includeHeaders, priorityKeys, unpriorityKeys)
{
	if(typeof includeHeaders == 'undefined') includeHeaders = true;

	function getKeys(arr)
	{
		var keysAll = [];

		/* gather all the keys for the objects in the array (or maybe just the first 10 objects or so) */
		for(var arrIndex = 0; arrIndex < 10 && arrIndex < arr.length; arrIndex++)
		{
			var keys = Object.keys(arr[arrIndex]);

			keysAll = keysAll.concat(keys);
		}

		return keysAll;
	}

	var keys = getKeys(arr);

	if(priorityKeys && priorityKeys.length > 0)
		keys = priorityKeys.concat(keys);
	
	keys = unique(keys);	//XXX unique is too slow for a concatenation of all the keys
	
	if(unpriorityKeys && unpriorityKeys.length > 0)
	{
		keys = keys.concat(unpriorityKeys);
		keys.reverse();
		keys = unique(keys);
		keys.reverse();
	}
	
	//XXX move keyPrev to be right after key?
	
	if(includeHeaders)
		doc.write(keys.join(separator) + "\n");

	for(var arrIndex = 0; arrIndex < arr.length; arrIndex++)
	{
		var obj = arr[arrIndex];

		var row = [];

		for(var keyIndex = 0; keyIndex < keys.length; keyIndex++)
		{
			var key = keys[keyIndex];

			var value = obj[key];

			if(value == null)
				value = "";	// null or undefined becomes blank
			else
			{
				value = '' + value;	//stringify

//				value = value.replace(/([,\\])/g, "\\$1");	// escape commas, backslashes, etc XXX UNNECESSARY?
				value = value.replace(/["]/g, '""');	// escape double quotes as double-double quote for OpenOffice Calc, etc.

				if(value.match(/ /))
					value = '"' + value + '"';	//need quotes if contains embedded spaces?
			}

			row.push(value);
		}

		doc.write(row.join(separator) + "\n");
	}
}

/* used for calculating EOY interest */
function remainingPaymentsEOY(firstCompleted)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(!remainingPaymentsEOY.NOW)
		remainingPaymentsEOY.NOW = new Date();

	var NOW = remainingPaymentsEOY.NOW;

	if(firstCompleted == null)
	{
		var monthsLeft = 11 - NOW.getMonth();	//getMonth() january = 0

		DEBUG && GM_log("1 monthsLeft=", monthsLeft);
		return monthsLeft;
	}
	else
	{
		var monthsLeft = 11 - firstCompleted.getMonth();	//getMonth() january = 0

		monthsLeft += (NOW.getFullYear() - firstCompleted.getFullYear()) * 12;

		DEBUG && GM_log("2 monthsLeft=", monthsLeft);
		return monthsLeft;
	}
}
	
function doPaymentHistory(vars, datatable)
{
var DEBUG = debug(true, arguments);

	var rs = datatable.getRecordSet();
	GM_log("rs=", rs);
	var records = rs.getRecords();
		
	/* check for 2 rows with the same date and one has a pyment of 0.00
	 * XXX only works if sorted by date (which is the default)
	 */
	var duplicateCount = 0;
	var record1 = records[records.length - 1];
	GM_log("doPaymentHistory() first loop");
	for(var index = records.length - 2;
		index >= 0;
		index--)	// start at the end and go up so we can delete rows
	{
		var record2 = record1;
		record1 = records[index];

//		GM_log("record1=", record1);
//		GM_log("record2=", record2);
		
		var dueDate1 = record1._oData.dueDate;
		var dueDate2 = record2._oData.dueDate;
		
		if(dueDate1.getTime() != dueDate2.getTime())	// dates don't match, go to the next row YYY don't use == with dates
			continue;
		
		var amount1 = record1._oData.paymentAmount;
		var amount2 = record2._oData.paymentAmount;

		var status1 = record1._oData.status.trim();
		var status2 = record2._oData.status.trim();

		DEBUG && GM_log("amount1=", amount1, " amount2=", amount2, " status1=", status1, " status2=", status2);

		/*YYY using == fails on chrome because the modified the values from highlightLoanPerf are still here */
//		if(! ((amount1 == 0 && status1 == "Not Received") || (amount2 == 0 && status2 == "Not Received")) )
		if(! ((amount1 == 0 && status1.match(/Not Received/)) || (amount2 == 0 && status2.match(/Not Received/))) )
			continue;

		duplicateCount++;
		
		/* the good row can be first or second */
		if(amount1 == 0)
//			record1.lcac_duplicateRow = true;
			rs.deleteRecord(index);
		else
//			record2.lcac_duplicateRow = true;
			rs.deleteRecord(index + 1);
	}
	GM_log("duplicateCount=", duplicateCount);
	if(duplicateCount > 0)
		window.status = duplicateCount + ' duplicate rows';


	vars.expectedPaymentLowerBound = floor2Decimals(vars.origPaymentAmount * 0.99);	// +/-1% to account for variation
	vars.expectedPaymentUpperBound = ceil2Decimals(vars.origPaymentAmount * 1.01);	// +/-1% to account for variation

	/* XXX include Processing...? only with a completion date? is that when it affects Outstanding Principal?
	 * https://www.lendingclub.com/foliofn/loanPerf.action?loan_id=592997&order_id=1863540&note_id=2723058
	 * https://www.lendingclub.com/foliofn/loanPerf.action?loan_id=600650&order_id=1226432&note_id=2766076
	 * Statuses can be:
	 *
	 * Scheduled
	 * Scheduled - Payment Plan
	 * Processing...
	 * Not Received
	 * Received - Partial Payment
	 * Completed - on time
	 * Completed - in grace period
	 * Completed - 21 days late
	 * ChargedOff (no space)
	 */
	var serviceFeeTotal = 0;
	var serviceFeeIdealTotal = 0;
	var paymentTotal = 0;
	var lateFeeTotal = 0;
	
//	var paymentHistory = vars.paymentHistory = [];
	var paymentHistory = [];

	paymentHistory.dueDateMissedCutoff = false;

	var dueDate;
	
	/* There's always at least 1 row in the table */
	GM_log("doPaymentHistory() second loop");
	var rowcount = -1;
	for(var index = 0;
		index < records.length;
		index++)
	{
		var record = records[index];
		GM_log("record=", record);

		/*
		 * WARNING: principal but no interest possible when loan is in Default status
		 */

		// Wed Dec 31 1969 19:00:00 GMT-0500 .getTime() = 0
		var dueDate0 = record._oData.dueDate;
		GM_log("1 dueDate0=", dueDate0);
		dueDate0 = Y2K(dueDate0);
		GM_log("2 dueDate0=", dueDate0);

		if(dueDate0)
			dueDate = dueDate0;


		var compDate = record._oData.compDate;
		GM_log("typeof compDate=", typeof compDate);
		GM_log("compDate=", compDate);

		if(typeof compDate == 'string' && compDate.match(/^Multiple Dates/i))
			continue;

		rowcount++;

		// XXX When Multiple Dates then dueDate = Wed Dec 31 1969 19:00:00 GMT-0500
		// maybe could use dueDateIndex?

		compDate = Y2K(compDate);

		var status = record._oData.status.replace(/[\r\n\s]+/g, ' ').trim();
		var amount = record._oData.paymentAmount;
		var lateFee = record._oData.lateFees.replace(/\$/, '').trim();
		if(lateFee == '-')
			lateFee = 0;

		/* e.g.
		 * <span title="$0.236719509292">$0.24</span>
		 * --
		 */
		var principal = html2Value(record._oData.principal);
		var interest = html2Value(record._oData.interest);
		
		var payment = {
			dueDate: dueDate,
			compDate: compDate,
			status: status,
			amount: amount,
			principal: principal,
			interest: interest,
		};

		paymentHistory.push(payment);

		GM_log("index=" + index + " rowcount=" + rowcount + " payment=", payment);
		if(rowcount == 0)
		{
			paymentHistory.first = payment;
			
			GM_log("payment.compDate=", payment.compDate);
			if(payment.status.match(/Completed|Received|Charged\s*Off/)
			|| (payment.compDate != null && payment.status.match(/Processing/)))
				paymentHistory.firstNotScheduledOrProcessing = payment;
		}

		if(rowcount == 1)
		{
			/* XXX Payment Plan can throw off this calculation
			 * e.g. https://www.lendingclub.com/foliofn/loanPerf.action?loan_id=772278&order_id=3430255&note_id=5416959
			 */

			GM_log("paymentHistory=", paymentHistory);
			GM_log("paymentHistory.first=", paymentHistory.first);
			var dueDateMissedCutoff = new Date(paymentHistory.first.dueDate);
			dueDateMissedCutoff.setMonth(dueDateMissedCutoff.getMonth() - 1);	// minus a month
			dueDateMissedCutoff.setDate(dueDateMissedCutoff.getDate() - 28);	// minus a little more
			
			if(dueDateMissedCutoff.getTime() > payment.dueDate.getTime())
				paymentHistory.dueDateMissedCutoff = true;
		}
		
		/*
		 * First dueDate with a status besides Scheduled/Processing
		 */
		if(paymentHistory.firstNotScheduledOrProcessing == null && !payment.status.match(/Scheduled|Processing/))
			paymentHistory.firstNotScheduledOrProcessing = payment;

		/*
		 * First dueDate with Completed/Recevied status
		 */
		if(paymentHistory.firstCompleted == null && payment.status.match(/^(Completed|Received)/))
			paymentHistory.firstCompleted = payment;

		/*
		 * Oldest row (last one processed)
		 */
		paymentHistory.oldest = payment;

		paymentTotal += amount;
		lateFeeTotal += lateFee;

		var serviceFeeIdeal = amount * 0.01;	// 1 % of total
		serviceFeeIdealTotal += serviceFeeIdeal;

		var serviceFee =
			amount <= 0.01
			? 0.00
			: Math.max(0.01, round2Decimals(serviceFeeIdeal));	// rounded, minimum is 1 cent
		serviceFeeTotal += serviceFee;
	}
			
	var dueDateTrue = new Date(paymentHistory.first.dueDate);
	if(paymentHistory.dueDateMissedCutoff)
		dueDateTrue.setMonth(dueDateTrue.getMonth() - 1);
	paymentHistory.first.dueDateTrue = dueDateTrue;

	serviceFeeIdealTotal = round2Decimals(serviceFeeIdealTotal);

	var serviceFeeIdealTotal2 = round2Decimals(paymentTotal * 0.01);	// check value

	var feeOverpayment = serviceFeeTotal - serviceFeeIdealTotal;

	vars.serviceFeeTotal = serviceFeeTotal;
	vars.feeOverpayment = feeOverpayment;

	/* find the arrears date, the most recent payment */
	var arrearsString, arrearsDate;
	if(vars.status.match(/Fully Paid/))
	{
		arrearsString = vars.status;
		arrearsDate = paymentHistory.first.dueDate;
	}
	else
	{
		/*YYY Payments to Date (21) can be wrong, e.g. for late notes */
		/* it's possible there's just one line if there's just one payment Note: this is projected payments not actual */
		GM_log("paymentHistory.firstNotScheduledOrProcessing=", paymentHistory.firstNotScheduledOrProcessing);
		if(paymentHistory.firstNotScheduledOrProcessing)
			arrearsDate = paymentHistory.firstNotScheduledOrProcessing.dueDate;
		else
		{
			arrearsDate = new Date(vars.issuedDate);

			GM_log("arrearsDate=", arrearsDate);
			GM_log("paymentHistory.first.dueDate=", paymentHistory.first.dueDate);

			/* no payments, due date a little slow in processing */
			if(arrearsDate.getTime() < paymentHistory.first.dueDate.getTime())
				arrearsDate.setMonth(arrearsDate.getMonth() + 1);
		}

		var oldestDueDate;
		if(paymentHistory.oldest.dueDate)
		{
			oldestDueDate = new Date(paymentHistory.oldest.dueDate);
			oldestDueDate.setMonth(oldestDueDate.getMonth() - 1);
		}
		else
			oldestDueDate = vars.issuedDate;

		var numPaymentsExpected = monthsBetween(oldestDueDate, arrearsDate);
	
		var periodsInYear = 12;
		/*
		 * what is this number?
		 * $75 16.77%
		 * Issued Date 	2/10/12
		 *     Due Date 3/20/12 Completion Date 3/26/12 $2.66 $1.61 $1.05(1.045991727398) $0.00
		 * 12.0244736842 * 30 = 360.734210526???
		 */


		/* XXX Note: many times Outstanding Principal doesn't match Payment History Principal Balance */
		var cumprincExpected;
		if(numPaymentsExpected >= vars.termInMonths)
			cumprincExpected = -vars.loanFraction;	// should have paid back the whole thing by now
		else if(numPaymentsExpected < 1)
			cumprincExpected = 0;
		else
			cumprincExpected = CUMPRINC(vars.interestRate / periodsInYear, vars.termInMonths, vars.loanFraction, 1, numPaymentsExpected);	// return value is negative
		
		var outstandingPrincipalExpected = vars.loanFraction + cumprincExpected;

		var arrears = outstandingPrincipalExpected - vars.outstandingPrincipal;

		if(arrears < -vars.outstandingPrincipal)
			arrearsString = "MAX";
		else if(arrears == 0)
			arrearsString = "EVEN";
		else
			arrearsString = sprintf("%+0.2f", arrears);
	}

	$.extend(vars, {
		arrearsDate: arrearsDate,
		arrearsString: arrearsString,
		lateFees: lateFeeTotal,
	});
	
	paymentHistory.firstCompletedOrIssuedDate =
		paymentHistory.firstCompleted != null
		? paymentHistory.firstCompleted.compDate
		: vars.issuedDate;
	
	GM_log("paymentHistory=", paymentHistory);

	return paymentHistory;
}

function doLoanPerfPart2(vars)
{
	var datatable = unsafeWindow.YAHOO.loanperf.myTableId;

	var paginator = datatable.get('paginator');
	var options = paginator.get('rowsPerPageOptions');
	options.push({value:999, text:"999*"});
	paginator.set('rowsPerPageOptions', options);
	paginator.setRowsPerPage(999);

	var paymentHistory = doPaymentHistory(vars, datatable);	// get this before we change it

	scanLoanPerf(vars.loanId, $("body"), vars);

	doLoanPerfPart2_0(vars);

	var formatCellOrig = datatable.formatCell;
	datatable.formatCell = function( elLiner , oRecord , oColumn )
	{
		var key = oColumn.key;
		var value = oRecord.getData(key);

		formatCellOrig.apply(this, arguments);

/* e.g.
dueDate value= Date {Fri May 10 1912 00:00:00 GMT-0400 (Eastern Daylight Time)}
compDate value= Date {Thu May 16 1912 00:00:00 GMT-0400 (Eastern Daylight Time)}
paymentAmount value= 0.89
principal value= <span title="$0.547519003448">$0.55</span>
interest value= <span title="$0.342480996552">$0.34</span>
lateFees value= <span title="$0.000000000000">$0.00</span>
outstandingPrincipal value= <span title="$23.374991287351">$23.37</span>
status value= Completed - on time
*/

		if(key == 'compDate')
		{
//			if(oRecord._nCount > 0 && (!value || value.getTime() == 0))
//				$(elLiner).closest("td").addClass("lcac_yellowRev");
		}
		else if(key == 'paymentAmount')
		{
			/*YYY sometimes it's off by a penny without payment plan or anything, some kind of rounding error? */
			if(!value)	
				$(elLiner).closest("td").addClass("lcac_zeropayment");
			else if(value < vars.origPaymentAmount - 0.01)	
				$(elLiner).closest("td").addClass("lcac_underpayment");
			else if(value > vars.origPaymentAmount + 0.01)
				$(elLiner).closest("td").addClass("lcac_overpayment");
		}
		else if(key == 'principal')
		{
			var value2 = html2Value(value);
			if(value2 == 0)
				$(elLiner).closest("td").addClass("lcac_zeropayment");
		}
		else if(key == 'lateFees')
		{
			/* value is pre-formatted */
			value = $(value).text().replace(/\$/, '');
			if(value > 0)
				$(elLiner).closest("td").addClass("lcac_redLow");
		}
		else if(key == 'status')
		{
			highlightElements($(elLiner), highlightLoanPerfBAD, "lcac_redLow");
			highlightElements($(elLiner), highlightLoanPerfWARNING, "lcac_yellowRev");
		}
	};

	datatable.render();

	return paymentHistory;
}

/* kind of slow with the compression, do in the background */
function doLoanPerfPart2_0(vars)
{
	doLoanPerfPart2_1(vars);

	setTimeout(function()
	{
		doLoanPerfPart2_2(vars);	// can be slow now that we compress stored note data
	}, 1000);
}

function doLoanPerfPart2_1(vars)
{
var DEBUG = debug(true, arguments);

	/*
	 * Add fields to the page
	 */
	//style copied from .object-details .module
	$(".data-summary:last").after("<div id='lcac_extras'></div>");	// folfion added new section FolioFn Listing Information
	var lcac_extras = $("#lcac_extras");	// find the div we just added
							
	/*
	 * e.g.
	 * https://www.lendingclub.com/account/loanPerf.action?loan_id=506788&order_id=2357536&note_id=1543883
	 * https://www.lendingclub.com/account/loanPerf.action?loan_id=478603&order_id=1931374&note_id=1098535
	 */
	var ficoTrend = parseTrendData($("table#trend-data tbody tr"));
	GM_log("ficoTrend=", ficoTrend);
	
	var recentCreditScore = parseInt($("th:contains('Recent Credit Score') + td").text());
	GM_log("recentCreditScore=", recentCreditScore);

	// How often does this happen?
	//XXX make this a header message instead of an alert
	if(ficoTrend.finalValue != recentCreditScore)
	{
		alert("FICO mismatch ficoTrend: " + ficoTrend.finalValue + " recentCreditScore: " + recentCreditScore);
	}
	
	var trendGraph = $("<div class='lcac_fico_trendGraph'><label>Credit Score Change*</label><br><span class='creditscorechangegraph'></span></div>");
	GM_log("trendGraph=", trendGraph);

	lcac_extras.append(trendGraph);	//YYY $.sparkline_display_visible() not working in chrome?
	
	var span = trendGraph.find("span.creditscorechangegraph");

	/* wider = longer history */
	var width =
		Math.min(800,
//			Math.max(
//				400,
				(ficoTrend.length - 1) * Math.floor(800 / 36)
//			)
		);
	
	trendGraph.find("span.creditscorechangegraph").sparkline(
		ficoTrend.vals,
		{
			width: width + 'px'
			, height: '80px'
			, chartRangeMax: '850'		// used to be 780
			, chartRangeMin: '499'
			, spotRadius: '5'
			, valueSpots: {
				':500': 'red'	// lowest on LendingClub
				, '501:': 'orangered'	// bad
				, '560:': 'orange'	// not good
				, '660:': 'blue'	// good
				, '760:': 'green'	// great
			}
			, spotColor: ''
			, minSpotColor: ''
			, maxSpotColor: ''
			, tooltipFormatter: function(sparkline, options, fields)
			{
				var x = fields.x;
				var ficoElement = ficoTrend[x];

				return sprintf("%d %s", ficoElement.val, ficoElement.date);
			}
		});
	
//	/*YYY is it faster to build it and then add it? */
//	lcac_extras.append(trendGraph);
//	$.sparkline_display_visible();	// per http://omnipotent.net/jquery.sparkline/#hidden
	
	/* Comment field */
	lcac_extras.append(''
		+ "<div>"
		+ "<label>Comment*:</label> "
		+ sprintf(
			"<input type='text' class='commentTextBox' name='comment_%s' size='50' style='width:80%;' />",
			vars.loanId
		)
		+ "</div>"
	);

	if(PAYMENTPLANONPERF)
	{
/* e.g.
<a href="/account/paymentPlan.action?loan_id=405486&amp;order_id=1539939" onclick="s_objectID=&quot;https://www.lendingclub.com/account/paymentPlan.action?loan_id=405486&amp;order_id=1539939_1&quot;;return this.s_oc?this.s_oc(e):true"><span class="lcac_yellowRev">On Payment Plan</span></a>
*/
		var pplink = $("a[href*='paymentPlan.action?loan_id=']");
		GM_log("pplink=", pplink);
		if(pplink.length > 0)
		{
			var href = pplink.prop('href');
			GM_log("href=", href);

			var div = $("div.data-container:last");
			GM_log("div=", div);
			div.after("<div class='pplink'><h3>Payment Plan</h3><div><div class='ppplaceholder'>Loading...</div></div></div>");
			$.get(href, function doLoanPerfPart2_1_get(responseText)
			{
				var dom = $(responseText);

				var pptable = dom.find("table#lcLoanPerfTable1");
				GM_log("pptable=", pptable);

				pptable.removeClass("standard-table");
				pptable.addClass("plain-table");

				pptable.find("thead").remove();

				$("div.ppplaceholder").replaceWith(pptable);

				dom.remove();	//XXX discard the rest (does this help free up memory?)
			})
			.fail(function doLoanPerfPart2_1_get_fail(jqXHR, textStatus, errorThrown)
			{
			var FUNCNAME = funcname(arguments);

				GM_log(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
				alert(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
			});
		}
	}

	/* commentTextBox */
	var commentTextBox = $('.commentTextBox');
	DEBUG && GM_log("commentTextBox=", commentTextBox);

	var comment = getComment(vars.loanId);
	DEBUG && GM_log("comment=", comment);

	commentTextBox
		.val(comment)
		.on('change',
			function(event)
			{
				setComment(this.name, this.value);
			});

	attachLocalStorageCommentListener();
}

function doLoanPerfPart2_2(vars)
{
var DEBUG = debug(true, arguments);

	var note = vars.noteId == null ? null : getStoredNote(vars.noteId);
	GM_log("note=", note);

	if(!note || !note.amountLent)
	{
		GM_log("returning, note=", note);
		if(note)
			GM_log("note.amountLent=" + note.amountLent);
		return;
	}

	// XXX 265px comes .moduleSmall:height
	GM_addStyle("div.lcac_receivedpayments { height:auto !important; min-height:265px; }");

	/* add a table to put our stuff in, after any No Fee text that might be here */
	var lcac_ReceivedPayments = $(":header:contains('Received Payments')").closest("div")
	GM_log("lcac_ReceivedPayments=", lcac_ReceivedPayments);
	lcac_ReceivedPayments
		.addClass('lcac_receivedpayments')
		.append("<table class='lcac_ReceivedPayments'><tbody></tbody></table>");
		
	/*XXX if you buy a note, then sell it, then buy it again, what value goes in amountLent? */

	$("table.lcac_ReceivedPayments tbody")
		.append(note.orderDate < note.issueDate ? '' : (''
			+ sprintf("<tr title='%s'><th>Order Date*</th><td>%s</td></tr>",
				"This value comes from " + notesRawDataURL,
				note.orderDate)
			))
		.append(''
			+ sprintf("<tr title='%s'><th>Investment*</th><td>$%0.2f</td></tr>",
				"This value comes from " + notesRawDataURL,
				note.amountLent)
			+ sprintf("<tr class='sub-total' title='%s'><th>Payments Received*</th><td>$%0.2f</td></tr>",
				"This value comes from " + notesRawDataURL,
				note.paymentReceived)
			+ sprintf("<tr class='sub-total'><th>Profit/Loss*</th><td>%s</td></tr>",
				negative2parens("$%0.2f", note.paymentReceived + vars.recoveries - note.amountLent))
			);
}


function doLoanPerfPart3(vars, paymentHistory)
{
var DEBUG = debug(false, arguments);

	if(vars.dueDateMissedCutoff)
	{
		$("#lcLoanPerf1 tbody.yui-dt-data tr")
			.filter(":eq(0), :eq(1)")
				.find("td.dueDate").addClass("lcac_redHigh");
	}

//	var daysSincePayment = daysBetween(TODAY(), paymentHistory.firstCompletedOrIssuedDate);
	
	var accruedInterest = vars.accrued_interest;

	//YYY if charged off or default then interest stops accuring
	var accruedInterestInMonths =
		calcInterestInMonths(vars.outstandingPrincipal, vars.interestRate, accruedInterest);
	
	var upcomingPaymentsBody = $(":header:contains('Upcoming Payments') + table tbody");

	if(upcomingPaymentsBody.length == 0)
		alert("upcomingPaymentsBody.length=" + upcomingPaymentsBody.length);

	$("th:contains(Accrued Interest)").next("td").append(sprintf("[%0.1fm]", accruedInterestInMonths));

	upcomingPaymentsBody
		.append(''
			+ sprintf("<tr><th>Initial <a href='%s'>PMT</a> Amount*</th><td>$%0.2f</td></tr>",
				"http://office.microsoft.com/en-us/excel-help/pmt-HP005209215.aspx",
				vars.origPaymentAmount)
			+ sprintf("<tr><th>+/-Expected as of %s*</th><td>%s</td></tr>",
				dateShortFormat(vars.arrearsDate),
				vars.arrearsString)
			);
				
	if(FEEOVERPAYMENT)
	{
		if(true || vars.outstandingPrincipal > 0)
		{
			/* YYY if fully paid, the fee overpayment rebate could be included in the final
			 * payment, making this calculation wrong but not by very much
			 */
			upcomingPaymentsBody
				.append(''
					+ sprintf("<tr><th>Fee Overpayment (est.)*</th><td>%s</td></tr>",
						vars.noFee ? "No Fee" : sprintf("%+0.2f", vars.feeOverpayment))
				);
		}

		if(vars.outstandingPrincipal > 0)
		{
			var expectedPayment = paymentHistory.firstNotScheduledOrProcessing.amount;
			GM_log("expectedPayment=", expectedPayment);

			/*
			 * XXX should we try to account for reduced payments and/or payment plan?
			 */
			var remainingPaymentsEOY2 = remainingPaymentsEOY(paymentHistory.firstCompletedOrIssuedDate);

			if(expectedPayment == 0)
			{
				var remainingPaymentsExpected = 0;
				var remainingPaymentsExpectedCeil = 0;

				var cumprinc = 0;
				var cumint = 0;
				
				var remainingPaymentsExpectedTotal = 0;
			}
			else
			{
				var remainingPaymentsExpected = NPER(vars.interestRate / 12, -expectedPayment, vars.outstandingPrincipal);
				var remainingPaymentsExpectedCeil = Math.ceil(remainingPaymentsExpected);

				var cumprinc =
					-CUMPRINC(vars.interestRate / 12, remainingPaymentsExpectedCeil, vars.outstandingPrincipal, 1);

				var cumint =
					-CUMIPMT(vars.interestRate / 12, remainingPaymentsExpectedCeil, vars.outstandingPrincipal, 1);
				
				var remainingPaymentsExpectedTotal = cumprinc + cumint;
			}

			upcomingPaymentsBody.find("tr:contains(Remaining Payments)")
				.after(''
					+ sprintf("<tr class='sub-total'><th>@&nbsp;$%0.2f (%0.1f)*</th><td>$%0.2f</td></tr>",
						expectedPayment, remainingPaymentsExpected, remainingPaymentsExpectedTotal)
				);

		}
	}
		
	var inProcessing = find("table#lcLoanPerfTable1 tr:contains(Processing...)");

	if(SELLORDERLINKONLOANPERF)
	if(isNoteOwned(vars.noteId) && !vars.status.match(/Default/) && !inProcessing)
	{
		var target = $(":header:contains('Loan Summary') + table tbody")
		target.append(
			sprintf("<tr><td colspan=2>"
			+ "<span class=lcac_togglesale_enable style='display:none'><button>Enable Add to Sell Order checkbox (experimental)</button></span>"
			+ "<span class=lcac_togglesale style='display:none'><label>Add to Sell Order <input type='checkbox' id='lcac_togglesale' name='%s' /></label> <a href='https://www.lendingclub.com/foliofn/selectLoansForSale.action'>View Sell Order</a></span>"
			+ "</td></tr>"
				, vars.noteId)
		);

		var lcac_togglesale_enable = $(".lcac_togglesale_enable", target);
		var lcac_togglesale = $("#lcac_togglesale", target);
		GM_log("lcac_togglesale_enable=", lcac_togglesale);
		GM_log("lcac_togglesale=", lcac_togglesale);

		var span_lcac_togglesale_enable = $("span.lcac_togglesale_enable", target);
		var span_lcac_togglesale = $("span.lcac_togglesale", target);
		GM_log("span_lcac_togglesale_enable=", span_lcac_togglesale);
		GM_log("span_lcac_togglesale=", span_lcac_togglesale);

		if(SELLORDERLINKONLOANPERFENABLED)
		{
			GM_log("showing span_lcac_togglesale");
			span_lcac_togglesale.css('display', 'inline');
		}
		else
		{
			GM_log("showing span_lcac_togglesale_enable");
			span_lcac_togglesale_enable
				.css('display', 'inline')
				.click(function()
				{
					span_lcac_togglesale_enable.css('display', 'none');
					span_lcac_togglesale.css('display', 'inline');
					GM_setValue("SELLORDERLINKONLOANPERFENABLED", true);
				});
		}


		lcac_togglesale
			.on('change', function(event)
			{
				var noteId = $(this).prop('name');
				var checked = $(this).prop('checked');
			
				ffnAddToSellOrder(noteId, checked,
					function ffnAddToSellOrder_post_success(data, textStatus, jqXHR)
					{
						var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

						GM_log(FUNCNAME + " data=", data);
						GM_log(FUNCNAME + " typeof data=" + typeof data);

						if(typeof data == 'string')
						{
							if(data.match(/You've been logged out/))
							{
								alert("Not logged in");
								lcac_togglesale.prop('checked', false);
								return;
							}
						}
						else if(typeof data != 'object')
						{
							alert(FUNCNAME + " unhandled typeof data=" + typeof data);
							return;
						}
						
						if(data.result == 'success')
							return;

						//assert data is an object
//						alert("result=" + data.result + " selectedNoteCount=" + data.selectedNoteCount + " You might need to open a Foliofn Sell Notes window first");
						var result = confirm("result=" + data.result + " selectedNoteCount=" + data.selectedNoteCount + " You might need to open a Foliofn Sell Notes window first. Open one now?");
						if(result)
							window.open("https://www.lendingclub.com/foliofn/sellNotes.action", "LCAC_sellNotes");

						if(typeof data.checked != 'undefined')	// sell page not open?
							lcac_togglesale.prop('checked', !checked);	// revert checkbox state
						else	// some other error
							lcac_togglesale.prop('checked', false);
					});
			});
	}

	GM_log("vars=", vars);

	if(isNoteSalePending(vars.noteId))
	{
		$("table.lcac_ReceivedPayments tbody")
			.append(

				"<tr><th colspan=2 style='text-align:center'>*** Sale Pending ***</th></tr>"
			);
	}

	if(isNotePurchasePending(vars.noteId))
	{
		$("table.lcac_ReceivedPayments tbody")
			.append(

				"<tr><th colspan=2 style='text-align:center'>*** Purchase Pending ***</th></tr>"
			);
	}

	if(vars.for_sale || vars.asking_price)
	{
		GM_log("vars.for_sale=" + vars.for_sale + " vars.asking_price=" + vars.asking_price);

		var forsalehtml = 
			"<tr><th colspan=2 style='text-align:center'>*** For Sale ***</th></tr>"
		;

		if(vars.asking_price)
		{
			GM_log("vars=", vars);
			var markup = vars.asking_price - vars.outstandingPrincipal - vars.accrued_interest;
			var markupFrac = markup / vars.outstandingPrincipal;
			
			if(paymentHistory.first.amount > 0)
				var irr = IRR(
					vars.outstandingPrincipal,
					round2Decimals(accruedInterest),
					paymentHistory.first.amount,
					vars.interestRate,
					vars.asking_price,
					vars.noFee ? 0 : null);
			else
				var irr = null;

			forsalehtml +=
				sprintf("<tr><th>Asking Price*</th><td>$%0.2f</td></tr>",
					vars.asking_price)

				+ sprintf("<tr><th>Markup*</th><td>%s/%0.2f%%</td></tr>",
					negative2negative("$%0.2f", markup), markupFrac * 100)

				+ sprintf("<tr class='sub-total'><th>IRR (est.)*</th><td>%s</td></tr>",
					irr == null ? 'unk' : negative2parens("%0.2f%%", irr * 100))
		}
			
		$(":header:contains('Loan Summary') + table tbody")
			.append(forsalehtml);
		
		if(BUYORDERLINKONLOANPERF)
		{
			var forsalehtml2 =
				sprintf("<tr><td colspan=2><label><span id='lcac_togglepurchase_label'>Add to Buy Order </span><input type='checkbox' id='lcac_togglepurchase' data-note_id='%s' data-loan_id='%s' /></label> <a href='/foliofn/cart.action'>View Buy Order</a></td>", vars.noteId, vars.loanId);
		
			var target = $(":header:contains('Loan Summary') + table tbody");
			target
				.append(forsalehtml2);

			var lcac_togglepurchase = $("#lcac_togglepurchase", target);
			GM_log("lcac_togglepurchase=", lcac_togglepurchase);
			var lcac_togglepurchase_label = $("#lcac_togglepurchase_label", target);
			GM_log("lcac_togglepurchase_label=", lcac_togglepurchase_label);
			var lcac_togglepurchase_label_origtext = lcac_togglepurchase_label.text();

			if(vars.in_cart)
				lcac_togglepurchase.prop('checked', true);

			lcac_togglepurchase
				.on('change', function(event)
				{
					var noteId = $(this).attr('data-note_id');
					var loanId = $(this).attr('data-loan_id');
					var checked = $(this).prop('checked');

					function resetLabel()
					{
						lcac_togglepurchase_label
							.text(lcac_togglepurchase_label_origtext);
						lcac_togglepurchase
							.prop('disabled', false);
					}

					lcac_togglepurchase_label
						.text('Please wait...');
					lcac_togglepurchase
						.prop('disabled', true);

					(function(noteId, checked)
					{
						setTimeout(function()
						{
							if(checked)
								ffnAddToCart(noteId, checked, resetLabel);
							else
								ffnRemoveFromCart(loanId, noteId, resetLabel);
						}, 0);
					})(noteId, checked);
				});
		}
	}

	if(vars.sale_price != null)
	{
		$("table.lcac_ReceivedPayments tbody")
			.append(''
				+ sprintf("<tr><th>Sale Price*</th><td>$%0.2f</td></tr>",
					vars.sale_price)
			);

		if(vars.par_value_at_sale != null)
		{
			if(paymentHistory.first.amount > 0)
				var irr = IRR(
					vars.par_value_at_sale,
					round2Decimals(accruedInterest),
					paymentHistory.first.amount,
					vars.interestRate,
					vars.sale_price);
			else
				var irr = null;
			
			var gainloss = vars.sale_price - vars.par_value_at_sale - vars.fee_at_sale;

			$("table.lcac_ReceivedPayments tbody")
				.append(''
					+ sprintf("<tr><th>Par Value at Sale*</th><td>%s</td></tr>",
						sprintf("$%0.2f", vars.par_value_at_sale))

					+ sprintf("<tr class='sub-total'><th>IRR (est.)*</th><td>%s</td></tr>",
						irr == null ? 'unk' : negative2parens("%0.2f%%", irr * 100))

					+ sprintf("<tr class='sub-total'><th>Fee*</th><td>%s</td></tr>",
						sprintf("$%0.2f", vars.fee_at_sale))

					+ sprintf("<tr class='sub-total'><th>Gain/Loss*</th><td>%s</td></tr>",
						sprintf("$%0.2f", gainloss))
				);
		}
		else if(isNoteSalePending(vars.noteId))
		{
			if(paymentHistory.first.amount > 0)
				var irr = IRR(
					vars.outstandingPrincipal,
					round2Decimals(accruedInterest),
					paymentHistory.first.amount,
					vars.interestRate,
					vars.sale_price);
			else
				var irr = null;

			var saleFee = sprintf("%.2f", vars.sale_price / 100);
			if(saleFee < .01)
				saleFee = .01;
			
			$("table.lcac_ReceivedPayments tbody")
				.append(''
					+ sprintf("<tr class='sub-total'><th>IRR (est.)*</th><td>%s</td></tr>",
						irr == null ? 'unk' : negative2parens("%0.2f%%", irr * 100))

					+ sprintf("<tr class='sub-total'><th>Fee (est.)*</th><td>%s</td></tr>",
						sprintf("$%0.2f", saleFee))

				);
		}
	}

	if(vars.our_asking_price != null)
	{
		/* XXX this value can "expire" if payments get made on the loan */

		var irr = IRR(
			vars.outstandingPrincipal,
			round2Decimals(accruedInterest),
			paymentHistory.first.amount,
			vars.interestRate,
			vars.our_asking_price);

		$("table.lcac_ReceivedPayments tbody")
			.append(''
				+ sprintf("<tr><th>Our Asking Price*</th><td>$%0.2f</td></tr>",
					vars.our_asking_price)

				+ sprintf("<tr><th>Outstanding Principal*</th><td>%s</td></tr>",
					sprintf("$%0.2f", vars.outstandingPrincipal)) +

				+ sprintf("<tr class='sub-total'><th>IRR (est.)*</th><td>%s</td></tr>",
					negative2parens("%0.2f%%", irr * 100))
				);
	}
	
	/*YYY on /account/ this is limited to 262px, which isn't big enough (/foliofn/ looks ok though) */
	if(location.href.match(/\/account\//))
		GM_addStyle(".object-details th, .object-details td {height:auto;}");
//	GM_addStyle(".object-details th, .object-details td {white-space:nowrap;}");
	GM_addStyle(".object-details {white-space:nowrap;}");
}

// from http://pe.usps.gov/text/LabelingLists/L002.htm
// var id = null; var obj = {}; jQ("table tr").find("td:nth-child(1), td:nth-child(3)").map(function(index, element){var text = jQ(element).text().trim(); if(index % 2 == 0) id = text; else obj[id] = text}); JSON.stringify(obj)
var zip3obj = null;
function getZip3(zip3)
{
	if(!zip3obj)
		zip3obj = JSON.parse(
			'{"100":"NEW YORK NY","101":"NEW YORK NY","102":"NEW YORK NY","103":"BROOKLYN NY","104":"BRONX NY","105":"WESTCHESTER NY","106":"WHITE PLAINS NY","107":"YONKERS NY","108":"NEW ROCHELLE NY","109":"WESTCHESTER NY","110":"QUEENS NY","111":"LONG ISLAND CITY NY","112":"BROOKLYN NY","113":"FLUSHING NY","114":"JAMAICA NY","115":"WESTERN NASSAU NY","116":"FAR ROCKAWAY NY","117":"MID-ISLAND NY","118":"HICKSVILLE NY","119":"MID-ISLAND NY","120":"ALBANY NY","121":"ALBANY NY","122":"ALBANY NY","123":"SCHENECTADY NY","124":"MID-HUDSON NY","125":"MID-HUDSON NY","126":"POUGHKEEPSIE NY","127":"MID-HUDSON NY","128":"ALBANY NY","129":"ALBANY NY","130":"SYRACUSE NY","131":"SYRACUSE NY","132":"SYRACUSE NY","133":"SYRACUSE NY","134":"SYRACUSE NY","135":"SYRACUSE NY","136":"SYRACUSE NY","137":"SYRACUSE NY","138":"SYRACUSE NY","139":"SYRACUSE NY","140":"BUFFALO NY","141":"BUFFALO NY","142":"BUFFALO NY","143":"NIAGARA FALLS NY","144":"ROCHESTER NY","145":"ROCHESTER NY","146":"ROCHESTER NY","147":"BUFFALO NY","148":"ROCHESTER NY","149":"ROCHESTER NY","150":"PITTSBURGH PA","151":"PITTSBURGH PA","152":"PITTSBURGH PA","153":"PITTSBURGH PA","154":"PITTSBURGH PA","155":"JOHNSTOWN PA","156":"PITTSBURGH PA","157":"JOHNSTOWN PA","158":"JOHNSTOWN PA","159":"JOHNSTOWN PA","160":"PITTSBURGH PA","161":"PITTSBURGH PA","162":"PITTSBURGH PA","163":"ERIE PA","164":"ERIE PA","165":"ERIE PA","166":"JOHNSTOWN PA","167":"ERIE PA","168":"JOHNSTOWN PA","169":"HARRISBURG PA","170":"HARRISBURG PA","171":"HARRISBURG PA","172":"HARRISBURG PA","173":"HARRISBURG PA","174":"HARRISBURG PA","175":"HARRISBURG PA","176":"HARRISBURG PA","177":"HARRISBURG PA","178":"HARRISBURG PA","179":"HARRISBURG PA","180":"LEHIGH VALLEY PA","181":"ALLENTOWN PA","182":"LEHIGH VALLEY PA","183":"LEHIGH VALLEY PA","184":"LEHIGH VALLEY PA","185":"LEHIGH VALLEY PA","186":"LEHIGH VALLEY PA","187":"LEHIGH VALLEY PA","188":"LEHIGH VALLEY PA","189":"PHILADELPHIA PA","190":"PHILADELPHIA PA","191":"PHILADELPHIA PA","192":"PHILADELPHIA PA","193":"WILMINGTON DE","194":"PHILADELPHIA PA","195":"HARRISBURG PA","196":"HARRISBURG PA","197":"WILMINGTON DE","198":"WILMINGTON DE","199":"WILMINGTON DE","200":"WASHINGTON DC","201":"DULLES VA","202":"WASHINGTON DC","203":"WASHINGTON DC","204":"WASHINGTON DC","205":"WASHINGTON DC","206":"SOUTHERN MD MD","207":"SOUTHERN MD MD","208":"SUBURBAN MD MD","209":"SILVER SPRING MD","210":"LINTHICUM MD","211":"LINTHICUM MD","212":"BALTIMORE MD","214":"ANNAPOLIS MD","215":"BALTIMORE MD","216":"EASTERN SHORE MD","217":"FREDERICK MD","218":"SALISBURY MD","219":"BALTIMORE MD","220":"NORTHERN VA VA","221":"NORTHERN VA VA","222":"ARLINGTON VA","223":"ALEXANDRIA VA","224":"RICHMOND VA","225":"RICHMOND VA","226":"DULLES VA","227":"DULLES VA","228":"CHARLOTTESVLE VA","229":"CHARLOTTESVLE VA","230":"RICHMOND VA","231":"RICHMOND VA","232":"RICHMOND VA","233":"NORFOLK VA","234":"NORFOLK VA","235":"NORFOLK VA","236":"NORFOLK VA","237":"PORTSMOUTH VA","238":"RICHMOND VA","239":"RICHMOND VA","240":"ROANOKE VA","241":"ROANOKE VA","242":"KNOXVILLE TN","243":"ROANOKE VA","244":"CHARLOTTESVLE VA","245":"ROANOKE VA","246":"CHARLESTON WV","247":"CHARLESTON WV","248":"CHARLESTON WV","249":"CHARLESTON WV","250":"CHARLESTON WV","251":"CHARLESTON WV","252":"CHARLESTON WV","253":"CHARLESTON WV","254":"BALTIMORE MD","255":"CHARLESTON WV","256":"CHARLESTON WV","257":"CHARLESTON WV","258":"CHARLESTON WV","259":"CHARLESTON WV","260":"PITTSBURGH PA","261":"CHARLESTON WV","262":"CHARLESTON WV","263":"CHARLESTON WV","264":"CHARLESTON WV","265":"PITTSBURGH PA","266":"CHARLESTON WV","267":"BALTIMORE MD","268":"DULLES VA","270":"GREENSBORO NC","271":"WINSTON-SALEM NC","272":"GREENSBORO NC","273":"GREENSBORO NC","274":"GREENSBORO NC","275":"RALEIGH NC","276":"RALEIGH NC","277":"DURHAM NC","278":"ROCKY MOUNT NC","279":"ROCKY MOUNT NC","280":"CHARLOTTE NC","281":"CHARLOTTE NC","282":"CHARLOTTE NC","283":"FAYETTEVILLE NC","284":"FAYETTEVILLE NC","285":"FAYETTEVILLE NC","286":"GREENSBORO NC","287":"ASHEVILLE NC","288":"ASHEVILLE NC","289":"ASHEVILLE NC","290":"COLUMBIA SC","291":"COLUMBIA SC","292":"COLUMBIA SC","293":"GREENVILLE SC","294":"CHARLESTON SC","295":"COLUMBIA SC","296":"GREENVILLE SC","297":"CHARLOTTE NC","298":"AUGUSTA GA","299":"CHARLESTON SC","300":"NORTH METRO GA","301":"ATLANTA GA","302":"ATLANTA GA","303":"ATLANTA GA","304":"MACON GA","305":"NORTH METRO GA","306":"NORTH METRO GA","307":"CHATTANOOGA TN","308":"AUGUSTA GA","309":"AUGUSTA GA","310":"MACON GA","311":"ATLANTA GA","312":"MACON GA","313":"JACKSONVILLE FL","314":"JACKSONVILLE FL","315":"JACKSONVILLE FL","316":"TALLAHASSEE FL","317":"TALLAHASSEE FL","318":"MACON GA","319":"MACON GA","320":"JACKSONVILLE FL","321":"ORLANDO FL","322":"JACKSONVILLE FL","323":"TALLAHASSEE FL","324":"PENSACOLA FL","325":"PENSACOLA FL","326":"JACKSONVILLE FL","327":"ORLANDO FL","328":"ORLANDO FL","329":"ORLANDO FL","330":"MIAMI FL","331":"MIAMI FL","332":"MIAMI FL","333":"MIAMI FL","334":"WEST PALM BCH FL","335":"TAMPA FL","336":"TAMPA FL","337":"MANASOTA FL","338":"MANASOTA FL","339":"FT MYERS FL","340":"APO/FPO AA","341":"FT MYERS FL","342":"MANASOTA FL","344":"JACKSONVILLE FL","346":"TAMPA FL","347":"ORLANDO FL","349":"WEST PALM BCH FL","350":"BIRMINGHAM AL","351":"BIRMINGHAM AL","352":"BIRMINGHAM AL","354":"BIRMINGHAM AL","355":"BIRMINGHAM AL","356":"BIRMINGHAM AL","357":"BIRMINGHAM AL","358":"BIRMINGHAM AL","359":"BIRMINGHAM AL","360":"MONTGOMERY AL","361":"MONTGOMERY AL","362":"BIRMINGHAM AL","363":"MONTGOMERY AL","364":"MONTGOMERY AL","365":"MOBILE AL","366":"MOBILE AL","367":"MONTGOMERY AL","368":"MONTGOMERY AL","369":"JACKSON MS","370":"NASHVILLE TN","371":"NASHVILLE TN","372":"NASHVILLE TN","373":"CHATTANOOGA TN","374":"CHATTANOOGA TN","375":"MEMPHIS TN","376":"KNOXVILLE TN","377":"KNOXVILLE TN","378":"KNOXVILLE TN","379":"KNOXVILLE TN","380":"MEMPHIS TN","381":"MEMPHIS TN","382":"MEMPHIS TN","383":"MEMPHIS TN","384":"NASHVILLE TN","385":"NASHVILLE TN","386":"MEMPHIS TN","387":"JACKSON MS","388":"MEMPHIS TN","389":"JACKSON MS","390":"JACKSON MS","391":"JACKSON MS","392":"JACKSON MS","393":"JACKSON MS","394":"HATTIESBURG MS","395":"GULFPORT MS","396":"JACKSON MS","397":"JACKSON MS","398":"TALLAHASSEE FL","399":"ATLANTA GA","400":"LOUISVILLE KY","401":"LOUISVILLE KY","402":"LOUISVILLE KY","403":"LEXINGTON KY","404":"LEXINGTON KY","405":"LEXINGTON KY","406":"FRANKFORT KY","407":"KNOXVILLE TN","408":"KNOXVILLE TN","409":"KNOXVILLE TN","410":"CINCINNATI OH","411":"CHARLESTON WV","412":"CHARLESTON WV","413":"CAMPTON KY","414":"CAMPTON KY","415":"CHARLESTON WV","416":"CHARLESTON WV","417":"KNOXVILLE TN","418":"KNOXVILLE TN","420":"PADUCAH KY","421":"NASHVILLE TN","422":"NASHVILLE TN","423":"EVANSVILLE IN","424":"EVANSVILLE IN","425":"KNOXVILLE TN","426":"KNOXVILLE TN","427":"LOUISVILLE KY","430":"COLUMBUS OH","431":"COLUMBUS OH","432":"COLUMBUS OH","433":"COLUMBUS OH","434":"TOLEDO OH","435":"TOLEDO OH","436":"TOLEDO OH","437":"COLUMBUS OH","438":"COLUMBUS OH","439":"PITTSBURGH PA","440":"CLEVELAND OH","441":"CLEVELAND OH","442":"AKRON OH","443":"AKRON OH","444":"CLEVELAND OH","445":"CLEVELAND OH","446":"AKRON OH","447":"AKRON OH","448":"CLEVELAND OH","449":"CLEVELAND OH","450":"CINCINNATI OH","451":"CINCINNATI OH","452":"CINCINNATI OH","453":"DAYTON OH","454":"DAYTON OH","455":"SPRINGFIELD OH","456":"COLUMBUS OH","457":"COLUMBUS OH","458":"COLUMBUS OH","459":"CINCINNATI OH","460":"INDIANAPOLIS IN","461":"INDIANAPOLIS IN","462":"INDIANAPOLIS IN","463":"GARY IN","464":"GARY IN","465":"SOUTH BEND IN","466":"SOUTH BEND IN","467":"FORT WAYNE IN","468":"FORT WAYNE IN","469":"KOKOMO IN","470":"CINCINNATI OH","471":"LOUISVILLE KY","472":"INDIANAPOLIS IN","473":"MUNCIE IN","474":"INDIANAPOLIS IN","475":"EVANSVILLE IN","476":"EVANSVILLE IN","477":"EVANSVILLE IN","478":"INDIANAPOLIS IN","479":"LAFAYETTE IN","480":"METROPLEX MI","481":"DETROIT MI","482":"DETROIT MI","483":"METROPLEX MI","484":"METROPLEX MI","485":"METROPLEX MI","486":"METROPLEX MI","487":"METROPLEX MI","488":"LANSING MI","489":"LANSING MI","490":"KALAMAZOO MI","491":"KALAMAZOO MI","492":"DETROIT MI","493":"GRAND RAPIDS MI","494":"GRAND RAPIDS MI","495":"GRAND RAPIDS MI","496":"TRAVERSE CITY MI","497":"TRAVERSE CITY MI","498":"IRON MOUNTAIN MI","499":"IRON MOUNTAIN MI","500":"DES MOINES IA","501":"DES MOINES IA","502":"DES MOINES IA","503":"DES MOINES IA","504":"WATERLOO IA","505":"DES MOINES IA","506":"WATERLOO IA","507":"WATERLOO IA","508":"DES MOINES IA","509":"DES MOINES IA","510":"SIOUX FALLS SD","511":"SIOUX FALLS SD","512":"SIOUX FALLS SD","513":"SIOUX FALLS SD","514":"DES MOINES IA","515":"OMAHA NE","516":"OMAHA NE","520":"CEDAR RAPIDS IA","521":"WATERLOO IA","522":"CEDAR RAPIDS IA","523":"CEDAR RAPIDS IA","524":"CEDAR RAPIDS IA","525":"DES MOINES IA","526":"QUAD CITIES IL","527":"QUAD CITIES IL","528":"DAVENPORT IA","530":"MILWAUKEE WI","531":"MILWAUKEE WI","532":"MILWAUKEE WI","534":"RACINE WI","535":"MADISON WI","537":"MADISON WI","538":"MADISON WI","539":"MADISON WI","540":"ST PAUL MN","541":"GREEN BAY WI","542":"GREEN BAY WI","543":"GREEN BAY WI","544":"WAUSAU WI","545":"GREEN BAY WI","546":"LA CROSSE WI","547":"EAU CLAIRE WI","548":"EAU CLAIRE WI","549":"MILWAUKEE WI","550":"ST PAUL MN","551":"ST PAUL MN","553":"MINNEAPOLIS MN","554":"MINNEAPOLIS MN","555":"MINNEAPOLIS MN","556":"DULUTH MN","557":"DULUTH MN","558":"DULUTH MN","559":"ST PAUL MN","560":"MANKATO MN","561":"MANKATO MN","562":"ST CLOUD MN","563":"ST CLOUD MN","564":"ST CLOUD MN","565":"FARGO ND","566":"BEMIDJI MN","567":"GRAND FORKS ND","570":"SIOUX FALLS SD","571":"SIOUX FALLS SD","572":"DAKOTA CENTRAL SD","573":"DAKOTA CENTRAL SD","574":"DAKOTA CENTRAL SD","575":"DAKOTA CENTRAL SD","576":"BISMARCK ND","577":"RAPID CITY SD","580":"FARGO ND","581":"FARGO ND","582":"GRAND FORKS ND","583":"GRAND FORKS ND","584":"FARGO ND","585":"BISMARCK ND","586":"BISMARCK ND","587":"MINOT ND","588":"MINOT ND","590":"BILLINGS MT","591":"BILLINGS MT","592":"BILLINGS MT","593":"BILLINGS MT","594":"GREAT FALLS MT","595":"GREAT FALLS MT","596":"GREAT FALLS MT","597":"BILLINGS MT","598":"MISSOULA MT","599":"MISSOULA MT","600":"PALATINE IL","601":"CAROL STREAM IL","602":"EVANSTON IL","603":"OAK PARK IL","604":"S SUBURBAN IL","605":"FOX VALLEY IL","606":"CHICAGO IL","607":"CHICAGO IL","608":"CHICAGO IL","609":"CHAMPAIGN IL","610":"PALATINE IL","611":"PALATINE IL","612":"QUAD CITIES IL","613":"PEORIA IL","614":"PEORIA IL","615":"PEORIA IL","616":"PEORIA IL","617":"CHAMPAIGN IL","618":"CHAMPAIGN IL","619":"CHAMPAIGN IL","620":"ST LOUIS MO","622":"ST LOUIS MO","623":"SPRINGFIELD IL","624":"CHAMPAIGN IL","625":"SPRINGFIELD IL","626":"SPRINGFIELD IL","627":"SPRINGFIELD IL","628":"ST LOUIS MO","629":"ST LOUIS MO","630":"ST LOUIS MO","631":"ST LOUIS MO","633":"ST LOUIS MO","634":"ST LOUIS MO","635":"MID-MISSOURI MO","636":"CAPE GIRARDEAU MO","637":"CAPE GIRARDEAU MO","638":"CAPE GIRARDEAU MO","639":"CAPE GIRARDEAU MO","640":"KANSAS CITY MO","641":"KANSAS CITY MO","644":"KANSAS CITY MO","645":"KANSAS CITY MO","646":"KANSAS CITY MO","647":"KANSAS CITY MO","648":"SPRINGFIELD MO","649":"KANSAS CITY MO","650":"MID-MISSOURI MO","651":"MID-MISSOURI MO","652":"MID-MISSOURI MO","653":"MID-MISSOURI MO","654":"SPRINGFIELD MO","655":"SPRINGFIELD MO","656":"SPRINGFIELD MO","657":"SPRINGFIELD MO","658":"SPRINGFIELD MO","660":"KANSAS CITY MO","661":"KANSAS CITY MO","662":"SHAWNEE MISSION KS","664":"KANSAS CITY MO","665":"KANSAS CITY MO","666":"KANSAS CITY MO","667":"KANSAS CITY MO","668":"KANSAS CITY MO","669":"SALINA KS","670":"WICHITA KS","671":"WICHITA KS","672":"WICHITA KS","673":"WICHITA KS","674":"SALINA KS","675":"WICHITA KS","676":"WICHITA KS","677":"NORTH PLATTE NE","678":"WICHITA KS","679":"AMARILLO TX","680":"OMAHA NE","681":"OMAHA NE","683":"OMAHA NE","684":"OMAHA NE","685":"OMAHA NE","686":"NORFOLK NE","687":"NORFOLK NE","688":"GRAND ISLAND NE","689":"GRAND ISLAND NE","690":"NORTH PLATTE NE","691":"NORTH PLATTE NE","692":"NORTH PLATTE NE","693":"NORTH PLATTE NE","700":"NEW ORLEANS LA","701":"NEW ORLEANS LA","703":"NEW ORLEANS LA","704":"NEW ORLEANS LA","705":"LAFAYETTE LA","706":"LAFAYETTE LA","707":"BATON ROUGE LA","708":"BATON ROUGE LA","710":"SHREVEPORT LA","711":"SHREVEPORT LA","712":"SHREVEPORT LA","713":"SHREVEPORT LA","714":"SHREVEPORT LA","716":"LITTLE ROCK AR","717":"LITTLE ROCK AR","718":"SHREVEPORT LA","719":"LITTLE ROCK AR","720":"LITTLE ROCK AR","721":"LITTLE ROCK AR","722":"LITTLE ROCK AR","723":"MEMPHIS TN","724":"MEMPHIS TN","725":"LITTLE ROCK AR","726":"NW ARKANSAS AR","727":"NW ARKANSAS AR","728":"LITTLE ROCK AR","729":"NW ARKANSAS AR","730":"OKLAHOMA CITY OK","731":"OKLAHOMA CITY OK","733":"AUSTIN TX","734":"OKLAHOMA CITY OK","735":"OKLAHOMA CITY OK","736":"OKLAHOMA CITY OK","737":"OKLAHOMA CITY OK","738":"OKLAHOMA CITY OK","739":"AMARILLO TX","740":"TULSA OK","741":"TULSA OK","743":"TULSA OK","744":"TULSA OK","745":"TULSA OK","746":"TULSA OK","747":"TULSA OK","748":"OKLAHOMA CITY OK","749":"TULSA OK","750":"NORTH TEXAS TX","751":"DALLAS TX","752":"DALLAS TX","753":"DALLAS TX","754":"NORTH TEXAS TX","755":"SHREVEPORT LA","756":"SHREVEPORT LA","757":"NORTH TEXAS TX","758":"NORTH TEXAS TX","759":"NORTH HOUSTON TX","760":"FT WORTH TX","761":"FT WORTH TX","762":"FT WORTH TX","763":"FT WORTH TX","764":"FT WORTH TX","765":"AUSTIN TX","766":"FT WORTH TX","767":"FT WORTH TX","768":"ABILENE TX","769":"ABILENE TX","770":"HOUSTON TX","772":"HOUSTON TX","773":"NORTH HOUSTON TX","774":"NORTH HOUSTON TX","775":"NORTH HOUSTON TX","776":"BEAUMONT TX","777":"BEAUMONT TX","778":"NORTH HOUSTON TX","779":"CORPUS CHRISTI TX","780":"SAN ANTONIO TX","781":"SAN ANTONIO TX","782":"SAN ANTONIO TX","783":"CORPUS CHRISTI TX","784":"CORPUS CHRISTI TX","785":"MCALLEN TX","786":"AUSTIN TX","787":"AUSTIN TX","788":"SAN ANTONIO TX","789":"AUSTIN TX","790":"AMARILLO TX","791":"AMARILLO TX","792":"AMARILLO TX","793":"LUBBOCK TX","794":"LUBBOCK TX","795":"ABILENE TX","796":"ABILENE TX","797":"MIDLAND TX","798":"EL PASO TX","799":"EL PASO TX","800":"DENVER CO","801":"DENVER CO","802":"DENVER CO","803":"BOULDER CO","804":"DENVER CO","805":"LONGMONT CO","806":"DENVER CO","807":"DENVER CO","808":"COLORADO SPGS CO","809":"COLORADO SPGS CO","810":"COLORADO SPGS CO","811":"DENVER CO","812":"DENVER CO","813":"ALBUQUERQUE NM","814":"GRAND JUNCTION CO","815":"GRAND JUNCTION CO","816":"GRAND JUNCTION CO","820":"CHEYENNE WY","821":"YELLOWSTONE NL PK WY","822":"CHEYENNE WY","823":"CHEYENNE WY","824":"CASPER WY","825":"CASPER WY","826":"CASPER WY","827":"CASPER WY","828":"CASPER WY","829":"ROCK SPRINGS WY","830":"ROCK SPRINGS WY","831":"ROCK SPRINGS WY","832":"POCATELLO ID","833":"BOISE ID","834":"POCATELLO ID","835":"SPOKANE WA","836":"BOISE ID","837":"BOISE ID","838":"SPOKANE WA","840":"SALT LAKE CTY UT","841":"SALT LAKE CTY UT","842":"SALT LAKE CTY UT","843":"SALT LAKE CTY UT","844":"OGDEN UT","845":"PROVO UT","846":"PROVO UT","847":"PROVO UT","850":"PHOENIX AZ","851":"PHOENIX AZ","852":"PHOENIX AZ","853":"PHOENIX AZ","855":"PHOENIX AZ","856":"TUCSON AZ","857":"TUCSON AZ","859":"PHOENIX AZ","860":"PHOENIX AZ","863":"PHOENIX AZ","864":"LAS VEGAS NV","865":"ALBUQUERQUE NM","870":"ALBUQUERQUE NM","871":"ALBUQUERQUE NM","873":"ALBUQUERQUE NM","874":"ALBUQUERQUE NM","875":"ALBUQUERQUE NM","876":"ALBUQUERQUE NM","877":"ALBUQUERQUE NM","878":"ALBUQUERQUE NM","879":"ALBUQUERQUE NM","880":"EL PASO TX","881":"LUBBOCK TX","882":"LUBBOCK TX","883":"EL PASO TX","884":"ALBUQUERQUE NM","885":"EL PASO TX","889":"LAS VEGAS NV","890":"LAS VEGAS NV","891":"LAS VEGAS NV","893":"LAS VEGAS NV","894":"RENO NV","895":"RENO NV","897":"CARSON CITY NV","898":"ELKO NV","900":"LOS ANGELES CA","901":"LOS ANGELES CA","902":"INGLEWOOD CA","903":"INGLEWOOD CA","904":"SANTA MONICA CA","905":"LOS ANGELES CA","906":"INDUSTRY CA","907":"LOS ANGELES CA","908":"LOS ANGELES CA","910":"PASADENA CA","911":"PASADENA CA","912":"GLENDALE CA","913":"SANTA CLARITA CA","914":"SANTA CLARITA CA","915":"SANTA CLARITA CA","916":"SANTA CLARITA CA","917":"INDUSTRY CA","918":"INDUSTRY CA","919":"SAN DIEGO CA","920":"SAN DIEGO CA","921":"SAN DIEGO CA","922":"SN BERNARDINO CA","923":"SN BERNARDINO CA","924":"SN BERNARDINO CA","925":"SN BERNARDINO CA","926":"SANTA ANA CA","927":"SANTA ANA CA","928":"ANAHEIM CA","930":"SANTA BARBARA CA","931":"SANTA BARBARA CA","932":"BAKERSFIELD CA","933":"BAKERSFIELD CA","934":"SANTA BARBARA CA","935":"BAKERSFIELD CA","936":"FRESNO CA","937":"FRESNO CA","938":"FRESNO CA","939":"SALINAS CA","940":"SAN FRANCISCO CA","941":"SAN FRANCISCO CA","942":"SACRAMENTO CA","943":"PALO ALTO CA","944":"SAN MATEO CA","945":"OAKLAND CA","946":"OAKLAND CA","947":"BERKELEY CA","948":"RICHMOND CA","949":"NORTH BAY CA","950":"SAN JOSE CA","951":"SAN JOSE CA","952":"STOCKTON CA","953":"STOCKTON CA","954":"NORTH BAY CA","955":"EUREKA CA","956":"SACRAMENTO CA","957":"SACRAMENTO CA","958":"SACRAMENTO CA","959":"SACRAMENTO CA","960":"REDDING CA","961":"RENO NV","962":"APO/FPO AP","963":"APO/FPO AP","964":"APO/FPO AP","965":"APO/FPO AP","966":"APO/FPO AP","967":"HONOLULU HI","968":"HONOLULU HI","969":"BARRIGADA GU","970":"PORTLAND OR","971":"PORTLAND OR","972":"PORTLAND OR","973":"PORTLAND OR","974":"EUGENE OR","975":"MEDFORD OR","976":"MEDFORD OR","977":"BEND OR","978":"PENDLETON OR","979":"BOISE ID","980":"SEATTLE WA","981":"SEATTLE WA","982":"SEATTLE WA","983":"TACOMA WA","984":"TACOMA WA","985":"TACOMA WA","986":"PORTLAND OR","988":"WENATCHEE WA","989":"YAKIMA WA","990":"SPOKANE WA","991":"SPOKANE WA","992":"SPOKANE WA","993":"SPOKANE WA","994":"SPOKANE WA","995":"ANCHORAGE AK","996":"ANCHORAGE AK","997":"FAIRBANKS AK","998":"JUNEAU AK","999":"KETCHIKAN AK","005":"MID-ISLAND NY","006":"SAN JUAN PR","007":"SAN JUAN PR","008":"SAN JUAN PR","009":"SAN JUAN PR","010":"HARTFORD CT","011":"HARTFORD CT","012":"HARTFORD CT","013":"CENTRAL MA","014":"CENTRAL MA","015":"CENTRAL MA","016":"WORCESTER MA","017":"CENTRAL MA","018":"MIDDLESEX-ESX MA","019":"MIDDLESEX-ESX MA","020":"BROCKTON MA","021":"BOSTON MA","022":"BOSTON MA","023":"BROCKTON MA","024":"NORTHWEST BOS MA","025":"PROVIDENCE RI","026":"PROVIDENCE RI","027":"PROVIDENCE RI","028":"PROVIDENCE RI","029":"PROVIDENCE RI","030":"MANCHESTER NH","031":"MANCHESTER NH","032":"MANCHESTER NH","033":"CONCORD NH","034":"MANCHESTER NH","035":"WHITE RIV JCT VT","036":"WHITE RIV JCT VT","037":"WHITE RIV JCT VT","038":"MANCHESTER NH","039":"SOUTHERN ME","040":"SOUTHERN ME","041":"SOUTHERN ME","042":"SOUTHERN ME","043":"SOUTHERN ME","044":"EASTERN ME","045":"SOUTHERN ME","046":"EASTERN ME","047":"EASTERN ME","048":"SOUTHERN ME","049":"EASTERN ME","050":"WHITE RIV JCT VT","051":"WHITE RIV JCT VT","052":"WHITE RIV JCT VT","053":"WHITE RIV JCT VT","054":"BURLINGTON VT","055":"MIDDLESEX-ESX MA","056":"BURLINGTON VT","057":"WHITE RIV JCT VT","058":"WHITE RIV JCT VT","059":"WHITE RIV JCT VT","060":"HARTFORD CT","061":"HARTFORD CT","062":"HARTFORD CT","063":"HARTFORD CT","064":"HARTFORD CT","065":"HARTFORD CT","066":"WESTCHESTER NY","067":"HARTFORD CT","068":"WESTCHESTER NY","069":"WESTCHESTER NY","070":"DV DANIELS NJ","071":"NEWARK NJ","072":"ELIZABETH NJ","073":"JERSEY CITY NJ","074":"NNJ METRO NJ","075":"NNJ METRO NJ","076":"NNJ METRO NJ","077":"TRENTON NJ","078":"NNJ METRO NJ","079":"DV DANIELS NJ","080":"SOUTH JERSEY NJ","081":"CAMDEN NJ","082":"SOUTH JERSEY NJ","083":"SOUTH JERSEY NJ","084":"ATLANTIC CITY NJ","085":"TRENTON NJ","086":"TRENTON NJ","087":"TRENTON NJ","088":"DV DANIELS NJ","089":"DV DANIELS NJ","090":"APO AE","091":"APO AE","092":"APO AE","093":"APO AE","094":"APO/FPO AE","095":"FPO AE","096":"APO/FPO AE","097":"APO/FPO AE","098":"APO/FPO AE"}'
		);
	return zip3obj[zip3];
}

function doZipcode()
{
	var locationTD = $("th:contains('Location') + td");
	var location = locationTD.text();
	DEBUG && GM_log("location=", location);

	var locationurl = sprintf("https://maps.google.com/maps?hl=en&q=%s&t=m&z=7", encodeURIComponent(location));
	DEBUG && GM_log("locationurl=", locationurl);
	
	locationTD.wrapInner(sprintf("<a href='%s' />", locationurl));
}

function doZipcodePrefix()
{
	var locationTD = $("th:contains('Location') + td");
	var location = locationTD.text();
	DEBUG && GM_log("location=", location);

	var zip3 = location.substr(0,3);	// first 3 digits

	var locationurl = sprintf("http://maps.huge.info/zip3.htm?zip3=%s", zip3);
	DEBUG && GM_log("locationurl=", locationurl);

	var zip3location = getZip3(zip3);
	GM_log("zip3location=" + zip3location);

	locationTD.append(' ' + zip3location);
	
	locationTD.wrapInner(sprintf("<a href='%s' />", locationurl));
}

function doLoanDetail()
{
var DEBUG = debug(false, arguments);

	var loanId = $(".memberHeader").html();
	DEBUG && GM_log("1 loanId=", loanId);

	loanId = loanId.match(/\d+/)
	DEBUG && GM_log("2 loanId=", loanId);

	if(loanId)
		loanId = loanId[0];
	DEBUG && GM_log("3 loanId=", loanId);
	
	false && doZipcode();
	true && doZipcodePrefix();
	
	if(false)	// what would we do with it?
	{
	var employerTD = $("th:contains('Current Employer') + td");
	var employer = employerTD.text();
	DEBUG && GM_log("employer=", employer);

	var employerurl =
		employer == "n/a"
		? null
		: sprintf("https://maps.google.com/maps?hl=en&q=%s", encodeURIComponent(employer + " near: " + location));
	DEBUG && GM_log("employerurl=", employerurl);

	if(employerurl)
		employerTD.wrapInner(sprintf("<a href='%s' />", employerurl));
	}

	var comment = getComment(loanId);

	$(".details-wrapper").first().after(
		sprintf(''
			+ "<label for='commentTextBox'>Comment*</label>"
			+ "<input type='text' class='commentTextBox' name='comment_%s' size='100'>"
			, loanId
		));

	var commentTextBox = $('.commentTextBox');

	commentTextBox.val(comment);

	commentTextBox.on('change',
		function(event)
		{
			DEBUG && GM_log("commentTextBox.addEventListener$change() event=", event);
			setComment(this.name, this.value);
		});

	attachLocalStorageCommentListener();
	
	if(true)
	{
		/* Add links to known notes */
		var noteLinks = getNoteLinks(loanId);
		if(noteLinks)
			$("div#master_content-header :header:first, div#content :header:first")	// h1 on account, h2 on foliofn
				.append(" " + noteLinks);

		GM_log("IRLINKS=", IRLINKS);
		if(IRLINKS)
		$("div#master_content-header :header:first, div#content :header:first")	// h1 on account, h2 on foliofn
			.append(sprintf(" <a href='%s' target='_lcac_ir'>[IR]</a>",
				sprintf("http://www.interestradar.com/loan?LoanID=%s", loanId)));
	}
}

var WAITFORELEMENTTIMEOUT = 500;
function waitForElement(selector, subselector, waitForElement_callback)
{
var DEBUG = debug(false, arguments);

	var element = $(selector);
	var subelement = subselector == null ? element : element.find(subselector);

	if(subelement && subelement.length > 0)
	{
		DEBUG && GM_log(DEBUG + " calling callback()...");
		waitForElement_callback(element, subelement);
		return;
	}

	if($(document).text().match(/504.*Gateway Timeout/))
	{
		DEBUG && GM_log(DEBUG + " found 504");
		return;
	}

	/* loop */
//	DEBUG && GM_log(DEBUG + " looping... WAITFORELEMENTTIMEOUT=" + WAITFORELEMENTTIMEOUT);
	setTimeout(
		function()
		{
			waitForElement(selector, subselector, waitForElement_callback);
		},
		WAITFORELEMENTTIMEOUT);
}

var TABLECANCHANGETIMEOUT = 500;
/* YYY I suspect our reliance on the first row won't work if the table is sortable */
function tableCanChange(table, tbodyselector, tableCanChange_callback)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);
	
	if(table == null)
		throw "tableCanChange() table=" + table;
	if(table.length == 0)
		throw "tableCanChange() table.length=" + table.length;

	var tbody = table.find(tbodyselector);
	DEBUG && GM_log("tbody=", tbody);

//	var trFirst = tbody.find("tr:first");
	var trs = tbody.find("tr");
	if(trs.length == 0)
		trs = null;
	DEBUG && GM_log("trs=", trs, " trs.length=", trs.length);
	
	if(trs)
	{
		if(!trs.hasClass('lcac_tableChangeHandled'))	// seems to get lost when the rows change
		{
			GM_log(FUNCNAME + " table changed");

			trs.addClass('lcac_tableChangeHandled');

			tableCanChange_callback(table, tbody);
		}
	}

	/* loop (if table can change) */
	setTimeout(
		function()
		{
			tableCanChange(table, tbodyselector, tableCanChange_callback);
		},
		TABLECANCHANGETIMEOUT);
}


function setSelectValue(selects, selectValue)
{
	/* ...and select it... */
	selects[0].value = selectValue;

	/* ...but just selecting the value doesn't seem to do it (is there a jquery way to do this?) */
	var evt = document.createEvent("HTMLEvents");
	evt.initEvent("change", true, true);
	selects[0].dispatchEvent(evt);
}

function getCellForColumn(tr, col)
{
var DEBUG = debug(false, arguments);

	var tds = tr.find("td");
	for(index = 0; index < tds.length; index++)
	{
		var td = tds.eq(index);
		var colspan = td.prop('colspan');
		col -= colspan;

		DEBUG && GM_log("colspan=", colspan, " col=", col, " td=", td);

		if(col < 0)
		{
			DEBUG && GM_log("col=", col, " returning td=", td);
			return td;
		}
	}

	DEBUG && GM_log("col=", col, " returning null");
	return null;
}

function getStoredNote(noteId, prop)
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

	var storedData = loadStoredData();

	if(noteId) noteId = ('' + noteId).trim();	// stringify
	
	if(noteId == null || noteId == "")
	{
		DEBUG && printStackTrace(FUNCNAME + " noteId=" + noteId);
		throw FUNCNAME + " noteId=" + noteId;
	}

	var note = storedData.notesByNoteId[noteId];

	if(note == null)
	{
		GM_log("storedData.notesByNoteId=", storedData.notesByNoteId);
		DEBUG && GM_log(FUNCNAME + " note=", note, " noteId=", noteId);
		return null;
	}
	
	if(prop)
	{
		if(prop in note)
			return note[prop];
		else
		{
			DEBUG && GM_log(FUNCNAME + " noteId=", noteId, " note[" + prop + "]=", note[prop], " note=", note);
			return null;
		}
	}

	return note;
}


/*
 * return array of array of string
 */
function csv2Array(csv)
{
var DEBUG = debug(false, arguments, false), FUNCNAME = funcname(arguments);

	DEBUG && GM_log("csv.length=", csv.length);

	var csvArr = csv.split(/\r\n|\r|\n/);

	DEBUG && GM_log("csvArr.length=", csvArr.length);

	var headers = csvArr.shift().split(/,/);	// pop the first element and split it
	for(var index = 0; index < headers.length; index++)	
		headers[index] = headers[index].trim();	// trim the values
	
	DEBUG && GM_log("headers=", headers);

	var retArr = [];

	var line;
	while(line = csvArr.shift())
	{
		DEBUG && GM_log("line=" + line);

		var length = line.length;

		if(length == 0)
			continue;

		var rowarr = [];
		var stringarr = [];
		var inString = false;
		for(var charIndex = 0; charIndex < length; charIndex++)
		{
			var ch = line.charAt(charIndex);

			if(ch == '"')
				inString = !inString;
			else if(!inString && ch == ',')
			{
				var string = stringarr.join('');
				rowarr.push(string);
				stringarr = [];
			}
			else
				stringarr.push(ch);
		}
		
		var string = stringarr.join('');
		rowarr.push(string);
		
		
		/* add properties to match headers */
		for(var rowIndex = 0; rowIndex < rowarr.length; rowIndex++)
		{
			rowarr[rowIndex] = rowarr[rowIndex].trim();	// trim the value

			var header = headers[rowIndex];

			rowarr[header] = rowarr[rowIndex];	// also assign the value as a property on the row
		}

		retArr.push(rowarr);
	}

	DEBUG && GM_log("retArr.length=", retArr.length);
	return retArr;
}

var storedData;
var expireOldData = true;
function loadStoredData()
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);
	DEBUG && timestamp(FUNCNAME, true);

	if(storedData == null)
	{
		printStackTrace("loadStoredData()");

		DEBUG && GM_log(FUNCNAME + " storedData=", storedData);

        storedData = {
            notesByNoteId: {},
            loansByLoanId: {},
            loanId2NoteArray: {},
		};

		DEBUG && timestamp(FUNCNAME, 'HERE 1');
		var noteDataJSONZIP = localStorage.getItem('noteDataZIP');
		DEBUG && timestamp(FUNCNAME, 'HERE 2');
		var loanDataJSONZIP = localStorage.getItem('loanDataZIP');
		DEBUG && timestamp(FUNCNAME, 'HERE 3');
		
		var noteDataJSON = RawDeflate.inflate(noteDataJSONZIP);
		DEBUG && timestamp(FUNCNAME, 'HERE 4');
		var loanDataJSON = RawDeflate.inflate(loanDataJSONZIP);
		DEBUG && timestamp(FUNCNAME, 'HERE 5');
		
		try
		{
			var notesByNoteId = noteDataJSON ? JSON.parse(noteDataJSON) : null;
			DEBUG && timestamp(FUNCNAME, 'HERE 6');
			var loansByLoanId = loanDataJSON ? JSON.parse(loanDataJSON) : null;
			DEBUG && timestamp(FUNCNAME, 'HERE 7');

			/* loanId2Note conversion */
			var loanId2NoteArray = {};
			$.each(notesByNoteId, function(key, note)	// these are properties
			{
				var loanId = '' + note.loanId;	// stringify

				if(!loanId2NoteArray[loanId]) loanId2NoteArray[loanId] = [];
				loanId2NoteArray[loanId].push(note);
//				loanId2NoteArray[loanId] = unique(loanId2NoteArray[loanId]).sort();
			});
			
			DEBUG && timestamp(FUNCNAME, 'HERE 8');
			
			storedData.notesByNoteId = notesByNoteId;
			storedData.loansByLoanId = loansByLoanId;
			storedData.loanId2NoteArray = loanId2NoteArray;
		}
		catch(ex)
		{
			GM_log(FUNCNAME + " ex=", ex, " ", ex.stack);
		}

		if(expireOldData)
		{
			DEBUG && printStackTrace("XXX expireOldData=" + expireOldData);

/*
accrual "0.0"
amountLent "1.26"
interestRate "0.1083"
loanId "357864"
nextPaymentDate "20110828"
noteId "159894"
orderId "1562575"
paymentReceived 1.28
principalRemaining 0
rate "0.1083"
status "Fully Paid"
*/
			$.each(storedData.notesByNoteId, function(index, note)
			{
//				delete note.accrual;
				delete note.nextPaymentDate;
				delete note.principalRemaining;
				delete note.status;
				delete note.paymentHistory;
//				delete note.amountLent;
//				delete note.paymentReceived;
			});
			
			//cleanup old data
			$.each(storedData.loansByLoanId, function(index, loan)
			{
				delete loan.ficoTrend;
				delete loan.paymentHistory;
			});
		}
	}

	return storedData;
}

function saveStoredNotes(notes)
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

	if(!notes)
		printStackTrace("notes=", notes);
	
	loadStoredData(true/*expireOldData*/);	// make sure it's loaded

	for(var index = 0; index < notes.length; index++)
	{
		var note = notes[index];

		var noteId = '' + note.noteId;
		var loanId = '' + note.loanId;

		/* if it doesn't exist then create it */
		if(storedData.notesByNoteId[noteId] == null)
			storedData.notesByNoteId[noteId] = {};

		/* merge the elements (new values overwrite the old ones) */
		$.extend(storedData.notesByNoteId[noteId], note);	

		if(note.interestRate)
		{
			if(storedData.loansByLoanId[loanId] == null)
				storedData.loansByLoanId[loanId] = {};
			storedData.loansByLoanId[loanId].interestRate = note.interestRate;
		}

		if(!storedData.loanId2NoteArray[loanId]) storedData.loanId2NoteArray[loanId] = [];
		storedData.loanId2NoteArray[loanId].push(note);
		storedData.loanId2NoteArray[loanId] = unique(storedData.loanId2NoteArray[loanId]).sort();
	}

	DEBUG && GM_log("storedData.notesByNoteId.keys=", Object.keys(storedData.notesByNoteId).length);
	DEBUG && GM_log("storedData.loansByLoanId.keys=", Object.keys(storedData.loansByLoanId).length);
	DEBUG && GM_log("storedData.loanId2NoteArray.keys=", Object.keys(storedData.loanId2NoteArray).length);

	saveStoredData();	// save it
}

/* kind of slow with the compression so do in the background */
function setLoanFlags(loanId, flags, dosaveStoredData)
{
	setTimeout(function()
	{
		setLoanFlags0(loanId, flags, dosaveStoredData);
	}, 3000);
}

function setLoanFlags0(loanId, flags, dosaveStoredData)
{
var DEBUG = debug(false, arguments);
	if(typeof dosaveStoredData === 'undefined')
		dosaveStoredData = true;

	loadStoredData();

	if(storedData.loansByLoanId[loanId] == null)
		storedData.loansByLoanId[loanId] = {};
	$.extend(storedData.loansByLoanId[loanId], flags);

	/* save a little space by removing falsey values */
	for(var key in storedData.loansByLoanId[loanId])
		if(!storedData.loansByLoanId[loanId][key])	// false, 0, "" are all falsey, null != false but !null = true
			delete storedData.loansByLoanId[loanId][key];

	DEBUG && GM_log("storedData.loansByLoanId[" + loanId + "]=", storedData.loansByLoanId[loanId]);

	if(dosaveStoredData)
		saveStoredData();
}

function saveStoredData()
{
	try
	{
		saveStoredData0();
	}
	catch(ex)
	{
		alert("ex=" + ex);
		GM_log("ex=", ex, " ex.stack=", ex.stack);
	}
}

//convertStoredData();
//
//function convertStoredData()
//{
//var DEBUG = debug(arguments, true);
//
//	GM_log("typeof RawDeflate.deflate=", typeof RawDeflate.deflate);
//
//	var noteDataJSON = localStorage.getItem('noteData');
//	if(noteDataJSON)
//	{
//		DEBUG && GM_log(DEBUG + " noteDataJSON.length=" + noteDataJSON.length + " noteDataJSON=" + noteDataJSON.substr(0,1024) + "...");
//
//		var noteDataJSONZIP = RawDeflate.deflate(noteDataJSON);
//		localStorage.removeItem('noteData');
//		localStorage.setItem('noteDataZIP', noteDataJSONZIP);
//	}
//
//	var loanDataJSON = localStorage.getItem('loanData');
//	if(loanDataJSON)
//	{
//		DEBUG && GM_log(DEBUG + " loanDataJSON.length=" + loanDataJSON.length + " loanDataJSON=" + loanDataJSON.substr(0,1024) + "...");
//
//		var loanDataJSONZIP = RawDeflate.deflate(loanDataJSON);
//		localStorage.removeItem('loanData');
//		localStorage.setItem('loanDataZIP', loanDataJSONZIP);
//	}
//}

function saveStoredData0()
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);
	DEBUG && timestamp(FUNCNAME, true);

	DEBUG && printStackTrace("saveStoredData0()");

	DEBUG && timestamp(FUNCNAME, 'HERE 1');
	var noteDataJSON = JSON.stringify(storedData.notesByNoteId);
	DEBUG && timestamp(FUNCNAME, 'HERE 2');
	var loanDataJSON = JSON.stringify(storedData.loansByLoanId);
	DEBUG && timestamp(FUNCNAME, 'HERE 3');

	DEBUG && GM_log(DEBUG + " noteDataJSON.length=" + noteDataJSON.length);
	false && DEBUG && GM_log(DEBUG + " noteDataJSON=" + noteDataJSON.substr(0,1024) + "...");
	DEBUG && GM_log(DEBUG + " loanDataJSON.length=" + loanDataJSON.length);
	false && DEBUG && GM_log(DEBUG + " loanDataJSON=" + loanDataJSON.substr(0,1024) + "...");

	DEBUG && timestamp(FUNCNAME, 'HERE 4');
	var noteDataJSONZIP = RawDeflate.deflate(noteDataJSON);
	DEBUG && timestamp(FUNCNAME, 'HERE 5');
	var loanDataJSONZIP = RawDeflate.deflate(loanDataJSON);
	DEBUG && timestamp(FUNCNAME, 'HERE 6');
	
	localStorage.setItem('noteDataZIP', noteDataJSONZIP);
	DEBUG && timestamp(FUNCNAME, 'HERE 7');
	localStorage.setItem('loanDataZIP', loanDataJSONZIP);
	DEBUG && timestamp(FUNCNAME, 'HERE 8');
}

function getStoredLoan(loanId)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(loanId == null || $.trim(loanId) == '')
	{
		printStackTrace(FUNCNAME + " loanId=", loanId);
		return null;
	}

	loanId = '' + loanId;	// stringify
	
	loadStoredData();

	var loan = storedData.loansByLoanId[loanId];
	
	if(!loan)
	{
		GM_log(FUNCNAME + " storedData.loansByLoanId[" + loanId + "]=", storedData.loansByLoanId[loanId]);
		return null;
	}

	return loan;
}

function getStoredInterestRateByLoanId(loanId)
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

	var loan = getStoredLoan(loanId);

	if(loan == null)
	{
		DEBUG && GM_log("returning null");
		return null;
	}

	var interestRate = parseFloat(loan.interestRate);

	DEBUG && GM_log("loan.interestRate=" + loan.interestRate);
	DEBUG && GM_log("interestRate=" + interestRate);

	return interestRate;
}

function getStoredNoteForLoanId(loanId)
{
	var notes = getStoredNotesForLoanId(loanId);
	if(notes == null || notes.length == 0)
		return null;
	return notes[0];
}

function getStoredNotesForLoanId(loanId, prop)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(loanId == null || $.trim(loanId) == "")
	{
		printStackTrace(FUNCNAME + " loanId=" + loanId + " loanId=" + loanId);
		throw FUNCNAME + " loanId=" + loanId + " loanId=" + loanId;
	}

	var storedData = loadStoredData();
	
	loanId = '' + loanId;	// stringify

	DEBUG && GM_log("storedData.loanId2NoteArray[" + loanId + "]=", storedData.loanId2NoteArray[loanId]);
	
	return storedData.loanId2NoteArray[loanId];	// an array
}

/*
 * loanId + orderId = ok (noteId unknown)
 * noteId + orderId = bad
 * noteId + loanId + any orderId = ok
 */
function loanPerfURL2(loanId, orderId, noteId, useFoliofnLink)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	/* if we only have to loanId, see if we can find a noteId for it */
	if(typeof loanId == 'object' && typeof orderId == 'undefined' && typeof noteId == 'undefined')
	{
		orderId = loanId.orderId;
		noteId = loanId.noteId;
		if('loanId' in loanId)	// we get this from one place...
			loanId = loanId.loanId;
		else if('loanGUID' in loanId)	// ...and this from another place (e.g. Foliofn)
			loanId = loanId.loanGUID;
		else
			throw FUNCNAME + " loanId=" + loanId;
	}

	var url = sprintf("/%s/loanPerf.action?loan_id=%s&order_id=%s&note_id=%s",
		useFoliofnLink ? 'foliofn' : 'account',
		loanId,
		orderId,
		noteId);

	return url;
}

function loanPerfURL(note, useFoliofnLink)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if('loanId' in note)	// we get this from one place...
		var loanId = note.loanId;
	else if('loanGUID' in note)	// ...and this from another place (e.g. Foliofn)
		loanId = note.loanGUID;
	else
		throw FUNCNAME + " loanId=" + loanId;
	
	var orderId = note.orderId;
	var noteId = note.noteId;

	return loanPerfURL2(loanId, orderId, noteId, useFoliofnLink);
}


/* the noteIds and loanIds we currently hold
 * XXX move this to be expiring data in the regular saved data
 * YYY sessionStorage isn't quite persistent enough for our purposes
 */
var sessionData = {};

function loadSessionData()
{
	if(sessionData.noteIds)
		return;
	
var FUNCNAME = funcname(arguments);
	
	GM_log("loadSessionData() sessionData=", sessionData);

	/* YYY we don't store it this way anymore, so clean it out */
	GM_log(FUNCNAME + " calling removeItem()...");
	localStorage.removeItem('noteIds');
	localStorage.removeItem('loanIds');
	localStorage.removeItem('purchasedPendingLoanIds');
	localStorage.removeItem('purchasedPendingNoteIds');
	localStorage.removeItem('soldPendingLoanIds');
	localStorage.removeItem('soldPendingNoteIds');
	GM_log(FUNCNAME + " calling removeItem()...DONE!");

	try
	{
		var sessionDataString = localStorage.getItem("sessionData");
		GM_log("sessionDataString=", sessionDataString.split());

		var sessionData2 = JSON.parse(sessionDataString);
		GM_log("sessionData2=", sessionData2);

		if(sessionData2 != null)
			sessionData = sessionData2;
	}
	catch(ex)
	{
		GM_log("loadSessionData() ex=", ex);
	}

	GM_log(FUNCNAME + " sessionData=", sessionData);
}

function saveOwnedNotes(notes)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);
	
	var noteIds = {};
	var loanIds = {};

	for(var index = 0; index < notes.length; index++)
	{
		var note = notes[index];

		var noteId = note.noteId;
		var loanId = note.loanId;

		noteIds[noteId] = true;
		loanIds[loanId] = true;
	}

	DEBUG && GM_log("noteIds=", noteIds);
	DEBUG && GM_log("loanIds=", loanIds);

	loadSessionData();

	sessionData.noteIds = noteIds;
	sessionData.loanIds = loanIds;
	
	localStorage.setItem("sessionData", JSON.stringify(sessionData));
}

function saveOwnedNotesPending(sessionData2)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	loadSessionData();

	$.extend(sessionData, sessionData2);	// overwrite
	
	localStorage.setItem("sessionData", JSON.stringify(sessionData));
}


function isNoteSalePending(noteId)
{
	loadSessionData();

	return sessionData.soldPendingNoteIds && sessionData.soldPendingNoteIds[noteId];
}

function isNotePurchasePending(noteId)
{
	loadSessionData();

	return sessionData.purchasedPendingNoteIds && sessionData.purchasedPendingNoteIds[noteId];
}

function isLoanPending(loanId)
{
	loadSessionData();

	return sessionData.purchasedPendingLoanIds && sessionData.purchasedPendingLoanIds[loanId];
}

function isLoanOwned(loanId)
{
	loadSessionData();

	return (sessionData.loanIds && sessionData.loanIds[loanId]) || isLoanPending(loanId);
}

function isNoteOwned(noteId)
{
	loadSessionData();

	return sessionData.noteIds && sessionData.noteIds[noteId];
}

function getNoteLinks(loanId, noteIdSelfRef)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	/* Add links to known notes */
	var noteArray = getStoredNotesForLoanId(loanId);
	if(noteArray == null)
		return null;

	var links = [], links2 = [], links3 = [];

	$.each(noteArray, function(index, note)
	{
		var url = loanPerfURL(note);

        /* push vs unshift = owned notes first */
        if(note.noteId == noteIdSelfRef)
        {
            if(noteArray.length > 1)
                links.push(sprintf("<a href='%s'>[^]</a>", url));
        }
        else if(isNoteOwned(note.noteId))
            links2.push(sprintf("<a href='%s'>[+]</a>", url));
        else
            links3.push(sprintf("<a href='%s'>[-]</a>", url));
	});

	var str = links.join('')
		+ links2.join('')
		+ links3.join('')

	DEBUG && GM_log(FUNCNAME + " str=" + str);

	return str;
}

function parseTrendData(trs)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	/* For example:
<tr>
	<td>750-779</td> <td>February 08, 2010</td>
</tr>
<tr>
	<td>780+</td> <td>March 08, 2010</td>
</tr>
<tr>
	<td>780+</td> <td>April 05, 2010</td>
</tr>
...
<tr>
	<td>499-</td> <td>February 07, 2011</td>
</tr>
	 */

	var values = [];
	var datePrev = null;
	trs.each(function()
	{
		var tds = $(this).find("td");
		var val = tds.eq(0).text();
		val = val.match(/\d+/)[0];
		
		var date = tds.eq(1).text();
		date = dateFormat(new Date(date), '-');
//		GM_log(FUNCNAME + "date=", date);

		if(datePrev == null || date != datePrev)	// there can be duplicates in here
			values.push({val: val, date: date});

		datePrev = date;
	});

	/* YYY sparkline fails if there's just one single value */
	if(values.length == 1)
		values.push(values[0]);

	var vals = [];
	for(var index = 0; index < values.length; index++)
		vals.push(values[index].val);
	values.vals = vals;

	values.finalValue = vals.length > 0 ? vals[vals.length - 1] : null;

	return values;
}

function getComment(comment_loanId)
{
	if(comment_loanId == null || comment_loanId.trim() == "")
	{
		printStackTrace("comment_loanId=" + comment_loanId);
		return null;
	}

	if(!comment_loanId.match(/^comment_/))
		comment_loanId = "comment_" + comment_loanId;

	var comment = localStorage.getItem(comment_loanId);

	if(comment == null)
		return "";

	return comment;
}

	
function calcInterestInMonths(outstandingPrincipal, interestRate, accruedInterest)
{
var DEBUG = debug(true, arguments);

	if(outstandingPrincipal === null || interestRate === null || accruedInterest === null)
	{
		DEBUG && GM_log("returning -99");
		return -99;
	}

	if(interestRate == null || isNaN(interestRate))
	{
		DEBUG && GM_log("calcInterestInMonths() returning NaN, outstandingPrincipal=" + outstandingPrincipal + " interestRate=" + interestRate + " accruedInterest=" + accruedInterest);
		return NaN;
	}

	if(outstandingPrincipal == 0)
	{
		DEBUG && GM_log("calcInterestInMonths() returning 0, outstandingPrincipal=" + outstandingPrincipal + " interestRate=" + interestRate + " accruedInterest=" + accruedInterest);
		return 0;
	}

	var oneMonthsInterest = outstandingPrincipal * interestRate / 12;

	var accruedInterestInMonths = accruedInterest / oneMonthsInterest;

	if(isNaN(accruedInterestInMonths))
	{
		GM_log("calcInterestInMonths() outstandingPrincipal=" + outstandingPrincipal + " interestRate=" + interestRate + " accruedInterest=" + accruedInterest + " oneMonthsInterest=" + oneMonthsInterest + " accruedInterestInMonths=" + accruedInterestInMonths);
	}

	DEBUG && GM_log(DEBUG + " returning " + accruedInterestInMonths);
	return Math.floor(accruedInterestInMonths * 10) / 10;
}

function parseFloat2(val)
{
	if(!val)
		return val;

	val = val.replace(/[$,]/g, '');

	return parseFloat(val);
}

	
GM_log("location.href=" + location.href);
GM_log("document.referrer=" + document.referrer);

function doLoanPerfPart1()
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	var asking_price = location.href.match(/&asking_price=(\d+\.*\d*)/);
	if(asking_price)
		asking_price = parseFloat(asking_price[1]);

	var in_cart = location.href.match(/&in_cart=(\d+)/);
	if(in_cart)
		in_cart = parseInt(in_cart[1]);

	var our_asking_price = location.href.match(/&our_asking_price=(\d+\.*\d*)/);
	if(our_asking_price)
		our_asking_price = parseFloat(our_asking_price[1]);

	var sale_price = location.href.match(/&sale_price=(\d+\.*\d*)/);
	if(sale_price)
		sale_price = parseFloat(sale_price[1]);

	var for_sale = location.href.match(/&for_sale=(\d+)/);
	if(for_sale)
		for_sale = for_sale[1];

	var purchase_price = location.href.match(/&purchase_price=(\d+\.*\d*)/);
	if(purchase_price)
		purchase_price = parseFloat(purchase_price[1]);

	var par_value_at_sale = location.href.match(/&par_value_at_sale=(\d+\.*\d*)/);
	if(par_value_at_sale)
		par_value_at_sale = parseFloat(par_value_at_sale[1]);

	var fee_at_sale = location.href.match(/&fee_at_sale=(\d+\.*\d*)/);
	if(fee_at_sale)
		fee_at_sale = parseFloat(fee_at_sale[1]);

	var loanId = $("input#loanId").val();	// a hidden field
	var orderId = $("input#orderId").val();	// a hidden field
	var noteId = $("input#noteId").val();	// a hidden field
	if(noteId == "") noteId = null;	// can load a loan page with just an orderId and a loanId, in which case this is empty
	
	/* add noteId to title */
	if(noteId)
	{
		var titleHeader = $(":header:contains(Loan id:)");
		GM_log("titleHeader=", titleHeader);

		var titleHeaderHTML = titleHeader.html();
		GM_log("2 titleHeaderHTML=", titleHeaderHTML);

		titleHeaderHTML = titleHeaderHTML.replace(/(\(Loan id: \d+)(\))/, "$1, Note id: " + noteId + "$2");
		GM_log("3 titleHeaderHTML=", titleHeaderHTML);

		titleHeader.html(titleHeaderHTML);
	}

	var accrued_interest = parseFloat2($("th:contains('Accrued Interest') + td").text());

	var loanFraction = parseFloat2($("th:contains('Note Amount') + td").text());
	var lateFees = parseFloat2($("th:contains('Late Fees Received') + td").text());

	var interestRateGradeCell = $("th:contains('Rate') + td");
	var interestRateGrade = interestRateGradeCell.text().match(/(.*?)\s*:\s*([\d\.]+)%/);
	var interestRate = parseFloat(interestRateGrade[2]) / 100;
	var interestGrade = interestRateGrade[1];
	
	if(interestRate == 0.06 && interestGrade != 'A1')
		interestRateGradeCell.attr("title", "Servicemembers Civil Relief Act?");
	else if(false/*XXX do we really need this?*/ && noteId)
	{
		/*YYY sometimes interestRate displayed does not match interestRate in the csv file */
		var note = getStoredNote(noteId);
		if(note)
		{
			GM_log("note.interestRate=", note.interestRate);
			if(note.interestRate != interestRate)
				interestRateGradeCell.attr("title", sprintf("My Notes &gt; Download All &gt; InterestRate=%s", note.interestRate));
		}
	}

	/*
	 * sanity check, minimum interest rate is like 4%
	 * http://www.lendingclub.com/public/how-we-set-interest-rates.action
	 */
	if(interestRate < 0.02)
	{
		GM_log(FUNCNAME + "... loanId=" + loanId + " interestRate=" + interestRate);
		alert(FUNCNAME + " loanId=" + loanId + " interestRate=" + interestRate);
		interestRate = null;
	}

	var termInMonths = parseInt($("th:contains('Term') + td").text().match(/([\d\.]+)/)[1]);
	
	/* for example:
	 * <th>Status</th> <td><span style="color: white; background-color: red;">Charged Off</span> </td> </tr>
	 * <tr> <th>Status</th> <td>Current </td> </tr>
	 */
	var status = $("th:contains('Status') + td").text().replace(/[\n\r\s]+/g, ' ').trim();
	var paymentPlan = status.match(/On Payment Plan/);	// null if no match found

//	GM_log("status=" + status + " " + status.split(''));
//	GM_log("paymentPlan=" + paymentPlan);
	
	if(paymentPlan)
	{
		paymentPlan = true;
		status = status.replace(/On Payment Plan/, "").trim();	// take the payment plan bit out of the status
	}

//	GM_log("status=" + status + "=" + status.split(''));
//	GM_log("paymentPlan=" + paymentPlan);
	
	var issuedDate = $("th:contains('Issued Date') + td").text().replace("/\n/g", " ").trim();
	issuedDate = text2Date(issuedDate);

	var outstandingPrincipal = parseFloat2($("th:contains('Outstanding Principal') + td").text());
		
	var origPaymentAmount =
		floor2Decimals(
			PMT(interestRate / 12, termInMonths, loanFraction) * -1);	// the value is negative

	GM_log("interestRate=" + interestRate + " termInMonths=" + termInMonths + " loanFraction=" + loanFraction);
	GM_log("origPaymentAmount=" + origPaymentAmount);

	var vars = {
		loanId: loanId,
		orderId: orderId,
		noteId: noteId,
		loanFraction: loanFraction,
		lateFees: lateFees,
		interestRate: interestRate,
		termInMonths: termInMonths,
		status: status,
		paymentPlan: paymentPlan,
		outstandingPrincipal: outstandingPrincipal,
		origPaymentAmount: origPaymentAmount,
		issuedDate: issuedDate,
		asking_price: asking_price,
		in_cart: in_cart,
		our_asking_price: our_asking_price,
		sale_price: sale_price,
		for_sale: for_sale,
		purchase_price: purchase_price,
		par_value_at_sale: par_value_at_sale,
		fee_at_sale: fee_at_sale,
		accrued_interest: accrued_interest,
	};
	
	GM_log(FUNCNAME + " vars=", vars);

	return vars;
}

function highlightElements(elements, regex, className, DEBUG)
{
var DEBUG = debug(DEBUG, arguments);

	/*XXX this doesn't work in all cases e.g.
<td>Charged Off
						<br><a href="/account/paymentPlan.action?loan_id=434797&amp;order_id=1457664" onclick="s_objectID=&quot;https://www.lendingclub.com/account/paymentPlan.action?loan_id=434797&amp;order_id=1457664_1&quot;;return this.s_oc?this.s_oc(e):true"><span class="lcac_yellowRev">On Payment Plan</span></a>
						</td>
	*/

	elements
		.filter(function(index, element) {
			return element.childNodes.length == 1 && element.firstChild.nodeType == 3;	// text only nodes (otherwise we could mess up attached functions)
		})
		.each(function(index, element)
		{
			element = $(element);

			var html = element.html();

			var html2 = html.replace(
				regex,
				"<span class='" + className + "'>$1</span>"
			);

			DEBUG && GM_log("html=" + html);
			if(html2 != html)	// only save it if it changed
			{
				DEBUG && GM_log("html2=" + html2);
				element.html(html2);
			}
		});
}


var highlightLoanPerfBAD;
var highlightLoanPerfWARNING;

function highlightLoanPerf()
{
var DEBUG = debug(false, arguments);

	if(!highlightLoanPerfBAD)
	{
		highlightLoanPerfBAD = RegExp("(charged\\s*off|default|deceased|bankrupt\\S*|lawsuit|bankruptcy counsel|external collections|collections|Payment Solutions specialist|Advanced collector|engaged with debt consolidator|skip trace|mail.*letter|cease and desist)", "gi");
		highlightLoanPerfWARNING = RegExp("(Processing...|partial payment|payment failed|\\d+ days late|check payment|grace period|mail service|no voicemail|3rd party|partial payment|not\\s*received|on payment plan|Overdue)", "gi");
	}

	var leafelements = $("div#content-wrap *:not(:has(*)), div#master_content *:not(:has(*))");	// foliofn and LC are different

	// remove leafs that descend from the following elements
	leafelements = leafelements.filter(
		function() {
			var parents = $(this).parents('.log-content, .collectionlog-header');
			return parents.length < 1;	// true means keep
		}
	);

	DEBUG && GM_log("leafelements=", leafelements);

	/*
	 * add some warnings to the top
	 */
	var warning = [], warning2 = [], warning3 = [];
	
	var htmlarr = [];
	// set.html() returns only first element of jQuery set, so we have to loop to get it all
	leafelements.each(function(){
		htmlarr.push($(this).html())
	});
	DEBUG && GM_log("htmlarr=", htmlarr);

	var html = htmlarr.join(" ");
	DEBUG && GM_log("html=" + html);

	html = html.replace(/(\s+)/gm, ' ');	// make one big line for multiline Recoveries match XXX should probably do this a little better
	DEBUG && GM_log("html=" + html);

	if(html.match(/(charged\s*off)/i))
		warning.push(RegExp.$1);

	if(html.match(/(default)/i))
		warning.push(RegExp.$1);

	if(html.match(/(deceased)/i))
		warning.push(RegExp.$1);

	if(html.match(/(lawsuit)/i))
		warning.push(RegExp.$1);

	/* some examples:
	 * Borrower filed for Chapter 13 Bankruptcy
	 * Borrower filed for Chapter 7 Bankruptcy (No Asset)
	 * Borrower provided Bankruptcy counsel information
	 */
	if(html.match(/(chapter[\s\d]*bankruptcy)/i))
		warning.push(RegExp.$1);
	else if(html.match(/(Bankruptcy\s*counsel)/i))
		warning.push(RegExp.$1);

	if(html.match(/(cease and desist)/i))
		warning.push(RegExp.$1);

	if(html.match(/(Advanced collector)/i))
		warning.push(RegExp.$1);

	if(html.match(/(Payment Solutions specialist)/i))
		warning.push(RegExp.$1);

	if(html.match(/(external collections)/i))
		warning.push(RegExp.$1);
	else if(html.match(/(collections)/i))
		warning.push(RegExp.$1);

	if(html.match(/engaged with debt (consolidator)/i))
		warning.push(RegExp.$1);

	if(html.match(/(skip trace)/i))
		warning.push(RegExp.$1);

	if(html.match(/(Processing\.\.\.)/))
		warning2.push(RegExp.$1);
	
	if(html.match(/(On Payment Plan)/))	// not ignore case
		warning2.push(RegExp.$1);
	
	if(html.match(/(check payment)/i))
		warning2.push(RegExp.$1);

	if(html.match(/(grace period)/i))
		warning2.push(RegExp.$1);

	if(html.match(/(Fully Paid)/))
		warning3.push(RegExp.$1);

/* e.g.
<tr> <th>Recoveries</th> <td>$17.04</td> </tr>
*/
	if(html.match(/(Recoveries)[^\$]*\$([\d.]+)/))
	{
		if(parseFloat(RegExp.$2) > 0.00)
			warning3.push(RegExp.$1);
	}

	if(html.match(/(No Fee)/))
		warning3.push(RegExp.$1);

	/* remove any initial slashes */
	warning = warning.join('/').toUpperCase();
	warning2 = warning2.join('/');
	warning3 = warning3.join('/').toUpperCase();

	DEBUG && GM_log("warning=" + warning);
	DEBUG && GM_log("warning2=" + warning2);
	DEBUG && GM_log("warning3=" + warning3);

	highlightElements(leafelements, highlightLoanPerfBAD, 'lcac_redRev');
	highlightElements(leafelements, highlightLoanPerfWARNING, 'lcac_yellowRev');


	$("div#noFee:contains('No Fee:')").addClass("lcac_greenrev");
	$("tr:contains('Recoveries')").not(":contains('$0.00')").addClass("lcac_greenrev");

	if(warning != '')
		warning = '<br><span class="lcac_red">' + warning + '</span>';

	if(warning2 != '')
		warning2 = '<br><span class="lcac_yellow">' + warning2 + '</span>';
	
	if(warning3 != '')
		warning3 = '<br><span class="lcac_green">' + warning3 + '</span>';

	// append warnings to Loan Performance header
	$(":header:contains('Loan Performance')")
		.append(''
			+ warning
			+ warning2
			+ warning3
			);
}

getLoanId.DEBUGCOUNT = -1;
/* extract the loanId */
function getLoanId(tr, loanIdColumnIndex, loanIdEmbeddedColumnIndex)
{
var DEBUG = debug(true, arguments);
DEBUG && getLoanId.DEBUGCOUNT++;

	try
	{
		var tds = tr.find("td");

		var loanId = null;
		if(loanIdEmbeddedColumnIndex != null)	//XXX this is wrong for completeLoanPurchase.action
		{
			var td = tds.eq(loanIdEmbeddedColumnIndex);
			DEBUG && getLoanId.DEBUGCOUNT < 10 && GM_log("td=", td);

			var html = td.html();
			DEBUG && getLoanId.DEBUGCOUNT < 10 && GM_log("html=", html);

			var loanId = html.match(/loan_id=(\d+)/);	// extract the loanId from the anchor URL

			if(loanId)
				loanId = loanId[1];

			if(loanId == "")
				loanId = null

			DEBUG && getLoanId.DEBUGCOUNT < 10 && GM_log("getLoanId() loanId=", loanId);
		}

		if(loanId == null && loanIdColumnIndex != null)
		{
			var td = tds.eq(loanIdColumnIndex);
			DEBUG && getLoanId.DEBUGCOUNT < 10 && GM_log("tds.eq(loanIdColumnIndex)=", tds.eq(loanIdColumnIndex));

			var text = td.text();
			DEBUG && getLoanId.DEBUGCOUNT < 10 && GM_log("tds.eq(loanIdColumnIndex).text()=" + tds.eq(loanIdColumnIndex).text());

			var loanId = text.match(/(\d+)/)[1];			// extract the loanId from the HTML text

			if(loanId == "")
				loanId = null;

			DEBUG && getLoanId.DEBUGCOUNT < 10 && GM_log("loanId=", loanId);
		}

		if(loanId == null)
			throw "getLoanId() loanId=" + loanId;

		if(!loanId.match(/^\d+$/))
			throw "getLoanId() loanId=" + loanId;

		return loanId;
	}
	catch(ex)
	{
		GM_log("getLoanId() ex=", ex);
		GM_log("typeof ex.stack=" + typeof ex.stack);
		GM_log("ex.stack=" + ex.stack);
		GM_log("tr=", tr);
		return null;
	}
}

function getNoteId(tr, noteIdColumnIndex, noteIdEmbeddedColumnIndex)
{
var DEBUG = debug(true, arguments);

	try
	{
		var tds = tr.find("td");
		DEBUG && GM_log("tds=", tds);
		DEBUG && GM_log("noteIdEmbeddedColumnIndex=", noteIdEmbeddedColumnIndex);

		var noteId = null;
		if(noteIdEmbeddedColumnIndex != null)
		{
			var td = tds.eq(noteIdEmbeddedColumnIndex);

			var html = td.html();
			DEBUG && GM_log("html=", html);

			var noteId = html.match(/note_id=(\d+)/);	// extract the noteId from the anchor URL
			
			DEBUG && GM_log("2 noteId=", noteId);

			if(noteId)
				noteId = noteId[1];

			if(noteId == "")
				noteId = null

		}
			
		DEBUG && GM_log("3 noteId=", noteId);
		DEBUG && GM_log("noteIdColumnIndex=", noteIdColumnIndex);

		if(noteId == null && noteIdColumnIndex != null)
		{
			var td = tds.eq(noteIdColumnIndex);

			var text = td.text();

			var noteId = text.match(/(\d+)/);			// extract the noteId from the HTML text
			
			DEBUG && GM_log("4 noteId=", noteId);

			if(noteId)
				noteId = noteId[1];
			
			DEBUG && GM_log("5 noteId=", noteId);

			if(noteId == "")
				noteId = null;
		}

		if(noteId == null)
		{
			GM_log("returning noteId=" + noteId);
			return null;
		}

		if(!noteId.match(/^\d+$/))
		{
			GM_log("/^\\d+$/ no match, returning null, noteId=" + noteId);
			return null;
		}

		return noteId;
	}
	catch(ex)
	{
		GM_log("getNoteId() ex=", ex);
		GM_log("typeof ex.stack=" + typeof ex.stack);
		GM_log("ex.stack=" + ex.stack);
		GM_log("tr=", tr);
		return null;
	}
}

function parseInterestRate(loanId, text)
{
var DEBUG = debug(false, arguments);

	if(!text)
		return null;

	if(text.match(/Not Stored/))
	{
		printStackTrace("Not stored");
		return null;
	}

	DEBUG && GM_log("parseInterestRate() loanId=", loanId, " text=", text);

//	var text2 = text.match(/(\d+|\d+\.{0,1}\d+)%/)[1];
	var text2 = text.match(/(\d+(.\d+)*)%/)[1];
	
	DEBUG && GM_log("text2=", text2);

	var interestRate = parseFloat(text2) / 100;
	
	DEBUG && GM_log("interestRate=", interestRate);

	if(isNaN(interestRate) || interestRate < 0.05)
	{
		GM_log("parseInterestRate()... loanId=" + loanId + " text=" + text + " interestRate=" + interestRate);
		return null;
	}

	return interestRate;
}

function scanLoanPerf(loanId, dom, vars, dosaveStoredData)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	var outstandingPrincipal = parseFloat2(dom.find("th:contains(Outstanding Principal) + td").text());
	DEBUG && GM_log("outstandingPrincipal=", outstandingPrincipal);

	var inProcessing = dom.find("table#lcLoanPerfTable1 tr:contains(Processing...)");
	if(inProcessing.length > 0)
		inProcessing = inProcessing.text().match(/\d+\/\d+\/\d+/);
	else
		inProcessing = null;

	var noFee = dom.find("div#noFee:contains(No Fee)");
	noFee = noFee.length > 0;

	/* all charged off loans have a Recoveries field, but it's often just $0.00 */
	var recoveries = dom.find("th:contains(Recoveries) + td");
	if(recoveries.length > 0)
		recoveries = parseFloat2(recoveries.text());	// remove the dollar sign
	else
		recoveries = null;
	
	var lateFees = dom.find("th:contains(Late Fees Received) + td");
	lateFees = parseFloat2(lateFees.text());	// remove the dollar sign

	var status = dom.find("th:contains(Status) + td").text();

	var chargedOffDefault = status.match(/(charged\s*off|default)/i);	// charged off and default do not appear here
	DEBUG && GM_log("chargedOffDefault=", chargedOffDefault);
	if(chargedOffDefault)
		chargedOffDefault = chargedOffDefault[0];
	else
		chargedOffDefault = null;
	
	var paymentPlan = status.match(/On Payment Plan/i);
	DEBUG && GM_log("paymentPlan=", paymentPlan);
	paymentPlan = paymentPlan != null;	// match returns array.length > 0 or null, right?
	
	/* Parse the Collection log
	 * Note: Collection Log can be non-existent
	 */
	var collectionLogText = dom.find("div#lcLoanPerf2").text();
	var bankruptDeceased = collectionLogText.match(/charged\s*off|deceased|chapter.*?bankrupt\w*|lawsuit/ig);
	if(bankruptDeceased)
		bankruptDeceased = bankruptDeceased.join(',').toLowerCase();
	DEBUG && GM_log("bankruptDeceased=", bankruptDeceased);

	var ficoTrend = parseTrendData(dom.find("table#trend-data tbody tr"));
	DEBUG && GM_log("ficoTrend=", ficoTrend);
	
	/*YYY ficoTrend appears to always have at least 2 values in the trend
	 * 2014-07-19: or not. e.g. this one is empty: https://www.lendingclub.com/foliofn/browseNotesLoanPerf.action?showfoliofn=true&loan_id=8474597&order_id=30275929&note_id=33143749
	 */

	var fico = ficoTrend.finalValue;

	if(ficoTrend.length >= 2)
	{
		var ficoPrev = ficoTrend[ficoTrend.length - 2].val;
		
		var ficoDrop = (fico - 400) - (ficoPrev - 400);
		var ficoDropPercent = ficoDrop / (ficoPrev - 400);
		DEBUG && GM_log("ficoDrop=", ficoDrop, " ficoDropPercent=", ficoDropPercent);
		ficoDrop = ficoDropPercent < -FICODROPPERCENT ? ficoDrop : null;
	}
	else
	{
		var ficoPrev = -1;
		var ficoDrop = 0;
		var ficoDropPercent = 0;
	}
	
	var recentCreditScore = parseInt(dom.find("th:contains(Recent Credit Score) + td").text());
	GM_log("recentCreditScore=", recentCreditScore, " ficoTrend.finalValue=", ficoTrend.finalValue);
	if(ficoTrend.finalValue != recentCreditScore)
	{
		GM_log("FICO MISMATCH ficoTrend.finalValue=" + ficoTrend.finalValue + " recentCreditScore=" + recentCreditScore);
	}
	
	$.extend(vars, {
		noFee: noFee,
		recoveries: recoveries,
		lateFees: lateFees,
		paymentPlan: paymentPlan,
		chargedOffDefault: chargedOffDefault,
		bankruptDeceased: bankruptDeceased,
		fico: fico,
		ficoDrop: ficoDrop,
		inProcessing: inProcessing,
		outstandingPrincipal: outstandingPrincipal,
		recentCreditScore: recentCreditScore,
	});
	
	setLoanFlags(loanId, vars, dosaveStoredData);

	GM_log(FUNCNAME + " vars=", vars);
	
	return ficoTrend;
}

function updateCommentTextBoxes(comment_loanId, comment)
{
var DEBUG = debug(false, arguments);

	var commentTextBoxes = $(sprintf("input.commentTextBox[name='%s']", comment_loanId));

	DEBUG && GM_log("commentTextBoxes=", commentTextBoxes);

	if(commentTextBoxes.length == 0)
		return;

	commentTextBoxes.val(comment);
}

function setComment(comment_loanId, comment)
{
var DEBUG = debug(false, arguments);

	if(comment_loanId != null) comment_loanId = comment_loanId.trim();
	if(comment == null) comment = ""; else comment = comment.trim();

	if(comment_loanId == null || comment_loanId == "")
	{
		printStackTrace("comment_loanId=" + comment_loanId);
		return;
	}

	if(!comment_loanId.match(/^comment_/))
		comment_loanId = "comment_" + comment_loanId;

	DEBUG && GM_log("comment_loanId=", comment_loanId);

	if(comment == "")
		localStorage.removeItem(comment_loanId);	// this will call the window's 'storage' listeners
	else
		localStorage.setItem(comment_loanId, comment);	// this will call the window's 'storage' listeners
	

	/* NOTE: localStorage only notifies other pages, so we'll call this here
	 * in case we have multiple notes for the same loan on our page
	 */
	updateCommentTextBoxes(comment_loanId, comment);
}

function attachLocalStorageCommentListener()
{
var DEBUG = debug(false, arguments);

	if(attachLocalStorageCommentListener.listenerAlreadyAdded == true)
		return;

	attachLocalStorageCommentListener.listenerAlreadyAdded = true;

	// NOTE: can have more than 1 textbox with the same loanId
//	$(window).bind('storage',	//XXX this gets events but doesn't have key?
	unsafeWindow.addEventListener('storage',
		function(event)
		{
			DEBUG && GM_log("unsafeWindow.addEventListener$storage() event=", event);

			var key = event.key;

			if(key.match(/^comment_/))
			{
				var comment_loanId = key;
				var comment = getComment(comment_loanId);

				updateCommentTextBoxes(comment_loanId, comment);
			}
		});
}

function importLocalStorage(jsonString)
{
var DEBUG = debug(false, arguments);

	var obj = JSON.parse(jsonString);

	DEBUG && GM_log("obj.noteData=", obj.noteData);
	DEBUG && GM_log("obj.loanData=", obj.loanData);

	$.extend(storedData.notesByNoteId, obj.noteData);	// merge these
	$.extend(storedData.loansByLoanId, obj.loanData);

	delete obj.noteData;
	delete obj.loanData;

	saveStoredData();
	
	$.extend(localStorage, obj);	// overwrite these (comments)
}
		
function getLocalStorage()
{
var DEBUG = debug(false, arguments);

	loadStoredData();

	var obj = {};
	
	for(var key in localStorage)
	{
		if(key.match(/^comment_/))
		{
			var comment = localStorage.getItem(key);
			obj[key] = comment;
		}
	}

	obj.noteData = storedData.notesByNoteId;	// this is all regenerated isn't it?
	obj.loanData = storedData.loansByLoanId;
	
	return obj;
}
	
function exportLocalStorage()
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);
	
	if($.browser.mozilla)	
	{
		/* new way for mozzila: open About page with window name and we'll catch it in the href handler */
		GM_log("new way for mozilla");

		var exportWindow = window.open("/public/about-us.action", "LCAC_exportLocalStorage");
		DEBUG && GM_log(FUNCNAME + " exportWindow=", exportWindow);

		if(exportWindow == null)
			alert("Could not open a new window. Are popups blocked?");

		return;
	}

	/* old way: open a window and write to it */
	var exportWindow = window.open('', "_blank");
	if(exportWindow == null)
	{
		alert("Could not open a new window. Are popups blocked?");
		return;
	}

	exportWindow.document.write(''
		+ "<head>"
		+ "<title>Export Comments</title>"
		+ "<meta name='content-disposition' content='inline; filename=exportLocalStorage.json'>"
		+ "</head><body>"
//		+ "<pre>"	// this prevents wordwrap :-(
		);
			
	var commentsEtc = getLocalStorage();
	var commentsEtcJSONString = JSON.stringify(commentsEtc, null/*filter*/, 4/*indent*/);

	exportWindow.document.write("<pre>");
	exportWindow.document.write(commentsEtcJSONString);
	exportWindow.document.close();
}

function checkWARNINGACCEPTED()
{
	var WARNINGACCEPTED = getStoredValue("WARNINGACCEPTED");
	if(WARNINGACCEPTED)
		return true;

	var ret = prompt("You use Auto Adjust at your OWN RISK! Always check and double-check values before submitting!! Initial here that you understand and agree, then hit OK.\n\n! ! ! OTHERWISE HIT CANCEL ! ! !")

//	GM_log("ret=" + ret);

	if(ret != null)
		ret = ret.trim();

	if(!ret)	// null or blank
	{
		throw "checkWARNINGACCEPTED() Warning not accepted";
		return false;
	}
	else
	{
		setStoredValue("WARNINGACCEPTED", ret + " " + new Date());

		WARNINGACCEPTED = getStoredValue("WARNINGACCEPTED");
//		GM_log("WARNINGACCEPTED=" + WARNINGACCEPTED);

		return false;	// warning dialog interferes with timeout markup updater
	}
}

function scanForLoanPerfLinks(dom, dosaveStoredNotes)
{
var DEBUG = debug(false, arguments);

	if(typeof dosaveStoredNotes == 'undefined')
		dosaveStoredNotes = true;

	/* don't need Expired & Removed Notes */
	var loanPerfLinks = dom.find("a[href*='loanPerf.action?loan_id=']");

	var notes = [];
	
	loanPerfLinks.each(function loanPerfLinks_each()
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		var href = $(this).prop('href');

		var loanId = href.match(/loan_id=(\d+)/)[1];
		var orderId = href.match(/order_id=(\d+)/)[1];
		var noteId =  href.match(/note_id=(\d+)/);
		if(noteId) noteId = noteId[1];

		/* in older version of tradingAccount.action note_id is not in the link XXX handle this better? */
		if(!noteId)
		{
			GM_log(FUNCNAME + " noteId=", noteId);
			return;
		}

		var note = {
				noteId: noteId,
				loanId: loanId,
				orderId: orderId,
			};

		notes.push(note);
	});

	if(dosaveStoredNotes)
		saveStoredNotes(notes);

	return notes;
}

function getAvailableCash(getAvailableCash_callback)
{
var FUNCNAME = funcname(arguments);

	var url = '/browse/cashBalanceAj.action?rnd=' + new Date().getTime();
	$.get(url, function(data)	/* callback */
	{
		if(!data || data == "")
		{
			getAvailableCash_callback(null);
			return;
		}

		data = $.parseJSON(data);
			
		var availableCash = data.cashBalance.replace(/[\$,]/g, '');	// remove dollar signs and commas

		GM_log(FUNCNAME + " data", data, " availableCash=", availableCash);

		getAvailableCash_callback(availableCash);

	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		GM_log("cashBalanceAj error textStatus=", textStatus, " errorThrown=", errorThrown);
		getAvailableCash_callback(null);
	});
}

function calcPending(table, addclass, pendingLoanIds, pendingNoteIds)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(!table)
		throw FUNCNAME + " table=" + table;

	var orderStatusColumnIndex = table.find("thead th:contains(Order Status)").index();
	var priceColumnIndex = table.find("thead th:contains(Price)").index();
	var noteStatusColumnIndex = table.find("thead th:contains(Note Status)").index();
	GM_log("orderStatusColumnIndex=", orderStatusColumnIndex, " priceColumnIndex=", priceColumnIndex);

	var pendingTotal = 0;

	/* It's possible Note Title could have the word "pending" in it */
	var elements = table.find("tbody tr td:nth-child(" + (orderStatusColumnIndex + 1) + "):contains(Pending)");

	elements
		.each(function(index, element)
		{
			var orderStatusElement = $(element);
			
			if(pendingLoanIds)
			{
				var noteStatusElement = orderStatusElement.closest("tr").find("td:eq(" + noteStatusColumnIndex + ")")

				var loanId = noteStatusElement.html().match(/loan_id=(\d+)/)[1];
				pendingLoanIds[loanId] = true;

				var noteId = noteStatusElement.html().match(/note_id=(\d+)/)[1];
				pendingNoteIds[noteId] = true;
			}

			var priceElement = orderStatusElement.closest("tr").find("td:eq(" + priceColumnIndex + ")")

			var value = priceElement.text().match(/\d+.\d+/);
			value = parseFloat(value);
			pendingTotal += value;
		});

	GM_log("pendingLoanIds=", pendingLoanIds);
	GM_log("pendingNoteIds=", pendingNoteIds);
	
	if(addclass)
		elements.addClass(addclass)

	GM_log(FUNCNAME + " pendingTotal=", pendingTotal, " pendingLoanIds=", pendingLoanIds);
	return pendingTotal;
}
						
function ffnRemoveFromCart(loanId, noteId, callback)
{
/*
 * e.g. /foliofn/removeFromCartAj.action?loan_id=802098&note_id=5356035
 */
	var url = "/foliofn/removeFromCartAj.action";
	var params =
		sprintf("loan_id=%d&note_id=%d",
			loanId, noteId);

	GM_log("url=" + url);
	GM_log("params=" + params);

	$.post(url, params, function ffnRemoveFromCart_get_success(data, textStatus, jqXHR)
	{
		GM_log("ffnRemoveFromCart_get_success() data=", data);
		if(!data.completionSuccess)
		{
			alert("completionSuccess=" + data.completionSuccess+ " data=" + (data ? JSON.stringify(data) : data));
		}

		callback();
	});
}

/*
 * a 2 step process:
 * 1. add the note to the cart
 * 2. add the cart to the order
 */
function ffnAddToCart(noteId, checked, callback)
{
/*
 * e.g. /foliofn/noteAj.action?s=true&si=32&ps=1&ni=5356035&rnd=1390428779802
 * si is row number in the list, starting at 0. unnecessary
 * rnd looks like milliseconds since unix epoch
 * ps is always 1
 * 2014-12-23 no longer working, what did they change?
 */
	var url = "/foliofn/noteAj.action";
	var params =
//		sprintf("s=%s&si=46&ps=1&ni=%d&rnd=%d",
		sprintf("s=%s&ps=1&ni=%d&rnd=%d",
			checked ? 'true' : 'false',
			noteId,
			new Date().getTime() * 1000);

	$.get(url, params, function ffnAddToCart_get_success(data, textStatus, jqXHR)
	{
		GM_log("ffnAddToCart_get_success() data=", data);
		// data.selectNoteResult always equals 0? what's the point?

		ffnAddToCart2(checked, callback);
	});
}

function ffnAddToCart2(checked, callback)
{
/*
 * e.g. /foliofn/addToCartAj.action?rnd=1390428882516
 */
	var url = "/foliofn/addToCartAj.action";
	var params =
		sprintf("rnd=%d",
			new Date().getTime() * 1000);

	$.get(url, params, function ffnAddToCart2_get_success(data, textStatus, jqXHR)
	{
		GM_log("ffnAddToCart2_get_success() data=", data);
		if(checked && data.cartSize == 0)	// if we checked one the cartSize should be > 0
		{
			alert("checked=" + checked + " data=" + data ? JSON.stringify(data) : data);
		}

		callback();
	});
}

			
function ffnAddToSellOrder(noteId, checked, callback)
{
var DEBUG = debug(true, arguments);

	var url = "/foliofn/updateLoanCheckBoxAj.action";

	noteId = parseInt(noteId);	// strings get rejected?

	/*
	 * 2014-12-21, e.g: random=asdf&json=[{"noteId":3108074,"remove":false}]
	 */

	var obj = {
		noteId: noteId,
		remove: !checked
	};
	DEBUG && GM_log("obj=", obj);
	obj = [obj];	//they want an array of objects

	var json = JSON.stringify(obj);
	DEBUG && GM_log("json=" + json);

	var params = sprintf("random=%s&json=%s", "asdf", json);
				
	GM_log("url=" + url + " params=" + params);

	$.post(url, params,
		function post_callback(data, textStatus, jqXHR)
		{
			GM_log("post_callback() data=", data, " textStatus=" + textStatus + " jqXHR=", jqXHR);

			callback(data, textStatus, jqXHR);
		});
}

function allowMiddleClickToWorkAgain(notesTable)
{
	/*YYY allow ctrl-click/shift-click to work on this table in chrome */
	tableCanChange(notesTable, "tbody.yui-dt-data", function(table, tbody)
	{
		tbody.find("a.expand-loan-details")
			.click(function(evt)
//						.on('click', function(evt) 		// http://bugs.jquery.com/ticket/11485
			{
				var element = $(this);
				var href = $(element).prop('href');

				var loanId = href.match(/loan_id=(\d+)/)[1];

				if(evt.ctrlKey || evt.shiftKey)
				{
					evt.stopPropagation();
				}
			});
	});
}

function findHeadersCheckCells(notesTable, colorCellsFunc, tableCanChange, flags)
{
var DEBUG = debug(true, arguments);
DEBUG && timestamp(arguments, true);

	findHeaders0(notesTable,
		flags.addCommentColumn, flags.addLoanIdColumn, flags.addInterestRateColumn, flags.addMarkupColumn, flags.addIRRColumn,
		flags.addHideRowsCheckBoxes,
		flags.addDeleteRowButton,
		flags.addNoteIdColumn);

	DEBUG && timestamp(arguments, "1");

	checkCells0(notesTable, colorCellsFunc, tableCanChange,
		flags.addCommentColumn, flags.addLoanIdColumn, flags.addInterestRateColumn, flags.addMarkupColumn, flags.addIRRColumn,
		flags.addDeleteRowButton,
		flags.addNoteIdColumn);

	DEBUG && timestamp(arguments, "2");
}


function findHeaders0(notesTable,
	addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
	addHideRowsCheckBoxes,
	addDeleteRowButton,
	addNoteIdColumn)
{
var DEBUG = debug(false, arguments);
	var notesTable0 = notesTable.get(0);

	DEBUG && GM_log("notesTable0=", notesTable0);

	findHeaders00(notesTable0);

	addHeaders0(notesTable0,
		addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
		addHideRowsCheckBoxes,
		addDeleteRowButton,
		addNoteIdColumn);

	findHeaders00(notesTable0);
}

function findHeaders00(notesTable0)
{
var DEBUG = debug(true, arguments);

	// null these out in case they were set before
	var columnIndexes = {};

	//XXX jquerify this and the headers below?
	notesTable0.loanIdEmbeddedColumnIndex =
	notesTable0.noteIdEmbeddedColumnIndex =
	notesTable0.loanIdColumnIndex =
	notesTable0.noteIdColumnIndex =
	notesTable0.commentColumnIndex =
	notesTable0.askingPriceColumnIndex =
	notesTable0.salePriceColumnIndex =
	notesTable0.purchasePriceColumnIndex =
	notesTable0.orderExpiresColumnIndex =
	notesTable0.ytmColumnIndex =
	notesTable0.irrColumnIndex =
	notesTable0.accruedInterestColumnIndex =
	notesTable0.markupColumnIndex =
	notesTable0.outstandingPrincipalColumnIndex =
	notesTable0.termColumnIndex =
	notesTable0.principalPlusColumnIndex =
	notesTable0.remainingPaymentsColumnIndex =
	notesTable0.loanStatusColumnIndex =
	notesTable0.interestRateColumnIndex =
	notesTable0.investmentColumnIndex =
	notesTable0.paymentsReceivedColumnIndex =
	notesTable0.orderStatusColumnIndex =
		undefined;

	var ths = notesTable0.tHead;
	if(ths) ths = ths.rows[0];
	if(ths) ths = ths.cells;
	(DEBUG &&ths == null) && GM_log("ths=", ths);

	/* Find all the headers and remember them for later XXX yes, is ugly global variables */
	for(var index0 = index = 0; index0 < ths.length; index0++, index++)
	{
		var th = ths[index0];

		if($(th).hasClass('hidden'))	//2014-08 they've added a hidden 0th column to the sell pricing page?
		{
			DEBUG && GM_log("hidden column, skipping")
			index--;
			continue;
		}


//		var innerHTML = th.innerHTML;
		var innerHTML = $("<div>").append(th.cloneNode(true)).html();	// outerHTML per http://stackoverflow.com/questions/1700870/how-do-i-do-outerhtml-in-firefox // true per https://developer.mozilla.org/en-US/docs/DOM/Node.cloneNode (worked in firefox, not in chrome)

		innerHTML =
			innerHTML
				.replace(/\<br\>/gi, ' ')	// html break
				.replace(/&nbsp;/gi, ' ')	// html non-breaking space
				.replace(/[\n\r\s]+/gi, ' ');	// newlines and strings of spaces

		var text = $(th).text();

		DEBUG && GM_log(''
			+ "index=" + index + " "
			+ "text=" + "'" + text + "'"
			+ "innerHTML=" + "'" + innerHTML + "'" + " "
			);

		// WARNING: "Principal + Interest" might contain <span title="Outstandng Principal and Accrued Interest">
		// WARNING: "Note ID" might contain <th class="loanID">Note ID</th>
		if(innerHTML.match(/Order\s*Status/i))
		{
			if(notesTable0.orderStatusColumnIndex != null) GM_log("notesTable0.orderStatusColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.orderStatusColumnIndex = index;
		}
		else if(innerHTML.match(/loan_status|Status|Note\s+Status|class="status"|th-NoteStatus/))	// sometimes "Status" is the link, but other places have Order Status
		{
			if(notesTable0.loanStatusColumnIndex != null) GM_log("notesTable0.loanStatusColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.loanStatusColumnIndex = index;
			notesTable0.loanIdEmbeddedColumnIndex = index;
			notesTable0.noteIdEmbeddedColumnIndex = index;
		}
		else if(innerHTML.match(/titleAndPurpose/i))	// sometimes title is the link
		{
			if(notesTable0.loanIdEmbeddedColumnIndex != null) GM_log("notesTable0.loanIdEmbeddedColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.loanIdEmbeddedColumnIndex = index;
			notesTable0.noteIdEmbeddedColumnIndex = index;
		}
		else if(innerHTML.match(/loanGUID|Loan\s+ID/i))	// loanId is class on some Note Id columns, e.g. tradingAccount.action
		{
			if(notesTable0.loanIdColumnIndex != null) GM_log("notesTable0.loanIdColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.loanIdColumnIndex = index;
		}
		else if(innerHTML.match(/Order\s+Expires/i))
		{
			if(notesTable0.orderExpiresColumnIndex != null) GM_log("notesTable0.orderExpiresColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.orderExpiresColumnIndex = index;
		}
		else if(innerHTML.match(/markup_discount|markup/i))
		{
			if(notesTable0.markupColumnIndex != null) GM_log("notesTable0.markupColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.markupColumnIndex = index;
		}
		else if(innerHTML.match(/ytm/))
		{
			if(notesTable0.ytmColumnIndex != null) GM_log("notesTable0.ytmColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.ytmColumnIndex = index;
		}
		else if(innerHTML.match(/IRR/))
		{
			if(notesTable0.irrColumnIndex != null) GM_log("notesTable0.irrColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.irrColumnIndex = index;
		}
		else if(innerHTML.match(/\bopa\b|\bopi\b|Principal\s+(\+\s+)*Interest/i))
		{
			if(notesTable0.principalPlusColumnIndex != null) GM_log("notesTable0.principalPlusColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.principalPlusColumnIndex = index;
		}
		else if(text.match(/Term/i))
		{
			if(notesTable0.termColumnIndex != null) GM_log("notesTable0.termColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.termColumnIndex = index;
		}
		else if(innerHTML.match(/outstanding_principal|outstanding-principal|principalRemaining|Outstanding\s+Principal/i))
		{
			if(notesTable0.outstandingPrincipalColumnIndex != null) GM_log("notesTable0.outstandingPrincipalColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.outstandingPrincipalColumnIndex = index;
		}
		else if(innerHTML.match(/asking_price|Asking.*Price/i))
		{
			if(notesTable0.askingPriceColumnIndex != null) GM_log("notesTable0.askingPriceColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.askingPriceColumnIndex = index;
		}
		else if(innerHTML.match(/Sale\s+Price/i))
		{
			if(notesTable0.salePriceColumnIndex != null) GM_log("notesTable0.salePriceColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.salePriceColumnIndex = index;
		}
		else if(innerHTML.match(/Purchase\s+Price/i))
		{
			if(notesTable0.purchasePriceColumnIndex != null) GM_log("notesTable0.purchasePriceColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.purchasePriceColumnIndex = index;
		}
		else if(innerHTML.match(/accrued_interest|Accrued\s+Interest/i))
		{
			if(notesTable0.accruedInterestColumnIndex != null) GM_log("notesTable0.accruedInterestColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.accruedInterestColumnIndex = index;
		}
		else if(innerHTML.match(/remaining_pay|Remaining\s+Payments/i))
		{
			if(notesTable0.remainingPaymentsColumnIndex != null) GM_log("notesTable0.remainingPaymentsColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.remainingPaymentsColumnIndex = index;
		}
		else if(innerHTML.match(/Interest\s+Rate|Stored\s+Rate/i))	// some headers have <br> and newlines in them
		{
			if(notesTable0.interestRateColumnIndex != null) GM_log("notesTable0.interestRateColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.interestRateColumnIndex = index;
		}
		else if(innerHTML.match(/Investment/i))
		{
			if(notesTable0.investmentColumnIndex != null) GM_log("notesTable0.investmentColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.investmentColumnIndex = index;
		}
		else if(innerHTML.match(/Payments\s+Received|Payments\s+To\s+Date/i))
		{
			if(notesTable0.paymentsReceivedColumnIndex != null) GM_log("notesTable0.paymentsReceivedColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.paymentsReceivedColumnIndex = index;
		}
		else if(innerHTML.match(/Comment\*/))
		{
			if(notesTable0.commentColumnIndex != null) GM_log("notesTable0.commentColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.commentColumnIndex = index;
		}
		else if(innerHTML.match(/Note\s+ID/i))
		{
			if(notesTable0.noteIdColumnIndex != null) GM_log("notesTable0.noteIdColumnIndex not null, index=" + index + " innerHTML=" + innerHTML);
			notesTable0.noteIdColumnIndex = index;
		}
		else if(innerHTML.match(/Note\s+Title|Portfolio|Term|Payment\s+Due|Trade\s+ID|Date|Transaction\s+Fee|Days\s+Since\s+Payment|Credit\s+Score\s+Change|alreadySelected|rateAndAmountRequested|th-fico|unfundedAmountCell|timeAndAmountLeft|totalAmount|th-checkboxes|origNoteAmnt|creditScore|select-all/i))
		{
			// don't care
		}
		else
		{
			GM_log("findHeaders00() unhandled th=", th, " innerHTML=", innerHTML, " th.innerHTML=", th.innerHTML);
		}
	}

	DEBUG && printDebugHeaders(notesTable0);
}

function checkCells0(notesTable, colorCellsFunc, tableCanChange,
	addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
	addDeleteRowButton,
	addNoteIdColumn)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	attachLocalStorageCommentListener();

	var tbody = notesTable.find("tbody:last");
	var tbody0 = tbody.get(0);
	DEBUG && GM_log("tbody0=", tbody0);

	var trFirst = tbody.find("tr:first");
	DEBUG && GM_log("trFirst=", trFirst);

	/*
	 * set a flag on the first row
	 * YYY seems like this gets reset when the row changes, but needs to be tested
	 */
	if(trFirst.length > 0)
	{
		if(!trFirst.data('lcac_cellsAdded'))	// seems to get lost when the rows change
		{
			DEBUG && GM_log("trFirst.data('lcac_cellsAdded')=", trFirst.data('lcac_cellsAdded'));

			trFirst.data('lcac_cellsAdded', true);

			addCells(notesTable,
				addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
				addDeleteRowButton,
				addNoteIdColumn);

			notesTable.data('colorIsDirty', true);
		}

		if(notesTable.data('colorIsDirty'))
			GM_log(FUNCNAME + " notesTable.data('colorIsDirty')=", notesTable.data('colorIsDirty'));
		
		if(notesTable.data('colorIsDirty')) // colorIsDirty is set elsewheres
		{
			if(colorCellsFunc)
				colorCellsFunc(notesTable);
			
			notesTable.data('colorIsDirty', false);
		}
	}

	/* loop (if table can change) */
	DEBUG && GM_log("tableCanChange=", tableCanChange);
	if(tableCanChange)
	{
		setTimeout(
			function()
			{
				checkCells0(notesTable, colorCellsFunc, tableCanChange,
					addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
					addDeleteRowButton,
					addNoteIdColumn);
			},
			TABLECANCHANGETIMEOUT);
	}
}

GM_addStyle("td.lcac_commentCell {padding-top:0 !important; padding-bottom:0 !important; white-space:nowrap !important;}");	// no padding around textbox
	
function addCells(notesTable,
	addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
	addDeleteRowButton,
	addNoteIdColumn)
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);
DEBUG && timestamp(arguments, true);

	var notesTable0 = notesTable.get(0);

	if(notesTable0.loanIdEmbeddedColumnIndex == null
	&& notesTable0.loanIdColumnIndex == null)	// column should not be null, 0 is OK though
	{
		DEBUG && GM_log("1 returning");
		return;
	}

	var trs =
		$(notesTable0)
			.find("tbody:last tr")
				.not(".tfoot")	// last line, footer
				.not(".lcac_canceled")	// expired so hidden
				.not(":contains('Edit Order')")	// footer on placeOrder.action
				.not(":contains('No Results Found')")	 // "No Results Found"
				;

//	GM_log("trs=", trs);
	DEBUG && GM_log("trs.length=", trs.length);

	if(trs.length == 0)
	{
		DEBUG && GM_log("2 returning");
		return;
	}
	else if(trs.filter(":first").find("td").length == 1) // no rows, or a message row
	{
		DEBUG && GM_log("3 returning");
		return;
	}
		
	//OPTIMIZEME 4 seconds
	trs.each(function(index, tr0)
	{
	var DEBUG = debug(true && index < 10, arguments);

		var tr = $(tr0);

		/*
		 * ADD THE CELLS FIRST or the columns won't match
		 */

		/* add loanId (for tradingAccount.action) */
		if(addLoanIdColumn)
		{
			DEBUG && GM_log("insertCell() notesTable0.loanIdColumnIndex=" + notesTable0.loanIdColumnIndex);
			tr0.insertCell(notesTable0.loanIdColumnIndex);
		}

		if(addNoteIdColumn)
		{
			DEBUG && GM_log("insertCell() notesTable0.noteIdColumnIndex=" + notesTable0.noteIdColumnIndex);
			tr0.insertCell(notesTable0.noteIdColumnIndex);
		}

		/* add interestRate cell */
		var interestRateCell = null;
		if(addInterestRateColumn)
		{
			DEBUG && GM_log("insertCell() notesTable0.interestRateColumnIndex=" + notesTable0.interestRateColumnIndex);
			interestRateCell = tr0.insertCell(notesTable0.interestRateColumnIndex);
			interestRateCell = $(interestRateCell);	//jqueryfi
		}

		/*
		 * "This security is no longer listed" takes up 5 columns
		 * (appears when order submitted but note already sold or removed)
		 */
		if(tr.html().match(/This security is no longer listed|This Note has already been listed for sale/))
			return;

		/* add markup cell */
		if(addMarkupColumn)
			tr0.insertCell(notesTable0.markupColumnIndex);	// will be filled in elsewheres

		/* add irr cell */
		if(addIRRColumn)
			tr0.insertCell(notesTable0.irrColumnIndex);	// will be filled in elsewheres

		/* find the loanId, and fill in the loanId Column if we added one */
		var loanId;
		if(addLoanIdColumn)
		{
			loanId = getLoanId(tr, null, notesTable0.loanIdEmbeddedColumnIndex);
			tr.find("td").eq(notesTable0.loanIdColumnIndex).html('' + loanId);
		}
		else
			loanId = getLoanId(tr, notesTable0.loanIdColumnIndex, notesTable0.loanIdEmbeddedColumnIndex);
			
		tr.data('loanId', loanId);	// save this for the next loop down there
		
		var noteId;
		if(addNoteIdColumn)
		{
			noteId = getNoteId(tr, null, notesTable0.noteIdEmbeddedColumnIndex);
			tr.find("td").eq(notesTable0.noteIdColumnIndex).html('' + noteId);
		}
		else if(notesTable0.noteIdColumnIndex != null)
			noteId = getNoteId(tr, notesTable0.noteIdColumnIndex);
		else
			noteId = null;

		tr.data('noteId', noteId);	// save this for the next loop down there

		if(addInterestRateColumn)
		{
			var interestRate = getStoredInterestRateByLoanId(loanId);

			if(interestRate == null || isNaN(interestRate) || interestRate < 0)
			{
				interestRateCell.html("Not Stored");
				interestRateCell.addClass('lcac_orangeMed lcac_nowrap');
			}
			else
			{
				interestRateCell.html(sprintf("%.2f%%", interestRate * 100.0));
			}
		}

	});

	/* OPTIMIZEME */
	if(addCommentColumn)
	{
		$.each(trs, function(index, tr0)
		{
			var tr = $(tr0);
			var loanId = tr.data('loanId');	// we added this up above

			if(loanId == null || loanId == undefined)
				return;

			/* add comment cell */
			var commentCell = tr0.insertCell(-1);	// -1 means insert at the end
			commentCell = $(commentCell);
			commentCell.addClass('lcac_commentCell');
			commentCell.append(
				sprintf(
					"<input class='commentTextBox' name='comment_%s' type='text' size=50 />",
					loanId
				));

			var commentTextBox = commentCell.find(".commentTextBox");
			var loanId = commentTextBox.prop('name');
			var comment = getComment(loanId);
			commentTextBox.val(comment);
		});

		/* add the event handlers */
		trs.find("input.commentTextBox")
			.on('change',
				function(event)
				{
					DEBUG && GM_log("event=", event);

					setComment(this.name, this.value);
				})
			.on('keypress',
				function(event)
				{
					DEBUG && GM_log("event=", event);

					if(event.keyCode == 13 /*ENTER*/)
					{
						setComment(this.name, this.value);
						event.preventDefault();	// don't let ENTER submit the form
					}
				});
	}

	DEBUG && timestamp(arguments, "9");
}
function colorCells(notesTable)
{
var DEBUG = debug(false, arguments);

	var notesTable0 = notesTable.get(0);

	var trs =
		notesTable
			.find("tbody:last tr")
				.not(".tfoot")	// last line, footer
				.not(".lcac_canceled")	// expired so hidden
				.not(":contains('Edit Order')")	// footer on placeOrder.action
				.not(":contains('No Results Found')")	 // "No Results Found"
				;


	var loanIdSeen = {};	// italic loanIds

	trs.each(function()
	{
		var tr = $(this);
		var tds = tr.find("td");

		var loanId = tr.data('loanId');
//		var loanId = getLoanId(tr, notesTable0.loanIdColumnIndex, notesTable0.loanIdEmbeddedColumnIndex);
		
		if(notesTable0.loanIdColumnIndex)
			var loanIdCell = tds.eq(notesTable0.loanIdColumnIndex);

		/*
		 * highlight repeated loan ids (per table)
		 */
		if(loanIdCell)
		{
			loanIdCell.addClass('lcac_first_candidate');

			if(!loanIdSeen[loanId])
			{
				loanIdSeen[loanId] = true;	// set the flag to true
				tr.addClass('lcac_first');
				tr.removeClass('lcac_notfirst');
			}
			else
			{
				tr.removeClass('lcac_first');
				tr.addClass('lcac_notfirst');
			}
		}

		if(tr.html().match(/no longer listed|already been listed/))
			return;

		var loanStatusCell = tds.eq(notesTable0.loanStatusColumnIndex);
		var loanStatus = loanStatusCell.text();

		var outstandingPrincipal = text2Value(tds.eq(notesTable0.outstandingPrincipalColumnIndex).text());
		var accruedInterest = text2Value(tds.eq(notesTable0.accruedInterestColumnIndex).text());
		var askingPrice = text2Value(tds.eq(notesTable0.askingPriceColumnIndex).text());
		var principalPlus = text2Value(tds.eq(notesTable0.principalPlusColumnIndex).text());
		var remainingPayments = text2Value(tds.eq(notesTable0.remainingPaymentsColumnIndex).text());

		var interestRateAssumed = false;
		var interestRate = parseInterestRate(loanId, tds.eq(notesTable0.interestRateColumnIndex).html());
		if(interestRate == null)
		{
			interestRate = getStoredInterestRateByLoanId(loanId);
			if(interestRate == null)
			{
				interestRateAssumed = true;
				interestRate = 0.10;
			}
		}

		var accruedInterestInMonths = calcInterestInMonths(outstandingPrincipal, interestRate, accruedInterest);
		if(accruedInterestInMonths > 0)
		{
			var td = tds.eq(notesTable0.accruedInterestColumnIndex);
//			var div = td.find('div');	// find the element that has the string (could be us or a div)
			var innermost = td.find('*:not(:has(*))');	// innermost element
			if(innermost.length == 0)
				innermost = td;

			if(!innermost.hasClass('lcac_inmonths'))
			{
				innermost.addClass('lcac_inmonths');
				innermost.append(sprintf('[%0.1fm]', accruedInterestInMonths));

				/* accrued interest is better indicator than "late" status */
				if(accruedInterestInMonths >= lateMonths1) // more than 3 months' interest
					td.addClass(interestRateAssumed ? 'lcac_orangeHigh' : 'lcac_redHigh');
				else if(accruedInterestInMonths >= lateMonths2) // more than 2 months' interest
					td.addClass(interestRateAssumed ? 'lcac_orangeMed' : 'lcac_redMed');
				else if(accruedInterestInMonths >= lateMonths3) // more than 1 month + grace period
					td.addClass(interestRateAssumed ? 'lcac_orangeLow' : 'lcac_redLow');
				else if(accruedInterestInMonths >= lateMonths4) // in grace period?
					td.addClass('lcac_yellowMed');
			}
		}

		if(loanStatus.match(/Default|Charged\s*Off/))
			tds.eq(notesTable0.loanStatusColumnIndex).addClass('lcac_redHigh');
		else if(loanStatus.match(/Late/))
			tds.eq(notesTable0.loanStatusColumnIndex).addClass('lcac_yellowLow');
		else if(loanStatus.match(/Fully.*Paid/))
			tds.eq(notesTable0.loanStatusColumnIndex).addClass('lcac_greenHigh');

		/* payments vs investment */
		if(notesTable0.paymentsReceivedColumnIndex && notesTable0.investmentColumnIndex)
		{
			var paymentsReceived = text2Value(tds.eq(notesTable0.paymentsReceivedColumnIndex).text());
			var investment = text2Value(tds.eq(notesTable0.investmentColumnIndex).text());

			if(paymentsReceived == 0)
				tds.eq(notesTable0.paymentsReceivedColumnIndex).addClass('lcac_orangeLow');
			else if(paymentsReceived < investment)
			{
				if(loanStatus.match(/Fully.*Paid/))
					tds.eq(notesTable0.paymentsReceivedColumnIndex).addClass('lcac_redMed');	// no chance of getting paid back now
				else if(paymentsReceived < investment / 2)
					tds.eq(notesTable0.paymentsReceivedColumnIndex).addClass('lcac_yellowMed');
				else
					tds.eq(notesTable0.paymentsReceivedColumnIndex).addClass('lcac_yellowLow');
			}
			else // paymentsReceived >= investment
				tds.eq(notesTable0.paymentsReceivedColumnIndex).addClass('lcac_greenLow');

			if(GAINLOSS)
			{
				var gainloss = paymentsReceived - investment;

				var td = tds.eq(notesTable0.paymentsReceivedColumnIndex);
				var innermost = td.find("*:not(:has(*))");	// innermost element
				if(innermost.length == 0)
					innermost = td;

				if(!innermost.hasClass('lcac_gainloss'))
				{
					innermost.addClass('lcac_gainloss');
					innermost.append(sprintf('%+0.2f', gainloss));
				}
			}
		}

		/*
		 * add price to href link to note
		 */
		if(PRICESINURL)
		if(askingPrice)
		{
			var a = loanStatusCell.find('a');	// find the element that has the string (could be us or a div)
			var href = a.prop('href');

			if(location.href.match(/cart.action/))	/* we're buying it */
				href += sprintf("&asking_price=%0.2f&in_cart=1", askingPrice);
			else /* we're selling it */
				href += sprintf("&our_asking_price=%0.2f", askingPrice);

			a.prop('href', href);
		}
	});
}

function addHeaders0(notesTable0,
	addCommentColumn, addLoanIdColumn, addInterestRateColumn, addMarkupColumn, addIRRColumn,
	addHideRowsCheckBoxes,
	addDeleteRowButton,
	addNoteIdColumn)
{
var DEBUG = debug(true, arguments);

//	var trHead0 = notesTable0.tHead.rows[0];
	var trHead = $(notesTable0).find("thead tr");
	var trHead0 = trHead.get(0);
	var trFoot = $(notesTable0).find(".tfoot");
	if(trFoot.length == 0)
		trFoot = null;


	/* add a "Loan ID" header (before Note ID) */
	if(addLoanIdColumn)
	{
//XXX before/after in tables doesn't seem to work in chrome
//		var th = trHead.find("th").eq(notesTable0.noteIdColumnIndex);
//		DEBUG && GM_log("th=", th);
//		th.before("<th class='loanId' style='white-space:nowrap;'>Loan ID*</th>");

		var column =
			notesTable0.noteIdColumnIndex != null
			? notesTable0.noteIdColumnIndex	// before the noteId column
			: -1;	// at the end
		
		DEBUG && GM_log("column=" + column);

		var newTH = trHead0.insertCell(column);	//investmentColumnIndex on LC Browse Notes
		$(newTH).replaceWith("<th class='loanId LCAC' style='white-space:nowrap;'>Loan ID*</th>");

		if(trFoot)
		{
			var tdFoot = getCellForColumn(trFoot, notesTable0.noteIdColumnIndex);
			var colspan = parseInt(tdFoot.prop("colspan"));
			tdFoot.prop("colspan", colspan + 1);
		}
		
		findHeaders00(notesTable0);
	}

	if(addNoteIdColumn)
	{
		GM_log("notesTable0.loanIdColumnIndex=" + notesTable0.loanIdColumnIndex);
		var column =
			notesTable0.loanIdColumnIndex != null
			? notesTable0.loanIdColumnIndex + 1	// after the loan id column
			: -1;
		GM_log("column=" + column);
		var newTH = trHead0.insertCell(column);	//investmentColumnIndex on LC Browse Notes
		$(newTH).replaceWith("<th class='noteId' style='white-space:nowrap;'>Note ID*</th>");

		if(trFoot)
		{
			var tdFoot = getCellForColumn(trFoot, notesTable0.noteIdColumnIndex);
			var colspan = parseInt(tdFoot.prop("colspan"));
			tdFoot.prop("colspan", colspan + 1);
		}
		
		findHeaders00(notesTable0);
	}

	/* add a "Interest Rate" header */
	if(addInterestRateColumn)
	{
		var newTH = trHead0.insertCell(notesTable0.loanStatusColumnIndex);
		$(newTH).replaceWith("<th class='storedRate' style='white-space:nowrap;'>Stored Rate*</th>");
		
		if(trFoot)
		{
			var tdFoot = getCellForColumn(trFoot, notesTable0.loanStatusColumnIndex);
			var colspan = parseInt(tdFoot.prop("colspan"));
			tdFoot.prop("colspan", colspan + 1);
		}

		findHeaders00(notesTable0);
	}

	/* add a "Markup" header */
	if(addMarkupColumn)
	{
		var newTH = trHead0.insertCell(notesTable0.askingPriceColumnIndex + 1);
		$(newTH).replaceWith("<th class='lcac_markup'>Markup*</th>");
		
		if(trFoot)
		{
			var tdFoot = getCellForColumn(trFoot, notesTable0.askingPriceColumnIndex);
			GM_log("tdFoot=", tdFoot);
			if(tdFoot)
			{
				var colspan = parseInt(tdFoot.prop("colspan"));
				tdFoot.prop("colspan", colspan + 1);
			}
			else
				trFoot.get(0).insertCell(-1);	//XXX fix the other ones
		}
		
		findHeaders00(notesTable0);
	}

	/* add a "IRR" header */
	if(addIRRColumn)
	{
		var newTH = trHead0.insertCell(-1);	// at the end or the header
//		var newTH = trHead0.insertCell(notesTable0.markupColumnIndex);

		$(newTH).replaceWith("<th class='lcac_irr' onclick='event.stopPropagation();'>IRR* (PMT est.)</th>");
		
		if(trFoot)
		{
			var tdFoot = getCellForColumn(trFoot, notesTable0.askingPriceColumnIndex);
			GM_log("tdFoot=", tdFoot);
			if(tdFoot)
			{
				var colspan = parseInt(tdFoot.prop("colspan"));
				tdFoot.prop("colspan", colspan + 1);
			}
			else
				trFoot.get(0).insertCell(-1);	//XXX fix the other ones
		}
		
		findHeaders00(notesTable0);
	}
		
	/* add a "Comment" header (at the end) */
	if(addCommentColumn)
	{
		var newTH = trHead0.insertCell(-1);	// at the end or the header

		$(newTH).replaceWith(
			"<th class='lcac_commentColumn' onclick='event.stopPropagation();' style='white-space:nowrap;'>Comment*</th>");

		if(trFoot)
			trFoot.get(0).insertCell(-1);	// at the end of the footer	(trFoot could be empty)
		
		findHeaders00(notesTable0);
	}
	
	DEBUG && printDebugHeaders(notesTable0);
}
	
var lateMonths1 = getStoredValue("lateMonths1", 4.5);
var lateMonths2 = getStoredValue("lateMonths2", 3.5);
var lateMonths3 = getStoredValue("lateMonths3", 2.5);
var lateMonths4 = getStoredValue("lateMonths4", 1.5);
	
var CHECKBOXLIMIT = GM_getValue("CHECKBOXLIMIT", 500);
var LOANPERFHIDEROWS = GM_getValue("LOANPERFHIDEROWS", true);
var MAXEXPIRES = GM_getValue("MAXEXPIRES", 7);
var GAINLOSS = GM_getValue("GAINLOSS", true);
var FICOWAYDOWN = GM_getValue("FICOWAYDOWN", 519);

var TABLESORTER = GM_getValue("TABLESORTER", true);
GM_log("TABLESORTER=", TABLESORTER);
var TABLESORTER2 = GM_getValue("TABLESORTER2", true);
GM_log("TABLESORTER2=", TABLESORTER2);
var TABLESORTER2DELAYINIT = GM_getValue("TABLESORTER2DELAYINIT", true);
GM_log("TABLESORTER2DELAYINIT=", TABLESORTER2DELAYINIT);
var TABLESORTER3 = GM_getValue("TABLESORTER3", false);
GM_log("TABLESORTER3=", TABLESORTER3);
var DETACHTABLES = GM_getValue("DETACHTABLES", true);
GM_log("DETACHTABLES=", DETACHTABLES);


var headerLimits = {
	askingPriceMax: getStoredValue("askingPriceMax", 1000.0),
	askingPriceStrict: getStoredValue("askingPriceStrict", true),
	markupMax: getStoredValue("markupMax", 0.05),
	markupMaxStrict: getStoredValue("markupMaxStrict", true),

	ytmMin: getStoredValue("ytmMin", 0.0),
	ytmStrict: getStoredValue("ytmStrict", false),
	irrMin: getStoredValue("irrMin", 0.0),
	irrStrict: getStoredValue("irrStrict", false),
	accruedInterestStrict: getStoredValue("accruedInterestStrict", false),
	excludeTooMuchInterestPer12Months: getStoredValue("excludeTooMuchInterestPer12Months", false),
	excludeTooMuchInterestThisYear: getStoredValue("excludeTooMuchInterestThisYear", false),
	principalPlusMin: getStoredValue("principalPlusMin", 1.0),
	principalPlusStrict: getStoredValue("principalPlusStrict", true),
	
	term: getStoredValue("term", "0"),
	termStrict: getStoredValue("termStrict", false),

	remainingPaymentsMax: getStoredValue("remainingPaymentsMax", "0"),
	remainingPaymentsMin: getStoredValue("remainingPaymentsMin", "0"),
	remainingPaymentsStrict: getStoredValue("remainingPaymentsStrict", false),

	foliofnMarkupLowLimit: getStoredValue("foliofnMarkupLowLimit", 0.00),
	foliofnMarkupHighLimit: getStoredValue("foliofnMarkupHighLimit", 10.00),
};

function setHeaderLimit(name, element, likelyPercent)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	if(element instanceof jQuery) element = element.get(0);

	var value = null;
	if(element.type == 'checkbox')
	{
		value = $(element).prop('checked');
	}
	else if(element.type == 'select-one')	//XXX could also 'select-multiple'
	{
		value = $(element).val();	
	}
	else if(element.type == 'text')
	{
		value = $(element).val();

		value = value.replace(/\$/, '');

		var isPercent = value.match(/%/);

		value = parseFloat(value);

		if(isPercent)
			value /= 100;
		else if(likelyPercent)	// interpret large values as a percent as well. How large?
		{
			if(value < 1)
				isPercent = true;
			else
			{
				value /= 100;
				isPercent = true;
			}
		}
		
		/* reformat and update the textfield */
		var valueString = isPercent ? sprintf("%0.1f%%", value * 100) : sprintf("%0.2f", value);
		
		$(element).val(valueString);
	}

	headerLimits[name] = value;
	setStoredValue(name, value);

	var closestTable = $(element).closest("table");

	closestTable.data('colorIsDirty', true);
}

function createStyle(css)
{
	var style = document.createElement('style');

	style.type = 'text/css';
	if(style.styleSheet)
		style.styleSheet.cssText = css;
	else
		style.appendChild(document.createTextNode(css));

	return style;
}


var greenHigh = "#7fff7f";	// dark
var greenMed = "#afffaf";
var greenLow = "#cfffcf";	// light
var redHigh = "#ff7f7f";
var redMed = "#ffafaf";
var redLow = "#ffdfdf";
var yellowHigh = "#ffff7f";
var yellowMed = "#ffffaf";
var yellowLow = "#ffffcf";
var orangeHigh = "#FF9900";	// dark
var orangeMed = "#FFB84D";
var orangeLow = "#FFD699";	// light

function updateFirst()
{
	var loanIdSeen = {};

	$("tr.lcac_first_candidate:visible")
		.each(function(index, element)
		{
			element = $(element);
			
			var loanId = element.data('lcac_loanId');

			if(!loanIdSeen[loanId])
			{
//					GM_log("FIRST element=", element, " element.data('lcac_loanId')=", element.data('lcac_loanId'));
				element.addClass("lcac_first");
				element.removeClass("lcac_notfirst");
				loanIdSeen[loanId] = true;
			}
			else
			{
//					GM_log("NOT FIRST element=", element, " element.data('lcac_loanId')=", element.data('lcac_loanId'));
				element.removeClass("lcac_first");
				element.addClass("lcac_notfirst");
			}
		});
}
	
function updateMarkup(notesTable0, tr, delay)
{
//	GM_log("updateMarkup() tr=", tr);
//	printStackTrace();

	if(typeof delay == 'undefined') delay = 0;

	/* setTimeout to make sure we do it AFTER the field gets updated */
	setTimeout(function(){
		updateMarkup0(notesTable0, tr);
	}, delay);
}

function updateMarkup0(notesTable0, tr)
{
	if(tr.text().match(/This security is no longer listed|This Note has already been listed for sale/i))
		return;

	var tds = tr.find("td");

	var markupCell = tds.eq(notesTable0.markupColumnIndex);

	var principalPlusCell = tds.eq(notesTable0.principalPlusColumnIndex);

	var askingPriceCell = tds.eq(notesTable0.askingPriceColumnIndex);
	var askingPriceInput = askingPriceCell.find(".asking-price");

	var principalPlus = text2Value(principalPlusCell.text());
	if(principalPlus == 0)	// Fully Paid
		return;

	var askingPrice;
	if(askingPriceInput.length > 0)
		askingPrice = text2Value(askingPriceInput.val());
	else
		askingPrice = text2Value(askingPriceCell.text());

	var markup = null;
	if(askingPrice > 0)
		markup = (askingPrice - principalPlus) / principalPlus;	// it's empty on Sell Notes before a price is set

	if(markup == null || isNaN(markup))
	{
		markupCell.text("--");
		return;
	}

	var colorString = '';
	if(markup != null)
	{
		markupCell.text(sprintf("%.2f%%", markup * 100));

		if(markup > headerLimits.foliofnMarkupHighLimit)
		{
			var diff = (markup - headerLimits.foliofnMarkupHighLimit) / headerLimits.foliofnMarkupHighLimit;
			diff = diff + 0.2;	// exaggerate the colors a little bit
			if(diff > .9) diff = 1;	// limit it
			diff = 255 - Math.floor(diff * 255);
			colorString = sprintf("#ff%02x%02x", diff, diff);	// red to white
		}
		else if(markup < headerLimits.foliofnMarkupLowLimit)
		{
			var diff = (markup - headerLimits.foliofnMarkupLowLimit) / headerLimits.foliofnMarkupLowLimit;
			diff = -diff;	// reverse it
			diff = diff + 0.2;	// exaggerate the colors a little bit
			if(diff > .9) diff = 1;	// limit it
			diff = 255 - Math.floor(diff * 255);
			colorString = sprintf("#%02xff%02x", diff, diff);	// green to white
		}
	}

//	askingPriceCell.css('background', colorString);
	markupCell.css('background', colorString);
};

function updateMarkupAll(notesTable0, trs, delay)
{
	if(typeof delay == 'undefined') delay = 0;

//	setTimeout(function(){
		updateMarkupAll0(notesTable0, trs);
//	}, delay);
}

function updateMarkupAll0(notesTable0, trs)
{
	trs.not(".tfoot").each(function()
	{
		var tr = $(this);
		updateMarkup(notesTable0, tr);
	});
}

function printDebugHeaders(notesTable0)
{
	GM_log(''
		+ "\nnotesTable0.loanIdEmbeddedColumnIndex=" + notesTable0.loanIdEmbeddedColumnIndex
		+ "\nnotesTable0.noteIdEmbeddedColumnIndex=" + notesTable0.noteIdEmbeddedColumnIndex
		+ "\nnotesTable0.loanIdColumnIndex=" + notesTable0.loanIdColumnIndex
		+ "\nnotesTable0.noteIdColumnIndex=" + notesTable0.noteIdColumnIndex
		+ "\nnotesTable0.commentColumnIndex=" + notesTable0.commentColumnIndex
		+ "\nnotesTable0.askingPriceColumnIndex=" + notesTable0.askingPriceColumnIndex
		+ "\nnotesTable0.salePriceColumnIndex=" + notesTable0.salePriceColumnIndex
		+ "\nnotesTable0.purchasePriceColumnIndex=" + notesTable0.purchasePriceColumnIndex
		+ "\nnotesTable0.orderExpiresColumnIndex=" + notesTable0.orderExpiresColumnIndex
		+ "\nnotesTable0.ytmColumnIndex=" + notesTable0.ytmColumnIndex
		+ "\nnotesTable0.irrColumnIndex=" + notesTable0.irrColumnIndex
		+ "\nnotesTable0.accruedInterestColumnIndex=" + notesTable0.accruedInterestColumnIndex
		+ "\nnotesTable0.markupColumnIndex=" + notesTable0.markupColumnIndex
		+ "\nnotesTable0.outstandingPrincipalColumnIndex=" + notesTable0.outstandingPrincipalColumnIndex
		+ "\nnotesTable0.principalPlusColumnIndex=" + notesTable0.principalPlusColumnIndex
		+ "\nnotesTable0.remainingPaymentsColumnIndex=" + notesTable0.remainingPaymentsColumnIndex
		+ "\nnotesTable0.loanStatusColumnIndex=" + notesTable0.loanStatusColumnIndex
		+ "\nnotesTable0.interestRateColumnIndex=" + notesTable0.interestRateColumnIndex
		+ "\nnotesTable0.investmentColumnIndex=" + notesTable0.investmentColumnIndex
		+ "\nnotesTable0.paymentsReceivedColumnIndex=" + notesTable0.paymentsReceivedColumnIndex
		+ "\nnotesTable0.orderStatusColumnIndex=" + notesTable0.orderStatusColumnIndex
	);
}

function moveFooterRowToFooter(notesTable)
{
	var footerRows = notesTable.find("tbody tr.tfoot");

	if(footerRows.length > 0)
	{
		var footer = notesTable.find("tfoot");

		if(footer.length == 0)
		{
			footer = $("<tfoot>");
			notesTable.find("tbody").after(footer);
		}
		footer.append(footerRows);

	}
}

//GM_log("typeof processMarkupYtm=", typeof processMarkupYtm);	//chrome
//GM_log("typeof window.processMarkupYtm=", typeof window.processMarkupYtm);	//neither
//GM_log("typeof unsafeWindow.processMarkupYtm=", typeof unsafeWindow.processMarkupYtm);	//chrome and firefox
//
//var showMarkupYtm0 = unsafeWindow.showMarkupYtm;
//unsafeWindow.showMarkupYtm = function()
//{
//	GM_log("showMarkupYtm() arguments=", arguments);
//	showMarkupYtm0.call(arguments);
//}
//GM_log("showMarkupYtm0=", showMarkupYtm0);
//GM_log("unsageWindow.showMarkupYtm=", unsageWindow.showMarkupYtm);

function setAskingPriceInput(askingPriceInput, newValue)
{
	if(newValue !== null)
		askingPriceInput.val(newValue == '' ? '' : sprintf("%0.2f", newValue));

//	processMarkupYtm2(askingPriceInput);

	GM_log("calling askingPriceInput.change()");
//	askingPriceInput.trigger('change');	// fire the event to notify the listeners
//	askingPriceInput.change();	// these aren't working

	var askingPriceInput0 = $(askingPriceInput).get(0);	// get the DOM element

	showMarkupYtm.apply(askingPriceInput0, null, true);	// this is how they call it now
}

function processMarkupYtm2(askingPriceInput)
{
	/* as of 2013-10 processMarkupYtm is only on selectLoansForSale.action */
	if(typeof unsafeWindow.processMarkupYtm != 'function')
		return;

	/* 2013-11-07 they added a reprice parameter to the URL. why? */
	var reprice = location.href.match(/selectNotesToReprice.action/) != null;
	unsafeWindow.processMarkupYtm(askingPriceInput, reprice);
}

/* per http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript */
function capitaliseFirstLetter(string, tolowercase)
{
    if(tolowercase)
    	return string.charAt(0).toLowerCase() + string.slice(1);
	else
    	return string.charAt(0).toUpperCase() + string.slice(1);
}


function parse_lenderAccountDetail(innerHTML)
{
var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

	var vars = {};

	var dom = $(innerHTML);
	GM_log("dom=", dom);
	
	var tradeableDiv = dom.find("div#account-details2");

	tradeableDiv.find("table th:contains('(')")
		.each(function tradeableDiv_each(index, element)
		{
		var FUNCNAME = funcname(arguments);

			var text = $(element).text();
			GM_log(FUNCNAME + " text=" + text);

			// e.g. "Issued & Current (2,724)"
			/*
			 * "Adjust account value and returns for past-due Notes" on Summary Page changes this page
			 * special characters and adds a third column Adjusted Principal Value, e.g.
			 * In Grace Period (33)	$415.01	$319.56
			 * Charged Off* (376)	$7,358.46	$7,358.46
			 */
			text = text
				.replace('&', 'And')
				.replace('-', 'To')
				.replace('days', 'Days')
				.replace(/[^A-Za-z0-9,()]/g, '')	
				.replace(/\s+/g, '')
				.replace(/,/g, '')
			;

			var split = text.split(/[()]/);	
			GM_log(FUNCNAME + " split=", split);

			var id = split[0] + "_count";
			var value = split[1];

			id = capitaliseFirstLetter(id, true);
			vars[id] = value;
		})
	
	tradeableDiv.find(":header:contains(Details) ~ table tbody tr")
		.each(function(index, element)
		{
			var tr = $(element);

			var id = tr.find(":eq(0)").text().replace(/ /g, '');

			id[0] = id[0].toLowerCase();
			
			var value = tr.find(":eq(1)").text();

			value = text2Value(value);

			id = capitaliseFirstLetter(id, true);
			vars[id] = value;
		});

	var accountSummaryDiv = $("div#lending-club-account-summary", dom);
	accountSummaryDiv.find("> *").not(".plusSignal")
		.each(function(index, element)
		{
			element = $(element);
			var text = element.text().trim();
			var split = text.split(/\s+/);

			var id = split[0];
			var value = split[1];
			value = text2Value(value);
			
			id = capitaliseFirstLetter(id, true);
			
			vars[id] = value;
		});

	/* what we used to call them */
	vars['totalPayments'] = vars['paymentstoDate'];
	vars['interestReceived'] = vars['interest'];
	vars['inFundingNotes'] = vars['committedCash'];	// they changed the name

	vars.accountTotal = vars.availableCash + vars.inFundingNotes + vars.outstandingPrincipal;

	GM_log(FUNCNAME + " vars=", vars);
	return vars;
}

// add this to URLs to try and bypass cache
function tsParam()
{
	return "&ts=" + new Date().getTime();
}
				


function doTargetYtm(trs, targetytm, callbackDone)
{
var DEBUG = debug(false, arguments);

	eachAsync(trs, function doTargetYtm_eachAsync_callback(index, tr, asyncLoopCallback)
	{
	var DEBUG = debug(false, arguments);

		var tr = $(tr);
		DEBUG && GM_log("tr=", tr);

		var href = tr.find("a[href*=loanPerf]").prop('href').match(/loan_id=(\d+).*order_id=(\d+)/);

		var loanId = href[1];
		var orderId = href[2];

		var principalPlus = tr.find(".outstanding-principal-accrued-interest").text().replace(/[$,]/, '');
		DEBUG && GM_log("loanId=" + loanId + " orderId=" + orderId + " principalPlus=" + principalPlus);

		var askingPriceInput = tr.find("input.asking-price");
		DEBUG && GM_log("askingPriceInput=", askingPriceInput);

		findAskingPriceForTargetYTM(loanId, orderId, principalPlus, targetytm,
			function doTargetYTM_findAskingPriceForTargetYTM_callback(success, askingPrice, ytm)
			{
			var DEBUG = debug(false, arguments);

				setAskingPriceInput(askingPriceInput, success ? askingPrice : '');	// sets the input and calls processMarkup()
				asyncLoopCallback();
			});

	}, callbackDone);
}

function getMarkupAndYtmAj(loanId, orderId, askingPrice, callback)
{
var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

	var url = sprintf("/foliofn/getMarkupAndYtmAj.action");
	var params = sprintf("orderId=%d&loanId=%d&askingPrice=%0.2f", orderId, loanId, askingPrice); // askingPrice MUST be no more than 2 decimal places!

	var reprice = location.href.match(/selectNotesToReprice.action/);
	if(reprice)
		params += "&reprice=true";
	else
		params += "&reprice=false";

	DEBUG && GM_log("url=" + url);
	DEBUG && GM_log("params=" + params);

	$.post(url, params, function getMarkupAndYtmAj_post_callback(responseText) 
	{
	var FUNCNAME = funcname(arguments);

		DEBUG && GM_log(FUNCNAME + " responseText=" + responseText);

		var obj = $.parseJSON(responseText);
		DEBUG && GM_log("obj=", obj);

		if(obj == null || obj.status != 'success')
		{
			GM_log("getMarkupAndYtmAj() get FAILED, obj=", obj, " url=", url);
			callback(null, null);
			return;
		}

		var result = obj.result;
		DEBUG && GM_log("result=", result);

		callback(result.markup / 100, result.ytm / 100);	// these are percentages
	});
}
	
function findAskingPriceForTargetYTM(loanId, orderId, askingPrice1, targetytm, callback, maxiterations)
{
	/* WARNING: for small notes, asking principalPlus can result in negative YTM */
	var askingPrice2;
	var ytm1, ytm2;

	if(typeof maxiterations == 'undefined') maxiterations = 10;

	getMarkupAndYtmAj(loanId, orderId, askingPrice1, function findAskingPriceForTargetYTM_callback1(markup, ytm)
	{
	var DEBUG = debug(false, arguments);

		if(markup == null)
		{
			callback(false, null, null);
			return;
		}

		ytm1 = ytm;
		DEBUG && GM_log("askingPrice1=" + askingPrice1 + " ytm1=" + ytm1);

		/* set initial value for askingPrice2 */
		if(ytm > 0)
			askingPrice2 = askingPrice1 * 2;
		else
			askingPrice2 = askingPrice1 / 2;


		getMarkupAndYtmAj(loanId, orderId, askingPrice2, function findAskingPriceForTargetYTM_callback2(markup, ytm)
		{
		var DEBUG = debug(false, arguments);

			ytm2 = ytm;
			DEBUG && GM_log("askingPrice2=" + askingPrice2 + " ytm2=" + ytm2);

			if(askingPrice2 < askingPrice1)
			{
				/* swap them */
				var askingPriceTemp = askingPrice1;
				var ytmTemp = ytm1;

				askingPrice1 = askingPrice2;
				ytm1 = ytm2;
				
				askingPrice1 = askingPriceTemp;
				ytm1 = ytmTemp;

			}

			function getMarkupAndYtmAj_iterate(iterationsleft)
			{
			var DEBUG = debug(false, arguments);

				DEBUG && GM_log("getMarkupAndYtmAj_iterate() iterationsleft=" + iterationsleft);
				DEBUG && GM_log("askingPrice1=" + askingPrice1 + " askingPrice2=" + askingPrice2);
				DEBUG && GM_log("ytm1=" + ytm1 + " ytm2=" + ytm2);

				var ytmDiff = ytm1 - targetytm;
				DEBUG && GM_log("ytmDiff=" + ytmDiff);

				if(ytmDiff >= 0	// greater than the target ytm (so targetytm of 0 doesn't go negative)
				&& ytmDiff <= .01	// small
				|| iterationsleft <= 0)	// or run out of tries
				{
					callback(iterationsleft > 0, askingPrice1, ytm1, askingPrice2, ytm2);
					return;
				}

				/* slope intercept */
				var m = (ytm2 - ytm1) / (askingPrice2 - askingPrice1); // slope (rise / run)
				var b = (ytm2 - targetytm) - m * askingPrice2;
				DEBUG && GM_log("m=" + m + " b=" + b);

				var askingPrice3 = -b / m;
				askingPrice3 = Math.floor(askingPrice3 * 100) / 100; // round to 2 places

				getMarkupAndYtmAj(loanId, orderId, askingPrice3, function findAskingPriceForTargetYTM_callback3(markup3, ytm3)
				{
				var DEBUG = debug(false, arguments);

					if(ytm3 < targetytm)
					{
						askingPrice2 = askingPrice3;
						ytm2 = ytm3;
					}
					else
					{
						askingPrice1 = askingPrice3;
						ytm1 = ytm3;
					}

					getMarkupAndYtmAj_iterate(iterationsleft - 1);	// loop
				});
			}
			
			getMarkupAndYtmAj_iterate(maxiterations);	// start the loop
		});
	});

}

function table2stringarrarr(dom)
{
	var trs = $("tr:not(:has(th))", dom);
	GM_log("trs.length=", trs.length);
	GM_log("trs=", trs);

	var arr = [];
	trs.each(function(index, element)
	{
		var arr2 = [];
		$("td", element).each(function(index, element)
		{
			arr2.push($(element).text());
		});

		arr.push(arr2);
	});

	return arr;
}



var scanDelay, scanDelayBackoff;

GM_addStyle(".yui-dt-col-NoteStatus {white-space:nowrap;}");

function setupfourclick()
{
	var DEBUG = debug(true, arguments);

	/* from http://css-tricks.com/snippets/jquery/triple-click-event/ */
	$.event.special.fourclick = {

		setup: function(data, namespaces) {
			var elem = this, $elem = jQuery(elem);
			$elem.bind('click', jQuery.event.special.fourclick.handler);
		},

		teardown: function(namespaces) {
			var elem = this, $elem = jQuery(elem);
			$elem.unbind('click', jQuery.event.special.fourclick.handler)
		},

		handler: function(event) {
			var elem = this, $elem = jQuery(elem), clicks = $elem.data('clicks') || 0;
			clicks += 1;
			if ( clicks === 4 ) {
				clicks = 0;

				// set event type to "fourclick"
				event.type = "fourclick";
				
				// let jQuery handle the triggering of "fourclick" event handlers
				jQuery.event.handle.apply(this, arguments)  
			}
			$elem.data('clicks', clicks);
		}
	};
}

function doitReady()
{
	var DEBUG = debug(true, arguments);

	setupfourclick();
	
//	"use strict";	// ewl 2012-12-02
var DEBUG = debug(true, arguments);

	if($(":contains(You've been logged out)").length > 0)
	{
		GM_log("You've been logged out");
		return;
	}

	if(NOFOLIOFNWARNING)
		$(".leavingForFolioFnWarning")
			.each(function()
			{
				/* replace the element since they've already got the listener attached */
				var replacement = $(this).clone().removeClass("leavingForFolioFnWarning");
				$(this).replaceWith(replacement);
			});
	else
		$(".leavingForFolioFnWarning").click(function()
		{
			$("#leavingLcWarningPopup .button-group")
				.prepend("<label><input type='checkbox' class='neveraskagain' />Never ask again*</label>")
				.find("button.default")	// the Yes button
					.click(function()
					{
						var neveraskagain = $(".neveraskagain").prop('checked');
						if(neveraskagain)
							GM_setValue("NOFOLIOFNWARNING", true);
					})
		});

		
	/* Add direct links to Foliofn browse notes/sell notes */
	$("li:contains(Trading Account) a[href='/foliofn/tradingAccount.action']").closest("li")
		.after(''
			+ sprintf(
				"<li>"
				+ "<a href='%s'>Ffn Browse*</a>"
				+ "<span class='separator'>|</span>"
				+ "</li>"
				,
				'/foliofn/tradingInventory.action')
			+ sprintf(
				"<li>"
				+ "<a href='%s'>Ffn Sell*</a>"
				+ "<span class='separator'>|</span>"
				+ "</li>"
				,
				'/foliofn/sellNotes.action')
			);

	var divier = $("li.divier:first");
	$("li:contains(My Account) a[href='/foliofn/tradingAccount.action']").closest("li")
		.after(''
			+ sprintf(
				"<li>"
				+ "<a href='%s'>LendingClub Account*</a>"
				+ "</li>"
				,
				'/account/summary.action')
			)
		.after(divier.clone())	// after the My Account li (after returns original set)
		;

		
	var innerHTML = document.body.innerHTML;
	if(innerHTML.match(/Member Sign-In/))	// sometimes it's the login page
		return;
	else if(innerHTML.match(/Temporarily Unavailable/))	// sometimes it's down
		return;

	GM_log("window.name=" + window.name);
	GM_log("document.title=" + document.title);
	if(document.title.match(/Export Comments/)
	|| document.title.match(/Scan Loans/)
	|| document.title.match(/Scan Orders/)
	|| document.title.match(/Foliofn Export/)
	|| document.title.match(/Foliofn Diffs/))
		return;

	/* in case we're in a page we opened so we don't reuse ourselves */
	if(window.name == '_scanLoans'
	|| window.name == '_scanLoans2'
	|| window.name == '_scanOrders'
	|| window.name == '_foliofnLoansExport')
	{
		GM_log("resetting window.name");
		window.name = '';	
	}

	function set_hideOwnNotes(value)
	{
		setStoredValue("hideOwnNotes", value);

		var head = document.getElementsByTagName('head')[0];

		if(value)
		{
			if(!arguments.callee.style)
				arguments.callee.style = createStyle("tr.lcac_ownNote {display:none}");
			head.appendChild(arguments.callee.style);
		}
		else
			if(arguments.callee.style) head.removeChild(arguments.callee.style);

		updateFirst();
	}

	function set_hideAlreadyInvested(value)
	{
		setStoredValue("hideAlreadyInvested", value);

		var head = document.getElementsByTagName('head')[0];

		if(value)
		{
			if(!arguments.callee.style)
				arguments.callee.style = createStyle("tr.lcac_alreadyInvested {display:none}");
			head.appendChild(arguments.callee.style);
		}
		else
			if(arguments.callee.style) head.removeChild(arguments.callee.style);

		updateFirst();
	}

	function set_hideNotFirst(value)
	{
		setStoredValue("hideNotFirst", value);

		var head = document.getElementsByTagName('head')[0];

		if(value)
		{
			if(!arguments.callee.style)
				arguments.callee.style = createStyle("tr.lcac_notfirst {display:none}");
			head.appendChild(arguments.callee.style);
		}
		else
			if(arguments.callee.style) head.removeChild(arguments.callee.style);

		updateFirst();
	}

	function set_hideUnlikedRows(value)
	{
		setStoredValue("hideUnlikedRows", value);

		var head = document.getElementsByTagName('head')[0];

		if(value)
		{
			if(!arguments.callee.style)
				arguments.callee.style = createStyle("tr.lcac_unlikedRow {display:none}");
			head.appendChild(arguments.callee.style);
		}
		else
			if(arguments.callee.style) head.removeChild(arguments.callee.style);

		updateFirst();
	}

	function set_canceledHide(value)
	{
		GM_log("set_canceledHide() value=" + value);

		setStoredValue("canceledHide", value);

		var head = document.getElementsByTagName('head')[0];

		if(value)
		{
			if(!arguments.callee.style)
				arguments.callee.style = createStyle("tr.lcac_canceled {display:none}");
			head.appendChild(arguments.callee.style);
		}
		else
			if(arguments.callee.style) head.removeChild(arguments.callee.style);
	}




	/*YYY we may be using params not mentioned here when TESTING is off */
	var adjustAskingPriceAutoFuncProto =
		"function(row, loanId, count, interestRate, principalPlus, loanStatus, outstandingPrincipal, accruedInterest, accruedInterestInMonths, foliofnMarkupHighLimit, foliofnMarkupLowLimit"
		+ ", bankruptDeceased, fico, ficoWayDown, ficoDrop, geolocation, amountLent, paymentReceived"
		+ ")";
	var adjustAskingPriceAutoFuncBodyDefault =
		"return principalPlus * (interestRate > 0.10 ? 1.02 : 1.015); /* if the interest rate is more than 10% mark it up 2% otherwise mark it up 1.5% */";
	var adjustAskingPriceAutoFuncBody;	// the current definition of the body
	var adjustAskingPriceAutoFunc = null;	// the instance of the current function
				

	var autoselectFuncProto = "function(row, numselected, loanStatus, loanId, noteId, askingPrice, principalPlus, interestRate, expires, daysLeft, markup, outstandingPrincipal, accruedInterest, accruedInterestInMonths)";
	var autoselectFuncBodyDefault = "return Math.random() < .5;/*select half the notes*/";
	var autoselectFuncBody;
	var autoselectFunc = null;


	function setAutoFunc(funcvarname, funcbodyvarname, funcproto, funcbody)
	{
	var DEBUG = debug(true, arguments);

		try
		{
			setStoredValue(funcbodyvarname, funcbody);	// write it to storage

			var evalstr = sprintf("%s = funcbody;", funcbodyvarname);
			eval(evalstr);
			var evalstr = sprintf("%s = %s { /*use strict;*/ %s };", funcvarname, funcproto, funcbody);
			eval(evalstr);
		}
		catch(ex)
		{
			GM_log("setAutoFunc() ex=", ex);
			GM_log("evalstr=" + evalstr);

			try
			{
				var evalstr = sprintf("%s = null;", funcbodyvarname);
				GM_log("evalstr=" + evalstr);
//				evalstr = "try{" + evalstr + "}catch(ex){alert('in eval() ex=', ex)}";
				eval(evalstr);
			}
			catch(ex2)
			{
				GM_log("setAutoFunc() ex2=", ex2);
			}

			throw ex;
		}
	}



	function autoFuncInit(funcvarname, funcbodyvarname, funcproto, funcbodydefault)
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		var funcbody = getStoredValue(funcbodyvarname);
		DEBUG && GM_log("funcbody=" + funcbody);

		try
		{
			setAutoFunc(funcvarname, funcbodyvarname, funcproto, funcbody);
			return true;
		}
		catch(ex)
		{
			GM_log(FUNCNAME + " ex=", ex);

			var ret = confirm(''
				+ ex + "\n\n"
				+ "\"" + body + "\"" + "\n\n"
				+ "Reset to default?"
				);

			if(ret)	// OK
				setAutoFunc(funcvarname, funcbodyvarname, funcproto, funcbodydefault);
		}
	}
	
	/*YYY in Firefox in a try block function declarations must come before use? */

	/* set up the function on load with the current definition or a default definition */
	autoFuncInit('adjustAskingPriceAutoFunc', 'adjustAskingPriceAutoFuncBody', adjustAskingPriceAutoFuncProto, adjustAskingPriceAutoFuncBodyDefault);
	autoFuncInit('autoselectFunc', 'autoselectFuncBody', autoselectFuncProto, autoselectFuncBodyDefault);


	function autoFuncEdit(funcvarname, funcbodyvarname, funcproto, funcbodydefault, funcbody)
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		while(true)
		{
			funcbody =
				prompt(
					funcproto,	// message
					funcbody);	// default text

			if(funcbody == null)	// user selects "Cancel"
				return;
			
			GM_log("funcbody=" + funcbody + "=", funcbody.split(''));	// funcbody.split will print string as array so you can see each character

			/*
			 * YYY chrome replaces long text argument to confirm with 3 dots in the middle -- very annoying
			 */
			if(funcbody.match(/\.\.\./))	
			{
				GM_log("ellipsis");
				alert("ellipsis detected! func truncated? please paste a clean copy");
				continue;
			}

			funcbody = funcbody.trim();

			if(funcbody == "")	// user enters blank XXX confirm reset to default?
			{
				var ret = confirm("Reset to default?");

				if(ret) // OK
					funcbody = funcbodydefault;
			}

			try
			{
				setAutoFunc(funcvarname, funcbodyvarname, funcproto, funcbody);
				return true;
			}
			catch(ex)
			{
				GM_log(FUNCNAME + " ex=", ex);

				var ret = confirm(''
					+ ex + "\n\n"
					+ "\"" + funcbody + "\"" + "\n\n"
					+ "Try again?"
					);

				GM_log("ret=" + ret);
				if(!ret)	// Cancel
				{
					var ret = confirm("Reset to default?");

					if(ret)
						funcbody = funcbodydefault;
					else
						return false;
				}
			}
		}
	}

	function addHeaderLimits()
	{
		/*
		 * setup the headers
		 * YYY stopPropogation() otherwise it will trigger the header sort
		 */

		$('#yui-dt0-th-asking_price').append(''
			+ "<nobr>"
			+ "<input type='text' id='askingPriceMaxTextBox' size=5 onclick='event.stopPropagation();' />"
			+ "<label for='askingPriceMaxTextBox' onclick='event.stopPropagation();'>max</label>"
			+ "<br>"
			+ "<input type='checkbox' %s id='askingPriceStrictCheckBox' onclick='event.stopPropagation();' />"
			+ "<label for='askingPriceStrictCheckBox' onclick='event.stopPropagation();'>Unlike</label>"
			+ "</nobr>"
			);

		$("th[id$='ytm']").append(''
			+ "<nobr>"
			+ "<input type='text' id='ytmMinTextBox' size=5 onclick='event.stopPropagation();' />"
			+ "<label for='ytmMinTextBox' onclick='event.stopPropagation();'>min</label>"
			+ "<br>"
			+ "<input type='checkbox' id='ytmStrictCheckBox' onclick='event.stopPropagation();' />"
			+ "<label for='ytmStrictCheckBox' onclick='event.stopPropagation();'>Unlike</label>"
			+ "</nobr>"
			);
		
		$("th.lcac_irr").append(
			"<br>"
			+ "<nobr>"
			+ "<label onclick='event.stopPropagation();'>"
			+ "<input type='text' id='irrMinTextBox' size=5 onclick='event.stopPropagation();' />"
			+ "min</label>"
			+ "<br>"
			+ "<label onclick='event.stopPropagation();'>"
			+ "<input type='checkbox' id='irrStrictCheckBox' onclick='event.stopPropagation();' />"
			+ "Unlike</label>"
			+ "</nobr>"
			);
		
		$("th[id$='loanGUID']").append(
			"<nobr>"
			+ "<input type='checkbox' id='hideAlreadyInvestedCheckBox' onclick='event.stopPropagation();'>"
			+ "<label for='hideAlreadyInvestedCheckBox' onclick='event.stopPropagation();'>not invested</label>"
			+ "<br>"
			+ "<label onclick='event.stopPropagation();'>"
			+ "<input type='checkbox' id='hideNotFirstCheckBox' onclick='event.stopPropagation();'>"
			+ "first only</label>"
			+ "</nobr>"
			);

		$("th[id$='term']").append(
			"<nobr>"
			+ "<select id='termSelect' onclick='event.stopPropagation();'>"
			+ "<option value='0'>any</option>"
			+ "<option value='36'>36</option>"
			+ "<option value='60'>60</option>"
			+ "</select>"
			+ "<br>"
			+ "<label onclick='event.stopPropagation();'>"
			+ "<input type='checkbox' id='termStrictCheckBox' onclick='event.stopPropagation();' />"
			+ "Unlike</label>"
			+ "</nobr>"
			);
		
		var remainingPaymentOptions = $("select#to_remp option").clone();	// note: selected option will be carried over

		$("th[id$='remaining_pay']").append(
			"<nobr>" +
			"<label onclick='event.stopPropagation();'>" +
			"<select id='remainingPaymentsMaxSelect' onclick='event.stopPropagation();' />" +
			"max</label>" +
			"<br>" +
			"<label onclick='event.stopPropagation();'>" +
			"<select id='remainingPaymentsMinSelect' onclick='event.stopPropagation();' />" +
			"min</label>" +
			"<br>" +
			"<label onclick='event.stopPropagation();'>" +
			"<input type='checkbox' id='remainingPaymentsStrictCheckBox' onclick='event.stopPropagation();' />" +
			"Unlike</label>" +
			"</nobr>" +
			"")
			.find("select")
				.append("<option value='0'>any</option>")
				.append(remainingPaymentOptions);
		
		$("th[id$='opa']").append(
			"<nobr>" +
			"<label onclick='event.stopPropagation();'>" +
			"<input type='text' id='principalPlusMinTextBox' size=5 onclick='event.stopPropagation();' />" +
			"min</label>" +
			"<br>" +
			"<input type='checkbox' id='principalPlusStrictCheckBox' onclick='event.stopPropagation();' />" +
			"<label for='principalPlusStrictCheckBox' onclick='event.stopPropagation();'>Unlike</label>" +
			"</nobr>" +
			"");
		
		$("th[id$='accrued_interest']")
			.append(
				"<nobr>" +
				"<input type='checkbox' id='accruedInterestStrictCheckBox' onclick='event.stopPropagation();'>" +
				"<label for='accruedInterestStrictCheckBox' onclick='event.stopPropagation();'>&lt;1month</label>" +	// <1mo <1month
				"</nobr>");

		$("th[id$='markup_discount']")
			.append(
				"<nobr>" +
				"<input type='text' id='markupMaxTextBox' size=5 onclick='event.stopPropagation();' />" +
				"<label for='markupMaxTextBox' onclick='event.stopPropagation();'>max</label>" +
				"<br>" +
				"<input type='checkbox' id='markupMaxStrictCheckBox' onclick='event.stopPropagation();' />" +
				"<label for='markupMaxStrictCheckBox' onclick='event.stopPropagation();'>Unlike</label>" +
				"</nobr>" +
				"");

		$("th.lcac_commentColumn").append(
			"<br>" +
			"<input type='checkbox' id='hideUnlikedRowsCheckBox' />" +
			"<label for='hideUnlikedRowsCheckBox'>Hide unliked rows?</label>" +
			"<br>" +
			"<input type='checkbox' id='hideOwnNotesCheckBox' />" +
			"<label for='hideOwnNotesCheckBox'>Hide own notes?</label>");


		/*
		 * setup the widgets
		 */

		$('input#askingPriceMaxTextBox')
			.on('change',
				function(event)
				{
					setHeaderLimit("askingPriceMax", this);
				})
			.on('keypress',
				function(event)
				{
					if(event.keyCode == 13 /*ENTER*/)
					{
						setHeaderLimit("askingPriceMax", this);
						event.preventDefault();	// don't try to submit the form
					}
				})
			.val(sprintf("%.2f", headerLimits.askingPriceMax));

		$('input#askingPriceStrictCheckBox')
			.on('change',
				function(event)
				{
					GM_log("askingPriceStrictCheckBox eventListener()... event=", event);
					setHeaderLimit("askingPriceStrict", this);
				})
			.prop('checked', headerLimits.askingPriceStrict);


		$("input#ytmMinTextBox")
			.on('change',
				function(event)
				{
					setHeaderLimit("ytmMin", this, true);
				})
			.on('keypress',
				function(event)
				{
					if(event.keyCode == 13 /*ENTER*/)
					{
						setHeaderLimit("ytmMin", this, true);
						event.preventDefault();	// don't try to submit the form
					}
				})
			.val(sprintf("%.1f%%", headerLimits.ytmMin * 100));

		$('input#ytmStrictCheckBox')
			.on('change',
				function(event)
				{
					GM_log("ytmStrictCheckBox on$function()... event=", event);
					setHeaderLimit("ytmStrict", this);
				})
			.prop('checked', headerLimits.ytmStrict);

		$("input#irrMinTextBox")
			.on('change',
				function(event)
				{
					setHeaderLimit("irrMin", this, true);
				})
			.on('keypress',
				function(event)
				{
					if(event.keyCode == 13 /*ENTER*/)
					{
						setHeaderLimit("irrMin", this, true);
						event.preventDefault();	// don't try to submit the form
					}
				})
			.val(sprintf("%.1f%%", headerLimits.irrMin * 100));

		$('input#irrStrictCheckBox')
			.on('change',
				function(event)
				{
					GM_log("irrStrictCheckBox on$function()... event=", event);
					setHeaderLimit("irrStrict", this);
				})
			.prop('checked', headerLimits.irrStrict);

		$('input#accruedInterestStrictCheckBox')
			.prop('checked', headerLimits.accruedInterestStrict)
			.on('change',
				function(event)
				{
					setHeaderLimit("accruedInterestStrict", this);
				});


		$('select#termSelect')
			.val(headerLimits.term == null ? "0" : headerLimits.term)	//YYY "Use of attributes' specified attribute is deprecated. It always returns true."
			.on('change',
				function(event)
				{
					GM_log("termSelect eventListener()... event=", event, " this=", this);
					setHeaderLimit("term", this);	// this == select
				});

		$('input#termStrictCheckBox')
			.prop('checked', headerLimits.termStrict)
			.on('change',
				function(event)
				{
					GM_log("termStrictCheckBox eventListener()... event=", event);
					setHeaderLimit("termStrict", this);	// this == select
				});
		
		$('select#remainingPaymentsMaxSelect')
			.val(headerLimits.remainingPaymentsMax == null ? "0" : headerLimits.remainingPaymentsMax)	//YYY "Use of attributes' specified attribute is deprecated. It always returns true."
			.on('change',
				function(event)
				{
					GM_log("remainingPaymentsMaxSelect eventListener()... event=", event, " this=", this);
					setHeaderLimit("remainingPaymentsMax", this);	// this == select
				});

		$('select#remainingPaymentsMinSelect')
			.val(headerLimits.remainingPaymentsMin == null ? "0" : headerLimits.remainingPaymentsMin)	//YYY "Use of attributes' specified attribute is deprecated. It always returns true."
			.on('change',
				function(event)
				{
					GM_log("remainingPaymentsMinSelect eventListener()... event=", event, " this=", this);
					setHeaderLimit("remainingPaymentsMin", this);	// this == select
				});

		$('input#remainingPaymentsStrictCheckBox')
			.prop('checked', headerLimits.remainingPaymentsStrict)
			.on('change',
				function(event)
				{
					GM_log("remainingPaymentsStrictCheckBox eventListener()... event=", event);
					setHeaderLimit("remainingPaymentsStrict", this);	// this == select
				});
		


		$('input#hideAlreadyInvestedCheckBox')
			.on('change',
				function(event)
				{
					GM_log("hideAlreadyInvestedCheckBox eventListener()... event=", event);
					set_hideAlreadyInvested($(this).prop('checked'));
				})
			.prop('checked', getStoredValue("hideAlreadyInvested"));

		$('input#hideNotFirstCheckBox')
			.on('change',
				function(event)
				{
					GM_log("hideNotFirstCheckBox eventListener()... event=", event);
					set_hideNotFirst($(this).prop('checked'));
				})
			.prop('checked', getStoredValue("hideNotFirst"));

		$('input#principalPlusMinTextBox')
			.val(sprintf("%.2f", headerLimits.principalPlusMin))
			.on('change',
				function(event)
				{
					setHeaderLimit("principalPlusMin", this);
				})
			.on('keypress',
				function(event)
				{
					if(event.keyCode == 13 /*ENTER*/)
					{
						setHeaderLimit("principalPlusMin", this);
						event.preventDefault();	// don't try to submit the form
					}
				});

		$('input#principalPlusStrictCheckBox')
			.prop('checked', headerLimits.principalPlusStrict)
			.on('change',
				function(event)
				{
					GM_log("principalPlusStrictCheckBox eventListener()... event=", event);
					setHeaderLimit("principalPlusStrict", this);
				});

		$("input#markupMaxTextBox")
			.val(sprintf("%.1f%%", headerLimits.markupMax * 100))
			.on('change',
				function(event)
				{
					setHeaderLimit("markupMax", this, true);
				})
			.on('keypress',
				function(event)
				{
					if(event.keyCode == 13)
					{
						setHeaderLimit("markupMax", this, true);
						event.preventDefault();	// don't try to submit the form
					}
				});

		$('input#markupMaxStrictCheckBox')
			.prop('checked', headerLimits.markupMaxStrict)
			.on('change',
				function(event)
				{
					setHeaderLimit("markupMaxStrict", this);
				});


		$("input#hideUnlikedRowsCheckBox")
			.on('change',
				function(event)
				{
					GM_log("hideUnlikedRowsCheckBox.on('change')...");
					set_hideUnlikedRows($(this).prop('checked'));
				})
			.prop('checked', getStoredValue("hideUnlikedRows"));

		$("input#hideOwnNotesCheckBox")
			.on('change',
				function(event)
				{
					GM_log("hideOwnNotesCheckBox.on('change')...");
					set_hideOwnNotes($(this).prop('checked'));
				})
			.prop('checked', getStoredValue("hideOwnNotes") );
	}

	function findHeader(notesTable0, pattern)
	{
		var ths = notesTable0.tHead.rows[0].cells;

		//XXX there's probably a better way to do this
		for(var index = 0; index < ths.length; index++)
		{
			var innerHTML = ths[index].innerHTML;

			if(innerHTML.match(pattern))
				return index;
		}

		return null;
	}

	function colorCellsSoldPurchasedCanceled(notesTable)
	{
	var DEBUG = debug(false, arguments);

		var notesTable0 = notesTable.get(0);
		
		var trs =
			notesTable
				.find("tbody:last tr")
					.not(".tfoot")	// last line, footer
					.not(".lcac_canceled")	// expired so hidden
					.not(":contains('Edit Order')")	// footer on placeOrder.action
					.not(":contains('No Results Found')")	 // "No Results Found"
					;


		trs.each(function()
		{
			var tr = $(this);
			var tds = tr.find("td");
			
			var loanStatusCell = tds.eq(notesTable0.loanStatusColumnIndex);

			var askingPrice = text2Value(tds.eq(notesTable0.askingPriceColumnIndex).text());
			var salePrice = text2Value(tds.eq(notesTable0.salePriceColumnIndex).text());
			var purchasePrice = text2Value(tds.eq(notesTable0.purchasePriceColumnIndex).text());
				
			DEBUG && GM_log("askingPrice=", askingPrice, " salePrice=", salePrice, " purchasePrice=", purchasePrice, " notesTable0.salePriceColumnIndex=", notesTable0.salePriceColumnIndex, " notesTable0.purchasePriceColumnIndex=", notesTable0.purchasePriceColumnIndex);
				
			/*
			 * add price to href link to note
			 */
			if(PRICESINURL)
			{
				if(askingPrice)
				{
					var a = loanStatusCell.find('a');	// find the element that has the string (could be us or a div)
					a.prop('href', a.prop('href') + sprintf("&our_asking_price=%0.2f", askingPrice));	// we're selling it
				}
				if(salePrice)
				{
					var a = loanStatusCell.find('a');	// find the element that has the string (could be us or a div)
					a.prop('href', a.prop('href') + sprintf("&sale_price=%0.2f", salePrice));	// sold
				}
				if(purchasePrice)
				{
					var a = loanStatusCell.find('a');	// find the element that has the string (could be us or a div)
					a.prop('href', a.prop('href') + sprintf("&purchase_price=%0.2f", purchasePrice));	// sold
				}
			}
		});
	}

	GM_addStyle(".lcac_first td.lcac_first_candidate {font-style:normal; font-weight:bold;}");
	GM_addStyle(".lcac_notfirst td.lcac_first_candidate {font-style:italic; font-weight:normal !important;}");
	GM_addStyle("td.lcac_alreadyInvested {text-decoration:underline !important;}");

	GM_addStyle(sprintf(".lcac_pending {background-color:%s !important;}", greenLow));
	GM_addStyle(sprintf(".lcac_updating {background-color:%s !important;}", yellowMed));
	GM_addStyle(sprintf(".lcac_likedRow {background-color:%s !important;}", greenLow));
	GM_addStyle(sprintf(".lcac_redHigh {background-color:%s !important;}", redHigh));
	GM_addStyle(sprintf(".lcac_redMed {background-color:%s !important;}", redHigh));
	GM_addStyle(sprintf(".lcac_redLow {background-color:%s !important;}", redLow));
	GM_addStyle(sprintf(".lcac_orangeHigh {background-color:%s !important;}", orangeHigh));
	GM_addStyle(sprintf(".lcac_orangeMed {background-color:%s !important;}", orangeMed));
	GM_addStyle(sprintf(".lcac_orangeLow {background-color:%s !important;}", orangeLow));
	GM_addStyle(sprintf(".lcac_yellowHigh {background-color:%s !important;}", yellowHigh));
	GM_addStyle(sprintf(".lcac_yellowMed {background-color:%s !important;}", yellowMed));
	GM_addStyle(sprintf(".lcac_yellowLow {background-color:%s !important;}", yellowLow));
	GM_addStyle(sprintf(".lcac_greenHigh {background-color:%s !important;}", greenHigh));
	GM_addStyle(sprintf(".lcac_greenMed {background-color:%s !important;}", greenMed));
	GM_addStyle(sprintf(".lcac_greenLow {background-color:%s !important;}", greenLow));
	GM_addStyle(".lcac_hide {display:none !important}");
	GM_addStyle(".lcac_nowrap {white-space:nowrap}");
	GM_addStyle(".lcac_gainloss {white-space:nowrap}");
	GM_addStyle(".lcac_inmonths {white-space:nowrap}");

	function colorCellsTradingInventory(notesTable) // Foliofn Browse Notes
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		var notesTable0 = notesTable.get(0);

		var trs =
			notesTable
				.find("tbody:last tr")
					.not(".tfoot")	// last line, footer
					.not(".lcac_canceled")	// expired so hidden
					.not(":contains('Edit Order')")	// footer on placeOrder.action
					.not(":contains('No Results Found')")	 // "No Results Found"
					;

		var ownNoteCount = 0, unlikedCount = 0;

		var loanIdSeen = {};	// italic loanIds

		loadSessionData();

		trs.each(function()
		{
			try
			{
				var tr0 = this;
				var tr = $(this);

				var ownNote = tr.html().match(/This is your own note/);
				if(ownNote)
				{
					tr.addClass('lcac_ownNote');
					ownNoteCount++;
					return;
				}

				var loanId = tr.data('loanId');
		//		var loanId = getLoanId(tr, notesTable0.loanIdColumnIndex, notesTable0.loanIdEmbeddedColumnIndex);

				var tds = tr.find("td");

				tds
					.css('background', '')	// remove all the backgrounds (YYY better to use classes?)
					.removeClass(			// remove all these classes
						"lcac_redHigh lcac_redMed lcac_redLow" +
						" lcac_orangeHigh lcac_orangeMed lcac_orangeLow" +
						" lcac_yellowHigh lcac_yellowMed lcac_yellowLow" +
						" lcac_greenHigh lcac_greenMed lcac_greenLow" +
						"");

				if(notesTable0.loanIdColumnIndex)
					var loanIdCell = tds.eq(notesTable0.loanIdColumnIndex);

				var loanStatusCell = tds.eq(notesTable0.loanStatusColumnIndex);
				var loanStatus = loanStatusCell.text();

				var termCell = tds.eq(notesTable0.termColumnIndex);
				var term = text2Value(termCell.text());
				
				var remainingPaymentsCell = tds.eq(notesTable0.remainingPaymentsColumnIndex);
				var remainingPayments = text2Value(remainingPaymentsCell.text());

				var outstandingPrincipal = text2Value(tds.eq(notesTable0.outstandingPrincipalColumnIndex).text());
				var principalPlus = text2Value(tds.eq(notesTable0.principalPlusColumnIndex).text());

				var accruedInterestCell = tds.eq(notesTable0.accruedInterestColumnIndex);
				var accruedInterest = text2Value(accruedInterestCell.text());

				var askingPriceCell = tds.eq(notesTable0.askingPriceColumnIndex);
				var askingPrice = text2Value(askingPriceCell.text());

				var ytm = text2Value(tds.eq(notesTable0.ytmColumnIndex).text());
				var markup = text2Value(tds.eq(notesTable0.markupColumnIndex).text());

				var interestRateCell = tds.eq(notesTable0.interestRateColumnIndex);
				var interestRate = parseInterestRate(loanId, interestRateCell.text(), false);
				
				var irrCell = notesTable0.irrColumnIndex != null ? tds.eq(notesTable0.irrColumnIndex) : null;

				var accruedInterestInMonths = calcInterestInMonths(outstandingPrincipal, interestRate, accruedInterest);

				GM_log("accruedInterestCell.hasClass('lcac_modified')=" + accruedInterestCell.hasClass('lcac_modified'));
				if(!accruedInterestCell.hasClass('lcac_modified'))	// called in a loop, so check to see if we already changed it
				{
					accruedInterestCell.addClass('lcac_modified');

					/*
					 * add months to accrued interest col
					 */
					var td = accruedInterestCell;
					var div = td.find('div');	// find the element that has the string (could be us or a div)
					if(div.length == 0)
						div = td;

					div.append(sprintf('[%0.1fm]', accruedInterestInMonths));

					/*
					 * add asking_price to href link to note
					 */
					var a = loanStatusCell.find('a');
					a.prop('href', a.prop('href')
//						+ sprintf("&asking_price=%s&accrued_interest=%s", askingPrice, accruedInterest));	// don't need accrued_interest anymore
						+ sprintf("&asking_price=%s", askingPrice));
				}
				
				if(irrCell && !irrCell.hasClass('lcac_modified'))	// called in a loop, so check to see if we already changed it
				{
					irrCell.addClass('lcac_modified');

					var loanFraction = Math.ceil(outstandingPrincipal / 25) * 25;	//XXX where can we get this????
					/*YYY paymentAmount unknown at this point, remainingPayments is often incorrect*/
//					var paymentAmount = floor2Decimals(-PMT(interestRate / 12, term, loanFraction));
//					var paymentAmount = outstandingPrincipal / remainingPayments;	//WRONG!
					var paymentAmount = floor2Decimals(-PMT(interestRate / 12, remainingPayments, outstandingPrincipal));
//					GM_log("paymentAmount=" + paymentAmount);

					var irr = IRR(
						outstandingPrincipal,
						accruedInterest,
						paymentAmount,
						interestRate,
						askingPrice);

					irrCell.text(negative2parens("%0.2f%%", irr * 100));
				}

				var like = 0, unlike = 0;
				
				/*
				 * highlight repeated loan ids (per table)
				 * XXX if first row is hidden how do we update these?
				 */
				if(loanIdCell)
				{
					loanIdCell.addClass('lcac_first_candidate');
					tr.addClass('lcac_first_candidate');
					tr.data('lcac_loanId', loanId);
				}

				if(loanIdCell && isLoanOwned(loanId))
				{
					loanIdCell.addClass('lcac_alreadyInvested');
					tr.addClass('lcac_alreadyInvested');
				}

				/* dealbreakers */
				if(loanStatus.match(/Default|Charged\s*Off/))
				{
					unlike++;
					loanStatusCell.addClass('lcac_redHigh');
					tr.addClass('lcac_statusStrict');
				}

				if(headerLimits.term
				&& headerLimits.term != "0" && term != headerLimits.term)
				{
					if(headerLimits.termStrict)
						unlike++;
					termCell.addClass('lcac_yellowMed');
					tr.addClass('lcac_termStrict');
				}

				GM_log("headerLimits.term=", headerLimits.term);
				GM_log("headerLimits.remainingPaymentsMax=", headerLimits.remainingPaymentsMax);
				GM_log("headerLimits.remainingPaymentsMin=", headerLimits.remainingPaymentsMin);

				if(headerLimits.remainingPaymentsMax != 0	// this is a string
				&& remainingPayments > headerLimits.remainingPaymentsMax)
				{
					GM_log("HERE 1 typeof headerLimits.remainingPaymentsMax=", typeof headerLimits.remainingPaymentsMax);

					if(headerLimits.remainingPaymentsStrict)
						unlike++;
					remainingPaymentsCell.addClass('lcac_yellowMed');
					tr.addClass('lcac_remainingPaymentsStrict');
				}

				if(headerLimits.remainingPaymentsMin != 0	// this is a string
				&& remainingPayments < headerLimits.remainingPaymentsMin)
				{
					GM_log("HERE 2");

					if(headerLimits.remainingPaymentsStrict)
						unlike++;
					remainingPaymentsCell.addClass('lcac_yellowMed');
					tr.addClass('lcac_remainingPaymentsStrict');
				}

				if(accruedInterestInMonths >= lateMonths1) // more than 3 months' interest
				{
					if(headerLimits.accruedInterestStrict)
						unlike++;
					accruedInterestCell.addClass('lcac_redHigh');
					tr.addClass('lcac_accruedInterestStrict');
				}
				else if(accruedInterestInMonths >= lateMonths2) // more than 2 months' interest
				{
					if(headerLimits.accruedInterestStrict)
						unlike++;
					accruedInterestCell.addClass('lcac_redMed');
					tr.addClass('lcac_accruedInterestStrict');
				}
				else if(accruedInterestInMonths >= lateMonths3) // more than 1 month + grace period
				{
					if(headerLimits.accruedInterestStrict)
						unlike++;
					accruedInterestCell.addClass('lcac_redLow');
					tr.addClass('lcac_accruedInterestStrict');
				}
				if(accruedInterestInMonths >= lateMonths4) // in grace period?
				{
					if(headerLimits.accruedInterestStrict)
						unlike++;
					accruedInterestCell.addClass('lcac_yellowMed');
					tr.addClass('lcac_accruedInterestStrict');
				}
				else if(accruedInterestInMonths >= 1.0) // in grace period? probably "Processing..."
				{
					if(headerLimits.accruedInterestStrict)
						unlike++;
					accruedInterestCell.addClass('lcac_yellowLow');
					tr.addClass('lcac_accruedInterestStrict');
				}


				/* user settable limits... yellow or red better? */
				if(askingPrice > headerLimits.askingPriceMax)
				{
					if(headerLimits.askingPriceStrict)
						unlike++;
					askingPriceCell.addClass('lcac_yellowHigh');
					tr.addClass('lcac_askingPriceStrict');
				}
				
				
				var irr = text2Value(tds.eq(notesTable0.irrColumnIndex).text());


				if(ytm == null)	// -- can either mean "can't calculate" or "0"
				{
					tds.eq(notesTable0.ytmColumnIndex).addClass('lcac_redLow');
					tr.addClass('lcac_ytmStrict');
				}
				else if(ytm < 0)	// never something you want
				{
					if(headerLimits.ytmStrict)
						unlike++;
					tds.eq(notesTable0.ytmColumnIndex).addClass('lcac_redHigh');
					tr.addClass('lcac_ytmStrict');
				}
				else if(ytm < headerLimits.ytmMin)
				{
					if(headerLimits.ytmStrict)
					{
						unlike++;
						tds.eq(notesTable0.ytmColumnIndex).addClass('lcac_redHigh');
					}
					else
						tds.eq(notesTable0.ytmColumnIndex).addClass('lcac_yellowLow');

					tr.addClass('lcac_ytmStrict');
				}

				if(irr == null)	// -- can either mean "can't calculate" or "0"
				{
					tds.eq(notesTable0.irrColumnIndex).addClass('lcac_redLow');
					tr.addClass('lcac_irrStrict');
				}
				else if(irr < 0)	// never something you want
				{
					if(headerLimits.irrStrict)
						unlike++;
					tds.eq(notesTable0.irrColumnIndex).addClass('lcac_redHigh');
					tr.addClass('lcac_irrStrict');
				}
				else if(irr < headerLimits.irrMin)
				{
					if(headerLimits.irrStrict)
					{
						unlike++;
						tds.eq(notesTable0.irrColumnIndex).addClass('lcac_redHigh');
					}
					else
						tds.eq(notesTable0.irrColumnIndex).addClass('lcac_yellowLow');
					tr.addClass('lcac_irrStrict');
				}

				if(principalPlus < 0 || isNaN(principalPlus))	// e.g. "--" becomes NaN when we try to parse it
				{
					if(headerLimits.principalPlusStrict)
						unlike++;
					tds.eq(notesTable0.principalPlusColumnIndex).addClass('lcac_redHigh');
					tr.addClass('lcac_principalPlusStrict');
				}
				else if(principalPlus < headerLimits.principalPlusMin)
				{
					if(headerLimits.principalPlusStrict)
						unlike++;
					tds.eq(notesTable0.principalPlusColumnIndex).addClass('lcac_yellowHigh');
					tr.addClass('lcac_principalPlusStrict');
				}
				else if(principalPlus < askingPrice)
					tds.eq(notesTable0.principalPlusColumnIndex).addClass('lcac_yellowLow');


				if(markup > headerLimits.markupMax)
				{
					if(headerLimits.markupMaxStrict)
						unlike++;
					tds.eq(notesTable0.markupColumnIndex).addClass('lcac_redLow');
					tr.addClass('lcac_markupMaxStrict');
				}
				else if(markup > 0)
					tds.eq(notesTable0.markupColumnIndex).addClass('lcac_yellowHigh');

				if(unlike > 0)
				{
		//			DEBUG && GM_log(DEBUG + " unlikedRow");
					tr.addClass('lcac_unlikedRow');
					tr.removeClass('lcac_likedRow');
					unlikedCount++;
					return;
				}

		//		DEBUG && GM_log(DEBUG + " likedRow");
				tr.addClass('lcac_likedRow');
				tr.removeClass('lcac_unlikedRow');


				if(askingPrice <= headerLimits.askingPriceMax)
				{
					like++;
					askingPriceCell.addClass('lcac_greenMed');
				}

				if(loanStatus.match(/Current/))
				{
					like++;
					loanStatusCell.addClass('lcac_greenMed');
				}

				if(ytm >= headerLimits.ytmMin)
				{
					like++;
					tds.eq(notesTable0.ytmColumnIndex).addClass('lcac_greenMed');
				}

				if(principalPlus >= headerLimits.principalPlusMin)
				{
					like++;
					tds.eq(notesTable0.principalPlusColumnIndex).addClass('lcac_greenMed');
				}

				if(markup <= headerLimits.markupMax)
				{
					like++;
					tds.eq(notesTable0.markupColumnIndex).addClass('lcac_greenMed');
				}

				// XXX remainingPayments information is incorrect on this table
		//		if(remainingPaymentsMax > 0 && remainingPayments <= remainingPaymentsMax)
		//			tds.eq(notesTable0.remainingPaymentsColumnIndex].addClass('lcac_greenLow');

				if(unlike == 0 && like >= 4)
					tr.addClass('lcac_likedRow');
			}
			catch(ex)
			{
				GM_log(FUNCNAME + " ex=" + ex + "\n" + ex.message + "\n" + ex.stack);
			}
		});

		$(".lcac_likedRow").removeClass('lcac_hide');

		updateFirst();

		window.status = sprintf("%d unliked rows, %d own notes", unlikedCount, ownNoteCount);
		DEBUG && GM_log("window.status=" + window.status);
	}




	function colorCellsPlusMarkup(notesTable)
	{
		colorCells(notesTable);
		updateMarkupAll(notesTable.get(0), notesTable.find("tbody:last tr"));
	}




	/*
	 * find first and most recent payment dates
	 * Note: Issued loans only have a scheduled payment in payment history
	 */

	/* find the most recent payment, does it matter if it paid or not?
	 *
	 * Note: sometimes Payment history skips a payment between most recent and scheduled if it's late/grace
	 * use a month before scheduled payment to work around this? doesn't always match the payment though e.g. on payment plan
	 */
	/* NOTE: data is contained within divs inside the td's, e.g.

	<tr id="yui-rec11" class="yui-dt-rec yui-dt-first yui-dt-even" style="">
	<td id="yui-gen89" class="dueDate yui-dt0-col-dueDate yui-dt-col-dueDate yui-dt-desc yui-dt-sortable yui-dt-resizeable yui-dt-first" headers="yui-dt0-th-dueDate ">
	<div id="yui-gen90" class="yui-dt-liner">10/19/12</div>
	</td>
	<td class=" tooltip compDate yui-dt0-col-compDate yui-dt-col-compDate yui-dt-sortable" headers="yui-dt0-th-compDate ">

	*/


	function tooManyRowsTickMark(value)
	{
		return ( CHECKBOXLIMIT > 0 && value > CHECKBOXLIMIT ) ? '+' : '';
	}

	function loanDetailURL(loanId)
	{
		return sprintf("/browse/loanDetail.action?loan_id=%s", loanId);
	}
		
	function toYYYYMMDD(datestr)
	{
		if(!datestr)
			return datestr;

		return datestr.replace(/(\d+)[^\d](\d+)[^\d](\d+)/, "$3$1$2");
	}


	/*
	 * END http://www.greywyvern.com/?post=258
	 */

	function parseAccountNotesRawDataCsv(responseText)
	{
	var DEBUG = debug(true, arguments, false), FUNCNAME = funcname(arguments);

		timestamp(FUNCNAME, 'before csv2Array()');
		var csvArray = csv2Array(responseText);
		timestamp(FUNCNAME, 'after csv2Array()');

		DEBUG && GM_log(FUNCNAME + " csvArray.length=" + csvArray.length);
		false && DEBUG && GM_log(FUNCNAME + " csvArray=", csvArray);

		var notes = [];
		for(var index = 0; index < csvArray.length; index++)
		{
			var note = csvArray[index];

			if(index < 10)
				DEBUG && GM_log(FUNCNAME + " note=", note);

			var note2 = {
				noteId: note['NoteId'],
				loanId: note['LoanId'],
				orderId: note['OrderId'],
				accrual: parseFloat(note['Accrual']),
				paymentReceived: parseFloat(note['PaymentsReceivedToDate']),
				amountLent: parseFloat(note['Invested'] ? note['Invested'] : note['Investment'] ? note['Investment'] : note['AmountLent']),
				status: note['Status'],
				orderDate: toYYYYMMDD(note['OrderDate']),

				issueDate0: toYYYYMMDD(note['Issue Date']),
				loanIssueDate: toYYYYMMDD(note['Loan Issue Date']),
				noteIssueDate: toYYYYMMDD(note['Note Issue Date']),

				principalRemaining: parseFloat(note['PrincipalRemaining']),
				interestRate: parseFloat(note['InterestRate']) / 100,
				status: note['Status'],

				nextPaymentDate: toYYYYMMDD(note['NextPaymentDate']),
			};
				
			note2.issueDate = note2.issueDate0 ? note2.issueDate0 : (note2.loanIssueDate ? note2.loanIssueDate : note2.noteIssueDate);

			notes.push(note2);
		}

		DEBUG && GM_log(FUNCNAME + " notes[0]=", notes[0]);
		
		timestamp(FUNCNAME, 'parseAccountNotesRawDataCsv returning');

		return notes;
	}

	function parseFfnNotesRawDataCsv(responseText)
	{
	var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

		var csvArray = csv2Array(responseText);

		DEBUG && GM_log(FUNCNAME + " csvArray.length=" + csvArray.length + " csvArray=", csvArray);

		var notes = [];
		for(var index = 0; index < csvArray.length; index++)
		{
			var note = csvArray[index];

			var note = {
				loanId: note['LoanId'],
				noteId: note['NoteId'],
				orderId: note['OrderId'],
				outstandingPrincipal: parseFloat(note['OutstandingPrincipal']),
				accruedInterest: parseFloat(note['AccruedInterest']),
				status: note['Status'],
				askPrice: parseFloat(note['AskPrice']),
				markupDiscount: parseFloat(note['Markup/Discount']),
				ytm: parseFloat(note['YTM']),
				daysSinceLastPayment: parseInt(note['DaysSinceLastPayment']),
				creditScoreTrend: note['CreditScoreTrend'],
				FICOEndRange: note['FICO End Range'],
				datetimeListed: note['Date/Time Listed'],
				neverLate: note['NeverLate'] == 'true',
			};

			notes.push(note);
		}

		DEBUG && GM_log(FUNCNAME + " notes[0]=", notes[0]);

		return notes;
	}

	/*
	 * Download all the notes we hold, also updates the stored note data
	 */
	function getAccountNotesRawData(callback)
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		/*
		 * YYY not straight-foward to get the complete list
		 * getting it from Account is OK, but from Folfiofn My Accounts the file is small,
		 * e.g. 12K instead of 360K, 89 notes instead of 2600
		 * cookies all look the same, is it using referer?
		 * (we had a problem once selling notes when using the no-referer add-on)
		 * YYY setting the referer is prohibited in javascript
		 */
		$.get(notesRawDataURL, function(responseText)
		{
			GM_log(FUNCNAME + " responseText.length=" + responseText.length);

			if(responseText.match(/Member Sign-In/))		// we've been logged out
			{
				alert("Not logged in");
				if(callback)
					callback(null);
				return;
			}

			timestamp(FUNCNAME, 'before parseAccountNotesRawDataCsv');
			var notes = parseAccountNotesRawDataCsv(responseText);	// an array of notes
			timestamp(FUNCNAME, 'after parseAccountNotesRawDataCsv');

			DEBUG && GM_log(DEBUG + " notes.length=", notes.length);
			DEBUG && GM_log(DEBUG + " notes=", notes);

			saveOwnedNotes(notes);
			saveStoredNotes(notes);

			if(callback)
			{
				DEBUG && GM_log(DEBUG + " calling getAccountNotesRawData_callback()...");
				callback(notes);
			}

			// done
		})
		.fail(function(jqXHR, textStatus, errorThrown)
		{
			GM_log("getAccountNotesRawData() textStatus=" + textStatus + " errorThrown=" + errorThrown);
			alert("getAccountNotesRawData() textStatus=" + textStatus + " errorThrown=" + errorThrown);
		});
	}

	function getFfnNotesRawData(callback)
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		var setupURL = '/foliofn/tradingInventory.action?mode=search&search_from_rate=0.04&search_to_rate=0.27&loan_status=loan_status_issued&loan_status=loan_status_current&loan_status=loan_status_ingrace&loan_status=loan_status_late_16_30&loan_status=loan_status_late_31_120&fil_search_term=term_36&fil_search_term=term_60&search_loan_term=term_36&search_loan_term=term_60&remp_min=1&remp_max=60&askp_min=0.00&askp_max=Any&markup_dis_min=-100&markup_dis_max=15&opr_min=0.00&opr_max=Any&ona_min=25&ona_max=Any&ytm_min=0&ytm_max=Any&credit_score_min=600&credit_score_max=850&credit_score_trend=UP&credit_score_trend=DOWN&credit_score_trend=FLAT';
//		var setupURL = 'https://www.lendingclub.com/foliofn/tradingInventory.action?mode=search&search_from_rate=0.04&search_to_rate=0.27&loan_status=loan_status_issued&loan_status=loan_status_current&loan_status=loan_status_ingrace&loan_status=loan_status_late_16_30&loan_status=loan_status_late_31_120&fil_search_term=term_36&fil_search_term=term_60&search_loan_term=term_36&search_loan_term=term_60&remp_min=13&remp_max=13&askp_min=0.00&askp_max=Any&markup_dis_min=-100&markup_dis_max=15&opr_min=0.00&opr_max=Any&ona_min=25&ona_max=Any&ytm_min=0&ytm_max=Any&credit_score_min=600&credit_score_max=850&credit_score_trend=UP&credit_score_trend=DOWN&credit_score_trend=FLAT';

		var requestURL = "/foliofn/notesRawData.action";	// link at bottom of Foliofn Browse Notes "Download Search Results"
		GM_log("requestURL=", requestURL);
		
		$.get(setupURL, function getFfnNotesRawData_get_setupURL_callback(responseText)
		{
		var FUNCNAME = funcname(arguments);

			GM_log(FUNCNAME + " responseText.length=" + responseText.length);

			$.get(requestURL, function getFfnNotesRawData_get_requestURL_callback(responseText)
			{
			var FUNCNAME = funcname(arguments);

				GM_log(FUNCNAME + " responseText.length=" + responseText.length);

				if(responseText.match(/Member Sign-In/))		// we've been logged out
				{
					alert("Not logged in");
					if(callback)
						callback(null);
					return;
				}

				var notes = parseFfnNotesRawDataCsv(responseText);	// an array of notes

				//XXX try to cache them?

				DEBUG && GM_log(FUNCNAME + " notes.length=", notes.length);
				DEBUG && GM_log(FUNCNAME + " notes=", notes);

				if(callback)
				{
					DEBUG && GM_log(FUNCNAME + " calling getFfnNotesRawData_callback()...");
					callback(notes);
				}

				// done
			})
			.fail(function requestURL_fail(jqXHR, textStatus, errorThrown)
			{
			var FUNCNAME = funcname(arguments);

				GM_log(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
				alert(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
			});
		})
		.fail(function setupURL_fail(jqXHR, textStatus, errorThrown)
		{
		var FUNCNAME = funcname(arguments);

			GM_log(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
			alert(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
		});
	}
	
	function getLenderActivityMulti(callback)
	{
	var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);
				
		var lenderActivityWindow = window.open(null, "_lenderActivity");
		if(lenderActivityWindow == null)
		{
			alert("Could not open a window. Are popups blocked?");
			return;
		}
		
		lenderActivityWindow.document.write(
			"<head><title>Lender Activity</title></head>" +
			"<body><pre id='LenderActivity'>");

		// Note: "Activity older than 6 months is not available."

		var endDate = new Date(2015, 01, 16);	// today (month is 0-based)

		var startDate = new Date(endDate.getTime());
		startDate.setDate(2);

		var count = 20;

		loop();

		function loop()
		{
			GM_log("startDate=", startDate, " endDate=", endDate);
			getLenderActivity(startDate, endDate, true, function(responseText)
			{
				GM_log("responseText=", responseText.substring(0, 256) + "...");

				if(!responseText)
				{
					lenderActivityWindow.document.write("--Error--");
					if(callback) callback(false);
					return;
				}
				else if(responseText.match(/master_error-wrapper/))
				{
//					GM_log("responseText=", responseText);
//					lenderActivityWindow.document.write("--EOF--");
					if(callback) callback(true);
					return;
				}

				lenderActivityWindow.document.write(responseText);

				endDate = startDate;
				startDate = new Date(endDate);
				startDate.setDate(2);
				startDate.setMonth(startDate.getMonth() - 1);

				loop();
			});
		}
	}

	function getLenderActivity(
		startdate, enddate
		, reportTypeExtended
		, callback
		)
	{
	var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

		var reportType = reportTypeExtended ? 'extended' : 'all';

		// Download All: https://www.lendingclub.com/account/getLenderActivity.action?output=csv&reportType=all&end_date_monthly_statements=02%2F16%2F2015&start_date_monthly_statements=02%2F01%2F2015
		// Download All - Extended: https://www.lendingclub.com/account/getLenderActivity.action?output=csv&reportType=extended&end_date_monthly_statements=02%2F16%2F2015&start_date_monthly_statements=02%2F01%2F2015

		startdate = sprintf("%02d/%02d/%d", startdate.getMonth() + 1, startdate.getDate(), startdate.getFullYear());
		GM_log(FUNCNAME + " startdate=" + startdate);

		
		enddate = sprintf("%02d/%02d/%d", enddate.getMonth() + 1, enddate.getDate(), enddate.getFullYear());
		GM_log(FUNCNAME + " enddate=" + enddate);
		

		var requestURL = sprintf("/account/getLenderActivity.action?output=csv&reportType=%s&end_date_monthly_statements=%s&start_date_monthly_statements=%s"
			, reportType
			, enddate
			, startdate
			);
		GM_log(FUNCNAME + " requestURL=" + requestURL);
			
		$.get(requestURL, function getLenderActivity_get_callback(responseText, textStatus, jqXHR) 	// success
		{
			var FUNCNAME = funcname(arguments);
		
			if(responseText.match(/Member Sign-In/))		// we've been logged out
			{
				/* XXX alert the user */
				callback(null);
				return;
			}

			callback(responseText);
		})
		.fail(function getLenderActivity_get_fail(jqXHR, textStatus, errorThrown)
		{
		var FUNCNAME = funcname(arguments);

			GM_log(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
			alert(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);

			callback(null);
		});
	}

	function checkAccountActivity(callback)
	{
	var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

		var now = new Date();
		
//		GM_setValue("LCAC_checkAccountActivityMade", null);	// for testing
//		GM_setValue("LCAC_checkAccountActivityChecked", null);	// for testing

		var dateprev = GM_getValue("LCAC_checkAccountActivityMade");
		var datecurr = now.toString();
		GM_log(FUNCNAME + " dateprev=" + dateprev);
		GM_log(FUNCNAME + " datecurr=" + datecurr);

		if(dateprev == datecurr)
		{
			var total = GM_getValue("LCAC_checkAccountActivityAmount");
			GM_log(FUNCNAME + " 1 total=" + total);
			callback(total);
			return;
		}

		getLenderActivity(now, now, false, function checkAccountActivity_getLenderActivity_callback(responseText)
		{
		var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

			DEBUG && GM_log(FUNCNAME + " responseText.length=", responseText.length);
			DEBUG && GM_log(FUNCNAME + " responseText=" + responseText.substr(0,200) + "...");
//			DEBUG && GM_log(FUNCNAME + " now=" + now);

			var payments = responseText.match(/Total Payments for this date,([-+\d\.]*)/);
			var fees = responseText.match(/Total Investor Fees for this date,([-+\d\.]*)/);
			DEBUG && GM_log(FUNCNAME + " payments=", payments);
			DEBUG && GM_log(FUNCNAME + " fees=", fees);

			//search for "Total Payments for this date"
			payments = payments ? parseFloat(payments[1]) : null;
			fees = fees ? parseFloat(fees[1]) : null;
			
			DEBUG && GM_log(FUNCNAME + " payments=", payments);
			DEBUG && GM_log(FUNCNAME + " fees=", fees);
			
			if(payments || fees)
			{
				var total = payments + fees;	// null + x = x
				DEBUG && GM_log(FUNCNAME + " total=", total);

				GM_setValue("LCAC_checkAccountActivityMade", datecurr);
				GM_setValue("LCAC_checkAccountActivityAmount", total);
				callback(total);
			}
			else
			{
				GM_setValue("LCAC_checkAccountActivityChecked", now);
				callback(false);
			}
		});
	}

	function getAccountSummary(callback)
	{
	var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

		var requestURL = "/account/lenderAccountDetail.action";

		$.get(requestURL, function getAccountSummary_get(responseText, textStatus, jqXHR) 	// success
		{
			var FUNCNAME = funcname(arguments);

			if(responseText.match(/Member Sign-In/))		// we've been logged out
			{
				/* XXX alert the user */
				callback(null);
				return;
			}
			
			DEBUG && GM_log(FUNCNAME + "_get() responseText.length=", responseText.length);
			responseText = responseText.replace(/^[\s\S]*?(<body)/, "$1");	//YYY jquery 1.9.1 chokes on DOCTYPE line?
			DEBUG && GM_log(FUNCNAME + "_get() responseText.length=", responseText.length);

			var summary = parse_lenderAccountDetail(responseText);
			DEBUG && GM_log(FUNCNAME + "_get() summary=", summary);

			callback(summary);
		})
		.fail(function getAccountSummary_get_fail(jqXHR, textStatus, errorThrown)
		{
		var FUNCNAME = funcname(arguments);

			GM_log(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
			alert(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
		});
	}

	function getFoliofnSummary(getFoliofnSummary_callback)
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

		var requestURL = "/foliofn/tradingAccount.action";	// html

		$.get(requestURL, function getFoliofnSummary_get(responseText) 	// success
		{
			var FUNCNAME = funcname(arguments);

			GM_log(FUNCNAME + " responseText.length=" + responseText.length);
			DEBUG && GM_log(FUNCNAME + " responseText=" + responseText.substr(0, 1024) + "...");

			responseText = responseText.replace(/^[\s\S]*?(<body)/, "$1");	//YYY jquery 1.9.1 chokes on DOCTYPE line?
			
			DEBUG && GM_log(FUNCNAME + " responseText=" + responseText.substr(0, 1024) + "...");

			if(responseText.match(/Member Sign-In/))		// we've been logged out
			{
				alert("Not logged in");
				getFoliofnSummary_callback(null);
				return;
			}

			var dom = $(responseText);

			var purchasedPendingLoanIds = {};
			var soldPendingLoanIds = {} ;
			var purchasedPendingNoteIds = {};
			var soldPendingNoteIds = {} ;

			var purchasedPendingTotal = calcPending(dom.find("table#purchased-orders"), null, purchasedPendingLoanIds, purchasedPendingNoteIds);
			var soldPendingTotal = calcPending(dom.find("#sold-orders"), null, soldPendingLoanIds, soldPendingNoteIds);

			dom.remove();	//XXX discard it (do we need to do this?)

			saveOwnedNotesPending({
				purchasedPendingLoanIds: purchasedPendingLoanIds,
				purchasedPendingNoteIds: purchasedPendingNoteIds,
				soldPendingLoanIds: soldPendingLoanIds,
				soldPendingNoteIds: soldPendingNoteIds,
				});

			getFoliofnSummary_callback({
				purchasedPendingTotal: purchasedPendingTotal,
				soldPendingTotal: soldPendingTotal,
			});
		})
		.fail(function getFoliofnSummary_get_fail(jqXHR, textStatus, errorThrown)
		{
		var FUNCNAME = funcname(arguments);

			GM_log(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
			alert(FUNCNAME + " textStatus=" + textStatus + " errorThrown=" + errorThrown);
		});
	}

	function scanLoanDetail(loanId, html)
	{
		var dom = $(html);
//		var dom = $.parseHTML(html);	// this does something else

//		GM_log("scanLoanDetail() dom=", dom);

		var location = dom.find("th:contains('Location') + td").text();

		var vars = {
			location: location,
		};

		setLoanFlags(loanId, vars);

		//dom should be avabile for garvbe collection since we don't reference it. XXX can we verify?

		return vars;
	}

	function followLink(containsString, search, delay)
	{
	var DEBUG = debug(true, arguments);

		delay = delay || 5000;

		var link = $(sprintf("a:contains('%s')", containsString));
		DEBUG && GM_log("link=%o", link);

		var href = link[0].href;
		DEBUG && GM_log("href=" + href);

		if(search)
		{
			DEBUG && GM_log("search=" + search);
			href += search;
			DEBUG && GM_log("href=" + href);
		}

		var unloading = false;
		window.onbeforeunload = function() { unloading = true};
		setTimeout(function(){
			if(unloading)
				return;

			window.location.href = href;
		}, delay);
	}


	var href = location.href;
	GM_log("href=" + href);
	if(href.match(/public\/about-us.action/))	// repurpose this page for our exports
	{
		if(window.name == 'LCAC_exportLocalStorage')
		{
			/* are some of these scripts preventing us from copying our text? */
			(function scriptRemove()
			{
				var scripts = $("script").not("[src*=chrome-extension]");

				if(scripts.length > 0)
				{
					var scriptsString = scripts.map(function() { return this.src ? ("src=" + this.src) : ("text=" + this.text.replace(/[\r\n\s]+/g, ' ').substr(0, 32) + "..."); }).toArray().join('\n');
					GM_log("removing scripts: " + scriptsString);

					if(false && TESTING) alert("removing scripts: " + scriptsString);

					scripts.remove();
				}

				setTimeout(scriptRemove, 1000);
			})();

			GM_log("overwrite head");
			/* DOM version of exportLocalStorage */
			$("head").html(
				"<title>Export Comments</title>"
				+ "<meta name='content-disposition' content='inline; filename=exportLocalStorage.json'>"
			);

			GM_log("overwrite body");
			$("body").html(
				"<pre class='LCAC_export'></pre>"	// discard classes on body
			);

			GM_log("calling getLocalStorage()");
			var commentsEtc = getLocalStorage();
			var commentsEtcJSONString = JSON.stringify(commentsEtc, null/*filter*/, 4/*indent*/);
			
			GM_log("writing comments");
			$(".LCAC_export")
				.html(commentsEtcJSONString)
			;
			
			GM_log("DONE");
		}
	}
	else if(href.match(/summary.action/))
	{

		var summarydiv = $(
			"<div class='lcacdiv' style='position:fixed; background:#FFFFFF; bottom:5px; right:5px; z-index:99;'>" +
			"<fieldset style='margin:0px 5px 5px 5px; padding:0px 5px 5px 5px; border:1px solid #2266AA;'>" +
			"<legend>LCAC</legend>" +
			"</fieldset>" +
			"</div>" +
			"");

		$(".master_content-outer-container").before(summarydiv);

		/* VITALS */
		{
			/* make it easier to select these values I use in my spreadsheet (instead of triple-click) */
			/* \s\S is like . but also matches embedded newlines */
			summarydiv.find("fieldset")
				.append(
					"<div style='width:100%'>" +
					"<input id='summaryValuesInput' type=text readonly onclick='select();' style='min-width:38em' />" +
					"<input id='summaryValuesRefreshButton' type=button style='width:5em;' value='Refresh' />" +
					"</div>" +
					"<div style='width:100%'>" +
					"<input id='summaryNotesInput' type=text readonly onclick='select();' style='min-width:38em' />" +
					"<input id='summaryNotesRefreshButton' type=button style='width:5em;' value='Refresh' />" +
					"</div>" +

					(LOOKUPBUTTONS ?
					"<div style='text-align:center;'>" +
					"<label>Payments Today:</label>" +
					"<input class=LCAC_paymentsToday value='--' readonly style='width:4em;'/>" +
					"<label>Lookup:</label>" +
					"<input id='loanIdInput' type=text size=8 />" +
					"<input id='loanIdButton' type=button value='Loan Id' />" +
					"<input id='noteIdInput' type=text size=8 />" +
					"<input id='noteIdButton' type=button value='Note Id' />" +
					"<input id='orderIdInput' type=text size=8 />" +
					"<input id='orderIdButton' type=button value='Order Id' />" +
					"</div>" +
					"" : "") +

					"<div style='text-align:center;'>" +
					(SCANBUTTONS ?
					"<label>Delay:" +
					"<select id='scanDelay'>" +
					"<option value='0.5'>0.5s</option>" +
					"<option value='1'>1s</option>" +
					"<option value='2'>2s</option>" +
					"<option value='3' selected='selected'>3s</option>" +
					"<option value='4'>4s</option>" +
					"<option value='5'>5s</option>" +
					"</select>" +
					"</label>" +
					"<input type='button' id='scanOrdersButton' value='Scan Orders'/>" +
					"<input type='button' id='scanLoansButton' value='Scan Portfolio'/>" +
					"" : "") +
					"<input type='button' id='exportLocalStorageButton' value='Export Comments' />" +
					"<input type='button' id='importLocalStorageButton' value='Import Comments' />" +
					(false ?
					"<input type='button' id='clearLocalStorageButton' value='Clear All' />" +
					"" : "") +
					"</div>" +

					""
				);
						
			scanDelay = scanDelayBackoff = $("#scanDelay").val() * 1000;
			$("#scanDelay").change(function(event)
			{
				scanDelay = scanDelayBackoff = $(this).val() * 1000;
				GM_log("scanDelay_change() scanDelay=" + scanDelay);
			});

			var loanIdInput = summarydiv.find("#loanIdInput");
			var loanIdButton = summarydiv.find("#loanIdButton");
			var noteIdInput = summarydiv.find("#noteIdInput");
			var noteIdButton = summarydiv.find("#noteIdButton");
			var orderIdInput = summarydiv.find("#orderIdInput");
			var orderIdButton = summarydiv.find("#orderIdButton");

			loanIdButton.click(function()
			{
				GM_log("loanIdButton.click()");
				var loanId = loanIdInput.val().trim();
				if(loanId == "")
					return;
					
				var url = sprintf("/account/loanDetail.action?loan_id=%s", loanId);
				window.open(url, "_blank");
			});

			orderIdButton.click(function()
			{
				GM_log("orderIdButton.click()");
				var orderId = orderIdInput.val().trim();
				if(orderId == "")
					return;
					
				var url = sprintf("/account/orderDetails.action?order_id=%s", orderId);
				window.open(url, "_blank");
			});

			noteIdButton.click(function()
			{
				GM_log("noteIdButton.click()");
				var noteId = noteIdInput.val().trim();
				if(noteId == "")
					return;

				var note = getStoredNote(noteId);
				if(!note)
				{
					alert("Unknown Order Id");
					return;
				}

				var url = loanPerfURL(note);
				window.open(url, "_blank");
			});

			var summaryValuesInput = summarydiv.find("#summaryValuesInput");
			var summaryValuesRefreshButton = summarydiv.find("#summaryValuesRefreshButton");
			var summaryNotesInput = summarydiv.find("#summaryNotesInput");
			var summaryNotesRefreshButton = summarydiv.find("#summaryNotesRefreshButton");

			function updateSummary(vars)	// javascript is single-threaded, yes? so we should be ok
			{
			var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

				if(vars == null)
				{
					updateSummary.vars = null;
					summaryValuesInput.addClass('lcac_updating');
					return false;
				}

				if(updateSummary.vars == null)
					updateSummary.vars = {};

				$.extend(updateSummary.vars, vars);

				DEBUG && GM_log("updateSummary.vars=", updateSummary.vars);

				var notDone = false;

				function sprintfOrEllipsis(value, format)
				{
					if(value == null)
					{
						notDone = true;
						return "...";
					}

					if(format)
						return sprintf(format, value);

					return value;
				}

				DEBUG && GM_log("updateSummary.vars=", updateSummary.vars);

				var str = ""
					+ sprintfOrEllipsis(updateSummary.vars.accountTotal, "$%0.2f")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.totalPayments, "$%0.2f")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.accruedInterest, "$%0.2f")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.availableCash, "$%0.2f")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.purchasedPendingTotal, "$%0.2f")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.soldPendingTotal, "$%0.2f")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.notYetIssued_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.issuedAndCurrent_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.inGracePeriod_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.late16To30Days_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.late31To120Days_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.fullyPaid_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.default_count, "%d")
					+ "\t" + sprintfOrEllipsis(updateSummary.vars.chargedOff_count, "%d")
					;
				
				DEBUG && GM_log("str=", str);

				summaryValuesInput.val(str);

				if(!notDone)
				{
					summaryValuesInput.removeClass('lcac_updating');

					return true;
				}

				return false;
			}


			function doSummaryValues(doSummaryValues_callback)
			{
				updateSummary(null);	// reset it

				checkAccountActivity(function doSummaryValues_checkAccountActivity_callback(payments)
				{	
				var DEBUG = debug(true, arguments);

					if(payments === false)
						payments = 'N/A';
					else if(payments === null)
						payments = '?';
					else
						payments = sprintf("$%0.2f", payments);

					GM_log("payments=" + payments);

					var input = $("input.LCAC_paymentsToday");
					
					GM_log("input=", input);

					input.val(payments);
				});

				getAccountSummary(
					function(retvals)	// callback
					{
						updateSummary(retvals) && doSummaryValues_callback();
					});

				getFoliofnSummary(
					function(retvals)	// callback
					{
						updateSummary(retvals) && doSummaryValues_callback();
					});
			}

			function doSummaryNotes(doSummaryNotes_callback)
			{
			var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

				summaryNotesInput.addClass('lcac_updating');

				timestamp(FUNCNAME, true);
				getAccountNotesRawData(function doSummaryNotes_getAccountNotesRawData_callback(notes) // callback
				{
					var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

					timestamp(FUNCNAME, 'getAccountNotesRawData_callback begin');

					/* error */
					if(notes == null)
					{
						summaryNotesInput.val("Error");
						return;
					}

					if(notes.length > 0)
						DEBUG && GM_log("notes[0]=", notes[0]);

					var notesTotal = 0.0;
					var principalRemainingTotal = 0.0;
					var interestRateTotal = 0.0;
					var interestRateTotalWeighted = 0.0;
					var ageInMonthsTotal = 0.0;
					var ageInMonthsTotalWeighted = 0.0;
					var loanIds = {};
					var loansTotal = 0.0;
					var today = new Date();
					for(var index = 0; index < notes.length; index++)
					{
						var note = notes[index];

						if(note.status.match(/Fully\s*Paid|Charged\s*Off/))
							continue;

						notesTotal++;

						var principalRemaining = note.principalRemaining;
						var interestRate = note.interestRate;
						var issueDate = Dates.parse(note.issueDate, "yyyyMMdd");
						var ageInMonths = monthDiff(issueDate, today);

						if(ageInMonths > 12 * 10)
						{
							GM_log("note.issueDate=" + note.issueDate + " issueDate=" + issueDate);
							GM_log("WARNING ageInMonths=" + ageInMonths + " note=", note, " issueDate=", issueDate);
						}

						principalRemainingTotal += principalRemaining;

						interestRateTotal += interestRate;
						interestRateTotalWeighted += interestRate * principalRemaining;

						ageInMonthsTotal += ageInMonths;
						ageInMonthsTotalWeighted += ageInMonths * principalRemaining;

						DEBUG && GM_log(FUNCNAME + " note=", note);

						if(!loanIds['' + note.loanId])
						{
							loanIds['' + note.loanId] = true;
							loansTotal++;
						}
					}

					var interestRateAvg = interestRateTotal / notesTotal;
					var interestRateAvgWeighted = interestRateTotalWeighted / principalRemainingTotal;
					
					var ageInMonthsAvg = ageInMonthsTotal / notesTotal;
					var ageInMonthsAvgWeighted = ageInMonthsTotalWeighted / principalRemainingTotal;
					
					DEBUG && GM_log("interestRateTotal=", interestRateTotal, " principalRemainingTotal=", principalRemainingTotal);

					summaryNotesInput.val(
						sprintf("%d notes"
						+ ",%d loans"
						+ ",$%0.2f o.p"
						+ ",avg rate:%0.2f%%/%0.2f%% weighted"
						+ ",avg age in months:%0.0f/%0.0f weighted"
							, notesTotal
							, loansTotal
							, principalRemainingTotal
							, interestRateAvg * 100, interestRateAvgWeighted * 100
							, ageInMonthsAvg, ageInMonthsAvgWeighted
							));

					summaryNotesInput.removeClass('lcac_updating');

					if(doSummaryNotes_callback)
						doSummaryNotes_callback();

					timestamp(FUNCNAME, 'getAccountNotesRawData_callback done');
				});
			}

			function summaryValuesRefreshButtonClick()
			{
				var val = summaryValuesRefreshButton.val();
				if(val == '--')
				{
					/* nothing */
				}
				else
				{
					var valueOrig = val;	// javascript scoping: this should be the same when we get back
					summaryValuesRefreshButton.val('--');

					// when done reset the timeleft
					doSummaryValues(
						function summaryValuesRefreshButtonClick_doSummaryValues_callback(retval)
						{
							summaryValuesRefreshButton.val(valueOrig);
						});
				}
			}

			function summaryNotesRefreshButtonClick()
			{
			var DEBUG = debug(true, arguments);

				var val = summaryNotesRefreshButton.val();
//				GM_log("val=", val);
				if(val == '--')
				{
					/* in refresh, set below */
				}
				else
				{
					var valueOrig = val;	// javascript scoping: this should be the same when we get back
					summaryNotesRefreshButton.val('--');

					// when done reset the timeleft
					doSummaryNotes(
						function summaryNotesRefreshButtonClick_doSummaryNotes_callback()
						{
							summaryNotesRefreshButton.val(valueOrig);
						});
				}
			}

			summaryValuesRefreshButton
				.on("click", function()
				{
					summaryValuesRefreshButtonClick();
				});
			if(LOADSUMMARYVALUESATSTARTUP)
				summaryValuesRefreshButtonClick();	// run it once at startup with current page
			else
				console.log("LOADSUMMARYVALUESATSTARTUP=" + LOADSUMMARYVALUESATSTARTUP);

			summaryNotesRefreshButton
				.on("click", function()
				{
					summaryNotesRefreshButtonClick();
				});
			if(LOADSUMMARYNOTESATSTARTUP)
				summaryNotesRefreshButtonClick();
			else
				console.log("LOADSUMMARYNOTESATSTARTUP=" + LOADSUMMARYNOTESATSTARTUP);

			summarydiv.find("input#importLocalStorageButton")
				.after(
'<div id="import_prompt" style="display:none; position:fixed; top:50%; left:50%; margin-left:-250px; margin-top:-100px; background:#ffffcf; border:2px solid #2266AA; z-index:99; padding:5px; text-align:center;">' +
'<label for="importtext"/>Paste exported text here:</label>' +
'<br><textarea id="importtext" rows="10" cols="80" spellcheck="false" style="overflow:hidden; resize: none;" />' +
'<br><input type="button" id="importOk" value="Ok">' +
'<input type="button" id="importCancel" value="Cancel">' +
'</div>' +
					"");

			summarydiv.find("input#importLocalStorageButton")
				.click(function()
				{
					GM_log("importLocalStorageButton click()...");

					$("div#import_prompt")
						.each(function(index, element){ GM_log("import_prompt element=", element); })
						.css("display", "block");

					$("#importtext")
						.val("")	// clear the field
						.focus();
				});
					
			$("input#importCancel").click(function() {
				$("div#import_prompt").css("display", "none");
			});
			
			$("input#importOk").click(function() {
				$("div#import_prompt").css("display", "none");

				var ok = $("#importtext").val();
				GM_log("ok.length=", ok.length);

				if(ok == null)
					ok = "";
				
				ok = ok.replace(/[\n\r]+/g, ' ').trim();	// remove newlines
				
				if(ok.length <= 0)
				{
					alert("No data");
					return;
				}

				var ret = confirm("length=" + ok.length + ". MAKE SURE YOU MAKE A BACKUP. Confirm import?");
				
				if(ret)
				{
					try
					{
						importLocalStorage(ok);
					}
					catch(ex)
					{
						GM_log(FUNCNAME + " ex=", ex, " ", ex.stack);
						alert(FUNCNAME + " ex=" + ex);
					}
				}
			});

			var scanOrdersButton = summarydiv.find("input#scanOrdersButton");
			scanOrdersButton.click(function scanOrdersButton_click()
			{
				var button = $(this);

				if(button.hasClass('lcac_running'))
					button.addClass('lcac_cancel');
				else
				{
					button.addClass('lcac_running');
					button.val('Running');

					scanOrders(button, function scanOrdersButton_click_scanOrders_callbackDone(success)
					{
						if(success)
							button.val('Done');
						else if(button.hasClass('lcac_cancel'))
							button.val('Canceled');
						else
							button.val('Incomplete');

						button.removeClass('lcac_running');
						button.removeClass('lcac_cancel');
					});
				}
			});

			var scanLoansButton = summarydiv.find("input#scanLoansButton");
			GM_log("scanLoansButton=", scanLoansButton);
			scanLoansButton.click(function scanLoansButton_click()
			{
				try
				{
					GM_log("scanLoansButton_click()");

					if(scanLoansButton.hasClass('lcac_running'))
						scanLoansButton.addClass('lcac_cancel');
					else
					{
						scanLoansButton.addClass('lcac_running');
						scanLoansButton.val('Running');
						
						scanLoans(scanLoansButton, function scanLoansButton_click_scanLoans_callbackDone(success)
						{
							if(success)
								scanLoansButton.val('Done');
							else if(scanLoansButton.hasClass('lcac_cancel'))
								scanLoansButton.val('Stopped');
							else
								scanLoansButton.val('Incomplete');

							scanLoansButton.removeClass('lcac_running');
							scanLoansButton.removeClass('lcac_cancel');
						});
					}
				}
				catch(ex)
				{
					GM_log("ex=", ex);
				}
			});
		}
			
		summarydiv.find("#clearLocalStorageButton")
			.click(function()
			{
				var ret = confirm("ARE YOU SURE?");
				if(!ret)
					return;

				for(var key in localStorage)
				{
					if(key.match(/^comment_/))
					{
						localStorage.removeItem(key);
					}
				}

				localStorage.removeItem('noteData');
				localStorage.removeItem('loanData');
				localStorage.removeItem('noteDataZIP');
				localStorage.removeItem('loanDataZIP');

				storedData = {};
				storedData.notesByNoteId = {};
				storedData.loansByLoanId = {};
				storedData.notesByLoanId = {};
				storedData.loanId2NoteArray = {};
			});

		/* XXX fix this, e.g. comments */
		summarydiv.find("input#exportLocalStorageButton")
			.click(exportLocalStorage);
	}
	else if(href.match(/loanPerf.action/)
		|| href.match(/browseNotesLoanPerf.action/))	// new link from Ffn Browse Notes
	{
		if(href.match(/browseNotesLoanPerf.action/)
		&& $(document).text().match(/An Error Has Occurred/i))
		{
			var href2 = href.replace(/browseNotesLoanPerf.action/, "loanPerf.action");
			if(false)
			{
				// redirect to regular loanPerf version per http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
				window.location.replace(href2);
			}
			else
			{
				$(":header:contains(An Error Has Occurred)").append(sprintf("<nobr> (No longer for sale? <a href='%s'>alternate link*)</a></nobr>", href2));
			}
			return;
		}

		var vars = doLoanPerfPart1(table);

		if(IRLINKS)
		$(":header:contains(Loan Performance)")
			.append(
				sprintf(" <a href='%s' target='_lcac_ir'>[IR]</a>",
					sprintf("http://www.interestradar.com/loan?LoanID=%d", vars.loanId))
				);

		// !important overrides column sort coloring
		GM_addStyle(".lcac_green { color:green !important; }");
		GM_addStyle(".lcac_greenrev { background-color:lightgreen !important; }");
		GM_addStyle(sprintf(".lcac_yellowRev { color:black; background-color:%s !important; }", yellowMed));
		GM_addStyle(".lcac_yellow { color:yellow; background-color:lightgrey !important; }");
		GM_addStyle(".lcac_red { color:red !important; }");
		GM_addStyle(".lcac_redRev { color:white; background-color:red !important; }");

		GM_addStyle(sprintf(".lcac_underpayment {background-color:%s !important;}", yellowMed));	
		GM_addStyle(sprintf(".lcac_zeropayment {background-color:%s !important;}", redLow));	
		GM_addStyle(sprintf(".lcac_overpayment {background-color:%s !important;}", greenLow));
		GM_addStyle(sprintf(".duplicateDate {background-color:%s !important;}", yellowLow));
		GM_addStyle(sprintf(".duplicateDate2 {background-color:%s !important;}", yellowHigh));
		
		GM_addStyle("table.plain-table {white-space: nowrap;}");	//YYY Collection Log date wraps on Chrome
		
		highlightLoanPerf();

//		GM_addStyle(".moduleSmallNoHeight {height:auto !important; }");
//		$(".moduleSmall").addClass("moduleSmallNoHeight");
//		$(".moduleSmall").removeClass("moduleSmall");	//2014-03-12 they changed it, finally

		$("a:contains('Original Listing')")
			.before(sprintf("<a href='/account/orderDetails.action?order_id=%s'>Order Details*</a> | ", vars.orderId));
	
		(function(vars)
		{
		waitForElement(":header:contains(Payment History) ~ div.pagination select.yui-pg-rpp-options", null,
			function()	// one at the top and one at the bottom
			{
				waitForElement("div#lcLoanPerf1 tbody.yui-dt-data", null,
					function()
					{
						var paymentHistory = doLoanPerfPart2(vars);

						doLoanPerfPart3(vars, paymentHistory);
					});
			});
		})(vars);
	
	}
	else if(href.match(/loanDetail.action/)	// Original Listing
		|| href.match(/loanDetailFull.action/)	// Original Listing
	)	
	{
		doLoanDetail();
	}
	else if(href.match(/tradingInventory.action|newLoanSearch.action/))	// newLoanSearch.action = "Reset" on Browse Notes
	{
		if(SAVEDSEARCHES)
		{
			$("div.search-container")
				.append(''
					+ "<div class='lcac_savedsearches'>"
					+ "<fieldset style='margin:0px 5px 5px 5px; padding:0px 5px 5px 5px; border:1px solid #2266AA;'>"
					+ "<legend>LCAC</legend>"
					+ "<button class='lcac_savesearch'>Save Search</button>"
					+ "<ul class='lcac_savedsearches'>"
					+ "</ul>"
					+ "</fieldset>"
					+ "</div>"
				);

		// XXX load these dynamically and allow user to save/delete them
		// BONUS POINTS: save sort order and rows per page

			var savedsearchesdiv = $("div.lcac_savedsearches")
			var savedsearcheslist = $("ul", savedsearchesdiv);

			function loadsavedsearches()
			{
//				var savedsearches = [
//					{
//						url: "https://www.lendingclub.com/foliofn/tradingInventory.action?mode=search&search_from_rate=0.04&search_to_rate=0.27&loan_status=loan_status_issued&loan_status=loan_status_current&never_late=true&fil_search_term=term_36&fil_search_term=term_60&search_loan_term=term_36&search_loan_term=term_60&remp_min=37&remp_max=50&askp_min=0.00&askp_max=Any&markup_dis_min=-100&markup_dis_max=15&opr_min=0.00&opr_max=Any&ona_min=25&ona_max=Any&ytm_min=0&ytm_max=Any&credit_score_min=600&credit_score_max=850&credit_score_trend=UP&credit_score_trend=DOWN&credit_score_trend=FLAT",
//						name: 'remp&gt;=37&lt;=50',
//					}
//				];
				
				var savedsearchesJSON = GM_getValue("LCAC_savedsearches");
				GM_log("savedsearchesJSON=", savedsearchesJSON);

				var savedsearches = savedsearchesJSON ? $.parseJSON(savedsearchesJSON) : [];
				DEBUG && GM_log("savedsearches=", savedsearches);

				return savedsearches;
			}

			function savesavedsearches(savedsearches)
			{
				DEBUG && GM_log("savedsearches=", savedsearches);

				var savedsearchesJSON = JSON.stringify(savedsearches);
				DEBUG && GM_log("savedsearchesJSON=" + savedsearchesJSON);

				GM_setValue("LCAC_savedsearches", savedsearchesJSON);
			}
			
			function reloadsavedsearches(savedsearches)
			{
				var liarr = [];
				$.each(savedsearches, function(index, savedsearch)
				{
					DEBUG && GM_log("savedsearch=", savedsearch);

					var lihtml = sprintf("<li>"
						+ "<button class='lcac_remove' data-index='%d'>x</button>"
						+ "<a href='%s'>%s</a>"
						, index
						, savedsearch.url
						, savedsearch.name);
					
					liarr.push(lihtml);
				});

				savedsearcheslist
					.empty()
					.append(liarr.join(''))	// join() defaults to comma separator
				;

				$("button.lcac_remove", savedsearcheslist)
					.click(function(event)
					{
						event.preventDefault();
						
						DEBUG && GM_log("button.lcac_remove.click() this=", this, " event=", event);

						var index = $(this).attr('data-index');
						DEBUG && GM_log("index=" + index);
						
						//XXX
						savedsearches.splice(index, 1);

						savesavedsearches(savedsearches);
						reloadsavedsearches(savedsearches);
					});
			}

			var savedsearches = loadsavedsearches();
			reloadsavedsearches(savedsearches);

			$("button.lcac_savesearch", savedsearchesdiv)
				.click(function(event)
				{
					event.preventDefault();

					DEBUG && GM_log("button.lcac_savesearch.click() event=", event);

					var name = window.prompt("Name this search");
					DEBUG && GM_log("name=" + name);

					if(name == null)
						return;

					name = name.trim();

					if(name == '')
					{
						alert("name cannot be empty");
						return;
					}

					var savedsearch = {
						url: location.href,
						name: name
					};

					savedsearches.push(savedsearch);
					savesavedsearches(savedsearches);
					reloadsavedsearches(savedsearches);
				});
		}

		set_hideOwnNotes(getStoredValue("hideOwnNotes"));
		set_hideAlreadyInvested(getStoredValue("hideAlreadyInvested"));
		set_hideNotFirst(getStoredValue("hideNotFirst"));
		set_hideUnlikedRows(getStoredValue("hideUnlikedRows"));


		$('#content-wrap').css("width", "auto");	// YYY on my system, there's a lot of ununsed whitespace on the left

		/*
		 * change the form to get so we can extract the search params, and use those params when we reload the page
		 * to keep the same search params
		 */
		if(TRADINGINVETORYPARAMS)
		{
			$("form#search-form").prop("method", "get");

			var search = window.location.search;	// empty string if nothing, otherwise "?..."
			DEBUG && GM_log("search=", search);
			localStorage.setItem("tradingInventory.action.search", search);	// save this for later, to fix up the link
		}

		/* floating div with our stuff in it */
		var lcacdiv = $(
				"<div class='lcacdiv' style='position:fixed; background:#FFFFFF; bottom:5px; right:5px; z-index:99;'>" +
				"<fieldset style='margin:0px 5px 5px 5px; padding:0px 5px 5px 5px; border:1px solid #2266AA;'>" +
				"<legend>LCAC</legend>" +

				"<label>Available Cash: " +
				"<input id='availableCashInput' size='10' readonly onclick='select();' />" +
				"</label>" +
				"<input type='button' id='availableCashRefresh' value='Refresh' />" +

				"<br>" +
				"<label>Purchase Total: " +
				"<input id='purchaseTotalInput' size='10' readonly />" +
				"</label>" +

				"<br>" +
				"<label>Remaining Cash: " +
				"<input id='remainingCashInput' size='10' readonly />" +
				"</label>" +

				(!TESTING ? '' :
				"<br>" +
				"<label>Search Note: " +
				"<input id='searchNoteIdPattern' size='10' />" +
				"<input type='button' id='searchNote' value='Search' />" +
				"</label>" +
				"") +

				"</fieldset>" +
				"</div>" +
				"");
		
		$("div.dataset-wrapper")
			.before(lcacdiv);

		var availableCash = null;
		var totalPrice = 0;

		function updateTotals()
		{
		var DEBUG = debug(true, arguments);

			$("#availableCashInput")
				.removeClass("lcac_greenLow")
				.removeClass("lcac_redLow");

			if(availableCash == null)
			{
				$("#availableCashInput").val('Error');
				$("#availableCashInput").addClass("lcac_redLow");
			}
			else
			{
				$("#availableCashInput").val(sprintf('$%0.2f', availableCash));
				if(availableCash > 0)
					$("#availableCashInput").addClass("lcac_greenLow");
			}

			if(totalPrice == null)
				$("#purchaseTotalInput").val('Unknown');
			else
				$("#purchaseTotalInput").val(sprintf('$%0.2f', totalPrice));

			if(availableCash == null || totalPrice == null)
				$("#remainingCashInput").val('Unknown');
			else
			{
				$("#remainingCashInput")
					.removeClass("lcac_redMed")
					.removeClass("lcac_greenLow");
				var remainingCash = availableCash - totalPrice;
				$("#remainingCashInput").val(sprintf('$%0.2f', remainingCash));
				if(remainingCash < 0)
					$("#remainingCashInput").addClass("lcac_redMed");
				else
					$("#remainingCashInput").addClass("lcac_greenLow");
			}
		}

		function updateAvailableCash2()
		{
			$("#availableCashInput").val('...');

			getAvailableCash(function(value)
			{
				availableCash = value;
				updateTotals();
			});
		}

		updateAvailableCash2();

		$("#availableCashRefresh").on('click', function()
		{
			updateAvailableCash2();
		});
			
		function searchNote(noteIdRegExp, callback)
		{
		var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

			getFfnNotesRawData(function searchNote_getFfnNotesRawData_callback(notes)
			{
				DEBUG && GM_log(FUNCNAME + " before filter notes=", notes);

				notes = $.map(notes, function searchNote_getFfnNotesRawData_notes_map(element, index)
				{
					return noteIdRegExp.exec(element.noteId) ? element : null;	// null removes the item in $.map(array)
				});
				
				DEBUG && GM_log(FUNCNAME + " after filter notes=", notes);

				callback(notes);	//XXX
			});
		}

		$("#searchNote").on('click', function searchNote_on_click()
		{
		var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

			var noteIdPattern = $("#searchNoteIdPattern").val().trim();
			DEBUG && GM_log("noteIdPattern=" + noteIdPattern);
			if(!noteIdPattern)
			{
				alert("Please enter a note Id");
				return;
			}

			noteIdPattern = noteIdPattern.replace(/%/, '.*');	// sql wildcard to regexp

			var noteIdRegExp = new RegExp('^' + noteIdPattern + '$');

			$("#searchNote").val("Searching...");

			var MAXSEARCHNOTES = 5;
			searchNote(noteIdRegExp, function searchNote_on_click_searchNote_callback(notes)
			{
			var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

				if(notes.length >= MAXSEARCHNOTES)
				{
					alert('' + notes.length + " notes found, only opening " + MAXSEARCHNOTES);
					notes = notes.splice(0, MAXSEARCHNOTES);	// index, howmany
				}

				$.each(notes, function notes_each(index, element)
				{
				var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);

					var url = loanPerfURL(element, true) + "&for_sale=1";	//XXX use the sale price in the csv
					DEBUG && GM_log("url=", url);

					var win = window.open(url, '_blank');
					DEBUG && GM_log("win=", win);
				});

				$("#searchNote").val("Search");
			});
		});
			
		loadSessionData();	// for colorCellsTradingInventory

		waitForElement(".yui-pg-rpp-options", null,
			function(selects)
			{
				if(false)	// they disabled our ability to ask for different amounts?
				{
				selects.append(""
					+ "<option value='500'>500*</option>"
					+ "<option value='1000'>1000*</option>"
					+ "<option value='2000'>2000*</option>"
				);
				}

				waitForElement("#browseNotes table", ".yui-dt-data",
					function(notesTable)
					{
						var datatable = unsafeWindow.YAHOO.browseloans.dt;

						findHeadersCheckCells(notesTable, colorCellsTradingInventory, true,
							{addCommentColumn:true, addIRRColumn:true, addHideRowsCheckBoxes:true, addNoteIdColumn:true});
						addHeaderLimits();

						/* YYY checkboxall too dangerous with hidden rows */
						$("#checkallcheckbox").css("visibility", "hidden");	// too dangerous with hidden rows
	//					$("#checkallcheckbox").css("display", "none");	// too dangerous with hidden rows

						$("#browseNotes table").on('change', '.yui-dt-checkbox', function(event)
						{
							if(totalPrice == null)
								return;

							//YYY in chrome we're called before it gets checked
							var checkbox = $(event.target);

							var askingPriceCell = checkbox.closest('tr').find('td.asking_price');
							var askingPrice = askingPriceCell.text();
							askingPrice = text2Value(askingPrice);

							if(checkbox.prop('checked'))
								totalPrice += askingPrice;
							else
								totalPrice -= askingPrice;

							updateTotals();
						});
					});
			});
	}
	else if(href.match(/account\/loans.action/))	// LC - My Notes
	{
		$("div.master_wrapper").css("margin-left", "50px");	// YYY on my system, there's a lot of ununsed whitespace on the left
//		$("div.master_wrapper").css("width", "auto");	// with this the headers don't wrap and then look wrong

		waitForElement("#lcloans table", ".yui-dt-data",
			function(notesTable)
			{
				findHeadersCheckCells(notesTable, colorCells, true,
					{addCommentColumn:true});
			});
	}
	else if(href.match(/foliofn\/loans.action|foliofn\/sellNotes.action/))	// Foliofn - Sell Notes	2013-12-06 loans.action became sellNotes.action
	{
		$("div#content-wrap").css("margin-left", "50px");

		waitForElement("#lcloans table", ".yui-dt-data",
			function(notesTable)
			{
				findHeadersCheckCells(notesTable, colorCells, true,
					{addCommentColumn:true});
			});

		if(AUTOSELLSELECT)
		$("input#sell")
			.after("<input type='button' class='autosellselect' value='Auto Select*' />")
			.next(".autosellselect")	// get the element we just added
			.click(function autosellselect_click()
			{
				GM_log("autosellselect_click()");
			});
		;
	}
	else if(href.match(/browse.action|addToPortfolio.action/))	// LC - Browse Notes (addToPortfolio.action after Invest of Loan page)
	{
		$("div.master_wrapper").css("margin-left", "50px");	// YYY on my system, there's a lot of ununsed whitespace on the left

		waitForElement("div#browseNotes table", "tbody.yui-dt-data",
			function(notesTable, tbody)
			{
				/* YYY tweak the style (on my system the checkboxes get moved under the Filter box) */
				notesTable.css("margin-right", "-320px");

				findHeadersCheckCells(notesTable, null/*XXX is this right?*/, true,
					{addCommentColumn:true, addLoanIdColumn: true});

				allowMiddleClickToWorkAgain(notesTable);
			});
	}
	else if(href.match(/viewOrder.action/))	// LC - View Order from Browse Notes
	{
		$("div.master_wrapper").css("margin-left", "50px");	// YYY on my system, there's a lot of ununsed whitespace on the left

		waitForElement(".dataset-wrapper table", null,
			function(notesTable)
			{
				notesTable.css('float', 'none');	// comments push it off the left side

				/* YYY tweak the style (on my system the checkboxes get moved under the Filter box) */
				findHeadersCheckCells(notesTable, null/*colorCellsFunc*/, true,
					{addCommentColumn:true, addLoanIdColumn:true});
				
				allowMiddleClickToWorkAgain(notesTable);
			});
	}
	else if(href.match(/placeOrder.action/))	// LC - Browse Notes
	{
		waitForElement("#all-loans-0", null,
			function(notesTable)
			{
//				$(".master_wrapper").css("width", "100%");
//				$("#master_content-mid").css("width", "100%");

				/* YYY tweak the style (on my system the checkboxes get moved under the Filter box) */
				findHeadersCheckCells(notesTable, null/*XXX is this right?*/, false,
					{addCommentColumn:true});
			});
	}
	else if(href.match(/file:\/\/.*\/tradingAccount.action/))	// saved My Account pages, must set fileIsGreaseable in about:config
	{
		GM_log("AAAAAAAAAAAA href=", href);

		var notes = scanForLoanPerfLinks($("body"), false);
		GM_log("notes.length=", notes.length);

		var notesByNoteId = {};
		for(var index = 0; index < notes.length; index++)
		{
			var note = notes[index];
			var noteId = note.noteId;
			if(noteId == null)
				continue;

			if(notesByNoteId[noteId] == null) notesByNoteId[noteId] = {};
			$.extend(notesByNoteId[noteId], note);	
		}

		var obj = {};
		obj.noteData = notesByNoteId;	// this is all regenerated isn't it?
		
		var objJSONString = JSON.stringify(obj);
		DEBUG && GM_log("objJSONString=", objJSONString.length, " " + objJSONString.substr(0, 1024) + "...");

		var ok = prompt("Scan LoanPerf links", objJSONString);
	}
	else if(href.match(/tradingAccount.action|cancelSellOrder.action/))	// Foliofn My Account
	{
	var DEBUG = debug(false, arguments), FUNCNAME = funcname(arguments);
	timestamp(FUNCNAME, true)
		
		//XXX add Table of Contents/links to sections

		$('#content-wrap').css("width", "auto");	// YYY on my system, there's a lot of ununsed whitespace on the left
		
		var summarydiv = ""
			+ "<div class='lcac_summarydiv' style='text-align:right;'>"
			+ "<div style='white-space:nowrap'>"
			+ "<label for=soldPendingTotalInput>Sold Pending: </label>"
			+ "<input id=soldPendingTotalInput type=text readonly onclick='select();' />"
			+ "</div>"
			+ "<div>"
			+ "<label for=purchasedPendingTotalInput>Purchased Pending: </label>"
			+ "<input id=purchasedPendingTotalInput type=text readonly onclick='select();' />"
			+ "</div>"
			+ "<label for='availableCashInput'>Available Cash: </label>"
			+ "<input id='availableCashInput' size='10' type=text readonly onclick='select();' />"
			+ "<input id='availableCashRefresh' type='button' value='Refresh' />"
			+ "</div>"
			+ "";
		
		
		/* Table of Contents */
		var tocdiv =
			(function()
			{
			var DEBUG = debug(false, arguments);

//				var ol = "<ol>";
//				var olclose = "</ol>";
//				var li = "<li>";
//				var liclose = "</li>";

				var ol = "";
				var olclose = "";
				var li = "";
				var liclose = " ";

				var tocHTMLarr = [];

				/* WARNING: there are headers on the page we don't want to include so restrict to h3 */
				var count = 0;
				$("h3").each(function()
				{
					count++;

					var element = $(this);
					DEBUG && GM_log("element=", element);

					var text = element.text();
					var id = element.attr('id');
					if(!id)	// some of them don't have ids
					{
						id = text.replace(/\s/g, '_');
						element.attr('id', id);
					}

					var lihtml = sprintf("%d. %s<a href='#%s'>%s</a>%s", count, li, id, text, liclose);
					DEBUG && GM_log("lihtml=" + lihtml);
					tocHTMLarr.push(lihtml);
				});

				var tocHTML =
					"<div class='lcac_toc'>" +
					ol +
					tocHTMLarr.join('') +	// array to string, no separator
					olclose +
					"</div>";
				DEBUG && GM_log("tocHTML=" + tocHTML);

				return tocHTML;
			})();
		
		GM_addStyle("div.lcac_toc ol { line-height:1em !important; font-size:small; }");

		var lcacdiv = $(""
			+ "<div class='lcacdiv' style='width:400px; position:fixed; background:#FFFFFF; z-index:99; bottom:5px; right:5px;'>"
			+ "<fieldset style='margin:0px 5px 5px 5px; padding:0px 5px 5px 5px; border:1px solid #2266AA;'>"
			+ "<legend>LCAC</legend>"

//			+ "<table>"
//			+ "<tr>"
//			+ "<td>"
			+ tocdiv
//			+ "</td>"
//			+ "<td>"
			+ summarydiv
//			+ "</td>"
//			+ "</tr>"
//			+ "</table>"

			+ "</fieldset>"
			+ "</div>"
			+ "");

		$(":header:contains('My Account')").after(lcacdiv);

		/*
		 * Add pending totals
		 */
		{
			function highlightPending(table, input)
			{
			var DEBUG = debug(false, arguments);

				var total = calcPending(table, 'lcac_pending');
				DEBUG && GM_log("total=", total);
						
				table.find(".tfoot td:last")
					.html(sprintf("Pending*: $%0.2f", total))
					.each(function(index, element)
					{
						if(total > 0)
							$(element).addClass("lcac_pending");
					});

				input.val(sprintf('$%0.2f', total));
				if(total > 0)
					input.addClass('lcac_pending');
			}

			/* Sold Pending Total */
			highlightPending($("#sold-orders"), $("#soldPendingTotalInput"));
			highlightPending($("#purchased-orders"), $("#purchasedPendingTotalInput"));
		}

		
		timestamp(FUNCNAME, "XXX 0.8");

		/*
		 * Open Sell Orders
		 */
		var notesTable1 = $("table#loans-1");
		var notesTable2 = $("table#sold-orders");
		var notesTable3 = $("table#purchased-orders");
		var notesTable4 = $("table#canceled-buy-orders");
		var notesTable5 = $("table#canceled-sell-orders");

		if(DETACHTABLES)
		{
		var notesTable1Placeholder = $("<div id='notesTable1Placeholder' />");
		notesTable1.after(notesTable1Placeholder);
		notesTable1.detach();
		
		var notesTable2Placeholder = $("<div id='notesTable2Placeholder' />");
		notesTable2.after(notesTable2Placeholder);
		notesTable2.detach();

		var notesTable3Placeholder = $("<div id='notesTable3Placeholder' />");
		notesTable3.after(notesTable3Placeholder);
		notesTable3.detach();
		
		var notesTable4Placeholder = $("<div id='notesTable4Placeholder' />");
		notesTable4.after(notesTable4Placeholder);
		notesTable4.detach();
		}

		//OPTIMIZEME 5 seconds
		(function()
		{
			timestamp(FUNCNAME, "XXX 1.1");

			/*
			 * move last row into a footer
			 */
			moveFooterRowToFooter(notesTable1);

			notesTable1.find(
				"thead th:nth-child(7), tbody td:nth-child(7)," + // hide the Note Title column (too wide)
				"thead th:nth-child(3), tbody td:nth-child(3)" // hide the Payments Remaining column (useless)
				).addClass('hidecolumn');
			
			GM_addStyle(".hidecolumn { display:none; }");

			var trFoot = $(notesTable1).find(".tfoot");
			if(trFoot.length > 0)
			{
				/* subtract from the colspans to match the hidden columns */
				var tdFoot = getCellForColumn(trFoot, 7);
				var colspan = parseInt(tdFoot.prop("colspan"));
				tdFoot.prop("colspan", colspan - 1);

				var tdFoot = getCellForColumn(trFoot, 3);
				var colspan = parseInt(tdFoot.prop("colspan"));
				tdFoot.prop("colspan", colspan - 1);
			}

			//OPTIMIZEME
			findHeadersCheckCells(notesTable1, colorCellsPlusMarkup, false/*tableCanChange*/,
				{addCommentColumn:true, addLoanIdColumn:true, addInterestRateColumn:true, addMarkupColumn:true});
		
	//		$("table#loans-1").replaceWith(notesTable1);
		})();

		(function()
		{
			/* add the buttons and textboxes */
			notesTable1.find("th.accrued_interest").append(
				"<br><input type='button' id='byInterestInMonthsHighButton' />" +
				"<br><input type='button' id='byInterestInMonthsMedButton' />" +
				"<br><input type='button' id='byInterestInMonthsLowButton' />" +
				"<br><input type='button' id='byInterestInMonthsGraceButton' />" +
				""
			);

			notesTable1.find("th.guid").append(''
				+ "<div style='white-space:nowrap'><input type='button' id='autoselectButton' />"
				+ "<input type='button' id='autoselectEditButton' value='Edit' /></div>"
			);

			notesTable1.find("th.status").append(''
				+ '<br><input type="button" id="defaultEtcButton" />'
				+ '<br><input type="button" id="principalTooLowButton" />'
				+ '<br><input type="button" id="geolocationButton" />'
				+ '<br><input type="button" id="ficoWayDownButton" />'
				+ '<br><input type="button" id="bankruptButton" />'
			);

			notesTable1.find("th.lcac_markup").append(''
				+ "<br><input type='text' id='foliofnMarkupHighLimitTextBox' size=5 />"
				+ "<br><input type='button' id='markupHighButton' />"
				+ "<br><input type='text' id='foliofnMarkupLowLimitTextBox' size=5 />"
				+ "<br><input type='button' id='markupLowButton' />"
				+ "<br><input type='button' id='markupLessThan1Button' />"
				+ (TESTING ?
				"<br><input type='button' id='doublecheckMarkupButton' />" +
				"" : "")
			);

			notesTable1.find("th.expires").append(
				"<br><input type='button' id='orderExpiresButton' />"
			);

			notesTable1.find("th.storedRate").append(
				"<br><span id='storedRateUnknown' style='white-space:nowrap;'></nobr>"
			);

			DEBUG && timestamp(FUNCNAME, "XXX 1.6");
		})();

		function rankRows(notesTable)
		{
		var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);
		timestamp(FUNCNAME, true);

			var notesTable0 = notesTable.get(0);

			// for the buttons later
			var checkboxes =
			{
				byMarkupHigh: [],
				byMarkupLow: [],
				markupLessThan1: [],
				byInterestInMonthsHigh: [],
				byInterestInMonthsMed: [],
				byInterestInMonthsLow: [],
				byInterestInMonthsGrace: [],
				byUnknownInterestRate: [],
				orderExpires: [],
				doublecheckMarkup: [],
				geolocation: [],
				principalTooLow: [],
				ficoWayDown: [],
				bankruptDeceased: [],
				autoselect: [],
				defaultEtc: [],
			};
						
			checkboxes.defaultEtc.default = 0;
			checkboxes.defaultEtc.chargedOff = 0;
			checkboxes.defaultEtc.fullyPaid = 0;

			/* YYY sorting with strings can be much much faster.
			 * did it stop working? or did it never work? */

			checkboxes.doublecheckMarkup.sortFunc =
			checkboxes.byMarkupHigh.sortFunc =
				function(a, b)
				{
					return a.markup - b.markup;
				};

			checkboxes.doublecheckMarkup.toStringFunc =
			checkboxes.byMarkupHigh.toStringFunc =
				function()
				{
					return sprintf("%+010.2f", this.markup);
				};

			checkboxes.byMarkupHigh.reverseFlag = true;
			checkboxes.doublecheckMarkup.reverseFlag = true;
			checkboxes.byMarkupLow.sortFunc =
				function(a, b)
				{
					return a.markup - b.markup;
				};

			checkboxes.byMarkupLow.toStringFunc =
				function()
				{
					return sprintf("%+010.2f", this.markup);
				};

			checkboxes.orderExpires.sortFunc =
				function(a, b)
				{
					return a.daysLeft - b.daysLeft;
				};

			checkboxes.orderExpires.toStringFunc =
				function()
				{
					return sprintf("%+010d", this.daysLeft);
				};

			checkboxes.byInterestInMonthsHigh.sortFunc =
			checkboxes.byInterestInMonthsMed.sortFunc =
			checkboxes.byInterestInMonthsLow.sortFunc =
			checkboxes.byInterestInMonthsGrace.sortFunc =
				function(a, b)
				{
					return a.markup - b.markup;
				};

			checkboxes.byInterestInMonthsHigh.toStringFunc =
			checkboxes.byInterestInMonthsMed.toStringFunc =
			checkboxes.byInterestInMonthsLow.toStringFunc =
			checkboxes.byInterestInMonthsGrace.toStringFunc =
				function()
				{
					return sprintf("%+010.2f", this.markup);
				};


			var TODAY2 = TODAY();
			var daysLeftMin = null;
			var daysLeftMinCount = null;

			// rank the rows
			DEBUG && GM_log("rank the rows...");

			// OPTIMIZEME ~5 seconds
			var trs =
				notesTable
					.find("tbody tr")	// tbody means not in the header (or footer)
						.not(".tfoot")	// double check to make sure we moved it to the footer
						.not(":contains(No Results Found)");
			
			DEBUG && GM_log("trs=", trs);

			var interestAnomaly = [];
			var row = -1, numselected = 0;
			var autoselectFuncAlerted = false;
			trs.each(function()
			{
				row++;
				var tr0 = this;
				var tr = $(this);
			
				DEBUG && GM_log("tr=", tr);
				
				var checkbox = tr.find("input:checkbox");

				var tds = tr.find("td");
				GM_log("tds=", tds);

				var loanStatus = tds.eq(notesTable0.loanStatusColumnIndex).text();
				DEBUG && GM_log("loanStatus=" + loanStatus);

				/* can't re-submit these (but can cancel them) */
				function defaultEtc(loanStatus)
				{
					if(loanStatus.match(/Default/))
					{
						checkboxes.defaultEtc.default++;
						return true;
					}
					else if(loanStatus.match(/Charged\s*Off/))
					{
						checkboxes.defaultEtc.chargedOff++;
						return true;
					}
					else if(loanStatus.match(/Fully\s*Paid/))
					{
						checkboxes.defaultEtc.fullyPaid++;
						return true;
					}
					return false;
				}

				if(defaultEtc(loanStatus))
				{
					checkboxes.defaultEtc.push(checkbox);
					GM_log("defaultEtc() returning");
					return; //continue;
				}
				
				/* Foliofn wierdness: compare accruedInterest to the saved value from notes */
				var noteId = tr.data('noteId');
				DEBUG && GM_log("noteId=", noteId);

				var note = getStoredNote(noteId);
				DEBUG && GM_log("note=", note);

				var accruedInterest2 = getStoredNote(noteId, "accrual");
				DEBUG && GM_log("accruedInterest2=", accruedInterest2);
				if(accruedInterest2 == null)
				{
					DEBUG && printStackTrace("accruedInterest2=" + accruedInterest2 + " returning");
					return;	// continue
				}

				var loanId = tr.data('loanId');

				var askingPrice = text2Value(tds.eq(notesTable0.askingPriceColumnIndex).text());
				var principalPlus = text2Value(tds.eq(notesTable0.principalPlusColumnIndex).text());

				var interestRate = getStoredInterestRateByLoanId(loanId); //WARNING: interestRate can be null here since we're using the stored rate

				var expiresString = tds.eq(notesTable0.orderExpiresColumnIndex).text();
				var expires = text2Date(tds.eq(notesTable0.orderExpiresColumnIndex).text());
				var daysLeft = Math.round((expires - TODAY2) / MILLISECONDSPERDAY);
				var markup = (askingPrice / principalPlus) - 1;
				var outstandingPrincipal = html2Value(tr0.cells[notesTable0.outstandingPrincipalColumnIndex].innerHTML);
				var accruedInterest = html2Value(tr0.cells[notesTable0.accruedInterestColumnIndex].innerHTML);
				var accruedInterestInMonths = calcInterestInMonths(outstandingPrincipal, interestRate, accruedInterest);

				GM_log("askingPrice=" + askingPrice + " accruedInterest=" + accruedInterest + " accruedInterestInMonths=" + accruedInterestInMonths + " principalPlus=" + principalPlus + " interestRate=" + interestRate);
						
				//OPTIMIZE add these values to the checkboxes directly for sorting (is this even allowed?)
				$.extend(checkbox,
				{
					askingPrice: askingPrice,
					principalPlus: principalPlus,
					interestRate: interestRate,
					expires: expires,
					daysLeft: daysLeft,
					markup: markup,
					outstandingPrincipal: outstandingPrincipal,
					accruedInterest: accruedInterest,
					accruedInterestInMonths: accruedInterestInMonths,
				});

				var accruedInterestDiff = accruedInterest2 - accruedInterest;
				if(Math.abs(accruedInterestDiff) >= 0.01)
				{
					interestAnomaly.push({
						noteId: noteId,
						accruedInterest: accruedInterest,
						accruedInterest2: accruedInterest2,
						accruedInterestDiff: accruedInterestDiff,
					});
				}

				var used = false;

				if(interestRate == null || isNaN(interestRate))
					checkboxes.byUnknownInterestRate.push(checkbox);
				
				if(principalPlus < 1)
					checkboxes.principalTooLow.push(checkbox);
				
				// add fico500 and bankrupt
				var loan = getStoredLoan(loanId);
				if(loan)
				{
					if(loan.bankruptDeceased)
					{
						checkboxes.bankruptDeceased.push(checkbox);
						used = true;
					}
					else if(loan.fico < FICOWAYDOWN)
					{
						checkboxes.ficoWayDown.push(checkbox);
						used = true;
					}
					var GEOGRAPHIC = new RegExp("\b(NY|NJ)\b");
					if(loan.location && GEOGRAPHIC && GEOGRAPHIC.test(loan.location))
					{
						checkboxes.geolocation.push(checkbox);
						used = true;
					}
				}


				DEBUG && GM_log("markup=" + markup);
				if(markup <= 0.01)
					checkboxes.markupLessThan1.push(checkbox);

				if(markup > headerLimits.foliofnMarkupHighLimit)
					checkboxes.byMarkupHigh.push(checkbox);

				if(markup <= 0.01
				&& (loanStatus.match(/Current/) || accruedInterestInMonths < 1.2))
					checkboxes.doublecheckMarkup.push(checkbox);

				if(accruedInterestInMonths >= lateMonths1)
				{
					checkboxes.byInterestInMonthsHigh.push(checkbox);
					used = true;
				}
				else if(accruedInterestInMonths >= lateMonths2)
				{
					checkboxes.byInterestInMonthsMed.push(checkbox);
					used = true;
				}
				else if(accruedInterestInMonths >= lateMonths3)
				{
					checkboxes.byInterestInMonthsLow.push(checkbox);
					used = true;
				}
				else if(accruedInterestInMonths >= lateMonths4)
				{
					checkboxes.byInterestInMonthsGrace.push(checkbox);
					used = true;
				}
		
				if(!used && markup < headerLimits.foliofnMarkupLowLimit)
					checkboxes.byMarkupLow.push(checkbox);

				if(daysLeft < MAXEXPIRES)	// most are limited to 7 days automatically
				{
					if(daysLeftMin == null || daysLeft < daysLeftMin)
					{
						daysLeftMin = daysLeft;
						daysLeftMinCount = 1;
					}
					else if(daysLeft == daysLeftMin)
						daysLeftMinCount++;

					checkboxes.orderExpires.push(checkbox);
				}

				try
				{
					if(autoselectFunc != null
					&& autoselectFunc(row, numselected, loanStatus, loanId, noteId, askingPrice, principalPlus, interestRate, expires, daysLeft, markup, outstandingPrincipal, accruedInterest, accruedInterestInMonths))
					{
						checkboxes.autoselect.push(checkbox);
						numselected++;
					}
				}
				catch(ex)
				{
					/*XXX handle this in the init, so we can let our editor handle it when editing */
					GM_log("calling autoselectFunc() ex=" + ex + "\n" + ex.stack);
					if(!autoselectFuncAlerted)
					{
						alert("error initing your autoselect function\nex=" + ex + "\n" + ex.message /*+ "\n" + ex.stack*/);
						autoselectFuncAlerted = true;
					}
				}
			});

			var interestAnomalyAlerted = false;
			if(interestAnomaly.length > 0)
			{
				var accruedInterestDiffMin = null;
				var indexMin = null;
				for(var index = 0; index < interestAnomaly.length; index++)
				{
					if(index == 0 || interestAnomaly[index].accruedInterestDiff < accruedInterestDiffMin)
					{
						indexMin = index;
						accruedInterestDiffMin = interestAnomaly[index].accruedInterestDiff;
					}
				}

				if(!interestAnomalyAlerted)
				{
					interestAnomalyAlerted = true;
					setTimeout(function()
					{
						alert(
							sprintf("Cached values out of date.%s Visit LC Account page to reload.",
								(TESTING && indexMin != null
								? sprintf(" %d notes, Max %f, Note Id %d.",
									interestAnomaly.length, interestAnomaly[indexMin].accruedInterestDiff, interestAnomaly[indexMin].noteId)
								: "")
								));

	//					var ok = confirm(
	//						sprintf("Cached values out of date.%s Reload?",
	//							(TESTING && indexMin != null
	//							? sprintf(" %d notes, Max %f, Note Id %d.",
	//								interestAnomaly.length, interestAnomaly[indexMin].accruedInterestDiff, interestAnomaly[indexMin].noteId)
	//							: "")
	//							));
	//
	//					if(!ok)
	//						return;
	//
	//					getAccountNotesRawData();	// this will store our interest rates
					}, 5000);
				}
			}

			/*
			 * sort the arrays
			 */
			for(var byWhateverName in checkboxes)
			{
				var byWhatever = checkboxes[byWhateverName];

				sortOptimizer(byWhatever, byWhatever.toStringFunc, byWhatever.sortFunc, byWhatever.reverseFlag)
			}
			
			checkboxes.daysLeftMin = daysLeftMin;
			checkboxes.daysLeftMinCount = daysLeftMinCount;

			timestamp(FUNCNAME, "returning");
			return checkboxes;
		}

		function updateButtons(checkboxes)
		{
			GM_log("updateButtons() notesTable1=", notesTable1);

			/* set the values */
			notesTable1.find("#foliofnMarkupHighLimitTextBox")
				.val(sprintf("%.1f%%",
					headerLimits.foliofnMarkupHighLimit * 100));

			notesTable1.find("#markupHighButton")
				.val(sprintf(">%.1f%%(%s)%s",
					headerLimits.foliofnMarkupHighLimit * 100,
					checkboxes.byMarkupHigh.length,
					tooManyRowsTickMark(checkboxes.byMarkupHigh.length)))
				.prop('disabled', checkboxes.byMarkupHigh.length == 0);

			notesTable1.find("#markupLowButton")
				.val(sprintf("<%.1f%%(%s)%s",
					headerLimits.foliofnMarkupLowLimit * 100,
					checkboxes.byMarkupLow.length,
					tooManyRowsTickMark(checkboxes.byMarkupLow.length)))
				.prop('disabled', checkboxes.byMarkupLow.length == 0);

			notesTable1.find("#doublecheckMarkupButton")
				.val(sprintf("<1%%+cur(%s)%s",
					checkboxes.doublecheckMarkup.length,
					tooManyRowsTickMark(checkboxes.doublecheckMarkup.length)))
				.prop('disabled', checkboxes.doublecheckMarkup.length == 0);

			notesTable1.find("#markupLessThan1Button")
				.val(sprintf("<1%%(%s)%s",
					checkboxes.markupLessThan1.length,
					tooManyRowsTickMark(checkboxes.markupLessThan1.length)))
				.prop('checked', checkboxes.markupLessThan1.length == 0);

			notesTable1.find("#byInterestInMonthsHighButton")
				.val(sprintf(">%.1fm(%s)%s",
					lateMonths1,
					checkboxes.byInterestInMonthsHigh.length,
					tooManyRowsTickMark(checkboxes.byInterestInMonthsHigh.length)))
				.prop('disabled', checkboxes.byInterestInMonthsHigh.length == 0);

			notesTable1.find("#byInterestInMonthsMedButton")
				.val(sprintf(">%.1fm(%s)%s",
					lateMonths2,
					checkboxes.byInterestInMonthsMed.length,
					tooManyRowsTickMark(checkboxes.byInterestInMonthsMed.length)))
				.prop('disabled', checkboxes.byInterestInMonthsMed.length == 0);

			notesTable1.find("#byInterestInMonthsLowButton")
				.val(sprintf(">%.1fm(%s)%s",
					lateMonths3,
					checkboxes.byInterestInMonthsLow.length,
					tooManyRowsTickMark(checkboxes.byInterestInMonthsLow.length)))
				.prop('disabled', checkboxes.byInterestInMonthsLow.length == 0);

			notesTable1.find("#byInterestInMonthsGraceButton")
				.val(sprintf(">%.1fm(%s)%s",
					lateMonths4,
					checkboxes.byInterestInMonthsGrace.length,
					tooManyRowsTickMark(checkboxes.byInterestInMonthsGrace.length)))
				.prop('disabled', checkboxes.byInterestInMonthsGrace.length == 0);

			notesTable1.find("#foliofnMarkupLowLimitTextBox")
				.val(sprintf("%.1f%%", headerLimits.foliofnMarkupLowLimit * 100));

			notesTable1.find("#geolocationButton")
				.val(sprintf("Geographic(%d)%s",
					checkboxes.geolocation.length,
					tooManyRowsTickMark(checkboxes.geolocation.length)))
				.prop("disabled", checkboxes.geolocation.length == 0);

			notesTable1.find("#defaultEtcButton")
				.val(sprintf("Def.(%d)/C.O(%d)/F.P(%d)",
					checkboxes.defaultEtc.default,
					checkboxes.defaultEtc.chargedOff,
					checkboxes.defaultEtc.fullyPaid,
					tooManyRowsTickMark(checkboxes.defaultEtc.length)))
				.prop("disabled", checkboxes.defaultEtc.length == 0);

			notesTable1.find("#principalTooLowButton")
				.val(sprintf("principal low(%d)%s",
					checkboxes.principalTooLow.length,
					tooManyRowsTickMark(checkboxes.principalTooLow.length)))
				.prop("disabled", checkboxes.principalTooLow.length == 0);

			notesTable1.find("#ficoWayDownButton")
				.val(sprintf("ficoWayDown(%d)%s",
					checkboxes.ficoWayDown.length,
					tooManyRowsTickMark(checkboxes.ficoWayDown.length)))
				.prop("disabled", checkboxes.ficoWayDown.length == 0);

			notesTable1.find("#bankruptButton")
				.val(sprintf("bankrupt, etc.(%d)%s",
					checkboxes.bankruptDeceased.length,
					tooManyRowsTickMark(checkboxes.bankruptDeceased.length)))
				.prop("disabled", checkboxes.bankruptDeceased.length == 0);

			notesTable1.find("#autoselectButton")
				.val(sprintf("(%d)",
					checkboxes.autoselect.length,
					tooManyRowsTickMark(checkboxes.autoselect.length)))
				.prop("disabled", checkboxes.autoselect.length == 0);
			
			var daysLeftMin = checkboxes.daysLeftMin;
			var daysLeftMinCount = checkboxes.daysLeftMinCount;
			notesTable1.find("#orderExpiresButton")
				.val(
					sprintf("T-%s(%s/%s)%s",
	//				sprintf("T-%s(%s)%s",
						daysLeftMin == null ? '--' : daysLeftMin,
						daysLeftMin == null ? '--' : daysLeftMinCount,
						checkboxes.orderExpires.length,
						tooManyRowsTickMark(checkboxes.orderExpires.length)))
				.prop('disabled', daysLeftMin == null);

			notesTable1.find('#storedRateUnknown')
				.text(sprintf("(%d Unknown)", checkboxes.byUnknownInterestRate.length));
		}

		function checkCheckboxes(checkboxes)
		{
		var DEBUG = debug(false, checkboxes);

			/* YYY server submit times out if too many */
			if(CHECKBOXLIMIT > 0)
				checkboxes = checkboxes.slice(0, CHECKBOXLIMIT);

			$(checkboxes)	// this is an array of jquery sets
				.map(function(index, element)	// turn it into a single jquery set
				{
					return element.toArray();
				})
				.prop('checked', true);

			window.status = checkboxes.length + ' boxes checked';
		}
			
		var checkboxes;	// this is used later down when the buttons are clicked
		function recalcCheckboxes()
		{
		var DEBUG = debug(true, arguments);

			checkboxes = rankRows(notesTable1);

			DEBUG && GM_log("checkboxes=", checkboxes);
			
			updateButtons(checkboxes);	// this is pretty fast
		}

		recalcCheckboxes();	// initialize it
		
		/* find the buttons and checkboxes */
		notesTable1.find("#foliofnMarkupHighLimitTextBox")
			.on('change', function()
			{
				setHeaderLimit("foliofnMarkupHighLimit", this, true);
				recalcCheckboxes();	// update it
			})
			.on('keypress', function(event)
			{
				if(event.keyCode == 13 /*ENTER*/)
				{
					setHeaderLimit("foliofnMarkupHighLimit", this, true);
					event.preventDefault();	// don't try to submit the form
					recalcCheckboxes();
				}
			});

		notesTable1.find("#foliofnMarkupLowLimitTextBox")
			.on('change', function()
				{
					setHeaderLimit("foliofnMarkupLowLimit", this, true);
					recalcCheckboxes();
				})
			.on('keypress', function(event)
				{
					if(event.keyCode == 13 /*ENTER*/)
					{
						setHeaderLimit("foliofnMarkupLowLimit", this, true);
						event.preventDefault();	// don't try to submit the form
						recalcCheckboxes();
					}
				});



		notesTable1.find("#markupHighButton")
			.on('click', function(){checkCheckboxes(checkboxes.byMarkupHigh);});

		notesTable1.find("#markupLowButton")
			.on('click', function(){checkCheckboxes(checkboxes.byMarkupLow);});

		notesTable1.find("#doublecheckMarkupButton")
			.on('click', function(){checkCheckboxes(checkboxes.doublecheckMarkup);});


		notesTable1.find("#markupLessThan1Button")
			.on('click', function(){checkCheckboxes(checkboxes.markupLessThan1);});

		notesTable1.find("#byInterestInMonthsHighButton")
			.on('click', function(){checkCheckboxes(checkboxes.byInterestInMonthsHigh);});

		notesTable1.find("#byInterestInMonthsMedButton")
			.on('click', function(){checkCheckboxes(checkboxes.byInterestInMonthsMed);});

		notesTable1.find("#byInterestInMonthsLowButton")
			.on('click', function(){checkCheckboxes(checkboxes.byInterestInMonthsLow);});

		notesTable1.find("#byInterestInMonthsGraceButton")
			.on('click', function(){checkCheckboxes(checkboxes.byInterestInMonthsGrace);});

		notesTable1.find("#defaultEtcButton")
			.on('click', function(){checkCheckboxes(checkboxes.defaultEtc);});

		notesTable1.find("#geolocationButton")
			.on('click', function(){checkCheckboxes(checkboxes.geolocation);});

		notesTable1.find("#principalTooLowButton")
			.on('click', function(){checkCheckboxes(checkboxes.principalTooLow);});

		notesTable1.find("#ficoWayDownButton")
			.on('click', function(){checkCheckboxes(checkboxes.ficoWayDown);});

		notesTable1.find("#bankruptButton")
			.on('click', function(){checkCheckboxes(checkboxes.bankruptDeceased);});

		notesTable1.find("#autoselectButton")
			.on('click', function(){checkCheckboxes(checkboxes.autoselect);});

		notesTable1.find("#autoselectEditButton")
			.on('click', function() {
				autoFuncEdit('autoselectFunc', 'autoselectFuncBody', autoselectFuncProto, autoselectFuncBodyDefault, autoselectFuncBody);
				recalcCheckboxes();
			});

		notesTable1.find("#orderExpiresButton")
			.on('click', function(){checkCheckboxes(checkboxes.orderExpires)});

		DEBUG && timestamp(FUNCNAME, "XXX 1.9");

		/*
		 * Sold this month
		 */
		queueTimeoutNull(function()
		{
			moveFooterRowToFooter(notesTable2);
			
			findHeadersCheckCells(notesTable2, colorCellsSoldPurchasedCanceled, false,
				{addCommentColumn:true, addLoanIdColumn:true});

			if(TESTING)
			{
				var emptyAs = notesTable2.find("a:empty");	// 2012-11-04 problem with the data
				GM_log("emptyAs=", emptyAs);
				emptyAs.append("placeholder*");
			}


			var notesTable0 = notesTable2.get(0);

			var trs = notesTable2.find("tbody tr");

			var clickCount = 0;	// all the rows share this variable?

			/* add the sale price copy buttons */
			trs.each(
				function(index, tr)
				{
					var tr = $(tr);	// element is DOM element

					var salePriceCell = tr.find("td").eq(notesTable0.salePriceColumnIndex);
					var salePrice = salePriceCell.text();
					
					var loanId = tr.data('loanId');
					var loanStatusCell = tr.find("td").eq(notesTable0.loanStatusColumnIndex);
			
					var a = loanStatusCell.find('a');	// find the element that has the string (could be us or a div)
					
					var url = a.prop('href');

//					if(TESTING)
//					{
//					/* add price to href link to note */
//					a.prop('href', url + sprintf("&sale_price=%0.2f", text2Value(salePrice)));
//					}

					if(COPYVALUEBUTTONS)
					{
						var commentCell = tr.find("td").eq(notesTable0.commentColumnIndex);
						
						commentCell.prepend(
							sprintf("<input id='salePriceButton' type='button' style='width:5em' value='%s'/>",
								salePrice));

						var commentTextBox = commentCell.find(".commentTextBox");
						var salePriceButton = commentCell.find("#salePriceButton");

						salePriceButton.on('click', function(eventObject)
						{
							(function salePriceButton_click() {
								var placeholder = sprintf("XX%dXX", ++clickCount);
								var commentOrig = commentTextBox.val();

								var comment = sprintf("%s@%s %s", placeholder, salePrice, commentOrig); // Note: salePrice already has dollar sign

								comment = $.trim(comment);

								commentTextBox.val(comment);
								commentTextBox.trigger('change');	// fire the event to notify the listeners

								$.get(url, function(responseText)
								{
									if(responseText.match(/Member Sign-In/))		// we've been logged out
									{
										alert("Not logged in");
										commentTextBox.val(commentOrig);	// reset it
										commentTextBox.trigger('change');	// fire the event to notify the listeners
										return;
									}

									responseText = responseText.replace(/^[\s\S]*?(<body)/, "$1");	//YYY jquery 1.9.1 chokes on DOCTYPE line?

									var outstandingPrincipal = parseFloat2($("th:contains(Outstanding Principal) + td", responseText).text());

									var comment = commentTextBox.val();	// this could have changed if user clicks multiple, so load it again

									/* add principal@price */
									comment = comment.replace(
										new RegExp(placeholder),
										sprintf("$%0.2f", outstandingPrincipal));

									commentTextBox.val(comment);
									commentTextBox.trigger('change');	// fire the event to notify the listeners
								})
								.fail(function(jqXHR, textStatus, errorThrown)
								{
									alert("salePriceButton_click() textStatus=" + textStatus + " errorThrown=" + errorThrown);

									commentTextBox.val(commentOrig);	// reset it
									commentTextBox.trigger('change');	// fire the event to notify the listeners
								});
							})();
						});
					}
				});

		});


		/*
		 * Purchased this month
		 */
		queueTimeoutNull(function()
		{
			moveFooterRowToFooter(notesTable3);

			findHeadersCheckCells(notesTable3, colorCellsSoldPurchasedCanceled, false,
				{addCommentColumn:true, addLoanIdColumn:true});
			
		});


		/*
		 * Canceled Buy Orders
		 */
		queueTimeoutNull(function()
		{
			moveFooterRowToFooter(notesTable4);

			findHeadersCheckCells(notesTable4, colorCellsSoldPurchasedCanceled, false,
				{addCommentColumn:true, addLoanIdColumn:true});
			
		});


		/*
		 * Canceled Sell Orders
		 */
		queueTimeoutNull(function()
		{
			moveFooterRowToFooter(notesTable5);

			findHeadersCheckCells(notesTable5, colorCellsSoldPurchasedCanceled, false,
				{addCommentColumn:true, addLoanIdColumn:true});
			
			GM_log("notesTable5=", notesTable5);
			GM_log("notesTable5.get()=", notesTable5.get());

			if(CANCELEDHIDE)
			{
			notesTable5
				.find("th:contains(Order Status)")
					.append(
						"<br>" +
						"<input type='checkbox' id='canceledHideCheckBox' />" +
						"<label for='canceledHideCheckBox'>Hide some?</label>" +
						"")
			notesTable5
				.find("tfoot td")	
					.filter(function(){return /Note\(s\)/.test($(this).text());})
						.append(" (<span id='visiblecount'>%s</span> visible)");
			}
			
			// hide the row or delete the row?
			notesTable5.find("tbody").find("td:contains(Expired), td:contains(Canceled by User)").closest("tr")
				.addClass("lcac_canceled")	


			if(true)
			setTimeout(function()	// why did we put this in a timeout again?
			{
			var canceledHide = getStoredValue("canceledHide");
			GM_log("canceledHide=" + canceledHide + " typeof canceledHide=" + typeof canceledHide);
			notesTable5
					.find('input#canceledHideCheckBox')
						.prop('checked', canceledHide);	// prop doesn't work?

			set_canceledHide(getStoredValue("canceledHide"));
			
			updateCount();

			/*XXX can't get a handle to the actual element? */
			notesTable5
				.on('change', 'input#canceledHideCheckBox', function(event)
				{
					GM_log("canceledHideCheckBox.change eventListener()... event=", event);
					var checked = $(this).prop('checked');
					set_canceledHide(checked);
					updateCount();
				})
			}, 0);

			function updateCount()
			{
				var count =
					notesTable5.find("tbody tr:visible")
						.not(".tfoot")	// last line, footer
						.length;
				
				GM_log("count=" + count);
				
				notesTable5
					.find("#visiblecount")
						.text('' + count);
			}

		});
		
		if(DETACHTABLES)
		{
			notesTable4Placeholder.replaceWith(notesTable4);
			notesTable3Placeholder.replaceWith(notesTable3);
			notesTable2Placeholder.replaceWith(notesTable2);
			notesTable1Placeholder.replaceWith(notesTable1);
		};
		
		(function addStatmentLinks()
		{
		var DEBUG = debug(false, arguments);

			var date = new Date();
			var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
			/*
			 * Add a link to this months (partial) statement
			 * e.g. <a href="/foliofn/traderStatement.action?start_date_trader_statements=03/01/2014" onclick="s_objectID=&quot;https://www.lendingclub.com/foliofn/traderStatement.action?start_date_trader_statements=03/01/201_1&quot;;return this.s_oc?this.s_oc(e):true">Trading Statement - March 2014</a>
			 */
			$("#Statements_from_Previous_Months + ul")
				.prepend(sprintf("<li><a href='/foliofn/traderStatement.action?start_date_trader_statements=%02d/%02d/%04d' >Trading Statement - %s %s*</a></li>", date.getMonth() + 1, 1, date.getFullYear(), monthNames[date.getMonth()], date.getFullYear()));


			/*
			 * Add a link to this years (partial) summary
			 */
			$("#Year_End_Summary + ul")
				.prepend(sprintf("<li><a href='/foliofn/yrEndTraderStatement.action?start_date_trader_statements=01/01/%s' >Year-end Summary - Notes Sold in %s*</a></li>", date.getFullYear(), date.getFullYear()));
		})();	// self-invoking
		
		
		if(TABLESORTER)
		{
			$.tablesorter.addParser({
				id: 'lcac_date',	// set a unique id
				is: function(s) {
					return false;	// return false so this parser is not auto detected
				},
				format: function(s) {
					return s.replace(/N\/A/, "99/99/99");	// replace N/A with a max value
				},
				type: 'text',	// set type, either numeric or text
			});

			if(TABLESORTER3)
			notesTable1.tablesorter({
//				delayInit: true,	// can't do this with a default sort
				cancelSelection: false,
//				sortList: [[1,0], [2,0]],
				headers:
				{
//					0: { sorter: 'checkboxes' },
					0: { sorter: false, },	// checkbox
					10: { sorter: false, },	// conflicts with button clicks
					11: { sorter: false, },	// conflicts with button clicks
					12: { sorter: false, },	// conflicts with button clicks
					13: { sorter: false, },	// conflicts with button clicks
					14: { sorter: false, },	// conflicts with button clicks
					15: { sorter: false, },	// comment
				},
				// tablesorter caches the element values?
//				textExtraction: function(node, table, cellIndex)
//				{
//					if(cellIndex == 0)
//					{
//						DEBUG && GM_log("textExtraction() node=%o table=%o cellIndex=" + cellIndex, node, table);
//						var checkbox = $(node).find("input:checkbox");
//						var checked = checkbox.prop("checked");
//						return checked ? "1" : "0";
//					}
//		
//					return  $(node).text();
//				},
			});

			notesTable2.tablesorter({
	//			delayInit: true,	// can't do this with a default sort
				sortList:
				[
					[notesTable2.find("thead th:contains('Date')").index(), 1],
					[notesTable2.find("thead th:contains('Trade ID')").index(), 0],
				],
				headers: { 1: { sorter:'lcac_date' } },
				widgets: ['zebra']
			});

			notesTable3.tablesorter({
	//			delayInit: true,	// can't do this with a default sort
				sortList:
				[
					[notesTable3.find("thead th:contains('Date')").index(), 1],	/* Date, desc */
	//				[2,0],
	//				[0,0],
				],
				headers: { 1: { sorter:'lcac_date' } },
				widgets: ['zebra']
			});

			queueTimeout(function()
			{
			if(TABLESORTER2)
			notesTable4.tablesorter(
				TABLESORTER2DELAYINIT
				? {
					delayInit: true,	// can't do this with a default sort
					headers: { 0: { sorter:'lcac_date' } },
					widgets: ['zebra']
				}
				: {
					sortList:
					[
						[notesTable4.find("thead th:contains('Date')").index(), 1],	/* Date, desc */
		//				[1, 0],
					],
					headers: { 0: { sorter:'lcac_date' } },
					widgets: ['zebra']
				}
			);

			if(TABLESORTER2)
			notesTable5.tablesorter(
				TABLESORTER2DELAYINIT
				? {
					delayInit: true,	// can't do this with a default sort
					headers: { 0: { sorter:'lcac_date' } },
					widgets: ['zebra']
				}
				: {
					sortList:
					[
						/* XXX just one of these can take a LOOONG time, e.g. 13 seconds with 1458 rows */
						[notesTable5.find("thead th:contains('Date')").index(), 1],	/* Date, desc */
			//			[notesTable5.find("thead th").index(":contains('Order Status')"), 0/*asc*/],
			//			[notesTable5.find("thead th").index(":contains('Note ID')"), 0/*asc*/],
					],
					headers: { 0: { sorter:'lcac_date' } },
					widgets: ['zebra']
				}
			);
			});
		}

		function updateAvailableCash1()
		{
			$("#availableCashInput").val('...');

			getAvailableCash(function updateAvailableCash1_getAvailableCash_callback(availableCash)
			{
			var DEBUG = debug(false, arguments);

				$("#availableCashInput")
					.removeClass("lcac_greenLow")
					.removeClass("lcac_redLow");

				if(availableCash == null)
				{
					$("#availableCashInput").val('Error');
					$("#availableCashInput").addClass("lcac_redLow");
				}
				else
				{
					$("#availableCashInput").val(sprintf('$%0.2f', availableCash));
					if(availableCash > 0)
						$("#availableCashInput").addClass("lcac_greenLow");
				}
			});
		}

		updateAvailableCash1();	
				
		$("#availableCashRefresh").on('click', function()
		{
			updateAvailableCash1();	// this was calling the wrong updateAvailableCash()... because it was in a floating div?
		});


		queueTimeout(function()
		{
			queueTimeout(function()
			{
				timestamp(FUNCNAME, "XXX 9.9");
			});
		});
		
		timestamp(FUNCNAME, "XXX 0.9");
	}
	else if(href.match(/purchaseSuccess.action/))	// after buying
	{
		if(TRADINGINVETORYPARAMS)
		{
			var search = localStorage.getItem("tradingInventory.action.search");	// we'll use this later
			GM_log("search=", search);

			if(search)
				$("a[href$='/tradingInventory.action']").each(function()
				{
					var element = $(this);
					GM_log("element=", element);
					element.prop("href", element.prop("href") + search);
				});

			if(AUTOFOLLOWLINK)
			followLink('Buy');
		}
	}
	else if(href.match(/selectNotesToReprice|selectLoansForSale|submitCompleteLoanPurchase|completeLoanPurchase|repriceSelectedNotes.action|confirmLoansForSale|saleSuccess.action|cart.action/))
	{
		/*XXX 2013-10-23 we're not interacting well with Foliofn's new markup stuff */
		if($("th.lcac_markup").length > 0)
			return;

		if($("td:contains(No Results Found)").length > 0)
		{
			GM_log("No Results Found, returning");
			return;
		}

		if($(":contains(Order Price Changes Submitted)").length > 0	// repriceSelectedNotes.action
		|| $(":contains(Notes Made Available for Sale)").length > 0)	// saleSuccess.action
		{
			// SUCCESS!
			if(AUTOFOLLOWLINK)
			followLink('your account');

			return;
		}
		
		if($(":contains(Order Not Submitted)").length > 0)	// repriceSelectedNotes.action
		{
			// some kind of error
			return;
		}

		/* negative YTM checked on the server, not just in the client */
		if(false)
		{
		GM_log("typeof checkAskingPrice=", typeof checkAskingPrice);
		if(typeof checkAskingPrice == 'function')
		{
			GM_log("checkAskingPrice=", checkAskingPrice);
			checkAskingPrice = function()
			{
				return 1;
			}
			GM_log("typeof checkAskingPrice=", typeof checkAskingPrice);
			GM_log("checkAskingPrice=", checkAskingPrice);
		}
		}

		if(TRADINGINVETORYPARAMS)
		{
			var search = localStorage.getItem("tradingInventory.action.search");	// we'll use this later
			GM_log("search=", search);

			if(search)
				$("a[href$='/tradingInventory.action']").each(function()
				{
					var element = $(this);
					element.prop("href", element.prop("href") + search);
				});
		}

		/* XXX sometimes submitCompleteLoanPurchase is actually "Browse Notes" page (e.g. if to-purchase notes were unavailable). How should we handle that case? Redirect to Browse Notes link? */

		$('#content-wrap').width('auto');	// YYY on my system, there's a lot of ununsed whitespace on the left

		/* completeLoanPurchase, submitCompleteLoanPurchase comes back on error */

		var addLoanIdColumn = href.match(/selectNotesToReprice|selectLoansForSale/) != null;
		
		var notesTable = $("table#loans-1");	//verified for selectNotesToReprice, completeLoanPurchase

		if(notesTable.length == 0)	// no table on the page
		{
			GM_log("NOT FOUND notesTable=", notesTable);
			return;
		}

		var notesTable0 = notesTable.get(0);
		GM_log("notesTable0=", notesTable0);

		var markupHeader = notesTable.find("th.markup");
		var ytmHeader = notesTable.find("th.ytm");
		
		var addMarkupColumn = markupHeader.length == 0;	//2013-10-23 LC added a markup column to sell notes


		/* YYY tweak HTML nonbreaking between dollar-sign and textbox
		 * WARNING indiscriminate modification of HTML can break listeners
		 */
		GM_addStyle("td.price { white-space:nowrap; }");

		/* "This security is no longer listed" */
		$(".empty-middle").each(function()
		{
			var element = $(this);
			element.prop('colspan', element.prop('colspan') + 1);
		});


		findHeadersCheckCells(notesTable, addMarkupColumn ? colorCellsPlusMarkup : colorCells, false,
			{addCommentColumn:true, addLoanIdColumn:addLoanIdColumn, addMarkupColumn:addMarkupColumn});


		var trs = notesTable.find("tbody tr").not(".tfoot");

		/*
		 * YYY programmatic changes to the asking price don't trigger events so we use a
		 * click handler for the whole table to update the markups
		 */
		if(addMarkupColumn)
		$("#master-copy-price").click(
			function(event)
			{
				GM_log("master-copy-price$click()...")

				/* set a timeout to make sure they've updated the field first */
				setTimeout(function()
				{
				updateMarkupAll(notesTable0, trs);
				});
			});

		if(addMarkupColumn)
		$(".copy-asking-price-value-over").click(
			function(event)
			{
				GM_log("copy-asking-price-value-over$click()... event=%o", event)

				/* just update a single row */
				var element = event.currentTarget;
				var tr = $(element).closest('tr');
				/* set a timeout to make sure they've updated the field first */
				setTimeout(function()
				{
				updateMarkup(notesTable0, tr);
				});
			});

		//XXX get rid of this and handle it back in the elements
		if(addMarkupColumn)
			notesTable.click(
				function(event)
				{
					GM_log("notesTable$click()...");

					updateMarkupAll(notesTable0, trs);
				});

		if(ytmHeader.length > 0)
		{
			function unsetLessThan(selector, lessthanvalue)
			{
				var tds = notesTable.find(selector).filter(function(index)
				{
					var text = $(this).text();
					text = text.replace(/\((.+)\)/, '-$1');	// they use parens for negative
					var value = parseFloat(text);
					if(text.match(/%/))
						value /= 100;

					GM_log("value=" + value + " lessthanvalue=" + lessthanvalue);
					return value < lessthanvalue;
				});
				GM_log("tds=", tds);

				tds.each(function(index)
				{
					var askingPriceInput = $(this).closest("tr").find("input.asking-price");
					setAskingPriceInput(askingPriceInput, '');
				});
			}

			if(false)
			{
			markupHeader
				.append(""
					+ "<input type='text' class='lcac_lessthanvalue' style='width:4em;' value='0.02' />"
					+ "<input type='button' class='lcac_unsetlessthan' value='unset <' />"
					+ "<input type='button' class='lcac_unsetgt70' value='unset >70%' />"
					+ "<input type='button' class='lcac_unsetnegmarkup' value='unset neg' />"
				)
				.find(".lcac_unsetgt70").click(function()
				{
					unsetLessThan("td.markup", 0.7);
				})
				.end()
				.find(".lcac_unsetlessthan").click(function()
				{
					var text = $(".lcac_lessthanvalue").val();
					var lessthanvalue = parseFloat(text);
					GM_log("text=" + text + " lessthanvalue=" + lessthanvalue);

					unsetLessThan("td.markup", lessthanvalue);
				})
				.end()
				.find(".lcac_unsetnegmarkup").click(function()
				{
					unsetLessThan("td.markup", 0);
				})
			;
			}

			if(false)
			{
			ytmHeader
				.append(""
				+ "<input type='text' class='lcac_targetytm' size='4' value='0.05' />"	//XXX load a default from GM_getValue
				+ "<input type='button' class='lcac_ytmdotarget' value='ytm target' />"
				+ "<input type='button' class='lcac_unsetnegytm' value='unset neg' />"
				)
				.find(".lcac_targetytm")
					.change(function lcac_targetytm_change()
					{
						var value = $(this).val();
						GM_log("value=" + value);

						var matches = value.match(/([\d.]+)%/);
						GM_log("matches=", matches);

						if(matches)
							value = matches[1] / 100;
						GM_log("value=" + value);

						$(this).val(value);
					})
				.end()
				.find(".lcac_ytmdotarget")
					.click(function ytmdotarget()
					{
						var ytmdotargetButton = $(this);

						GM_log("ytmdotarget()");
						var trs = notesTable.find("tbody > tr").not(".tfoot");

						var targetytm = $("input.lcac_targetytm").val();

						if(ytmdotargetButton.hasClass('lcac_running'))
						{
							//XXX cancel and reset button
							return;
						}

						ytmdotargetButton.val('Running');
						ytmdotargetButton.addClass('lcac_running');

						doTargetYtm(trs, targetytm, function doTargetYtm_callbackDone()
						{
							ytmdotargetButton.val('ytm target');
							ytmdotargetButton.removeClass('lcac_running');
						});

						GM_log("trs=", trs);
					})
				.end()
				.find(".lcac_unsetnegytm").click(function()
				{
					unsetLessThan("td.ytm", 0);
				})
				;
			}
		}
						
		trs.each(function()
		{
			var tr = $(this);	// element is DOM element

			var askingPriceInput = tr.find("input.asking-price");

			if(!askingPriceInput)	// sometimes it comes back "This security is no longer listed" on submitCompleteLoanPurchase
				return;


			if(addMarkupColumn)
				askingPriceInput
					.on('change',
						function()
						{
							GM_log("askingPriceInput$change()... tr=", tr);
							updateMarkup(notesTable0, tr);
						})
					.on('keyup',
						function()
						{
							GM_log("askingPriceInput$keyup()... tr=", tr);
							updateMarkup(notesTable0, tr);
						})
					.on('keypress',
						function(event)
						{
							if(event.keyCode == 13 /*ENTER*/)
							{
								event.preventDefault();	// don't try to submit the form
								updateMarkup(notesTable0, tr);
							}
						});
			else
				askingPriceInput
					.on('keypress',
						function(event)
						{
							if(event.keyCode == 13 /*ENTER*/)
							{
								event.preventDefault();	// don't try to submit the form
								//XXX update the markup
								setAskingPriceInput(askingPriceInput, null);	// null means don't set it, just call processMarkupYtm
							}
						});
		});

		/*
		 * add % adjustment buttons to price Asking Price column
		 */
		var askingPriceHeader = notesTable.find("th.price");
		if(askingPriceHeader)
		{
			function adjustAskingPrice(multiplier)
			{
				var trs = notesTable.find("tbody tr").not(".tfoot");

				trs.each(function()
				{
					var tr = $(this);	// element is DOM element

					var askingPriceInput = tr.find("input.asking-price");

					var value = text2Value(askingPriceInput.val());

					var newValue = value * multiplier;
					newValue = round2Decimals(newValue);

					// values less than 0.50 will never change using +% or -% buttons, so minimum 1 cent change
					if(newValue == value)
						newValue += (multiplier > 1.0 ? 0.01 : -0.01);

				
					setAskingPriceInput(askingPriceInput, newValue);
				});
			}

			function adjustAskingPriceAuto()
			{
				if(!checkWARNINGACCEPTED())
					return;

				if(adjustAskingPriceAutoFunc == null)
				{
					alert("Adjust Asking Price Auto function is unset");
					return;
				}

				try
				{
					var trs = notesTable.find("tbody tr").not(".tfoot");

					var notesTable0 = notesTable.get(0);

					var loanIdCountArray = Array();
					var interestAnomaly = [];

					var trsReverse = $(trs.get().reverse());		// per: http://stackoverflow.com/questions/1394020/jquery-each-backwards
					trsReverse.each(function()
					{
						var tr = $(this);

						// WARNING!!! buttons can be are inputs too!!! hidden order_id and loan_id are inputs on these rows, too

						var askingPriceInput = tr.find("input.asking-price");

						var tds = tr.find("td");

						// WARNING: remainingPayments is NOT accurate for loans that aren't paid exactly on schedule
						var loanId = getLoanId(tr, notesTable0.loanIdColumnIndex, notesTable0.loanIdEmbeddedColumnIndex);
						var interestRate = getStoredInterestRateByLoanId(loanId);
						var principalPlus = text2Value(tds.eq(notesTable0.principalPlusColumnIndex).text());
						var remainingPayments = text2Value(tds.eq(notesTable0.remainingPaymentsColumnIndex).text());
						var loanStatus = tds.eq(notesTable0.loanStatusColumnIndex).text();
						var outstandingPrincipal = text2Value(tds.eq(notesTable0.outstandingPrincipalColumnIndex).text());
						var accruedInterest = text2Value(tds.eq(notesTable0.accruedInterestColumnIndex).text());
						var accruedInterestInMonths = calcInterestInMonths(outstandingPrincipal, interestRate, accruedInterest);
						var loan = getStoredLoan(loanId);

						var noteId = tr.data('noteId');
						var note = getStoredNote(noteId);
						if(note == null)
						{
							printStackTrace("noteId=" + noteId + " note=" + note);
							return;	// continue
						}

						var accruedInterest2 = note.accrual;
						var accruedInterestDiff = accruedInterest2 - accruedInterest;

						if(Math.abs(accruedInterestDiff) >= 0.01)
						{
							interestAnomaly.push({
								noteId: noteId,
								accruedInterest: accruedInterest,
								accruedInterest2: accruedInterest2,
								accruedInterestDiff: accruedInterestDiff,
							});
						}

						var newValue = null;
						if(loanStatus == 'Fully Paid')
						{
							newValue = 0;	// the price submit function interprets 0 as ignore
						}
						else
						{
							var loanIdCount;
							if(loanIdCountArray[loanId] == null)
								loanIdCount = loanIdCountArray[loanId] = 0;
							else
								loanIdCount = ++loanIdCountArray[loanId];

							newValue =
//								DEBUGcall(adjustAskingPriceAutoFunc,
								adjustAskingPriceAutoFunc(
									index, loanId, loanIdCount,
									interestRate, principalPlus, loanStatus, outstandingPrincipal,
									accruedInterest, accruedInterestInMonths,
									headerLimits.foliofnMarkupHighLimit, headerLimits.foliofnMarkupLowLimit,
									!!loan.bankruptDeceased, 	// booleanify	falsey => true => false
									loan.fico, loan.fico < FICOWAYDOWN,
									!!loan.ficoDrop,	// booleanify	falsey => true => false
									loan.location ? loan.location : "",	// emptystringify
									note ? note.amountLent : null, note ? note.paymentReceived : null
								);
						}

						/* if they return a negative number, don't change the value
						 * YYY some Fully Paid notes sneaking in, however a "0" appears to just make it ignore that note
						 */
						if(newValue >= 0)
							setAskingPriceInput(askingPriceInput, newValue);
					});

					if(TESTING)
					if(interestAnomaly.length > 0)
					{
						interestAnomaly.sort(function(a, b)
						{
							return a.accruedInterestDiff - b.accruedInterestDiff;
						});

						GM_log("interestAnomaly=", interestAnomaly);

						setTimeout(function()
						{
							alert(
								sprintf("%d Accrued Interest Anomalies! Max %f, Note Id %d",
									interestAnomaly.length,
									interestAnomaly[0].accruedInterestDiff,
									interestAnomaly[0].noteId));
						}, 1);
					}
				}
				catch(ex)
				{
					GM_log("adjustAskingPriceAuto() ex=" + ex + "\n" + ex.stack);
					alert("adjustAskingPriceAuto() ex=" + ex);
				}

				/* YYY we have click handler on the entire table */
	//			updateMarkupAll(notesTable0, trs);
			};

			askingPriceHeader.append(
				'<br>' +
				'<input type="button" id="adjustAskingPriceAutoButton" value="Auto" />' +
				'<input type="button" id="autoAskingPriceEditButton" value="Edit" />' +
				'<br>' +
				'<nobr>' +
				'<input type="button" id="adjustAskingPriceDownButton" value="-1%" />' +
				'<input type="button" id="adjustAskingPriceUpButton" value="+1%" />' +
				'<br>' +
				'<input type="button" id="adjustAskingPriceDown2Button" value="-.1%" />' +
				'<input type="button" id="adjustAskingPriceUp2Button" value="+.1%" />' +
				'</nobr>' +
				'');

			$("#autoAskingPriceEditButton").on('click', function(){
				autoFuncEdit('adjustAskingPriceAutoFunc', 'adjustAskingPriceAutoFuncBody', adjustAskingPriceAutoFuncProto, adjustAskingPriceAutoFuncBodyDefault, adjustAskingPriceAutoFuncBody);
			});
			$("#adjustAskingPriceAutoButton").on('click', function(){adjustAskingPriceAuto();});

			$("#adjustAskingPriceDownButton").on('click', function(){adjustAskingPrice(0.99);});
			$("#adjustAskingPriceUpButton").on('click', function(){adjustAskingPrice(1.01);});

			$("#adjustAskingPriceDown2Button").on('click', function(){adjustAskingPrice(0.999);});
			$("#adjustAskingPriceUp2Button").on('click', function(){adjustAskingPrice(1.001);});
		}
	}
	else if(href.match(/traderStatement/))	// Foliofn Statements
	{
		if($("p:contains(There was no activity during this period)").length > 0)
		{
			GM_log("no activity");
			return;
		}

		waitForElement(".yui-pg-rpp-options", null,
			function(selects)
			{
				setSelectValue(selects, '10000'); // this is the value for "All"

		waitForElement("div#lender-activity-div table", "tbody.yui-dt-data",
			function waitForElement_callback(table, tbody)
			{
			var DEBUG = debug(false, arguments);

				tableCanChange(table, "tbody.yui-dt-data", function tableCanChange_callback(table, tbody)
				{
				var DEBUG = debug(false, arguments);

	/* e.g.
	<td id="yui-gen633" class="descriptions"> Sell Note:6531226 </td>
	*/
					tbody.find("td.descriptions:contains(Buy Note:)").each(function tbody_find()
					{
					var DEBUG = debug(false, arguments);

						var element = $(this);
						DEBUG && GM_log("element=", element);

						var html = element.html();
						DEBUG && GM_log("html=" + html);

						var noteId = html.match(/Note:\s*(\d+)/)[1];
						DEBUG && GM_log("noteId=" + noteId);

						var note = getStoredNote(noteId);
						DEBUG && GM_log("note=", note);

						if(note == null)
							return;
						
						var url = loanPerfURL(note);
						html = html.replace(/(Note:\s*)(\d+)/, "$1<a href='" + url + "'>$2</a>");
						DEBUG && GM_log("AFTER html=", html);
						
						element.html(html);
					});
				});
			});
			});
	}
	else if(href.match(/yrEndTraderStatement.action/))
	{
	var DEBUG = debug(false, arguments);

		var table = $("table#lender-activity");
		var ths = table.find("thead th");

		/* NOTE: no footers on this table */
		var noteIdCol = ths.filter(":contains('Note Id')").index();

		var purchasePriceCol = ths.filter(":contains('Purchase Price')").index();
		var parValueAtPurchaseCol = ths.filter(":contains('Par Value at Purchase')").index();	// Principal + Accrued Interest

		var salePriceCol = ths.filter(":contains('Sale Price')").index();
		var parValueAtSaleCol = ths.filter(":contains('Par Value at Sale')").index();	// Principal + Accrued Interest
		var feeCol = ths.filter(":contains('Fee')").index();

		var trs = table.find("tbody tr");

		table.tablesorter({
	//		sortList: [[1,0], [0,0]],	// default sort
		});

		var totalGainTotal = 0, totalFeeTotal = 0;
		trs.each(function()
		{
			var tds = $("td", this);

			/* purchase price */
			var purchasePriceCell = tds.eq(purchasePriceCol);
			var parValueAtPurchaseCell = tds.eq(parValueAtPurchaseCol);

			var purchasePrice = text2Value(purchasePriceCell.text());
			var parValueAtPurchase = text2Value(parValueAtPurchaseCell.text());

			var purchaseGain = parValueAtPurchase - purchasePrice;
			
			if(GAINLOSS) purchasePriceCell.append(sprintf("%+0.2f", purchaseGain));
			var purchaseGainPercent = purchaseGain / purchasePrice;
			if(purchaseGainPercent > 0.10)
				purchasePriceCell.addClass('lcac_greenHigh');
			else if(purchaseGainPercent > 0.00)
				purchasePriceCell.addClass('lcac_greenLow');
			else if(purchaseGainPercent < -0.10)
				purchasePriceCell.addClass('lcac_redLow');
			else if(purchaseGainPercent < -0.00)
				purchasePriceCell.addClass('lcac_yellowLow');


			/* sale price */
			var salePriceCell = tds.eq(salePriceCol);
			var parValueAtSaleCell = tds.eq(parValueAtSaleCol);
			var feeCell = tds.eq(feeCol);

			var salePrice = text2Value(salePriceCell.text());
			var parValueAtSale = text2Value(parValueAtSaleCell.text());
			var saleFee = text2Value(feeCell.text());

			var saleGain0 = salePrice - parValueAtSale;
			var saleGain = salePrice - parValueAtSale - saleFee;
			
	//		if(GAINLOSS) salePriceCell.append(sprintf("%+0.2f%+0.2f", saleGain0, -saleFee));
			if(GAINLOSS) salePriceCell.append(sprintf("%+0.2f", saleGain));
			var saleGainPercent = saleGain / parValueAtSale;
			if(saleGainPercent > 0.10)
				salePriceCell.addClass('lcac_greenHigh');
			else if(saleGainPercent > 0.00)
				salePriceCell.addClass('lcac_greenLow');
			else if(saleGainPercent < -0.10)
				salePriceCell.addClass('lcac_redLow');
			else if(saleGainPercent < -0.00)
				salePriceCell.addClass('lcac_yellowLow');
			
			var noteIdCell = tds.eq(noteIdCol);
			var noteId = noteIdCell.text();
			
			/* add a link to the note, if we have the data in storedData */
			var note = getStoredNote(noteId);
			if(note)
			{
				var url = loanPerfURL(note);
				DEBUG && GM_log("url=", url);

				if(PRICESINURL)
					url += sprintf("&sale_price=%0.2f&par_value_at_sale=%0.2f&fee_at_sale=%0.2f", salePrice, parValueAtSale, saleFee);

				noteIdCell.wrapInner(sprintf("<a href='%s' />", url));
			}

			/* total */
			var totalGain = purchaseGain + saleGain /*- saleFee*/;	// saleGain already discounted for fee
			totalGain = round2Decimals(totalGain);

			totalGainTotal += totalGain;
			totalFeeTotal += saleFee;

			if(GAINLOSS) noteIdCell.append(sprintf("%+0.2f", totalGain));
			if(totalGain >= 1)
				noteIdCell.addClass('lcac_greenHigh');
			else if(totalGain >= 0.01)
				noteIdCell.addClass('lcac_greenLow');
			else if(totalGain <= -1)
				noteIdCell.addClass('lcac_redHigh');
			else if(totalGain <= -0.01)
				noteIdCell.addClass('lcac_redLow');
		});

		var totalDiv =
				sprintf("<div class='lcac_summary'>(%d entries, %s total gain, %s total fee)</div>",
					trs.length,
					negative2negative("$%0.2f", totalGainTotal),
					negative2negative("$%0.2f", totalFeeTotal)
				);

		$("div#lender-activity-div")
			.before(totalDiv)
			.after(totalDiv);

	//	findHeadersCheckCells(table, null, false, {addCommentColumn:true});
	}
	else if(href.match(/lenderActivity.action/)	// LC Account Activity date entry form
		|| href.match(/getLenderActivity.action/))	// LC Account Activity page with data
	{
		var target = $("a.notesDownloadLink:last");
		GM_log("target=", target);
		
		target.after("<button id='downloadActivity' style='clear:both; float:right'>Download 6 months*</button>");

		var button = $("button#downloadActivity");
		GM_log("button=", button);

		button
			.on("click", function(e)
			{
				e.preventDefault();

				button
					.text("Downloading...")
					.prop('disabled', true);

				getLenderActivityMulti(function getLenderActivityMulti_callback()
				{
					GM_log("getLenderActivityMulti_callback()");
					button
						.text("Download 6 months*")
						.prop('disabled', false);
				});
			});
	}
	else if(href.match(/orderDetails.action/))	// scrape the Order Details
	{
		// e.g. /account/loanPerf.action?loan_id=1532036&order_id=3335086&note_id=13739444

		scanForLoanPerfLinks($("body"));
	}
	else if(href.match(/paymentPlan.action/))
	{
		/* XXX should we do something here? */
	}
//	else if(href.match(/lenderAccountDetail.action/))
//	{
//		/* for testing parse_lenderAccountDetail() */
//		parse_lenderAccountDetail($("body").html());
//	}
	else
	{
		if(DEBUG)
			alert("no match, href=" + href);
	}
		
	function scanOrders(button, callbackDone)
	{
		var scanOrdersWindow = window.open(null, '_scanOrders');
		if(scanOrdersWindow == null)
		{
			alert("Could not open a window. Are popups blocked?");
			return;
		}

		scanOrdersWindow.document.write(
			"<head><title>Scan Orders</title></head>" +
			"<body><pre id='ScanOrders'>Scan Orders");

		$.get("/account/orders.action", function(html)
		{
			var tds = $(html).find("table#orders tbody tr").find("a[href*='orderDetails.action'], td:nth-child(12)");

			var orders = [];
			var noteCountTotal = 0;
			for(var index = 0; index < tds.length; )
			{
				var href = tds.eq(index++).prop('href');
				var noteCount = parseFloat(tds.eq(index++).text());

				if(noteCount == 0)	// skip orders with no active notes
					continue;
				
				noteCountTotal += noteCount;
				
				orders.push(href);
			}

			scanOrdersWindow.document.write(
				sprintf("<br>%d orders, %d notes", orders.length, noteCountTotal));

			var count = 0;
			var continueConfirmed = null;
			function scanOrders_doit()
			{
				if(orders.length == 0)
				{
					scanOrdersWindow.document.write("<br>Done");
					scanOrdersWindow.document.close();

					callbackDone(true);
					return;
				}
				
				if(scanOrdersWindow.closed && continueConfirmed === null)
				{
					var ok = confirm("Scan Orders Window closed. OK to keep scanning, Cancel to quit.");
					if(ok)
						continueConfirmed = true;
					else
					{
						continueConfirmed = false;

						scanOrdersWindow.document.write("<br>Canceled");
						scanOrdersWindow.document.close();

						callbackDone(false);
						return;
					}
				}

				if(button.hasClass('lcac_cancel'))
				{
					scanOrdersWindow.document.write("<br>Canceled");
					scanOrdersWindow.document.close();

					callbackDone(false);
					return;
				}
				
				var href = orders.shift();
				GM_log("href=", href);

				if(count == 0 || ++count > 5)
				{
					count = 1;
					scanOrdersWindow.document.write("<br>");
				}
				else
					scanOrdersWindow.document.write(", ");

				var orderId = href.match(/order_id=(\d+)/)[1];
				scanOrdersWindow.document.write(
					sprintf("<a href='%s'>%s</a>...", href, orderId));

				$.get(href, function(html)
				{
					var notes = scanForLoanPerfLinks($(html));
					
					scanOrdersWindow.document.write(
						sprintf("%2d notes", notes.length));

					var delay = 1000 + Math.random() * 200;
					setTimeout(scanOrders_doit, delay);	// loop
				})
				.fail(function(jqXHR, textStatus, errorThrown)
				{
					GM_log("scanOrders_doit() textStatus=", textStatus, " errorThrown=", errorThrown, " url=", url);
					alert("scanOrders_doit() textStatus=" + textStatus + " errorThrown=" + errorThrown + " url=" + url);
					scanOrdersWindow.document.write(
						"<br>Error textStatus=" + textStatus + " errorThrown=" + errorThrown + " url=" + url);
				});
			};

			scanOrders_doit();	// kick off the loop
		})
		.fail(function(jqXHR, textStatus, errorThrown)
		{
			GM_log("scanOrders() textStatus=", textStatus, " errorThrown=", errorThrown, " url=", url);
			alert("scanOrders() textStatus=" + textStatus + " errorThrown=" + errorThrown + " url=" + url);
			scanOrdersWindow.document.write(
				"<br>Error textStatus=" + textStatus + " errorThrown=" + errorThrown + " url=" + url);
		});
	}
					
	var notesToScan = [];
	var notesToScanNoLocation = [];

	function scanLoans(scanLoansButton, callbackDone)
	{
	var DEBUG = debug(true, arguments), FUNCNAME = funcname(arguments);

		var scanLoansDiv = scanLoans.scanLoansDiv;
		var scanLoansPreWrapper = scanLoans.scanLoansPreWrapper;	// for scrolling
		var scanLoansPre = scanLoans.scanLoansPre;
		var scrollLockToBottom = null;
		if(!scanLoansDiv)
		{
			
//			scanLoansWindow.document.write(
//				"<head><title>Scan Loans</title></head>"
//				+ ""
//				+ "<body>"
//				+ "<div style='position: fixed; top:0px; right:0px; margin:5px 5px 5px 5px; padding:5px 5px 5px 5px; border:1px solid #2266AA; z-index:99'>"
//				+ "<label>"
//				+ "<input type='checkbox' class='scrollLockToBottom' checked='checked' />"
//				+ "Scroll Lock to Bottom"
//				+ "</label>"
//				+ "</div>"
//				+ "<pre class='scanLoansWindowPre' style='tab-size:15; -moz-tab-size:15; -o-tab-size:15;'></pre>"
//				);

			scanLoansDiv = scanLoans.scanLoansDiv = $(
				"<div class='scanloansdiv' style='position:fixed; background:#FFFFFF; bottom:5px; left:5px; z-index:99;' >" +
				"<fieldset style='margin:0px 5px 5px 5px; padding:0px 5px 5px 5px; border:1px solid #2266AA; height:98%;'>" +
				"<legend>LCAC Scan Portfolio</legend>" +
				"<div class='scanloansprewrapper' style='height:95%; overflow-y:scroll; overflow-x:auto; width:70em; height:15em;'>" +
				"<pre class='scanloanspre' style='tab-size:17; -moz-tab-size:17; -o-tab-size:17;'></pre>" +
				"</div>" +
				"</fieldset>" +
				"</div>" +
				"");
			
			$(".master_content-outer-container").before(scanLoansDiv);	// add it to the DOM

			scanLoansPre = scanLoans.scanLoansPre = $(".scanloanspre", scanLoansDiv);
			scanLoansPreWrapper = scanLoans.scanLoansPreWrapper = $(".scanloansprewrapper", scanLoansDiv);

			scanLoansPreWrapper.bind("fourclick", function scanLoansPreWrapper_fourclick() {
				GM_log("scanLoansDiv_fourclick()");

				/* select everything in div
				 * from http://stackoverflow.com/questions/985272/jquery-selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
				 */
				var selection = window.getSelection();
				var range = document.createRange();

				range.selectNodeContents(scanLoansPreWrapper[0]);
				selection.removeAllRanges();
				selection.addRange(range);
			});

//			$(".scrollLockToBottom", scanLoansDiv.document)
//				.each(function scrollLockToBottom_each()	// initialize the variable to match the checkbox
//				{
//					scrollLockToBottom = $(this).is(":checked");
//					GM_log("scrollLockToBottom_each() scrollLockToBottom=" + scrollLockToBottom);
//				})
//				.change(function scrollLockToBottom_change(event)	// listen for changes
//				{
//					scrollLockToBottom = $(this).is(":checked");
//					GM_log("scrollLockToBottom_change() scrollLockToBottom=" + scrollLockToBottom);
//				});
		}

		scanLoans_doit.startnewline = true;
		scanLoans_doit.continueConfirmed = null;

		function scanLoans_done(success)
		{
			saveStoredData();
			callbackDone(success);
		}

		function scanLoans_doit(notesToScan, notesToScanNoLocation)
		{
		var DEBUG = debug(true, arguments);

			function continueline(html)
			{
				scanLoansPre.find("span:last").append(html);
			}
			function newline(html)
			{
				scanLoansPre.append("<div>" + html + "</div>");

//				if(scrollLockToBottom)
				{
//					GM_log("calling scrollTop(" + scanLoansPreWrapper[0].scrollHeight + ")");
					scanLoansPreWrapper.scrollTop(scanLoansPreWrapper[0].scrollHeight);
				}
			}
			
			var breakloop = false;
			var loopafterresponse = false;
			function scanLoans_doloop()
			{
			var DEBUG = debug(true, arguments);

				function loopWithTimeout()
				{
				var DEBUG = debug(true, arguments);

					if(scanDelayBackoff > scanDelay) scanDelayBackoff -= 50;	// go a little faster
					if(scanDelayBackoff < scanDelay) scanDelayBackoff = scanDelay;
					var delay = scanDelayBackoff + Math.random() * (loopafterresponse ? 1000 : 500);
					GM_log("scanDelay=" + scanDelay + " scanDelayBackoff=" + scanDelayBackoff + " delay=" + delay);

					DEBUG && GM_log("calling setTimeout(scanLoans_doloop, " + delay + ")");
					setTimeout(scanLoans_doloop, delay);
				}
						
				if(notesToScan.length == 0 && notesToScanNoLocation.length == 0)
				{
					newline("Done<br>");

					scanLoans_done(true);
					return;	// no loop
				}

//				if(scanLoansDiv.closed && scanLoans_doit.continueConfirmed === null)
//				{
//					var ok = confirm("Scan Loans Window closed. Keep scanning?");
//					if(ok)
//						scanLoans_doit.continueConfirmed = true;
//					else
//					{
//						scanLoans_doit.continueConfirmed = false;
//
//						newline("Canceled<br>");
//
//						scanLoans_done(false);
//						return;	// no loop
//					}
//				}

				if(scanLoansButton.hasClass('lcac_cancel'))
				{
					newline("Stopped<br>");

					scanLoans_done(false);
					return;	// no loop
				}
				
				if(breakloop)
					return;
				
				//assert(notesToScanNoLocation.length > 0 || notesToScan.length > 0)
						
				if(notesToScan.length > 0)
				{
					var note = notesToScan.shift();
					var loanId = note.loanId;
					
					var url = loanPerfURL(note, true/*useFoliofnLink*/) + tsParam();
					DEBUG && GM_log("scanLoans_doloop() url=" + url + "...");
					$.get(url, function(responseText)
					{
						DEBUG && GM_log("scanLoans_doloop() url=" + url + "...done");

						if(responseText.match(/Member Sign-In/))		// we've been logged out
						{
							newline('Not logged in<br>');
							alert("Not logged in");
							breakloop = true;
							return;
						}
						
						if(responseText.match(/Temporarily Unavailable/))		// we've been logged out
						{
							newline(
								sprintf("%s\t<a href='%s'>%s</a>\t%s",
									loanId,
									url, note.noteId,
									"Temporarily Unavailable"));

							//push it back on the stack
							notesToScan.push(note);

							return;
						}


						var vars = {};
						var ficoTrend =
							scanLoanPerf(loanId, $(responseText), vars
								, true/*dosaveStoredData*/);	// XXX save it every 5 or 10 notes

						var msgArray = [];

						if(ficoTrend.finalValue != vars.recentCreditScore)
						{
							msgArray.push("FICO MISMATCH ficoTrend.finalValue=" + ficoTrend.finalValue + " vars.recentCreditScore=" + vars.recentCreditScore);
						}

						if(vars.chargedOffDefault)
						{
							if(vars.chargedOffDefault)
								msgArray.push(vars.chargedOffDefault.toUpperCase());
							else	
								msgArray.push('');
							
							if(vars.recoveries)
								msgArray.push("Recoveries " + vars.recoveries);
							else	
								msgArray.push('');
								
							if(vars.lateFees)
								msgArray.push("Late Fees " + vars.lateFees);
							else	
								msgArray.push('');
								
							msgArray.push('');
						}
						else
						{
							if(vars.bankruptDeceased)	// also contains lawsuit,bankruptacy,etc. see scanLoanPref()
								msgArray.push(vars.bankruptDeceased);
							else	
								msgArray.push('');

							if(vars.inProcessing)
								msgArray.push("Processing, Due Date: " + vars.inProcessing);
							else	
								msgArray.push('');

							if(vars.paymentPlan)
								msgArray.push("Payment Plan");
							else	
								msgArray.push('');
						}

						if(true || msgArray.length > 0)	//ewl 2014-03-12 always newline, for FICO
						{
							var msg = msgArray.join("\t");

							newline(
								sprintf("%s\t<a href='%s'>%s</a>\t%s\tFICO %s%s\t%s",
									loanId,
									url, note.noteId,
									msg,
									ficoTrend.finalValue != null ? ficoTrend.finalValue : '',
									vars.ficodrop ? ' drop' : '',
									ficoTrend.vals));
							scanLoans_doit.startnewline = true;
						}
						else if(scanLoans_doit.startnewline)
						{
							newline(sprintf("<a href='%s'>.</a>", url));
							scanLoans_doit.startnewline = false;
						}
						else
							continueline(sprintf("<a href='%s'>.</a>", url));

						first = false;
					})
					.always(function()
					{
						if(loopafterresponse) loopWithTimeout();
					})
					.fail(function(jqXHR, textStatus, errorThrown)
					{
						GM_log("scanLoans_doloop_fail() textStatus=", textStatus, " errorThrown=", errorThrown, " url=", url);
						scanDelayBackoff += 500;	// backoff XXX do this better

						newline(sprintf("<a href='%s'>Error</a>, backing off %0.2f", url, scanDelayBackoff / 1000));

						//push it back on the stack
						notesToScan.push(note);
					});
				}
				else if(notesToScanNoLocation.length > 0)
				{
					var note = notesToScanNoLocation.shift();
					var loanId = note.loanId;
					
					var url = loanDetailURL(loanId) + tsParam();
					DEBUG && GM_log("scanLoans_doloop() url=" + url + "...");
					$.get(url, function(responseText)
					{
						DEBUG && GM_log("scanLoans_doloop() url=" + url + "...done");

						if(responseText.match(/Member Sign-In/))		// we've been logged out
						{
							newline('Not logged in<br>');
							alert("Not logged in");
							breakloop = true;
							return;
						}
						
						if(responseText.match(/Temporarily Unavailable/))		// we've been logged out
						{
							newline(
								sprintf("Loan <a href='%s'>%s</a>, Note <a href='%s'>%s</a>\t%s",
									url, loanId,
									loanPerfURL(note), note.noteId,
									"Temporarily Unavailable"));

							//push it back on the stack
							notesToScanNoLocation.push(note);

							return;
						}

						var retvals = scanLoanDetail(loanId, responseText);

						newline(
							sprintf("Loan <a href='%s'>%s</a>, Note <a href='%s'>%s</a>\t%s",
								url, loanId,
								loanPerfURL(note), note.noteId,
								retvals.location));
					})
					.always(function()
					{
						if(loopafterresponse) loopWithTimeout();
					})
					.fail(function(jqXHR, textStatus, errorThrown)
					{
						GM_log("notesToScanNoLocation_fail() textStatus=", textStatus, " errorThrown=", errorThrown, " url=", url);
						scanDelayBackoff += 500;	// backoff XXX do this better

						newline(sprintf("<a href='%s'>Error</a>, backing off %0.2f", url, scanDelayBackoff / 1000));

						//push it back on the stack
						notesToScanNoLocation.push(note);
					});
				}
				
				if(!loopafterresponse) loopWithTimeout();
			}

			scanLoans_doloop(); // start the loop
		}

		/*YYY add this to prepare for pause/resume behavior */
		if(notesToScan.length > 0 || notesToScanNoLocation.length > 0)
			scanLoans_doit(notesToScan, notesToScanNoLocation);
		else
			getAccountNotesRawData(	// fill up the notesToScan lists
				function(notes0)	// callback
				{
					/* error */
					if(notes0 == null)
						return;

					var loanIdLookup = Array();

					loadStoredData();	// only do this at the begining of the loop
					
					/* prune the notes we don't need to scan */
					$.each(notes0, function(index, note)
					{
						var loanId = note.loanId;
						if(loanIdLookup[loanId])	// already saw it
							return;
						loanIdLookup[loanId] = true;

						var status = note.status;
						if(status.match(/In\s*Funding|In\s*Review|Fully\s*Paid/))
							return;
						
						notesToScan.push(note);

						/* this data doesn't change so just load the ones we don't already have */
						var loan = getStoredLoan(loanId);
						if(!loan || !loan.location)
							notesToScanNoLocation.push(note);
					});

//					notesToScan.sort(function(a, b) {return a.nextPaymentDate - b.nextPaymentDate});
					notesToScan.sort(function(a, b) {return b.nextPaymentDate - a.nextPaymentDate});	// reverse

					scanLoans_doit(notesToScan, notesToScanNoLocation);
				});

	}
}

/* from http://stackoverflow.com/questions/2536379/difference-in-months-between-two-dates-in-javascript */
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}


function doitReadyTryCatch()
{
	var DEBUG = debug(true, arguments);

	try
	{
		doitReady();
	}
	catch(ex)
	{
		GM_log("doitReadyTryCatch() ex=" + ex + "\n" + ex.message + "\nex.stack=" + ex.stack + "--EOF--");
	}
}
			
$(document).ready(doitReadyTryCatch);
