
var HangarXPLOR = HangarXPLOR || {};

HangarXPLOR.$list = null;                            // Element where we display the pledges
HangarXPLOR._inventory = [];                         // Inventory containing all pledges
HangarXPLOR._debugRoot = $('#HangarXPLOR-js-1').attr('src').replace(/(.*)web_resources.*/, "$1");

//
// To debug settings:
//  1. Visit chrome://sync-internals/
//  2. Click Sync Node Browser tab and wait for it to load (may give a blank screen or in progress cursor)
//  3. Click expansion triangle in the sidebar for Extension settings
//  4. Click on individual settings in the sidebar to see their values and other metadata
// Alternatively, try https://chrome.google.com/webstore/detail/storage-area-explorer/ocfjjjjhkpapocigimmppepjgfdecjkb
//

HangarXPLOR._shipCount     = HangarXPLOR._shipCount || 0;
HangarXPLOR._upgradeCount  = HangarXPLOR._upgradeCount || 0;
HangarXPLOR._giftableCount = HangarXPLOR._giftableCount || 0;
HangarXPLOR._packageCount  = HangarXPLOR._packageCount || 0;
HangarXPLOR._ltiCount      = HangarXPLOR._ltiCount || 0;
HangarXPLOR._cacheSalt     = HangarXPLOR._cacheSalt || btoa(Math.random());

var RSI = RSI || {};

HangarXPLOR.Initialize = function()
{
  HangarXPLOR.LoadSettings(function() {

    var pathname = window.location.pathname;
    HangarXPLOR.Log('Initialize->LoadSettings', 'pathname=', pathname);

    switch(pathname) {
      case '/account/pledges': {
        var $lists = $('.list-items');

        if ($lists.length == 1) {
          HangarXPLOR.BulkUI();
          HangarXPLOR.$list = $($lists[0]);
          HangarXPLOR.$list.addClass('js-inventory');
          $lists = undefined;
      
      HangarXPLOR.UpdateStatus(0);
      
      RSI.Api.Account.pledgeLog((payload) => {

        var today = new Date().toISOString();
        var safetySalt = '';

        // CIG Released ship naming in March 2021, which requires us to invalidate cache
        if (today.substr(0, 7) == '2021-03') safetySalt = today.substr(0, 13) + ':';

        HangarXPLOR._activeHash = safetySalt + payload.data.rendered.length + ':' + btoa(payload.data.rendered.substr(39, 20)) + ':' + HangarXPLOR._cacheSalt;
        
        HangarXPLOR.LoadCache(HangarXPLOR.LoadPage);
      });
      
        } else {
          HangarXPLOR.Log('Error locating inventory');
        }
        break;
      }
      case '/account/buy-back-pledges': {
        var $pledges = $('#billing > div > div.inner-content > section.available-pledges > ul');
        HangarXPLOR.Log('Initialize->LoadSettings', '$pledges=', $pledges);

        if ($pledges.length == 1) {
          HangarXPLOR.Log('TODO:(pv) Load buybacks...');
          //BulkUI();
          //...
          //LoadPage(1);
        } else {
          HangarXPLOR.Log('Error locating buybacks');
        }
        break;
      }
    }
  });
}

HangarXPLOR.Initialize();
