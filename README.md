Note: I mostly use Chrome now. Let me know if something isn't working, especially if you're using Firefox.

Step 1. Install Greasemonkey (for Firefox) https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/ or Tampermonkey (for Chrome) https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

Step 2. Follow this installation Link: https://github.com/ghubcompressedtime/LCAC/raw/master/LCAC.user.js

From the Lenders perspective, LendingClub's website is pretty basic. This script adds some features which I think makes it a lot easier to use.

Features:

Add comments to loans. (Comments are stored locally on the users' computer and ARE NOT SHARED, even for the same user on different computers. Comments can be exported / imported with relative ease, for backing up or transferring to another computer or browser.)

Add a missing Loan id (or Note id) in various places.

Add missing Interest Rate to some tables.

Highlights certain keywords on Loan Performance page. Highlights over- and under-payments. Also adds a FICO change chart -- no more having to click a second time to see that graph.

Add links to notes (or loans) in various places, like Account Activity or Foliofn Year-end Summary.

Additionally, for Foliofn users:

Lots of highlighting on the My Account Open Sell Orders page. Add buttons to make it easier to select which notes you want to reprice or cancel.

Also, adds an Auto Price feature with a user-editable pricing function for selling or repricing notes. It can be as simple or as complex as you want (using Javascript, see below). Displays a markup and recalculates it as you change the price.

Lots of highlighting and data filtering for Browse Notes. Makes it easier to find the hidden gems.

I mostly use this on Chrome under Windows now, but it should work on Chrome and Firefox for any platform.

If you've got a bug (or feature request), please let me know.

==Auto-pricing function== 
The auto-pricing function is Javascript and takes the following arguments:

function(row, loanId, count, interestRate, principalPlus, loanStatus, outstandingPrincipal, accruedInterest, accruedInterestInMonths, foliofnMarkupHighLimit, foliofnMarkupLowLimit, tooMuchInterestThisYear, tooMuchInterestPer12Months)

The default body is simply:

return principalPlus * (interestRate > 0.10 ? 1.02 : 1.015); /* if the interest rate is more than 10% mark it up 2% otherwise mark it up 1.5% */

Happy Lending!


