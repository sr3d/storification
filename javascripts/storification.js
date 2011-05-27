var API = (function($){
  return {
    Homepage: {
      load: function(options) {
        options = $.extend({
          page:       1,
          limit:      10,
          onSuccess:  $.noop,
        }, options || {} );
        
        $.ajax({
          url:        'http://storify.com/storifyfeatured/homepage.json',
          method:     'get',
          dataType:   'jsonp',
          data:       { page: options.page, limit: options.limit },
          success:    options.onSuccess
        });
      }
    }
  };
})(jQuery);



var Homepage = (function($) {
  var currentPage = 1, limit = 10;
  var entryTemplate = $.template('entryTemplate', "<div><li data-icon='false'><a href='/'><img src='${image.src}'/><h3>${title}</h3><p>${description}</p></a></li></div>");
  var buildEntryHtml = function(story) {
    if(!story.image.src) story.image.src = story.image.thumbnail || story.author.avatar;
    story.title = story.title.substr(0, 40);
    return $.tmpl('entryTemplate', story)[0].innerHTML;
  };
  
  var initialize = function(){
    API.Homepage.load({ 
      currentPage: currentPage,
      limit: limit,
      onSuccess: function(json) {
        console.log("json.elements %o",json.elements);
        var stories = $.map(json.elements, function(story){ return story;});
        
        var html = ['<ul class="ui-listview" data-role="listview">'];
        $.each(json.elements, function(key,story) { html.push(buildEntryHtml(story)); });
        html.push('</ul>');
        
        $('#homepage div:jqmData(role="content")').html(html.join(' '));
        $('#homepage ul').listview();
        
        // console.log("html %o",html);
        // console.log("stories %o",stories);
        // log(stories);
        /* extract the featured pages */
        // var stories = [];
        // for(var i = 0; i < limit; i++) {
        //   st
        // };
        /* construct the view and append */
        
      }
    })
  }
  
  return {
    initialize: initialize
  }
})(jQuery);

