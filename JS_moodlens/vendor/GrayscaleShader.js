var GrayscaleShader = (function () {
    var inCtx, inData, inPxls,          // original context and pixels
        outC, outCtx, outData, outPxls, // resulting canvas, context and pixels
        w, h, numPixels, len,
        
        // some shortcuts:
        abs = Math.abs,
        sqrt = Math.sqrt,
        exp = Math.exp,
        min = Math.min,
        max = Math.max,
        round = Math.round,
        floor = Math.floor,
        random = Math.random,
        sin = Math.sin,
        
        e = Math.E,
        PI = Math.PI, 
        sqrt2Pi = sqrt(2 * PI),


        // helper functions:        
        mod = function(x, y) {
            return x - y * floor(x / y);
        },

        mix = function(x, y, a) {
            return x * (1 - a) + y * a;
        },
        
        dotV3 = function(v1, v2) {
            return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
        },
        
        distanceToCenter = function(x, y) {
            var dX = x/w - .5,
                dY = y/h - .5;

            return sqrt(dX * dX + dY * dY); 
        },

        randBtwn = function (x, y, intOnly) {
            intOnly = intOnly || false;
            var rand = random() * ((y-x)+1) + x;
            return intOnly || rand > y ? floor(rand) : rand;
        },

        // glitch-related utils, adapted from glsls:
        fract = function (x) {
            return x - floor(x);
        },

        clamp = function (x, minVal, maxVal) {
            return min(max(x, minVal), maxVal);
        },

        step = function (edge, x) {
            return x < edge ? 0 : 1;
        },

        smoothstep = function (edge0, edge1, x) {
            var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
            return isNaN(t) ? 0 : t * t * (3 - 2 * t);
        },

        //---------------------------------------------------------------------------------------------
        //hsb -> rgb conversion algorithm, used for glitchy shapes, works with floats
        //---------------------------------------------------------------------------------------------
        hsb2rgb = function (hue, sat, bri){
            var hue6 = hue * 6,
                invSat = 1 - sat,
                r = clamp(abs(mod(hue6, 6) - 3) - 1, 0, 1),
                g = clamp(abs(mod(hue6 + 4, 6) - 3) - 1, 0, 1 ),
                b = clamp(abs(mod(hue6 + 2, 6) - 3) - 1, 0, 1 );

            r = r * r * (3 - 2 * r);
            g = g * g * (3 - 2 * g);
            b = b * b * (3 - 2 * b);

            return [
                // bri * mix(1, r, sat),
                // bri * mix(1, g, sat),
                // bri * mix(1, b, sat)
                bri * (invSat + r * sat),
                bri * (invSat + g * sat),
                bri * (invSat + b * sat)
            ];
        },


        ////// uniforms:

       
       
        ////// cached values



        ////// sets the default uniform values here, if needed
        reset = function () {
            
            
        },

        /*
         * Takes in a preset object built by presets.js
         * Basically an object literal, whose keys correspond to
         * local variables in the shader (but may not always)
         * Each shader should have their own:
         */
        loadPreset = function (preset) {

            // uniform = preset.uniform;

            // if the uniforms are ints, add a .int suffix:
            // someUniformInt = preset.sameUniform.int;
        },

        // cache some values based on the current state variables:
        // These will be shader specific, and maybe we don't need them
        // in the other shaders, can ignore this for now:
        prepareToShade = function ( ) {
            
           
        },


        // we call this on every pixel, passing in the x and y coordinates within
        // canvas
        shadePixel = function (x, y) {
            // cache the pixel positions inside the image data array:

            // the color data is single dimensional, so we convert the x and y coords
            // to an index within the array (pos), and we cache each of the 
            // color component positions (posR, posG, posB, posA)...
            var pos = Math.round((y * w + x) * 4),
                posR = pos, posG = pos + 1, posB = pos + 2, posA = pos + 3,


                // SOMETHING TO KEEP IN MIND:
                // inPxls contains color intensities as unsigned bytes from 0 to 255.
                // intensities in the original shaders were normalized, so below we 
                // normalize inR, inG, inB:

                // get the original color of this pixel:
                inR = inPxls[posR],// / 255,
                inG = inPxls[posG],// / 255,
                inB = inPxls[posB],// / 255,
                inA = inPxls[posA];// / 255;

                inR *= 0.3;
                inG *= 0.59;
                inB *= 0.11;

                inR = inR+inG+inB;
                inG = inR;
                inB = inR;

            //-----------------------
            // write out the de-normalized color values 
            outPxls[posR] = inR;//min(round(inR * 255), 255);
            outPxls[posG] = inG;//min(round(inG * 255), 255);
            outPxls[posB] = inB;//min(round(inB * 255), 255);
            outPxls[posA] = inA;//min(round(inA * 255), 255);
        };

    return {          
        // takes the canvas element containing the original photo, 
        // and iterates over each pixel to generate the moodgram
        // can optionally take a preset parameter, which will
        // contain a key for any uniform whose default value should
        // be changed before shading.
        // returns a new canvas containing the moodgram
        shade: function (c, preset, inPlace) {
            inPlace = inPlace || false; 
            outC = document.createElement('canvas');
            
            w = outC.width = c.width;
            h = outC.height = c.height;
            
            inCtx = c.getContext('2d');
            inData = inCtx.getImageData(0,0,w,h);
            inPxls = inData.data;
            outCtx = outC.getContext('2d');
            outData = outCtx.getImageData(0,0,w,h);
            outPxls = outData.data;
            numPixels = w * h;
            len = outPxls.length;

            // set the uniform values based on the preset object
            loadPreset(preset);

            // will cache any intermediate values, based on the already set
            // uniforms:
            prepareToShade();

            // iterate over the pixels, shading each one:
            for ( var x = 0; x < w; x++ ) {
                for ( var y = 0; y < h; y++ ) {
                    shadePixel(x, y);
                }
            }

            if ( inPlace ) {
                inCtx.putImageData(outData, 0, 0);
                return c;
            }
            else {
                outCtx.putImageData(outData, 0, 0);
                return outC;
            }
        }
    };
})();