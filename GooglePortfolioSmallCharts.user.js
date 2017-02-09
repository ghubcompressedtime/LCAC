// ==UserScript==
// @name	GooglePortfolioSmallCharts
// @namespace  http://use.i.E.your.homepage/
// @version	0.6
// @description adds small charts to Google Finance portfolio view
// @match	 https://www.google.com/finance/portfolio?action=view*
// @grant	  GM_addStyle
// @grant	 GM_log
// @copyright  2014, Emery Lapinski
// @require	http://code.jquery.com/jquery-1.9.1.js
// ==/UserScript==

var DEBUG = true;

if(!GM_log)
	GM_log = console.log.bind(console);

GM_log("GooglePortfolioSmallCharts");

if(DEBUG) 
	unsafeWindow.jQ = jQuery; // export for development and debugging

jQ = jQuery;

function doit()
{
	GM_addStyle("img.gpsmallcharts { vertical-align:middle;/*makes the TEXT vertical aligned???*/; max-height:95px; }");

	
	var div, divPct, autoupdateInput, autoupdateLabel;
	if(false)
	{
		
		div = $("<div style='z-index: 999; position: fixed; top:10px; right:10px; font-size: x-large'><span id=divPct></span><label id=GPSCautoupdateLabel><input type=checkbox id=GPSCautoupdate>autoupdate</label></div>");

		$("body").append(div);
	}
	else
	{
		div = $("<div style='text-align: center; font-size: x-large'><span id=divPct></span><label id=GPSCautoupdateLabel><input type=checkbox id=GPSCautoupdate>autoupdate</label></div>");

		$("div.appbar-snippet-primary").after(div);
	}

	GM_log("div=", div);
		
	divPct = div.find("#divPct");
	GM_log("divPct.length=", divPct.length, " divPct=", divPct);

	autoupdateInput = div.find("#GPSCautoupdate");
	GM_log("autoupdateInput.length=", autoupdateInput.length, " autoupdateInput=", autoupdateInput);

	autoupdateLabel = div.find("#GPSCautoupdateLabel");

	autoupdateInput.change(function autoupdateChecked_change()
	{
		GM_log("autoupdateChecked_change()");

		var checked = $(this).is(':checked');
		
		GM_log("checked=", checked);

		if(!checked)
		{
			GM_log("loopUpdatePctTimeout=", loopUpdatePctTimeout);

			if(loopUpdatePctTimeout)
			{
				clearTimeout(loopUpdatePctTimeout);
				loopUpdatePctTimeout = null;
			}
		}
		else
		{
			loopUpdatePct();
		}
	});
	
	autoupdateInput
		.prop('checked', false)	// set the initial value
		.change();	// trigger the event listener
	
	function updatePctDiv(changeText)
	{
		// e.g. -1,673.32 (-0.27%)
		
		GM_log("updatePctDiv() changeText=", changeText);
		
		var changeText2 = changeText.replace(/[$,]/g, '');
			
		GM_log("changeText2=", changeText2);

		var change = parseFloat(changeText2);
		
		GM_log("change=", change);
		
		var pctText = changeText.match(/[-.0-9]+%/);
		
		GM_log("pctText=", pctText);
		
		var pct = parseFloat(pctText);
		
		GM_log("pct=", pct);

//		pct = -pct;	// for testing

		var hue, lightness;
		if(pct < 0)
		{
			// red
			hue = 0;
			lightness = 100 + Math.max(pct, -1.0) * 50;
		}
		else
		{
			// green
			hue = 120;
			lightness = 100 - Math.min(pct, 1.0) * 50;
		}

		GM_log("lightness=", lightness);

		divPct.html("<span title='" + new Date() + "'>" + changeText + "</span>");
		div.css("background-color", "hsl(" + hue + ", 100%, " + lightness + "%)");
	}
	
	var changeText = jQ("td:contains(Portfolio value:)").next().text();
	
	updatePctDiv(changeText);

	
	var href = location.href;
	
	GM_log("href=", href);
	
	if(false)
	downloadAndUpdatePct();	// for testing

	var backoffseconds = 60;
	var changeOld = null;
	
	var loopUpdatePctTimeout = null;

	function loopUpdatePct()
	{
		GM_log("loopUpdatePct()");

		downloadAndUpdatePct(
			function downloadAndUpdatePct_callback(change)
			{
				GM_log("downloadAndUpdatePct_callback() change=", change, " changeOld=", changeOld);

				if(changeOld == null || change != changeOld)
					backoffseconds = 60;
				else
					backoffseconds = Math.min(backoffseconds * 2, 60 * 60);

				changeOld = change;

				GM_log("calling setTimeout(loopUpdatePct, " + backoffseconds + " * 1000)");
				loopUpdatePctTimeout = setTimeout(loopUpdatePct, backoffseconds * 1000);
			});
	}

	function downloadAndUpdatePct(callback)
	{
		GM_log("downloadAndUpdatePct()");
        
        GM_log("href=", href);

		autoupdateLabel.contents().last().replaceWith('updating');
			   
		$.ajax({
            url: href,
            cache: false,
            data: {
				"_": $.now()
			}
			, fail: function get_fail()
			{
				autoupdateLabel.contents().last().replaceWith('autoupdate failed');
			}
			, success: function get_success(data, textStatus, jqXHR)
			{
				autoupdateLabel.contents().last().replaceWith('autoupdate');

				GM_log("get_success() arguments=", arguments);

//				GM_log("data=", data);
				
				unsafeWindow.data3 = data;	// for testing

				/* e.g.
				 * ,su:{lname:"",s:"",e:"",lp:{f:"",so:""},c:"-1,860.55",sh:"",b:{f:"$399,843.62",so:"399843.63"},mv:{f:"$659,267.49",so:"659267.5"},g:{f:"+$328,808.45",so:"328808.44"},gp:"+82.23",dg:{f:"-$1,860.55",so:"-1860.5502"},rt:"34.62",cap:{f:"",so:""},vol:{f:"",so:""},op:{f:"",so:""},hi:{f:"",so:""},lo:{f:"",so:""},avvo:{f:"",so:""},hi52:{f:"",so:""},lo52:{f:"",so:""},eps:{f:"",so:""},pe:"",beta:"",r1w:"0.03",r4w:"2.27",r3m:"14.98",rytd:"2.83",r1y:"19.23",r3y:"35.00",r5y:"34.62"
				 * ,cp:{f:"-0.28",so:"0"}
				 */

				var matches = data.match(/google.finance.data = .*,su:.*?c:"([^"]*)".*?,cp:{f:"([^"]*)"/);

				GM_log("matches=", matches);

				if(!matches && matches.length < 3)
					return;
				
				var change = matches[1];
				var changePct = matches[2];

				var changeText = change + " (" + changePct + "%)";
				
				GM_log("changeText=", changeText);

				updatePctDiv(changeText);

				if(callback)
					callback(change);
			}
		});
	}
	
	loopOn("table.gf-table tbody tr", function(trs)
		{
//		GM_log("tds.length=" + tds.length + " tds=", tds);
		
		trs.each(function(index, tr)
			 {
				tr = $(tr);	// jqueryify
				
				var tdsymbol = $(".pf-table-s", tr);
				var tdlastprice = $(".pf-table-lp", tr);
				var tdchange = $(".pf-table-cp", tr);
				
				var symbol = tdsymbol.text();
				if(!symbol)
				 	return;
			
				symbol = symbol.replace(/^\./, '^');	// yahoo uses caret instead of dot e.g. .DJI => ^DJI
				symbol = symbol.replace(/\./, '-');		// yahoo uses minus instead of dot e.g. BRK.B => BRK-B

				tdsymbol.append("&nbsp;<a href=//finance.yahoo.com/q?s=" + symbol + ">(yahoo)</a>");
				
				var imgurl = "//ichart.finance.yahoo.com/c/bb/m/" + symbol;
				tdlastprice.prepend("<img class='gpsmallcharts' src='" + imgurl + "'>");
				
				var imgurl2 = "//ichart.yahoo.com/t?s=" + symbol;
				tdchange.append("<img class='gpsmallcharts' src='" + imgurl2 + "' >");
			 });
		});
}

function loopOn(selector, callback)
{
	var elements = $(selector).not(".GooglePortfolioSmallCharts");
	
	if(elements.length > 0)
	{
		elements.addClass("GooglePortfolioSmallCharts");
		callback(elements);
	}
	
	setTimeout(function()
	{
	   loopOn(selector, callback);
	}, 1000);
}

$(document).ready(doit);


