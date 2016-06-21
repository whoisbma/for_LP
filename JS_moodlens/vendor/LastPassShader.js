var LastPassShader = (function () {
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

        dotV2 = function(v1, v2) {
            return v1[0] * v2[0] + v1[1] * v2[1];
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

        random2 = function(st) { 
            st = [dotV2(st, [127.1, 311.7]),
                  dotV2(st, [269.5, 183.3])];
            st[0] = -1 + 2 * fract(sin(st[0]) * 43758.5453123);
            st[1] = -1 + 2 * fract(sin(st[1]) * 43758.5453123);
            return st;
        },

        valueNoise = function(st) {
            var i = [floor(st[0]), floor(st[1])];
            var f = [fract(st[0]), fract(st[1])];
            var u = [f[0] * f[0] * (3 - 2 * f[0]),
                     f[1] * f[1] * (3 - 2 * f[1])];

            return mix(mix(dotV2(random2([i[0] + 0, i[1] + 0]),[f[0] - 0, f[1] - 0]),
                           dotV2(random2([i[0] + 1, i[1] + 0]),[f[0] - 1, f[1] - 0]),u[0]),
                       mix(dotV2(random2([i[0] + 0, i[1] + 1]),[f[0] - 0, f[1] - 1]),
                           dotV2(random2([i[0] + 1, i[1] + 1]),[f[0] - 1, f[1] - 1]),u[0]),u[1]);
        },


        ////// uniforms:
        blurSize,
        sigma,
        windNoise,
        windStrNoise,
        windOscMod1,
        windOscMod2,
        windBlendStr,

        blurSizeSplit,
        sigmaSplit,
        splitBlurOffset,
        splitBlurPos,
        splitBlurStr,
        splitBlurBlend,
       
       
        ////// cached values



        ////// sets the default uniform values here, if needed
        reset = function () {
            blurSize = 50;
            sigma = 9;
            windNoise = [0,0];
            windStrMod = 0;
            windOscMod1 = 0;
            windOscMod2 = 0;
            windBlendStr = 0;

            blurSizeSplit = 10;
            sigmaSplit = 9;
            splitBlurOffset = [0,0];
            splitBlurPos = 0;
            splitBlurStr = 0;
            splitBlurBlend = 0;
            
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
            blurSize = preset.blurSize.int;
            sigma = preset.sigma;
            windNoise = preset.windNoise;
            windStrMod = preset.windStrMod;
            windOscMod1 = preset.windOscMod1;
            windOscMod2 = preset.windOscMod2;
            windBlendStr = preset.windBlendStr;

            blurSizeSplit = preset.blurSizeSplit.int;
            sigmaSplit = preset.sigmaSplit;
            splitBlurOffset = preset.splitBlurOffset;
            splitBlurPos = preset.splitBlurPos;
            splitBlurStr = preset.splitBlurStr;
            splitBlurBlend = preset.splitBlurBlend;
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

            var v_texCoord = [(x + 0.5)/w, (y + 0.5)/h];

            var texOffset = [1/w, 1/h];

            //WIND
            var blurMultiplyVec = 
                        [1 * fract(windOscMod1 * sin(v_texCoord[1] * windOscMod2)) 
                                     * ((inR + inG + inB * 0.1) * windStrMod), 0];

            var incrementalGaussian = [0,0,0];
            incrementalGaussian[0] = 1 / (sqrt2Pi * sigma);
            incrementalGaussian[1] = exp(-0.5 / (sigma*sigma));
            incrementalGaussian[2] = incrementalGaussian[1] * incrementalGaussian[1];

            var avgValue = [0,0,0,0];
            var coefficientSum = 0; 

            avgValue[0] += inR * incrementalGaussian[0];
            avgValue[1] += inG * incrementalGaussian[0];
            avgValue[2] += inB * incrementalGaussian[0];
            avgValue[3] += inA * incrementalGaussian[0];

            coefficientSum += incrementalGaussian[0];

            incrementalGaussian[0] *= incrementalGaussian[1];
            incrementalGaussian[1] *= incrementalGaussian[2];

            for (var i = 1; i <= 25; i++) {
                var rgb = [0,0,0,0];
                var pos = [0,0];
                pos[0] = v_texCoord[0] + i * texOffset[0] * blurMultiplyVec[0];
                pos[1] = v_texCoord[1] + i * texOffset[1] * blurMultiplyVec[1];
                pos[0] = round(pos[0] * w);
                pos[1] = round(pos[1] * h);

                var newPos = Math.round((pos[1] * w + pos[0]) * 4),
                newPosR = newPos, 
                newPosG = newPos + 1, 
                newPosB = newPos + 2, 
                newPosA = newPos + 3;

                if (newPos > 0 && newPos < inPxls.length - 4) {
                    rgb[0] = inPxls[newPosR] / 255;
                    rgb[1] = inPxls[newPosG] / 255;
                    rgb[2] = inPxls[newPosB] / 255;
                    rgb[3] = inPxls[newPosA] / 255;
                } else {
                    rgb = [0,0,0,0];
                }

                avgValue[0] += rgb[0] * incrementalGaussian[0];
                avgValue[1] += rgb[1] * incrementalGaussian[0];
                avgValue[2] += rgb[2] * incrementalGaussian[0];
                avgValue[3] += rgb[3] * incrementalGaussian[0];
                coefficientSum += 1 * incrementalGaussian[0];
                incrementalGaussian[0] *= incrementalGaussian[1];
                incrementalGaussian[1] *= incrementalGaussian[2];
            }

            var windBlur = [0,0,0];
            windBlur[0] = avgValue[0] / coefficientSum;
            windBlur[1] = avgValue[1] / coefficientSum;
            windBlur[2] = avgValue[2] / coefficientSum;

            var noisePos = [v_texCoord[0] + windNoise[0], v_texCoord[1] + windNoise[1]];
            var osc = 0.4 * valueNoise(noisePos) + 0.5;
            osc = smoothstep(0.2, 0.8, osc);
            var selectiveWind = [osc * windBlur[0],
                                 osc * windBlur[1],
                                 osc * windBlur[2]];




            //BLUR
            var blurMultiplyVecSplit = [splitBlurStr * sin(v_texCoord[1] * 0.3 - splitBlurPos), 0];

            var incrementalGaussianSplit = [0,0,0];
            incrementalGaussianSplit[0] = 1 / (sqrt2Pi * sigmaSplit);
            incrementalGaussianSplit[1] = exp(-0.5 / (sigmaSplit*sigmaSplit));
            incrementalGaussianSplit[2] = incrementalGaussianSplit[1] * incrementalGaussianSplit[1];

            var avgValueSplit = [0,0,0,0];
            var coefficientSumSplit = 0; 

            avgValueSplit[0] += inR * incrementalGaussianSplit[0];
            avgValueSplit[1] += inG * incrementalGaussianSplit[0];
            avgValueSplit[2] += inB * incrementalGaussianSplit[0];
            avgValueSplit[3] += inA * incrementalGaussianSplit[0];

            coefficientSumSplit += incrementalGaussianSplit[0];

            incrementalGaussianSplit[0] *= incrementalGaussianSplit[1];
            incrementalGaussianSplit[1] *= incrementalGaussianSplit[2];

            for (var i = 1; i <= 10; i++) {
                var rgb = [0,0,0,0];
                var pos = [0,0];
                pos[0] = v_texCoord[0] + i * texOffset[0] * blurMultiplyVecSplit[0];
                pos[1] = v_texCoord[1] + i * texOffset[1] * blurMultiplyVecSplit[1];
                pos[0] = round(pos[0] * w);
                pos[1] = round(pos[1] * h);

                var newPos = Math.round((pos[1] * w + pos[0]) * 4),
                newPosR = newPos, 
                newPosG = newPos + 1, 
                newPosB = newPos + 2, 
                newPosA = newPos + 3;

                if (newPos > 0 && newPos < inPxls.length - 4) {
                    rgb[0] = inPxls[newPosR] / 255;
                    rgb[1] = inPxls[newPosG] / 255;
                    rgb[2] = inPxls[newPosB] / 255;
                    rgb[3] = inPxls[newPosA] / 255;
                } else {
                    rgb = [0,0,0,0];
                }

                avgValueSplit[0] += rgb[0] * incrementalGaussianSplit[0];
                avgValueSplit[1] += rgb[1] * incrementalGaussianSplit[0];
                avgValueSplit[2] += rgb[2] * incrementalGaussianSplit[0];
                avgValueSplit[3] += rgb[3] * incrementalGaussianSplit[0];
                coefficientSumSplit += 0.9 * incrementalGaussianSplit[0];
                incrementalGaussianSplit[0] *= incrementalGaussianSplit[1];
                incrementalGaussianSplit[1] *= incrementalGaussianSplit[2];
            }

            var splitBlur = [0,0,0];
            splitBlur[0] = avgValueSplit[0] / coefficientSumSplit;
            splitBlur[1] = avgValueSplit[1] / coefficientSumSplit;
            splitBlur[2] = avgValueSplit[2] / coefficientSumSplit;

            inR *= 0.35 - splitBlurBlend - windBlendStr;
            inG *= 0.35 - splitBlurBlend - windBlendStr;
            inB *= 0.35 - splitBlurBlend - windBlendStr;
            
            selectiveWind[0] *= 0.5 + windBlendStr;
            selectiveWind[1] *= 0.5 + windBlendStr;
            selectiveWind[2] *= 0.5 + windBlendStr;

            splitBlur[0] *= 0.3 + splitBlurBlend;
            splitBlur[1] *= 0.3 + splitBlurBlend;
            splitBlur[2] *= 0.3 + splitBlurBlend;

            var finalRGB =  [inR + selectiveWind[0] + splitBlur[0],
                             inG + selectiveWind[1] + splitBlur[1],
                             inB + selectiveWind[2] + splitBlur[2]]

            outPxls[posR] = min(floor(finalRGB[0] * 255), 255);
            outPxls[posG] = min(floor(finalRGB[1] * 255), 255);
            outPxls[posB] = min(floor(finalRGB[2] * 255), 255);
            outPxls[posA] = 255;


            //-----------------------
            // write out the de-normalized color values 
            // outPxls[posR] = min(round(inR * 255), 255);
            // outPxls[posG] = min(round(inG * 255), 255);
            // outPxls[posB] = min(round(inB * 255), 255);
            // outPxls[posA] = min(round(inA * 255), 255);
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