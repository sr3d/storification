/* API Wrapper */
var API = (function($){
  var Homepage = {
    get: function(options) {
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
  };
  
  var Story = {
    get: function(url, options) {
      options = $.extend({ onSuccess:  $.noop }, options || {} );
      $.ajax({
        url:        url,
        method:     'get',
        dataType:   'jsonp',
        success:    options.onSuccess
      });
    }    
  };

  return {
    Homepage: Homepage,
    Story: Story
  };
})(jQuery);

/* Wrap http(s) urls with a tag */
String.prototype.linkify = function() { return this.replace(/(https?:\/\/.*\b)/g, '<a href="' + RegExp.$1 + '">' + RegExp.$1 + '</a>'); }

var Elements = (function($){
  
  /* Generic content item */
  var Item = function(json) {
    this.json = json;
  }
  $.extend(Item.prototype, {
    html: function() {
      return this.json.description;
    }
  });
  
  
  /* a Tweet, can have just tweet or photo */
  var Tweet = function(json){
    this.json = json;
  };
  $.extend(Tweet.prototype, {
    html: function() {
      var html = ['<div class="tweet">'];
      if(this.json.image && this.json.image.src) {
        html.push('<img src=' + this.json.image.src + ' style="width: 100%"/>');
      };
      html.push('<div><img src="http://twitter.com/favicon.ico"/> ' + this.json.description.linkify() +'</div>');
      
      html.push('</div>');
      return html.join("\n");
    }
  });
  
  /* a Text element */
  var Text = function(json) {
    this.json = json;
  }
  $.extend(Text.prototype, {
    html: function() {
      var html = ['<div class="text">'];
      html.push(this.json.description.linkify());
      html.push('</div>');
      return html.join("\n");
    }
  });


  var Website = function(json) {
    this.json = json;
  }
  $.extend(Website.prototype, {
    html: function() {
      var html = ['<div class="website">'];
      html.push(this.json.description);
      
      if(this.json.oembed) {
        html.push('<div class="oembed">');
        html.push(this.json.oembed.html);
        html.push('</div>');
      };
      
      html.push('</div>');
      return html.join("\n");
    }
  });


  /* Video: Youtube */
  var YouTube = function(json) {
    this.json = json;
  }
  $.extend(YouTube.prototype, {
    html: function() {
      var html = ['<div class="video youtube">'];
      html.push('<div class="video_wrapper"><a href="' + this.json.permalink + '">');
        html.push('<img src="' + this.json.thumbnail + '"/>');
      html.push('</a></div>');
      html.push('<p>' + this.json.description.linkify() + '</p>');
      html.push('</div>');
      return html.join("\n");
    }
  });

  // http://jsonformatter.curiousconcept.com/#http://storify.com/xdamman/hackdisrupt-the-techcrunch-disrupt-hackathon-in-ny.json
  var Story = function(json) {
    this.json   = json;
    this.name   = json.shorturl;
    this.title  = json.title;
    this.elements = [];
    this.initElements();
  }
  $.extend(Story.prototype, {
    
    /* Traverse the elements to initialize each item */
    initElements: function(){
      var self = this;
      $.each(this.json.elements, function( key, element ) {
        var item;
        switch(element.elementClass) {
          case 'tweet':  
            item = new Tweet(element); 
            break;
          case 'text':
            item = new Text(element); 
            break;
          case 'website':
            item = new Website(element); 
            break;
          case 'video':
            if(element.source == 'youtube')
              item = new YouTube(element);
            else {
              console.log("this video type is not implemented");
              item = new Item(element);
            }
            break;
          case '':
          default:
            item = new Item(element);
        };
        self.elements.push(item);
      });
    }
    
    /* Output the HTML for the Story */
    ,html: function() {
      var html = ["<p>" + this.json.description+"</p>"];
      for(var i = 0; i < this.elements.length; i++) {
        html.push("<p>" + this.elements[i].html() +"</p>");
      };
      return html.join("\n");
    }
  });

  return {
    Tweet:    Tweet,
    Text:     Text,
    Item:     Item,
    YouTube:  YouTube,
    
    Story:    Story
  };
})(jQuery);


var Page = (function($){
  /* template for a new mobile page */
  var pageTemplate = $.template('pageTemplate', '<div data-role="page" id="${id}">\
                                                    <div data-role="header"><h1>${title}</h1></div>\
                                                    <div data-role="content">{{html content}}</div>\
                                                 </div>' );
  
  var showStory = function(a) {
    API.Story.get($(a).attr('href'), {
      onSuccess: function(json) {
        var story = new Elements.Story(json);
        var page = { id: (new Date()).getTime(), title: story.title, content: story.html() };
        $.tmpl('pageTemplate', page).appendTo($('body'));
        document.location.href = '#' + page.id; // hack for jQueryMobile
        $.mobile.changePage( $('#'+page.id), 'slide', false, true);
      }
    });
  };
  
  
  var open = function(a) {
    showStory(a);
  }
  
  return {
    open: open
  };
  
})(jQuery);


var Homepage = (function($) {
  var currentPage = 1, limit = 4;
  var entryTemplate = $.template('entryTemplate', "<div><li data-icon='false'><a href='${permalink}.json'><img src='${image.src}'/><h3>${title}</h3><p>${description}</p></a></li></div>");
  var buildEntryHtml = function(story) {
    if(!story.image.src) story.image.src = story.image.thumbnail || story.author.avatar;
    // story.title = story.title.substr(0, 40); // trim some fat
    return $.tmpl('entryTemplate', story)[0].innerHTML;
  };
  
  var open = function(){
    API.Homepage.get({ 
      currentPage: currentPage,
      limit: limit,
      onSuccess: function(json) {
        /* collect the story and construct the HTML accordingly */
        var stories = $.map(json.elements, function(story){ return story;});
        var html = ['<ul class="ui-listview" data-role="listview">'];
        $.each(json.elements, function(key,story) { html.push(buildEntryHtml(story)); });
        html.push('</ul>');
        
        /* insert the list view and init it */
        $('#homepage div:jqmData(role="content")').html(html.join("\n"));
        $('#homepage ul').listview();
        
        /* open story on click */
        $('#homepage ul a').click(function(e){
          Page.open(this);
          return false;
        });
      }
    })
  }
  
  return {
    open: open
  }
})(jQuery);