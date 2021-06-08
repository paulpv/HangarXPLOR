
var HangarXPLOR = HangarXPLOR || {};

// Load a page of pledges from RSI
HangarXPLOR.LoadPage = function(pageNo) {
  var pathname = window.location.pathname;
  HangarXPLOR.Log('LoadPage', 'pathname=', pathname);

  pageNo = pageNo || 1;
  
  HangarXPLOR.UpdateStatus(pageNo);
  
  var url = '/account/pledges?page=' + pageNo;
  
  if (pageNo == 1 && document.location.search == '?page=1')
      return HangarXPLOR.ProcessPage(document.body, pageNo);
  
  HangarXPLOR.Log('Loading', url);
  
  var $page = $('<div>');
  
  $page.load(url + ' .page-wrapper', function(response, status) {
    if (status != "success") {
      HangarXPLOR.Log('Error loading page ' + pageNo + ' of your hangar - please contact plugins@ddrit.com for further support');
      return;
    }
    HangarXPLOR.ProcessPage(this, pageNo);
  });
}