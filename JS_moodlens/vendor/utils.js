var Utils = (function() {
	var floor = Math.floor,
		random = Math.random,
		sqrt = Math.sqrt,
		min = Math.min,
		max = Math.max,
		moods = {
			"anxious": {
				"color":"#8e001b",
				"description":"If your palms are sweaty and you know it, clap your hands. All signs point to you feeling pretty anxious right about now. Though it might be easy to fret, don't because scent can have an impact on how you're feeling. A whiff or two of lavender could be all it takes to bring your mood to a more relaxing place.",
				"headline":"Real-time data indicates you might have a case of the nervous Nellies.",
				"id":10,
				"order":0,
				"scent":"Lavender & Vanilla",
				"shade":"#5B272E"
			},
			"calm":{
				"color":"#a87db2",
				"description":"Stress levels, what stress levels? In this cool, calm and very much state of mind, it's downright impossible to rattle you no matter what comes your way.\n\n        Scents can influence how you feel. Grab something with notes of vanilla or lavender whenever you want to take it down a few notches.",
				"headline":"Real-time data suggests you find yourself right in between cool and collected.",
				"id":6,
				"order":16,
				"scent":"Lavender & Vanilla",
				"shade":"#9D66AF"
			},
			"carefree":{
				"color":"#ff6559",
				"description":"Your current mantra: worry free is the way to be. When you're this easygoing, you're registering at off the chart happy-go-lucky levels and are fine going just about wherever the wind blows. You'd even count your troubles. If you had any.\n\n        How you feel can be influenced by scent.  Reach for marine notes and hints of violet when you're looking to send worries packing.",
				"headline":"Real-time data points to your cares adding up to a grand total of zero.",
				"id":5,
				"order":2,
				"scent":"Blue Odyssey",
				"shade":"#C6524F"
			},"confident":{
				"color":"#d11e15",
				"description":"You're a ten in a sea of sevens when it comes to self-assurance. You're feeling confident and there's no denying it. So confident in fact, that you're probably asking yourself things like, \"why walk when you can strut?\"\n\n        Scent can affect how you feel. Add notes of pink rose and peony the next time you want to take those confidence levels sky-high.",
				"headline":"Real-time data shows you're number one in the confidence department.",
				"id":9,
				"order":19,
				"scent":"Blooming Peony & Cherry",
				"shade":"#962329"
			},
			"creative":{
				"color":"#ff00b1",
				"description":"You couldn't stop your imaginative juices from flowing even if you wanted to. In this creative state of mind, you're able to find the ordinary in the extraordinary no matter where you look. With ideas coming at you from every direction, it only makes sense to keep a notebook close by to catch them all.\n\n        Did you know scents can impact your mood? Have some aromas of cypress on hand to keep this flow of brilliance going.",
				"headline":"Real-time data indicates your creative juices are most definitely flowing.",
				"id":13,
				"order":17,
				"scent":"Balsem & Fir",
				"shade":"#C11477"
			},
			"energized":{
				"color":"#ee4f00",
				"description":"No snooze button for you, friend. In this energized kind of mood, you're in a perky state of mind and are up for just about anything, whether it be an impromptu dance party or a scenic jog.\n\n        Did you know feelings can be complimented by scent? Bright and zesty cherry notes can help up your positive charge the next time you're looking to feel this energized.","headline":"Real-time data points to you putting the p in perky.",
				"id":11,
				"order":3,
				"scent":"Blooming Peony & Cherry",
				"shade":"#C92F00"
			},
			"exhilarated":{
				"color":"#c30e2e",
				"description":"Happy doesn't even begin to come close to describing you right now. When you're living life with this much delight, you can't help but smile ear to ear and be downright bubbly.\n\n        Scent can have an effect on how you're feeling. Adding a bowl of cherries or freshly picked pink blooms to your space can help put you in an ultra-feel good mood in the future.",
				"headline":"Real-time data points to you not just feeling good, but absolutely exhilarated.",
				"id":18,
				"order":1,
				"scent":"Blooming Peony & Cherry",
				"shade":"#9E002D"
			},
			"indifferent":{
				"color":"#74637f",
				"description":"Everything's coming up...well...meh. When you're stuck in this zone of whatever, there's a whole lot of shrugging going on.\n\n        A certain scent can make you feel a certain way. If you're looking to try on a new frame of mind, put your nose to work sniffing green tea and orange-based aromas to help brighten your mood.",
				"headline":"Real-time data suggests your shoulders are getting quite the workout.",
				"id":0,
				"order":14,
				"scent":"Blue Odyssey",
				"shade":"#554760"
			},
			"inspired":{
				"color":"#00dd88",
				"description":"What starts with curiosity and question marks ends with an ah-ha moment that fills you with a rush of feeling. When you find yourself filled with this much inspired spirit, there's nothing to do but let the muse take you on its journey.\n\n        Scent can affect how you're feeling. Keep yumberry and watermelon fragrances close by whenever you're hoping to land your next big epiphany.",
				"headline":"Real-time data infers you've found your ah-ha moment.",
				"id":4,
				"order":8,
				"scent":"Radiant Berries",
				"shade":"#18663B"
			},
			"invigorated":{
				"color":"#2277bc",
				"description":"Wide-eyed and ready for action is how to best describe you right about now. When you're in the invigorated zone, you're lively, filled with energy and ready to take on whatever the day throws your way with a fresh burst of enthusiasm.\n\n        Scents can provoke feelings. The next time you want to be in an invigorated mood, look to hints of marine notes or aromatic florals.",
				"headline":"Real-time data suggests you've got that wide-eyed feeling",
				"id":17,
				"order":11,
				"scent":"Blue Odyssey",
				"shade":"#004884"
			},
			"joyful":{
				"color":"#35845a",
				"description":"You couldn't stop your giddiness if you tried. When you're feeling this merry, you're more than in good spirits, you're in amazing ones. You might even have to resist the urge to skip down the street or belt out your favorite song.\n\n        Scents can make a difference in how you're feeling. Next time you want to get on this joyful of a level, find a fir tree or two.",
				"headline":"Real-time data suggests you're registering at a ten on the giddiness scale.",
				"id":14,
				"order":7,
				"scent":"Balsem & Fir",
				"shade":"#00442B"
			},
			"jubilant":{
				"color":"#eea904",
				"description":"That jubilant emotion you're feeling? It's something humans have been trying to bottle for centuries, so drink it down. While you're at it, go on and raise your hands in the air like you really do care and then victory dance the day away.\n\n        Did you know feelings can be complemented by scent? Adding fragrances of sweet citrus and peony can help bring about a celebratory mood.",
				"headline":"Real-time data indicates you're feeling jubilant with a capital J.",
				"id":19,
				"order":5,
				"scent":"Blooming Poeny & Cherry",
				"shade":"#C98B00"
			},
			"optimistic":{
				"color":"#CE3262",
				"description":"You can't help but sport your favorite pair of rose-colored shades when you're rocking this kind of optimism. With an outlook this positive, nothing can even come close to raining on your parade.\n\n        Scent has been known to influence how you're feeling. Look to aromas of grapefruit and watermelon when you want to take a walk on the even brighter side.","headline":"Real-time data points to you feeling oh so optimistic.",
				"id":8,
				"order":18,
				"scent":"Radiant Berries",
				"shade":"#AF1049"
			},
			"peaceful":{
				"color":"#b6c1ff",
				"description":"You've found your center. And it's not going anywhere. Peaceful is as peaceful does, and right now you're centered, relaxed and free from everyday stresses.\n\n        Scents can have an effect on your mood. Reach for hints of rose and jasmine next time you want to recreate your low-key demeanor.",
				"headline":"Real-time data indicates you're feeling centered and stress-free.",
				"id":2,
				"order":13,
				"scent":"Lavender & Vanilla",
				"shade":"#969EBC"
			},
			"refreshed":{
				"color":"#5bc2ef",
				"description":"New day, brand new you. Two ways to best describe you right now are bright-eyed and ready for action. When you're in this type of up and at 'em mood, you see everything from an all-new perspective.\n\n        Did you know scents can impact how you're feeling? Add fragrances of sparkling orange and watery melon to bring on this kind of fresh perspective in the future.",
				"headline":"Real-time data suggests you're feeling up and even more at 'em.",
				"id":7,
				"order":10,
				"scent":"Blue Odyssey",
				"shade":"#4B9FBC"
			},
			"relaxed":{
				"color":"#ffb380",
				"description":"No one could accuse you of being anything but chill right now. When you're in this tension-free frame of mind, you've got no other choice but to sit back, kick up your feet and enjoy the stress-free life.\n\n        The scents around you can impact your emotions. Bring about a relaxed mood again by adding aromas of lavender and vanilla.",
				"headline":"Real-time data shows you're smack dab in the middle of a stress-free zone.",
				"id":1,
				"order":4,
				"scent":"Lavender & Vanilla",
				"shade":"#D38A59"
			},
			"silly":{
				"color":"#ffd94f",
				"description":"You never met a knock, knock joke that you didn't like. When you're smack dab in this mood, you'll do anything to tickle your funny bone, whether it be making a face or telling a joke.\n        Scent has a way of affecting your emotions. Reach for yumberry and watermelon scented somethings the next time you want another bout of giggles.",
				"headline":"Real-time data shows you're down for a good giggle-a-thon.",
				"id":12,
				"order":6,
				"scent":"Radiant Berries",
				"shade":"#E5B417"
			},
			"tranquil":{
				"color":"#00afab",
				"description":"You're in a zone free from any everyday bothers, so the odds of you getting riled up are few and very far between. Since you're got no drama to save for your mama, it's only right to kick back and enjoy the miles and miles of smooth sailing ahead.\n\n        Did you know scent can affect mood? Add vanilla and amber notes the next time you want to recreate these types of mellow vibes.",
				"headline":"Real-time data suggests your bothers are few and far between.",
				"id":3,
				"order":9,
				"scent":"Lavender & Vanilla",
				"shade":"#007F70"
			},
			"wild":{
				"color":"#742f8b",
				"description":"These days, you're living wild and free. Heavy emphasis on the wild. With that free-range feeling roaring within you, the day doesn't stand a chance at taming you.\n\n        Did you know scent can actually have an effect on your emotions? Unlock this uncaged feeling in you again with fragrances like watermelon and grapefruit.",
				"headline":"Real-time data shows you're not one to be tamed.",
				"id":16,
				"order":15,
				"scent":"Radiant Berries",
				"shade":"#5F117C"
			},
			"worried":{
				"color":"#626b99",
				"description":"So many thoughts racing through your head. And none of them are all that jolly. A trip down uneasy street is never fun, but at least there's a bit of good news to share: scents can make a difference in what you're feeling. So, if you're looking to subtract a few worries, treat your nose to a few notes of juniper or spruce.   ",
				"headline":"Real-time data infers you've taken a detour down uneasy street.",
				"id":15,
				"order":12,
				"scent":"Balsem & Fir",
				"shade":"#4A547C"
			}
		};

	return {
		noop : function() {},
		isObject : function(obj) {
			return obj && Object.prototype.toString.call(obj) === '[object Object]';
		},
		isArray : function(arr) {
			return arr && ((Array.isArray && Array.isArray(arr)) || Object.prototype.toString.call(arr) === '[object Array]');
		},
		isString : function(str) {
			return str && Object.prototype.toString.call(str) === '[object String]';
		},
		midPointBtwn : function(x1, y1, x2, y2) {
			return {
			    x: x1 + (x2 - x1) / 2,
			    y: y1 + (y2 - y1) / 2
			};
		},
		mod : function(x, y) {
		    return x - y * floor(x / y);
		},
		mix : function(x, y, a) {
		    return x * (1 - a) + y * a;
		},
		dotV3 : function(v1, v2) {
		    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
		},
		distanceToCenter : function(x, y) {
		    var dX = x/w - .5,
		        dY = y/h - .5;

		    return sqrt(dX * dX + dY * dY); 
		},
		randBtwn : function(x, y, intOnly) {
		    intOnly = intOnly || false;
		    var rand = random() * ((y-x)+1) + x;
		    return intOnly || rand > y ? floor(rand) : rand;
		},
		// glitch-related utils, adapted from glsls:
		fract : function(x) {
		    return x - floor(x);
		},
		clamp : function(x, minVal, maxVal) {
		    return min(max(x, minVal), maxVal);
		},
		step : function(edge, x) {
		    return x < edge ? 0 : 1;
		},
		smoothstep : function(edge0, edge1, x) {
		    var t = min(max((x - edge0) / (edge1 - edge0), 0), 1);
		    return isNaN(t) ? 0 : t * t * (3 - 2 * t);
		},
		getCurrentTime : function() {
			return new Date().getTime();
		},
		// fixes all float values in a given collection to 2 decimal places, in place:
		printify : function(collection) {
			this.each(collection, function(i, value) {
				if (this.isObject(value) || this.isArray(value)){
					this.printify(value);
				}
				else if (typeof value === 'number') {
					collection[i] = collection[i].toFixed(2);
				}
			});
		},
		getSign : function(n) {
			return n >= 0;
		},
		getVectorMagnitude : function(vector) {
			return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
		},
		getVectorMagnitude2D : function(vector) {
			return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		},
		each : function(collection, callback) {
			var i, len;
			if (this.isArray(collection)) {
				len = collection.length;
				for (i = 0; i < len; i++) {
					callback(i, collection[i]);
				}
			} else if (this.isObject(collection)) {
				for (i in collection) {
					if (collection.hasOwnProperty(i)) {
						callback(i, collection[i]);
					}
				}
			}
		},
		getMood : function(x, y) {
			var key = y + 5 * x;
			return this.keyToMood(key);
		},
		keyToMood : function(key) {
			var mood;

			if (this.isString(key)) {
				mood = key;
			}
			else if (isNaN(key) || key < 0 || key > 19) {
				return false;	
			}
			else {
				this.each(moods, function(m, data) {
					if (key === moods[m].id) mood = m;
				});			
			}

			return $.extend(true, {emotion: mood}, moods[mood]);
		},
		moodToKey : function(mood) {
			return (moods[mood]) ? moods[mood].id : false;
		},
		// given a mood id or a mood string, returns the pleasantness and activity vals
		getPleasantnessAndActivity : function(mood) {
			var result = {};

			if (this.isString(mood)) {
				mood = this.moodToKey(mood);	
			}
			if (isNaN(mood)) return false;

			return {
				p : mood % 5,
				a : Math.floor(mood / 5)
			};
		},
		getRandomMood : function() {
			var key = this.randBtwn(0, 19, true),
				mood = Object.keys(moods)[key];

			return $.extend(true, {emotion: mood}, moods[key]);
		},
		dataURItoBlob : function(dataURI) {
		    if(typeof dataURI !== 'string'){
		        throw new Error('Invalid argument: dataURI must be a string');
		    }
		    dataURI = dataURI.split(',');
		    var type = dataURI[0].split(':')[1].split(';')[0],
		        byteString = atob(dataURI[1]),
		        byteStringLength = byteString.length,
		        arrayBuffer = new ArrayBuffer(byteStringLength),
		        intArray = new Uint8Array(arrayBuffer);
		    for (var i = 0; i < byteStringLength; i++) {
		        intArray[i] = byteString.charCodeAt(i);
		    }
		    return new Blob([intArray], {
		        type: type
		    });
		},
		isKiosk : function() {
			return false;
		},
		// determines a new mood from given seed, weather and social moods,
		// as an offset from the seed mood:
		// can accept mood parameters as strings or keys
		translateMood : function(seed, weather, social) {
			// we get a new mood by moving one mood in the direction of 
			// the pull vector, which is weather by default, and social 
			// in case the weather and seed are identical
			var pullFactor = (seed !== weather) ? weather : social,
				// find the pleasantness and activity values:
				seedVec = this.getPleasantnessAndActivity(seed),
				pullVec = this.getPleasantnessAndActivity(pullFactor);

			var dP = pullVec.p - seedVec.p,
				dA = pullVec.a - seedVec.a;

			dP = this.clamp(dP, -1, 1);
			dA = this.clamp(dA, -1, 1);

			var newMood = this.clamp((seedVec.p + dP), 0, 4) + 5 * this.clamp((seedVec.a + dA), 0, 3);
			
			return this.keyToMood(newMood).emotion;
		}
	};   
}());