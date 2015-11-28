// ==UserScript==
// @name         MonthlyIncomeAddYearly
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  
// @author       
// @match        https://www.lendingclub.com/account/loanDetail.action?loan_id=*
// @require      https://code.jquery.com/jquery-2.1.4.js
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

GM_log = console.log.bind(console);

// per http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


var el = $("th:contains(Gross Income)");
el = el.parent().find("td");
el.css('white-space', 'nowrap');

var text = el.text();
text = text.replace(/[^0-9.]/g, '');

var monthly = parseFloat(text);

var yearly = monthly * 12;

el.append(" ($" + numberWithCommas(yearly) + " / yearly)");

