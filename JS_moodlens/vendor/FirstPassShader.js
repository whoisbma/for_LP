var FirstPassShader = (function () {
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

        normpdf = function(x, sigma) {
            return 0.39894*exp(-0.5*x*x/(sigma*sigma))/sigma;
        },

        normpdf3 = function(v, sigma) {
            return 0.39894*exp(-0.5*dotV3(v,v)/(sigma*sigma))/sigma;
        },


        ////// uniforms:
        fakeShadowOffset,
        sigma,
       
       
        ////// cached values



        ////// sets the default uniform values here, if needed
        reset = function () {
            fakeShadowOffset = 0.25;
            sigma = 10;
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
            fakeShadowOffset = preset.fakeShadowOffset;
            sigma = preset.sigma;
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
            var pos = round((y * w + x) * 4),
                posR = pos, 
                posG = pos + 1, 
                posB = pos + 2, 
                posA = pos + 3,

            // SOMETHING TO KEEP IN MIND:
            // inPxls contains color intensities as unsigned bytes from 0 to 255.
            // intensities in the original shaders were normalized, so below we 
            // normalize inR, inG, inB:

            // get the original color of this pixel:
                inR = inPxls[posR] / 255,
                inG = inPxls[posG] / 255,
                inB = inPxls[posB] / 255,
                inA = inPxls[posA] / 255;

            var c = [inR, inG, inB];

            var bsigma = 0.14;
            var msize = 10;
            var kSize = floor((msize-1)/2);
            var kernel = [];

            for (var i = 0; i < msize; i++) {
                kernel.push(0);
            }

            var final_color = [0, 0, 0];
            
            var z = 0;

            for (i = 0; i <= kSize; ++i) {
                kernel[kSize+i] = kernel[kSize-i] = normpdf(i, sigma);
            }


            var cc = [0,0,0];
            var factor = 0;
            var bZ = 1/normpdf(0, bsigma);

            for (i = -kSize; i <= kSize; ++i) {
                for (var j = -kSize; j <= kSize; ++j) {
                    var ttx = (x+i); 
                    var tty = (y+j);
                    ttx = round(ttx);
                    tty = round(tty);
                    var newPos = round((tty * w + ttx) * 4);
                    var newPosR = newPos,
                        newPosG = newPos + 1,
                        newPosB = newPos + 2;
                    // console.log(newPos, newPosR, newPosG, newPosB);
                    if ( newPos > 0 && newPos < inPxls.length - 4) {
                        var newR = inPxls[newPosR]/255;
                        var newG = inPxls[newPosG]/255;
                        var newB = inPxls[newPosB]/255;
                        cc = [newR, newG, newB];
                        var ummm = [newR-c[0], newG-c[1], newB-c[2]];
                        // console.log(ummm);
                        factor = normpdf3(ummm, bsigma) * bZ * kernel[kSize+j]*kernel[kSize+i];
                    
                        z += factor;
                       
                        final_color[0] += (factor * cc[0]);
                        final_color[1] += (factor * cc[1]);
                        final_color[2] += (factor * cc[2]);
                        
                    }
                }
            }
            // console.log(final_colour);
            //-----------------------
            // write out the de-normalized color values 
            // outPxls[posR] = min(round((final_color[0]/z) * 255), 255);
            // outPxls[posG] = min(round((final_color[1]/z) * 255), 255);
            // outPxls[posB] = min(round((final_color[2]/z) * 255), 255);
            // outPxls[posA] = min(round(inA * 255), 255);

            var pct = distanceToCenter(x,y);

            // outPxls[posR] = min(round((pct) * 255), 255);
            // outPxls[posG] = min(round((pct) * 255), 255);
            // outPxls[posB] = min(round((pct) * 255), 255);
            // outPxls[posA] = min(round(inA * 255), 255);

            pct = exp(pct);
            // var st = [x/w, y/h];
            // var pct = 0;
            // pct = 
            // console.log(pct);

            final_color[0] = final_color[0]/z;
            final_color[1] = final_color[1]/z;
            final_color[2] = final_color[2]/z;

            final_color[0] += (1.0 - (final_color[0]) ) * 
                    (((2.0 * pct-1.0) * fakeShadowOffset) * 
                    (1.0 - (final_color[0]) ));
            final_color[1] += (1.0 - (final_color[1]) ) * 
                    (((2.0 * pct-1.0) * fakeShadowOffset) * 
                    (1.0 - (final_color[1]) ));
            final_color[2] += (1.0 - (final_color[2]) ) * 
                    (((2.0 * pct-1.0) * fakeShadowOffset) * 
                    (1.0 - (final_color[2]) ));

            outPxls[posR] = min(round((final_color[0]) * 255), 255);
            outPxls[posG] = min(round((final_color[1]) * 255), 255);
            outPxls[posB] = min(round((final_color[2]) * 255), 255);
            outPxls[posA] = min(round(inA * 255), 255);


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