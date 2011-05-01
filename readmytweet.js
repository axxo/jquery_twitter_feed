(function( $ ) {
var scrollY;
$.fn.readmytweet = function(options) { 
	//Set default settings
	var settings = {
		'color'         : 'black', //now also available in 'blue' and 'white'
		'search'		: 'from:raffi_s',
		'user'			: raffi_s,
		'width'			: 0,
		'tweets'		: 20,
		'speed'			: 20
	};
	//Override default settings
	return this.each(function() {        
		if ( options ) { 
			$.extend(settings,options);
		}
		//Write the html code
		$(this).html('<div class="rmtwrapper"><div class="rmtlogo"></div><div class="rmtstage"><div class="rmtfadeleft"></div><div class="rmtfaderight"></div><div class="rmtscroller"></div></div></div>');
		//Give the wrapper a indentifier
		readmytweet = $(this).children('.rmtwrapper');
		//Give the scroller a indentifier
		rmtScroller = readmytweet.children().children('.rmtscroller');
		//Add the color
		readmytweet.addClass(settings['color']);
		//Set the width of all the elements
		if(settings['width']) {
			readmytweet.width(settings['width']);
		}
		readmytweet.children('.rmtstage').width(readmytweet.width()-readmytweet.children('.rmtlogo').width());
		readmytweet.children('.rmtstage').children('.rmtfaderight').css('marginLeft',readmytweet.children('.rmtstage').width()-readmytweet.children('.rmtstage').children('.rmtfaderight').width());
		//Check if we need to link the logo
		if(settings['user']) {
			readmytweet.children('.rmtlogo').css('cursor','pointer');
			readmytweet.children('.rmtlogo').click(function() {
				window.open('http://twitter.com/'+settings['user'],settings['user']);
			});
		}
		//Make a var to count the total width of the tweets
		totalWidth = 0;
		//Search tweets with JSON
		var url = 'http://search.twitter.com/search.json?q='+settings['search']+'&callback=?&rpp='+settings['tweets'];
		$.getJSON(url, function(data) {
			$.each(data.results, function(i, item) {
				//Beautify the date
				date = new Date(item['created_at']);
				diff = (((new Date()).getTime()-date.getTime())/1000);
				day_diff = Math.floor(diff / 86400);
				if (!day_diff) {
					if(diff < 86400) {   twitterDate = Math.floor(diff / 3600) + " hours ago"; }
					if(diff < 7200) {   twitterDate = "1 hour ago"; }
					if(diff < 3600) {   twitterDate = Math.floor(diff / 60) + " minutes ago"; }
					if(diff < 120) { 	twitterDate = "1 minute ago"; }
					if(diff < 60) { 	twitterDate = "just now"; }
				} else {
					if(day_diff < 31) { twitterDate = Math.ceil( day_diff / 7 ) + " weeks ago" }
					if(day_diff < 7) { twitterDate = day_diff + " days ago" }
					if(day_diff == 1) { twitterDate = "Yesterday" }
				}
				//Get the tweet url
				twitterUrl = 'http://twitter.com/'+item['from_user'];
				//Parse links in messages
				message = item['text'].replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,"<a href='$1' target='_blank'>$1</a>");
				//Parse Users @
				message = message.replace(/(^|\s)@(\w+)/g,"$1<a href='http://www.twitter.com/$2' target='_blank'>@$2</a>");
				//Parse Hashtags
				message = message.replace(/(^|\s)#(\w+)/g,"$1<a href='http://search.twitter.com/search?q=%23$2' target='_blank'>#$2</a>");
				//Make our div
				htmlCode = '<div class="rmttweet"><div class="rmtavatar"><a href="'+twitterUrl+'" target="_blank"><img src="'+item['profile_image_url']+'"/></a></div><div class="rmtinfo"><div class="rmttop"><div class="rmtname"><a href="'+twitterUrl+'" target="_blank">'+item['from_user']+'</a></div><div class="rmtdate">'+twitterDate+'</div></div><div class="rmtmessage">'+message+'</div></div></div>';
				//Append the code
				rmtScroller.append(htmlCode);
				//Set the rmttop width
				rmttop = rmtScroller.children(':last').children().children('.rmttop');
				rmttop.width(rmttop.children('.rmtname').width()+rmttop.children('.rmtdate').width()+22);
				//Check the total width of the div
				totalWidth += rmtScroller.children(':last').width();	
			})
			//Hide the scroller
			rmtScroller.hide();
			//Set the width of the container
			rmtScroller.width(totalWidth);
			//Set the speed
			speed = (41-settings['speed'])*100;
			//Set the beginning point
			rmtScroller.css('marginLeft',100);
			scrollY = 100;
			//Fadein and start to scroll
			rmtScroller.fadeIn(500);
			rmtScroller.rmtScroll();
			//Check if user hovers over the scroller
			rmtScroller.hover(function() { rmtScroller.rmtPause(1); }, function() { rmtScroller.rmtPause(0); });
		});
		
	})
};
//Scroll function
$.fn.rmtScroll = function() {
	scrollY -= 100;
	rmtScroller = $(this);
	rmtScroller.animate({
  		marginLeft: scrollY
  	},speed, 'linear',function() {
  		$(this).rmtOverflow();
  	});
}
//Check tweets that are offstage and remove them
$.fn.rmtOverflow = function() {
	rmtScroller = $(this);
	rmtTarget = $(this).children(':first');
	//If there is a tweet offstage, remove it
	if(-scrollY>rmtTarget.width()) {
		scrollY += rmtTarget.width();
		rmtScroller.css('marginLeft',scrollY);
		rmtScroller.append('<div class="rmttweet">'+$(this).children(':first').html()+'</div>');
		rmtTarget.remove();
	}
	$(this).rmtScroll();
}
//Pause Scroller
$.fn.rmtPause = function(mouseOver) {
	if(mouseOver == '1') {
		rmtScroller = $(this);
		rmtScroller.stop();
		scrollY = parseInt(rmtScroller.css('marginLeft'));
	} else {
		rmtScroller.rmtScroll();
	}
}
})(jQuery);