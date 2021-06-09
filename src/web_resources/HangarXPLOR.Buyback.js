var HangarXPLOR = HangarXPLOR || {};

HangarXPLOR.$buybacks = null; // Element where we display the buybacks
HangarXPLOR._buybacks = []; // Inventory containing all buybacks
var RsiBuybackMaxPageSize = 100;

HangarXPLOR.LoadBuybacks = function() {
  var $buybacks = $('#billing > div.content > div.inner-content > section.available-pledges > ul.pledges');
  //HangarXPLOR.Log('Initialize->LoadSettings', '$buybacks=', $buybacks);
  if ($buybacks.length != 1) {
    HangarXPLOR.Log('Error locating buybacks');
    return;
  }

  HangarXPLOR.Log('Loading buyback items...');
  BuybackBulkUI();
  HangarXPLOR.$buybacks = $($buybacks[0]);
  HangarXPLOR.$buybacks.addClass('js-inventory');
  //HangarXPLOR.Log('Initialize->LoadSettings', 'HangarXPLOR.$buybacks=', HangarXPLOR.$buybacks);

  $buybacks == undefined;

  HangarXPLOR.UpdateStatus(0);

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

  // TODO:(pv) Verify "empy" (sic) class in Buy Back Pledges page
  var isEmpty = $('.pledges > li > .empy-list', $page).length > 0;
  //HangarXPLOR.Log('ProcessBuybackPage isEmpty', isEmpty);

  var $buybacks = $('.pledges > li', $page);
  //HangarXPLOR.Log('ProcessBuybackPage $buybacks.length', $buybacks.length);

  if (!isEmpty) $buybacks.each(ProcessBuybackItem);
      
  var isLastPage =  $('div.content > div.inner-content > div.pager-wrapper > div.pager > div.right > a.raquo', $page).length == 0;

  if (isEmpty || isLastPage) {
    HangarXPLOR.Log('Reached the end; render items...');

    $('div.content > div.inner-content > div.pager-wrapper').remove();
    HangarXPLOR.$bulkUI.$inner.removeClass('loading');
    //HangarXPLOR.$bulkUI.remove();

    var buffer = HangarXPLOR._buybacks;

    // TODO:(pv) Filter as desired...

    HangarXPLOR.$buybacks.empty();
    HangarXPLOR.$buybacks.append(buffer);

    //HangarXPLOR.SaveCache();
    BuybackDrawUI();

    HangarXPLOR.$buybacks.on('click', 'li', function(e) {
      if (!e.originalEvent.isButton) {
        $('.pledge', this).removeClass('js-selected');
        this.isSelected = !this.isSelected;
        HangarXPLOR.Log("ProcessBuybackPage this.isSelected", this.isSelected);
        if (this.isSelected) $('.pledge', this).addClass('js-selected');
        HangarXPLOR.RefreshBulkUI();
      }
    });

  } else {
    sleep(1000).then(() => {
      LoadBuybackPage(pageNo + 1, pageSize);
    });
  }
}

function ProcessBuybackItem() {
  //HangarXPLOR.Log('ProcessBuybackItem', this);

  //...

  HangarXPLOR._buybacks.push(this);
}

function sleep(milliSeconds) {
  return new Promise(resolve => setTimeout(resolve, milliSeconds));
}

function BuybackBulkUI() {
  var bulkHeight = $('.js-bulk-ui').height();
  var $innerContent = $('#billing > div > div.inner-content');
  var maxOffset = document.body.scrollHeight - ($innerContent.height() + $innerContent.offset().top - 150);
  var $sideNav = $('#billing > div > div.sidenav');
  //HangarXPLOR.Log(`BulkUI $sideNav=`, $sideNav);
  var minOffset = $sideNav.offset().top + $sideNav.height();
  //HangarXPLOR.Log(`BulkUI maxOffset=${maxOffset}, minOffset=${minOffset}`);

  var positionUI = function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollTop > document.body.scrollHeight - maxOffset - bulkHeight) HangarXPLOR.$bulkUI[0].style.top = (document.body.scrollHeight - maxOffset - bulkHeight - scrollTop + 150) + 'px';
    else if (scrollTop < minOffset) HangarXPLOR.$bulkUI[0].style.top = (minOffset - scrollTop + 150) + 'px';
    else HangarXPLOR.$bulkUI[0].style.top = '160px';
  };
  
  $(document).on('scroll', positionUI);
  
  var $content = $('.content');
  
  HangarXPLOR.$bulkUI = $('<div>', { class: 'js-bulk-ui' });
  
  HangarXPLOR.$bulkUI.$inner = $('<div>', { class: 'inner content-block1 loading' });
  HangarXPLOR.$bulkUI.$value = $('<div>', { class: 'value' });
  HangarXPLOR.$bulkUI.$actions = $('<div>', { class: 'actions' });
  HangarXPLOR.$bulkUI.$downloads = $('<div>', { class: 'actions' });
  HangarXPLOR.$bulkUI.$loading = $('<div>', { class: 'status value' });
  
  $content.append(HangarXPLOR.$bulkUI);
  HangarXPLOR.$bulkUI.append(HangarXPLOR.$bulkUI.$inner);
  HangarXPLOR.$bulkUI.$inner.append(
    HangarXPLOR.$bulkUI.$loading,
    HangarXPLOR.$bulkUI.$value,
    HangarXPLOR.$bulkUI.$actions,
    HangarXPLOR.$bulkUI.$downloads,
    $('<div>', { class: 'top-line-thin' }),
    $('<div>', { class: 'top-line' }),
    $('<div>', { class: 'corner corner-top-right' }),
    $('<div>', { class: 'corner corner-bottom-right' }));
  
  HangarXPLOR.$bulkUI.$downloads.append(HangarXPLOR.Button('Download CSV', 'download js-download-csv', HangarXPLOR._callbacks.DownloadCSV));
  HangarXPLOR.$bulkUI.$downloads.append(HangarXPLOR.Button('Download JSON', 'download js-download-json', HangarXPLOR._callbacks.DownloadJSON));

  bulkHeight = $('.js-bulk-ui').height();
  positionUI();
}

function BuybackDrawUI() {
  //...

  var temp;

  temp = $('#contentbody');
  temp.css('padding-bottom', '15px');

  temp = $('#contentbody > div.wrapper');
  temp.css('max-width', 'none');

  temp = $('#billing');
  temp.css('padding', '20px');

  temp = $('#billing > div.content.clearfix > div.sidenav');
  temp.css('width', '330px');

  temp = $('#billing > div.content.clearfix > div.sidenav > ul > li.active > a > span.bg');
  temp.css('width', '275px');

  temp = $('#billing > div > div.inner-content');
  temp.css('width', '100%');
  temp.css('padding-left', '330px');

  //...

  var $controls = $('<div class="js-custom-controls">');
  var $controls2 = $('<div>', { class: 'controls clearfix mrn15' });
  $controls.append($controls2);

  $controls.insertAfter('div.inner-content > section.buy-back-pledges');

  // TODO:(pv) Move this to BuyBackBulkUI and add "Show All"
  $controls2.append(HangarXPLOR.Button('Hide', 'js-custom-filter', () => {
    console.log('click');
    var $selected = $('.js-selected', HangarXPLOR.$buybacks);
    console.log('click $selected', $selected);
    $selected.hide();
    //...
  }));

  //...
}
