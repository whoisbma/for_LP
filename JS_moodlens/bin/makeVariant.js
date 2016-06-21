/* Phantom JS script to generate variants/moodgrams */

// Usage: phantomjs --web-security=false makeVariant.js <abs-path-to-img-src> <path-to-destination> <mood-data>
// Dependency: MoodgramShader.js should be in the same directory

var fs = require('fs'),
	system = require('system'),
	page,
	pathSrc,
	pathDest,
	imgSrc;
if (system.args.length < 3) {
    console.log("Usage: phantomjs --web-security=false makeVariant.js ABSOLUTE_PATH_TO_IMAGE ABS_PATH_TO_DESTINATION MOOD_DATA");
    phantom.exit(1);
}
else {
	pathSrc = system.args[1];
	pathDest = system.args[2];
	moodData = system.args[3];
	if ( fs.isFile(pathSrc) ) {

		// Create a page where we can process the image
		page = require('webpage').create();
		page.content = '<html><body style="margin:0;padding:0"><canvas id="moodgram_src"></canvas></body></html>';
		imgSrc = encodeURI('file://' + pathSrc);

		// inject the moodgram shader:
		if ( page.injectJs('../vendor/jquery.min.js') && 
			 page.injectJs('../vendor/utils.js') && 
			 page.injectJs('../vendor/presets.js') &&
			 page.injectJs('../vendor/GrayscaleShader.js') && 
			 page.injectJs('../vendor/FirstPassShader.js') && 
			 page.injectJs('../vendor/OilShader.js') && 
			 page.injectJs('../vendor/BlenderShader.js') && 
			 page.injectJs('../vendor/LastPassShader.js') ) {

			page.evaluate(function (imgSrc, moodData) {
				var img = new Image(),
					c = document.getElementById('moodgram_src'),
					ctx = c.getContext('2d'),
					w, h;

				img.src = imgSrc;

				window.callPhantom({
					status: imgSrc
				});

				img.onload = function ( ) {
					// the image loaded, inject it into the canvas, and shade it in place:
					w = c.width = img.width;
					h = c.height = img.height;
					ctx.drawImage(img, 0, 0);

					moodData = JSON.parse(moodData);

					var latestMood = Utils.moodToKey(moodData.latestMood),
						social = moodData.social,
						weather = moodData.futureWeather;

					var mood = Utils.translateMood(latestMood, weather, social);
					var preset = Presets.getCompositePreset(mood, mood, weather, social);

					GrayscaleShader.shade(c, null, true);
                    FirstPassShader.shade(c, preset['first-pass'], true);
                    OilShader.shade(c, preset['oil-shader'], true);
                    BlenderShader.shade(c, preset['blender'], true);
                    LastPassShader.shade(c, preset['last-pass'], true);
					
					// notify phantomjs:
					window.callPhantom({
						width: w,
						height: h,
						output: JSON.stringify({
							status : 'success',
							mood : mood
						}),
					});
				};

			}, imgSrc, moodData);

			page.onCallback = function ( data ) {
				// the page finished, so let's resize it
				// and draw the new file:					
				page.viewportSize = {
					width: data.width,
					height: data.height,
				}

				page.render(pathDest);
				console.log(data.output);
				phantom.exit();
			};

			page.onError = function (msg, trace) {
				var msgStack = ['PHANTOM ERROR: ' + msg];
				if (trace && trace.length) {
					msgStack.push('TRACE:');
					trace.forEach(function(t) {
						msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
					});
				}
				console.log('The script encountered an error on the frontend. Is the --web-security=false option set?' + msgStack.join('\n'));
				phantom.exit(1);
			}

			phantom.onError = function (msg, trace) {
				var msgStack = ['PHANTOM ERROR: ' + msg];
				if (trace && trace.length) {
					msgStack.push('TRACE:');
					trace.forEach(function(t) {
						msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
					});
				}
				console.error(msgStack.join('\n'));
				phantom.exit(1);
			}

		} else {
			console.log('{"status":"error","message":"Unable to inject the javascript dependencies."');
			phantom.exit(1);
		}

	}
	else {
		console.log(pathSrc + ' does not exist.');
	}
}
