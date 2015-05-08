// ==UserScript==
// @name       moneyFormatterOverride
// @namespace  http://use.i.E.your.homepage/
// @version    0.1
// @description  enter something useful
// @match      https://www.lendingclub.com/account/loanPerf.action*
// @copyright  2012+, You

// @run-at         document-start

// ==/UserScript==

var GM_log;
if(unsafeWindow.console) {
    GM_log = function()
    {
        unsafeWindow.console.log.apply(unsafeWindow.console, arguments);	//YYY using "this" was causing problems in chrome
    };
}
else
    GM_log = function(){};


GM_log("moneyFormatterOverride");

var count = 0;
function check()
{
    if(count++ > 10)
    {
        GM_log("moneyFormatter timeout count=" + count);
        return;
    }

    if(!unsafeWindow.moneyFormatter)
    {
        setTimeout(check, 100);
        return;
    }

    GM_log("moneyFormatter FOUND count=" + count);
    GM_log("typeof unsafeWindow.moneyFormatter=" + typeof unsafeWindow.moneyFormatter);
    GM_log("typeof unsafeWindow.moneyFormatterYUI=" + typeof unsafeWindow.moneyFormatterYUI);

    override();
    override2();
}

check();

function override()
{
    var moneyFormatter_ORIG = unsafeWindow.moneyFormatter;
    unsafeWindow.moneyFormatter = function()
    {
        GM_log("moneyFormatter() arguments=", arguments);
        var retval = moneyFormatter_ORIG.apply(this, arguments);
        GM_log("moneyFormatter() retval=", retval);
    }

    var moneyFormatterYUI_ORIG = unsafeWindow.moneyFormatterYUI;
    unsafeWindow.moneyFormatterYUI = function()
    {
        GM_log("moneyFormatterYUI() arguments=", arguments);
        var retval = moneyFormatterYUI_ORIG.apply(this, arguments);
        GM_log("moneyFormatterYUI() retval=", retval);
    }
}

function override2()
{
    unsafeWindow.moneyFormatterYUI = function moneyFormatterYUIOverride(el,oRecord,oColumn,oData)
    {
        GM_log("moneyFormatterYUIOverride() arguments=", arguments);

        if(oData==undefined||oData=="")
        {
            el.innerHTML="&nbsp;"; return
        }
        if(oData=="--")
        {
            el.innerHTML=oData; return
        }
        var bigNumberStr=oData.toString(); 
        GM_log("bigNumberStr=", bigNumberStr);
        var fraction=bigNumberStr.split(".")[1];
        if(fraction != undefined 
           && fraction.length > 2 
           && !(fraction.substring(2).match(/[1-9]/g) == null))
        {
            GM_log("HERE 1");
            var bigNumber=new Big(bigNumberStr); 
            GM_log("HERE 1 typeof bigNumber=", typeof bigNumber, " bigNumber=", bigNumber);
            var bigNumberStrForTooltip=numeral(bigNumber).format("$0,0.0000000000");
            GM_log("HERE 1 bigNumberStrForTooltip=", bigNumberStrForTooltip);
            el.title=bigNumberStrForTooltip;
            bigNumber=bigNumber.round(3,2);    //[rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP) https://github.com/MikeMcl/big.js/blob/master/big.js
            GM_log("HERE 1 bigNumber=", bigNumber);
            bigNumberStr=bigNumber.toString();
            bigNumberStr=numeral(bigNumberStr).format("$0,0.000");
            el.innerHTML='<span style="border-bottom:dotted 1px;">'+bigNumberStr+"</span>"
        }
        else
        {
            GM_log("HERE 2");
            GM_log("HERE 2 bigNumberStr=", bigNumberStr);
            bigNumberStr=numeral(bigNumberStr).format("$0,0.00");
            el.innerHTML=bigNumberStr; 
            var bigNumberStrForTooltip=numeral(bigNumberStr).format("$0,0.0000000000");
            el.title=bigNumberStrForTooltip
        }

    }


}
