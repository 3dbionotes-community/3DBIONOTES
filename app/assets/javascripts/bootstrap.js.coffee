jQuery = window.$

jQuery ->
  jQuery("a[rel~=popover], .has-popover").popover()
  jQuery("a[rel~=tooltip], .has-tooltip").tooltip()
