
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

HangarXPLOR.Initialize = function() {
  HangarXPLOR.LoadSettings(function() {
    var pathname = window.location.pathname;
    HangarXPLOR.Log('Initialize->LoadSettings', 'pathname=', pathname);
    switch(pathname) {
      case '/account/pledges': {
        LoadHangar();
        break;
      }
      case '/account/buy-back-pledges': {
        LoadBuybacks();
        break;
      }
    }
  });
}

function LoadHangar() {
  var $lists = $('.list-items');
  if ($lists.length != 1) {
    HangarXPLOR.Log('Error locating inventory');
    return;
  }

  HangarXPLOR.Log('Loading hangar items...');
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
}


//
// New Experimental Buy Back Pledges logic...
//

HangarXPLOR.$buybacks = null; // Element where we display the buybacks
HangarXPLOR._buybacks = []; // Inventory containing all buybacks
var RsiBuybackMaxPageSize = 100;

function LoadBuybacks() {
  var $buybacks = $('#billing > div.content > div.inner-content > section.available-pledges > ul.pledges');
  //HangarXPLOR.Log('Initialize->LoadSettings', '$buybacks=', $buybacks);
  if ($buybacks.length != 1) {
    HangarXPLOR.Log('Error locating buybacks');
    return;
  }

  HangarXPLOR.Log('Loading buyback items...');
  //HangarXPLOR.BulkUI();
  HangarXPLOR.$buybacks = $($buybacks[0]);
  HangarXPLOR.$buybacks.addClass('js-inventory');
  //HangarXPLOR.Log('Initialize->LoadSettings', 'HangarXPLOR.$buybacks=', HangarXPLOR.$buybacks);

  $buybacks == undefined;

  //HangarXPLOR.UpdateStatus(0);

  LoadBuybackPage(1);
}

function LoadBuybackPage(pageNo, pageSize) {
  pageNo = pageNo || 1;

  pageSize = pageSize || $('#billing > div.content > div.inner-content > div.pager-wrapper > div.pager > div.left > a.selectlist > span').text().match(/\d+/)[0];
  HangarXPLOR.Log('LoadBuybackPage', 'pageSize=', pageSize);

  if (pageNo == 1)
    return ProcessBuybackPage(document.body, pageNo, pageSize);

  var url = '/account/buy-back-pledges?page=' + pageNo + '&pagesize=' + pageSize;
  HangarXPLOR.Log('LoadBuybackPage Loading', url);

  var $page = $('<div>');

  $page.load(url + ' .page-wrapper', function(response, status) {
    if (status != "success") {
      HangarXPLOR.Log('Error loading page ' + pageNo + ' of your buybacks');
      return;
    }
    ProcessBuybackPage(this, pageNo, pageSize);
  });
}

function ProcessBuybackPage($page, pageNo, pageSize) {
  //HangarXPLOR.Log('ProcessBuybackPage $page=', $page);

  // TODO:(pv) Verify (sic) "empy" class in Buy Back Pledges page
  var isEmpty = $('.pledges > li > .empy-list', $page).length > 0;
  //HangarXPLOR.Log('ProcessBuybackPage isEmpty', isEmpty);

  var $buybacks = $('.pledges > li', $page);
  //HangarXPLOR.Log('ProcessBuybackPage $buybacks.length', $buybacks.length);

  if (!isEmpty) $buybacks.each(ProcessBuybackItem);
      
  var isLastPage =  $('div.content > div.inner-content > div.pager-wrapper > div.pager > div.right > a.raquo', $page).length == 0;

  if (isEmpty || isLastPage) {
    HangarXPLOR.Log('Reached the end; render items...');

    $('div.content > div.inner-content > div.pager-wrapper').remove();

    var buffer = HangarXPLOR._buybacks;

    // TODO:(pv) Filter as desired...

    HangarXPLOR.$buybacks.empty();
    HangarXPLOR.$buybacks.append(buffer);

    //HangarXPLOR.SaveCache();
    //HangarXPLOR.DrawUI();

    HangarXPLOR.$buybacks.on('click', 'li', function(e) {
      if (!e.originalEvent.isButton) {
        $('.pledge', this).removeClass('js-selected');
        this.isSelected = !this.isSelected;
        HangarXPLOR.Log("ProcessBuybackPage this.isSelected", this.isSelected);
        if (this.isSelected) $('.pledge', this).addClass('js-selected');
        
        //RefreshBulkUI();
      }
    });

  } else {
    sleep(1000).then(() => {
      LoadBuybackPage(pageNo + 1, pageSize);
    });
  }
}

function ProcessBuybackItem() {
  HangarXPLOR.Log('ProcessBuybackItem', this);

  //...

  HangarXPLOR._buybacks.push(this);
}

function sleep(milliSeconds) {
  return new Promise(resolve => setTimeout(resolve, milliSeconds));
}

HangarXPLOR.Initialize();
