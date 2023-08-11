// One Page Few Page

;(function($) {

	var wipeInit = true, pages_count, document_width, document_height, params, currentId, coords = new Array(), onResizing = false, anim_params = {
		start : {
			x : 0,
			y : 0,
			angle : 0
		},
		end : {
			x : 0,
			y : 0,
			angle : 0,
			length : 0
		}
	};

	// Init things
	$.opfp = function(settings) {
		params = null;
		params = $.extend({
			// Params
			cols : 1,
			start_angle : 0,
			end_angle : -100,
			length : 0.3,
			selector : '.page_item',
			start : 1,
			speed : 1000,
			type : 'bezier',
			firstStep : 'col',
			forceRefresh : false,
			swipe : false,
			loop: true,
			widthOffset: 0,
			heightOffset: 0,
			watchResize: true,
			
			// Don't set!!!
			pureSelector : '',
			// Callbacks
			onBeforeLoad : false,
			onAfterLoad : false,
			onBeforeSwitch : false,
			onAfterSwitch : false,
			onNext : false,
			onPrev : false,
			onGoTo : false,
			onNoMore : false,
			onSwipe : false,
			onSwipeLeft : false,
			onSwipeRight : false,
			onSwipeUp : false,
			onSwipeDown : false
		}, settings);

		if (params.onBeforeLoad) {
			params.onBeforeLoad.call(this);
		}
		document_width = parseInt($(window).width());
		document_height = parseInt($(window).height());
		anim_params.end.length = params.length;
		params.pureSelector = params.selector.split('.')[1];
		pages_count = 0;

		var i = 0;
		var i_row = 1;
		var i_col = 1;

		$(params.selector).each(function() {
			pages_count++;
			i++;
			if (params.cols < i_col) {
				i_col = 1;
				i_row++;
			}
			coords[i] = i_row + ',' + i_col;
			i_col++;
			$(this).width(document_width + params.widthOffset).height(document_height + params.heightOffset).attr('rel', i);
		});

		$('body').width(params.cols * document_width).height(document_height);

		$(params.selector).removeClass('opfp_active');
		$(params.selector + '[rel=' + params.start + ']').addClass('opfp_active');

		if (params.start != 1 || params.forceRefresh) {
			this.opfp.goTo(params.start);
		}

		// Init WipeTouch
		if (jQuery().wipetouch && params.swipe == true && wipeInit) {
			$(params.selector).wipetouch({
				wipeLeft : function(result){
					$.opfp.swipeLeft();
					if (params.onSwipe) {
						params.onSwipe.call(this);
					}
					if (params.onSwipeLeft) {
						params.onSwipeLeft.call(this);
					}
				},
				wipeRight : function(result) {
					$.opfp.swipeRight();
					if (params.onSwipe) {
						params.onSwipe.call(this);
					}
					if (params.onSwipeRight) {
						params.onSwipeRight.call(this);
					}
				},
				wipeUp : function(result) {
					$.opfp.swipeUp();
					if (params.onSwipe) {
						params.onSwipe.call(this);
					}
					if (params.onSwipeUp) {
						params.onSwipeUp.call(this);
					}
				},
				wipeDown : function(result) {
					$.opfp.swipeDown();
					if (params.onSwipe) {
						params.onSwipe.call(this);
					}
					if (params.onSwipeDown) {
						params.onSwipeDown.call(this);
					}
				}
			});
			wipeInit = false;
		}
		
		if(params.watchResize){
			
			$(window).resize(function(){

				$.opfp.reFresh();

			});
			
			if (window.DeviceOrientationEvent) {
				window.addEventListener('orientationchange', $.opfp.reFresh, false);
			}
			
			
		}

		if (params.onAfterLoad) {
			params.onAfterLoad.call(this);
		}

	}
	// Anim starter
	$.opfp.anim = function(dir) {

		if ($('body').is(':animated')) {
			return;
		}

		if (params.onBeforeSwitch) {
			params.onBeforeSwitch.call(this);
		}

		anim_params.start.angle = isNaN(params.start_angle) ? random(-300, 300) : params.start_angle;
		anim_params.end.angle = isNaN(params.end_angle) ? random(-300, 300) : params.end_angle;

		// Get positions and set some values
		var current = $('.opfp_active');
		currentId = parseInt(current.attr('rel'));
		var nextItem, nextId;

		if (!isNaN(dir)) {
			nextItem = $('.page_item[rel=' + dir + ']');
			nextId = parseInt(dir);
		} else if (dir == 'next') {
			if ($('.opfp_active').next(params.selector).length > 0) {
				nextItem = $('.opfp_active').next();
				nextId = nextItem.attr('rel');
			}
			else if(!params.loop){
				nextItem = current;
				nextId = currentId;
			}
			else {
				nextItem = $(params.selector).filter(':first');
				nextId = nextItem.attr('rel');
				if (params.onNoMore) {
					params.onNoMore.call(this);
				}
			}
		} else if (dir == 'prev') {
			if ($('.opfp_active').prev(params.selector).length > 0) {
				nextItem = $('.opfp_active').prev();
				nextId = nextItem.attr('rel');
			}
			else if(!params.loop){
				nextItem = current;
				nextId = currentId;
			}
			else {
				nextItem = $(params.selector).filter(':last');
				nextId = nextItem.attr('rel');
				if (params.onNoMore) {
					params.onNoMore.call(this);
				}
			}
		}

		anim_params.start.x = document_width * (getCol(currentId) - 1 ) * -1;
		anim_params.start.y = document_height * (getRow(currentId) - 1 ) * -1;
		anim_params.end.x = document_width * (getCol(nextId) - 1 ) * -1;
		anim_params.end.y = document_height * (getRow(nextId) - 1 ) * -1;

		if (params.type == 'straight' || params.type == 'step') {
			anim_params.start.angle = 0;
			anim_params.end.angle = 0;
		}

		if (params.type == 'straight' || params.type == 'bezier') {
			$('body').stop().animate({
				path : new $.opfp.bezier(anim_params)
			}, params.speed, function() {
				if (params.onAfterSwitch)
					params.onAfterSwitch.call(this);
			});
		} else if (params.type == 'step') {

			var thisCol = getCol(currentId);
			var thisRow = getRow(currentId);
			var newCol = getCol(nextId);
			var newRow = getRow(nextId);
			var direction = 'stay';
			var firstSpeed = params.speed;
			var speed = params.speed;
			var stepId;
			if (thisCol > newCol) {
				direction = 'left';
			} else if (thisCol < newCol) {
				direction = 'right';
			}

			if (params.firstStep == 'row') {

				if (direction == 'left' && thisRow != newRow) {
					stepId = getId(thisRow + ',' + newCol);
					if (stepId == -1) {
						stepId = getId(newRow + ',' + thisCol);
					}
					speed = Math.floor(speed / 2);
					firstSpeed = Math.floor(speed / 2);
				} else if (direction == 'right' && thisRow != newRow) {
					stepId = getId(thisRow + ',' + newCol);
					if (stepId == -1) {
						stepId = getId(newRow + ',' + thisCol);
					}
					speed = Math.floor(speed / 2);
					firstSpeed = Math.floor(speed / 2);
				} else {
					firstSpeed = 0;
					stepId = currentId;
				}

			} else if (params.firstStep == 'col') {

				if (direction == 'left' && thisCol != newCol) {
					stepId = getId(newRow + ',' + thisCol);
					if (stepId == -1) {
						stepId = getId(thisRow + ',' + newCol);
					}
					speed = Math.floor(speed / 2);
					firstSpeed = Math.floor(speed / 2);
				} else if (direction == 'right' && thisCol != newCol) {
					stepId = getId(newRow + ',' + thisCol);
					if (stepId == -1) {
						stepId = getId(thisRow + ',' + newCol);
					}
					speed = Math.floor(speed / 2);
					firstSpeed = Math.floor(speed / 2);
				} else {
					firstSpeed = 0;
					stepId = currentId;
				}
			}

			var stepOneStartX = document_width * (getCol(currentId) - 1 ) * -1;
			var stepOneStartY = document_height * (getRow(currentId) - 1 ) * -1;
			var stepOneEndX = document_width * (getCol(stepId) - 1 ) * -1;
			var stepOneEndY = document_height * (getRow(stepId) - 1 ) * -1;

			var stepTwoStartX = document_width * (getCol(stepId) - 1 ) * -1;
			var stepTwoStartY = document_height * (getRow(stepId) - 1 ) * -1;
			var stepTwoEndX = document_width * (getCol(nextId) - 1 ) * -1;
			var stepTwoEndY = document_height * (getRow(nextId) - 1 ) * -1;

			anim_params.start.x = stepOneStartX;
			anim_params.start.y = stepOneStartY;
			anim_params.end.x = stepOneEndX;
			anim_params.end.y = stepOneEndY;

			$('body').stop().animate({
				path : new $.opfp.bezier(anim_params)
			}, firstSpeed, function() {
				anim_params.start.x = stepTwoStartX;
				anim_params.start.y = stepTwoStartY;
				anim_params.end.x = stepTwoEndX;
				anim_params.end.y = stepTwoEndY;
				$(this).animate({
					path : new $.opfp.bezier(anim_params)
				}, speed, function() {
					if (params.onAfterSwitch) {
						params.onAfterSwitch.call(this);
					}
				})
			});

			anim_params.end.x = document_width * (getCol(nextId) - 1 ) * -1;
			anim_params.end.y = document_height * (getRow(nextId) - 1 ) * -1;
		}
		current.removeClass('opfp_active');
		nextItem.addClass('opfp_active');
	}
	// Show next
	$.opfp.next = function() {
		if (params.onNext) {
			params.onNext.call(this);
		}
		this.anim('next');
	}
	// Show previous
	$.opfp.prev = function() {
		if (params.onPrev) {
			params.onPrev.call(this);
		}
		this.anim('prev');
	}
	// Go to
	$.opfp.goTo = function(id, isSwipe) {
		
		if (isNaN(id)) {
			id = id.match(/[0-9]+/);
		}
		
		var act = $('.opfp_active');
		var next = $(params.selector + "[rel=" + id + "]").length;
		
		if(params.loop && isSwipe){
			if ( next <= 0 && params.onNoMore) {
				params.onNoMore.call(this);
			}
			if ( next == 0 && act.next(params.selector).length == 0 ){
				id = 1;
				next = $(params.selector + "[rel=1]").length;
			}
			else if(next == 0 && act.prev(params.selector).length == 0){
				id = parseInt($(params.selector).filter(':last').attr('rel'));
				next = $(params.selector + "[rel=" + id + "]").length;
			}
		}
		
		if ( next > 0) {
			if (params.onGoTo) {
				params.onGoTo.call(this);
			}
			this.anim(id);
		} else {
			if (params.onNoMore && isSwipe) {
				params.onNoMore.call(this);
			}
		}
	}
	
	// Refresh
	$.opfp.reFresh = function(){
		
		document_width = parseInt($(window).width());
		document_height = parseInt($(window).height());
		pages_count = 0;

		var i = 0;
		var i_row = 1;
		var i_col = 1;

		$(params.selector).each(function() {
			pages_count++;
			i++;
			if (params.cols < i_col) {
				i_col = 1;
				i_row++;
			}
			coords[i] = i_row + ',' + i_col;
			i_col++;
			$(this).width(document_width + params.widthOffset).height(document_height + params.heightOffset).attr('rel', i);
		});

		$('body').width(params.cols * document_width).height(document_height);
		
		
		$.opfp.goTo(parseInt($('.opfp_active').attr('rel')));
		//console.log(parseInt($('.opfp_active').attr('rel')));
	}
	
	// Swipe Up
	$.opfp.swipeUp = function() {
		var nextSwipeIdUp = parseInt($('.opfp_active').attr('rel')) + params.cols;
		$.opfp.goTo(nextSwipeIdUp, true);
	}
	// Swipe down
	$.opfp.swipeDown = function() {
		var nextSwipeIdDown = parseInt($('.opfp_active').attr('rel')) - params.cols;
		$.opfp.goTo(nextSwipeIdDown, true);
	}
	// Swipe Right
	$.opfp.swipeRight = function() {
		var nextSwipeIdRight = parseInt($('.opfp_active').attr('rel')) - 1;
		$.opfp.goTo(nextSwipeIdRight, true);
	}
	// Swipe Left
	$.opfp.swipeLeft = function() {
		var nextSwipeIdLeft = parseInt($('.opfp_active').attr('rel')) + 1;
		$.opfp.goTo(nextSwipeIdLeft, true);
	}
	// Private functions

	var getCol = function(id) {
		return coords[id].split(',')[1];
	}
	var getRow = function(id) {
		return coords[id].split(',')[0];
	}
	var getId = function(coord) {
		return coords.indexOf(coord);
	}
	var random = function(from, to) {
		return Math.floor(Math.random() * (to - from + 1) + from);
	}
	// Path methods (Originally coming from jQuery Path plugin, see licences.txt)
	var V = {
		rotate : function(p, degrees) {
			var radians = degrees * 3.141592654 / 180
			var c = Math.cos(radians), s = Math.sin(radians)
			return [c * p[0] - s * p[1], s * p[0] + c * p[1]]
		},
		scale : function(p, n) {
			return [n * p[0], n * p[1]]
		},
		add : function(a, b) {
			return [a[0] + b[0], a[1] + b[1]]
		},
		minus : function(a, b) {
			return [a[0] - b[0], a[1] - b[1]]
		}
	}

	$.opfp.bezier = function(animParams) {
		animParams.start = $.extend({
			angle : 0,
			length : 0.3333
		}, animParams.start)
		animParams.end = $.extend({
			angle : 0,
			length : 0.3333
		}, animParams.end)

		this.p1 = [animParams.start.x, animParams.start.y];
		this.p4 = [animParams.end.x, animParams.end.y];

		var v14 = V.minus(this.p4, this.p1)
		var v12 = V.scale(v14, animParams.start.length)
		v12 = V.rotate(v12, animParams.start.angle)
		this.p2 = V.add(this.p1, v12)

		var v41 = V.scale(v14, -1)
		var v43 = V.scale(v41, animParams.end.length)
		v43 = V.rotate(v43, animParams.end.angle)
		this.p3 = V.add(this.p4, v43)

		this.f1 = function(t) {
			return (t * t * t);
		}
		this.f2 = function(t) {
			return (3 * t * t * (1 - t));
		}
		this.f3 = function(t) {
			return (3 * t * (1 - t) * (1 - t));
		}
		this.f4 = function(t) {
			return ((1 - t) * (1 - t) * (1 - t));
		}
		/* p from 0 to 1 */
		this.css = function(p) {
			var f1 = this.f1(p), f2 = this.f2(p), f3 = this.f3(p), f4 = this.f4(p)
			var x = this.p1[0] * f1 + this.p2[0] * f2 + this.p3[0] * f3 + this.p4[0] * f4;
			var y = this.p1[1] * f1 + this.p2[1] * f2 + this.p3[1] * f3 + this.p4[1] * f4;

			return {
				marginTop : y + "px",
				marginLeft : x + "px"
			}
		}
	}

	$.fx.step.path = function(fx) {
		var css = fx.end.css(1 - fx.pos);
		for (var i in css) {
			fx.elem.style[i] = css[i];
		}
	}
})(jQuery);

// jQuery Wipe Touch Plugin
;(function ($)
{
	$.fn.wipetouch = function (settings)
	{
		// ------------------------------------------------------------------------
		// PLUGIN SETTINGS
		// ------------------------------------------------------------------------

		var config = {

			// Variables and options
			moveX: 40, 	// minimum amount of horizontal pixels to trigger a wipe event
			moveY: 40, 	// minimum amount of vertical pixels to trigger a wipe event
			tapToClick: false, // if user taps the screen it will fire a click event on the touched element
			preventDefault: true, // if true, prevents default events (click for example)
			allowDiagonal: false, // if false, will trigger horizontal and vertical movements so wipeUpLeft, wipeDownLeft, wipeUpRight, wipeDownRight are ignored

			// Wipe events
			wipeLeft: false, // called on wipe left gesture
			wipeRight: false, // called on wipe right gesture
			wipeUp: false, // called on wipe up gesture
			wipeDown: false, // called on wipe down gesture
			wipeUpLeft: false, // called on wipe top and left gesture
			wipeDownLeft: false, // called on wipe bottom and left gesture
			wipeUpRight: false, // called on wipe top and right gesture
			wipeDownRight: false, // called on wipe bottom and right gesture
			wipeMove: false, // triggered whenever touchMove acts

			// DEPRECATED EVENTS
			wipeTopLeft: false, // USE WIPEUPLEFT
			wipeBottomLeft: false, // USE WIPEDOWNLEFT
			wipeTopRight: false, // USE WIPEUPRIGHT
			wipeBottomRight: false	// USE WIPEDOWNRIGHT
		};

		if (settings)
		{
			$.extend(config, settings);
		}

		this.each(function ()
		{
			// ------------------------------------------------------------------------
			// INTERNAL VARIABLES
			// ------------------------------------------------------------------------

			var startX; 					// where touch has started, left
			var startY; 					// where touch has started, top
			var startDate = false; 			// used to calculate timing and aprox. acceleration
			var curX; 						// keeps touch X position while moving on the screen
			var curY; 						// keeps touch Y position while moving on the screen
			var isMoving = false; 			// is user touching and moving?
			var touchedElement = false; 	// element which user has touched

			// These are for non-touch devices!
			var useMouseEvents = false; 	// force using the mouse events to simulate touch
			var clickEvent = false; 		// holds the click event of the target, when used hasn't clicked

			// ------------------------------------------------------------------------
			// TOUCH EVENTS
			// ------------------------------------------------------------------------

			// Called when user touches the screen.
			function onTouchStart(e)
			{
				var start = useMouseEvents || (e.originalEvent.touches && e.originalEvent.touches.length > 0);

				if (!isMoving && start)
				{
					if (config.preventDefault)
					{
						e.preventDefault();
					}

					// Temporary fix for deprecated events, these will be removed on next version!
					if (config.allowDiagonal)
					{
						if (!config.wipeDownLeft)
						{
							config.wipeDownLeft = config.wipeBottomLeft;
						}

						if (!config.wipeDownRight)
						{
							config.wipeDownRight = config.wipeBottomRight;
						}

						if (!config.wipeUpLeft)
						{
							config.wipeUpLeft = config.wipeTopLeft;
						}

						if (!config.wipeUpRight)
						{
							config.wipeUpRight = config.wipeTopRight;
						}
					}

					// When touch events are not present, use mouse events.
					if (useMouseEvents)
					{
						startX = e.pageX;
						startY = e.pageY;

						$(this).bind("mousemove", onTouchMove);
						$(this).one("mouseup", onTouchEnd);
					}
					else
					{
						startX = e.originalEvent.touches[0].pageX;
						startY = e.originalEvent.touches[0].pageY;

						$(this).bind("touchmove", onTouchMove);
					}

					// Set the start date and current X/Y.
					startDate = new Date().getTime();
					curX = startX;
					curY = startY;
					isMoving = true;

					touchedElement = $(e.target);
				}
			}

			// Called when user untouches the screen.
			function onTouchEnd(e)
			{
				if (config.preventDefault)
				{
					e.preventDefault();
				}

				// When touch events are not present, use mouse events.
				if (useMouseEvents)
				{
					$(this).unbind("mousemove", onTouchMove);
				}
				else
				{
					$(this).unbind("touchmove", onTouchMove);
				}

				// If is moving then calculate the touch results, otherwise reset it.
				if (isMoving)
				{
					touchCalculate(e);
				}
				else
				{
					resetTouch();
				}
			}

			// Called when user is touching and moving on the screen.
			function onTouchMove(e)
			{
				if (config.preventDefault)
				{
					e.preventDefault();
				}

				if (useMouseEvents && !isMoving)
				{
					onTouchStart(e);
				}

				if (isMoving)
				{
					if (useMouseEvents)
					{
						curX = e.pageX;
						curY = e.pageY;
					}
					else
					{
						curX = e.originalEvent.touches[0].pageX;
						curY = e.originalEvent.touches[0].pageY;
					}

					// If there's a wipeMove event, call it passing
					// current X and Y position (curX and curY).
					if (config.wipeMove)
					{
						triggerEvent(config.wipeMove, {
							curX: curX,
							curY: curY
						});
					}
				}
			}

			// ------------------------------------------------------------------------
			// CALCULATE TOUCH AND TRIGGER
			// ------------------------------------------------------------------------

			function touchCalculate(e)
			{
				var endDate = new Date().getTime(); 	// current date to calculate timing
				var ms = startDate - endDate; 			// duration of touch in milliseconds

				var x = curX; 							// current left position
				var y = curY; 							// current top position
				var dx = x - startX; 					// diff of current left to starting left
				var dy = y - startY; 					// diff of current top to starting top
				var ax = Math.abs(dx); 					// amount of horizontal movement
				var ay = Math.abs(dy); 					// amount of vertical movement

				// If moved less than 15 pixels, touch duration is less than 100ms,
				// and tapToClick is true then trigger a click event and stop processing.
				if (ax < 15 && ay < 15 && ms < 100)
				{
					clickEvent = false;

					if (config.preventDefault)
					{
						resetTouch();

						touchedElement.trigger("click");
						return;
					}
				}
				// When touch events are not present, use mouse events.
				else if (useMouseEvents)
				{
					var evts = touchedElement.data("events");

					if (evts)
					{
						// Save click event to the temp clickEvent variable.
						var clicks = evts.click;

						if (clicks && clicks.length > 0)
						{
							$.each(clicks, function (i, f)
							{
								clickEvent = f;
								return;
							});

							touchedElement.unbind("click");
						}
					}
				}

				// Is it moving to the right or left, top or bottom?
				var toright = dx > 0;
				var tobottom = dy > 0;

				// Calculate speed from 1 to 5, 1 being slower and 5 faster.
				var s = ((ax + ay) * 60) / ((ms) / 6 * (ms));

				if (s < 1) s = 1;
				if (s > 5) s = 5;

				var result = {
					speed: parseInt(s),
					x: ax,
					y: ay,
					source: touchedElement
				};

				if (ax >= config.moveX)
				{
					// Check if it's allowed and trigger diagonal wipe events.
					if (config.allowDiagonal && ay >= config.moveY)
					{
						if (toright && tobottom)
						{
							triggerEvent(config.wipeDownRight, result);
						}
						else if (toright && !tobottom)
						{
							triggerEvent(config.wipeUpRight, result);
						}
						else if (!toright && tobottom)
						{
							triggerEvent(config.wipeDownLeft, result);
						}
						else
						{
							triggerEvent(config.wipeUpLeft, result);
						}
					}
					// Otherwise trigger horizontal events if X > Y.
					else if (ax >= ay)
					{
						if (toright)
						{
							triggerEvent(config.wipeRight, result);
						}
						else
						{
							triggerEvent(config.wipeLeft, result);
						}
					}
				}
				// If Y > X and no diagonal, trigger vertical events.
				else if (ay >= config.moveY && ay > ax)
				{
					if (tobottom)
					{
						triggerEvent(config.wipeDown, result);
					}
					else
					{
						triggerEvent(config.wipeUp, result);
					}
				}

				resetTouch();
			}

			// Resets the cached variables.
			function resetTouch()
			{
				startX = false;
				startY = false;
				startDate = false;
				isMoving = false;

				// If there's a click event, bind after a few miliseconds.
				if (clickEvent)
				{
					window.setTimeout(function ()
					{
						touchedElement.bind("click", clickEvent);
						clickEvent = false;
					}, 50);
				}
			}

			// Trigger a wipe event passing a result object with
			// speed from 1 to 5, x / y movement amount in pixels,
			// and the source element.
			function triggerEvent(wipeEvent, result)
			{
				if (wipeEvent)
				{
					wipeEvent(result);
				}
			}

			// ------------------------------------------------------------------------
			// ADD TOUCHSTART AND TOUCHEND EVENT LISTENERS
			// ------------------------------------------------------------------------

			if ("ontouchstart" in document.documentElement)
			{
				$(this).bind("touchstart", onTouchStart);
				$(this).bind("touchend", onTouchEnd);
			}
			else
			{
				useMouseEvents = true;

				$(this).bind("mousedown", onTouchStart);
				$(this).bind("mouseout", onTouchEnd);
			}
		});

		return this;
	};
})(jQuery);
