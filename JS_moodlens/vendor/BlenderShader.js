var BlenderShader = (function () {
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

        // mix = function(x, y, a) {
        //     var result;
        //     if(Utils.isArray(x)) {
        //         if(x.length === 2) {
        //             return mixV2(x, y, a);
        //         } else if (x.length === 3) {
        //             return mixV3(x, y, a);
        //         } else if (x.length === 4) {
        //             return mixV4(x, y, a);
        //         }
        //     } else {
        //         result = x * (1 - a) + y * a;            
        //     }
        //     return result;
        // },

        mixV2 = function(x, y, a) {
            var xx = x[0] * (1 - a) + y[0] * a;
            var yy = x[1] * (1 - a) + y[1] * a;
            var result = [xx,yy];
            return result;
        },

        mixV3 = function(x, y, a) {
            var xx = x[0] * (1 - a) + y[0] * a;
            var yy = x[1] * (1 - a) + y[1] * a;
            var zz = x[2] * (1 - a) + y[2] * a;
            var result = [xx,yy,zz];
            return result;
        },

        mixV4 = function(x, y, a) {
            var xx = x[0] * (1 - a) + y[0] * a;
            var yy = x[1] * (1 - a) + y[1] * a;
            var zz = x[2] * (1 - a) + y[2] * a;
            var ww = x[3] * (1 - a) + y[3] * a;
            var result = [xx,yy,zz,ww];
            return result;
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
            // st[0] = st[0] / w;
            // st[1] = st[1] / h;
            var i = [floor(st[0]), floor(st[1])];
            var f = [fract(st[0]), fract(st[1])];
            var u = [f[0] * f[0] * (3 - 2 * f[0]),
                     f[1] * f[1] * (3 - 2 * f[1])];

            // return mix(dotV2(random2([i[0] + 0, i[1] + 0]),[f[0] - 0, f[1] - 0]),
            //                dotV2(random2([i[0] + 1, i[1] + 0]),[f[0] - 1, f[1] - 0]),u[0]);

            return mix(mix(dotV2(random2([i[0] + 0, i[1] + 0]),[f[0] - 0, f[1] - 0]),
                           dotV2(random2([i[0] + 1, i[1] + 0]),[f[0] - 1, f[1] - 0]),u[0]),
                       mix(dotV2(random2([i[0] + 0, i[1] + 1]),[f[0] - 0, f[1] - 1]),
                           dotV2(random2([i[0] + 1, i[1] + 1]),[f[0] - 1, f[1] - 1]),u[0]),u[1]);
        },

        //---------------------------------------------------------------------------------------------
        //low level rect drawing with a glitchy mask - used for all the glitches so far
        //---------------------------------------------------------------------------------------------
        glitch = function (coord, origin, lw, lineD, str, blur, density, colorMod, offset, oscil) {
            var coordX = coord[0],
                coordY = coord[1], 
                originX = origin[0],
                originY = origin[1],
                lwX = lw[0],
                lwY = lw[1],

                lineComponent = fract(coordY * lineD), 
                lines = [lineComponent, lineComponent, lineComponent, 1], 

                lineStepComponent = step(density, lineComponent),
                lineStep = [lineStepComponent, lineStepComponent, lineStepComponent, step(density, 1)],

                yblur = abs(sin((coordY + offset) * oscil)),

                b = smoothstep(originY, originY + lwY * yblur, coordY),
                l = smoothstep(originX, originX + lwX * blur, coordX),
                t = smoothstep(1 - (lwY + originY), 1 - (lwY * (1-yblur) + originY), 1-coordY),
                r = smoothstep(1 - (lwY + originY), 1 - (lwX * (1-blur) + originX), 1-coordX),

                pctStr = b * l * t * r * str,
                
                colorComponent = lineStepComponent * pctStr,
                color = [colorComponent, colorComponent, colorComponent, lineStep[3] * pctStr],
                
                hsbRgbSeed = hsb2rgb(coordX * 0.3 + offset, 1, 1);


            color[0] *= colorMod[0] * hsbRgbSeed[0];
            color[1] *= colorMod[1] * hsbRgbSeed[1];
            color[2] *= colorMod[2] * hsbRgbSeed[2];

            return color;
        },


        ////// uniforms:

        //brcosa - brightness, contrast, saturation
        brightness,   // default 1.0      min -5.0        max 5.0 (will realistically be much smaller)
        contrast,     // default 1.0      min -5.0        max 5.0
        saturation,   // default 1.0      min -5.0        max 5.0

        //rgb channels, 2d vectors in array form =
        rbias,    // default 0.0, 0.0     min -.1, -.1    max .1, .1
        gbias,    // default 0.0, 0.0     min -.1, -.1    max .1, .1
        bbias,    // default 0.0, 0.0     min -.1, -.1    max .1, .1
        // rmult,    // default 1.0, 1.0     min 0.9, 0.9    max 1.1, 1.1
        // gmult,    // default 1.0, 1.0     min 0.9, 0.9    max 1.1, 1.1
        // bmult,    // default 1.0, 1.0     min 0.9, 0.9    max 1.1, 1.1

        // denormalized bias:
        rbiasLocal,
        gbiasLocal,
        bbiasLocal,

        // // white colors become intensified
        // remph,    // default 1.0          min 0.0         max 2.0
        // gemph,    // default 1.0          min 0.0         max 2.0
        // bemph,    // default 1.0          min 0.0         max 2.0

        // darker colors become intensified
        rscreen,  // default 0.0          min -1.0        max 1.0
        gscreen,  // default 0.0          min -1.0        max 1.0
        bscreen,  // default 0.0          min -1.0        max 1.0

        //colorMod threshold effect, creates grain:
        modr,     // default 0.01         min 0.01        max 0.5
        modg,     // default 0.01         min 0.01        max 0.5
        modb,     // default 0.01         min 0.01        max 0.5

        //blur
        blurSizeR,  // default 0         min 0        max 50
        blurSizeG,  // default 0         min 0        max 50
        blurSizeB,  // default 0         min 0        max 50   

        //----------------------------------------
        //BLUR----------------------------------------
        //this uses a gaussian blur algorithm i found.
        //it starts with getting the blurSize uniforms.
        numBlurPixelsPerSideR,
        numBlurPixelsPerSideG,
        numBlurPixelsPerSideB,

        texOffset,
        // horizontalPass = 0, // 0 or 1 to indicate vertical or horizontal pass
        // how you calculate the blur
        sigmaR,   // default 0.01         min 0.01        max 20.0
        sigmaG,   // default 0.01         min 0.01        max 20.0
        sigmaB,   // default 0.01         min 0.01        max 20.0
        //some fun math for each channel getting the sigma uniforms.
        iniGaussianRx, iniGaussianRy, iniGaussianRz,
        iniGaussianGx, iniGaussianGy, iniGaussianGz,
        iniGaussianBx, iniGaussianBy, iniGaussianBz,

        //vignette
        vignetteStr,  //default 0.0       min -1.0        max 1.0

        //original image
        origMix,  //default 0.0           min 0.0         max 1.0
        invMix,

        //glitch uniforms - two separate sets
        glitchBaseUniforms,   // uniforms to base glitch color on. currently based on remph gemph bemph
        glitchDensity,        // default 0.5      min 0.0     max 1.0 
        glitchLineDensity,    // default 100.0    min 0.0     max 500.0
        glitchOscillation,    // default 0.0      min 0.0     max 50.0
        glitchOffset,         // default 0.0      min 0.0     max 1.0
        glitchBlur,           // default 0.0      min 0.0     max 1.0
        glitchStr,            // default 0.5      min 0.0     max 1.0

        glitchDensity2,       // default 0.5      min 0.0     max 1.0 
        glitchLineDensity2,   // default 100.0    min 0.0     max 500.0
        glitchOscillation2,   // default 0.0      min 0.0     max 50.0
        glitchOffset2,        // default 0.0      min 0.0     max 1.0
        glitchBlur2,          // default 0.0      min 0.0     max 1.0
        glitchStr2,           // default 0.5      min 0.0     max 1.0;

        rglitch,
        gglitch,
        bglitch,

        //noise for RGB
        noiseRGBoffset,

        ///////// cached values:::::

        invContrast,
        invSaturation,

        invRscreen,
        invGscreen,
        invBscreen,


        /// sets the default uniform values here:
        reset = function () {
            
            //brcosa - brightness, contrast, saturation
            brightness = 1;   // default 1.0      min -5.0        max 5.0 (will realistically be much smaller)
            contrast = 1;     // default 1.0      min -5.0        max 5.0
            saturation = 1;   // default 1.0      min -5.0        max 5.0

            //rgb channels, 2d vectors in array form =
            rbias = [0,0];    // default 0.0, 0.0     min -.1, -.1    max .1, .1
            gbias = [0,0];    // default 0.0, 0.0     min -.1, -.1    max .1, .1
            bbias = [0,0];    // default 0.0, 0.0     min -.1, -.1    max .1, .1
            // rmult = [1,1];    // default 1.0, 1.0     min 0.9, 0.9    max 1.1, 1.1
            // gmult = [1,1];    // default 1.0, 1.0     min 0.9, 0.9    max 1.1, 1.1
            // bmult = [1,1];    // default 1.0; 1.0     min 0.9; 0.9    max 1.1; 1.1

            // white colors become intensified
            // remph = 1;    // default 1.0          min 0.0         max 2.0
            // gemph = 1;    // default 1.0          min 0.0         max 2.0
            // bemph = 1;    // default 1.0          min 0.0         max 2.0

            // darker colors become intensified
            rscreen = 0;  // default 0.0          min -1.0        max 1.0
            gscreen = 0;  // default 0.0          min -1.0        max 1.0
            bscreen = 0;  // default 0.0          min -1.0        max 1.0

            //colorMod threshold effect; creates grain:
            modr = 0.01;     // default 0.01         min 0.01        max 0.5
            modg = 0.01;     // default 0.01         min 0.01        max 0.5
            modb = 0.01;     // default 0.01         min 0.01        max 0.5

            //blur
            blurSizeR = 0;  // default 0         min 0        max 50
            blurSizeG = 0;  // default 0         min 0        max 50
            blurSizeB = 0;  // default 0         min 0        max 50   

            // how you calculate the blur
            sigmaR = 0.01;   // default 0.01         min 0.01        max 20.0
            sigmaG = 0.01;   // default 0.01         min 0.01        max 20.0
            sigmaB = 0.01;   // default 0.01         min 0.01        max 20.0

            //vignette
            vignetteStr = 0;  //default 0.0       min -1.0        max 1.0

            //original image
            origMix = 0;  //default 0.0           min 0.0         max 1.0

            //glitch uniforms - two separate sets
            glitchDensity = 0.5;        // default 0.5      min 0.0     max 1.0 
            glitchLineDensity = 100.0;    // default 100.0    min 0.0     max 500.0
            glitchOscillation = 0;    // default 0.0      min 0.0     max 50.0
            glitchOffset = 0;         // default 0.0      min 0.0     max 1.0
            glitchBlur = 0;           // default 0.0      min 0.0     max 1.0
            glitchStr = 0.5;            // default 0.5      min 0.0     max 1.0

            glitchDensity2 = 0.5;       // default 0.5      min 0.0     max 1.0 
            glitchLineDensity2 = 100;   // default 100.0    min 0.0     max 500.0
            glitchOscillation2 = 0;   // default 0.0      min 0.0     max 50.0
            glitchOffset2 = 0;        // default 0.0      min 0.0     max 1.0
            glitchBlur2 = 0;          // default 0.0      min 0.0     max 1.0
            glitchStr2 = 0.5;           // default 0.5      min 0.0     max 1.0;

            rglitch = 1.0;
            gglitch = 1.0;
            bglitch = 1.0;

            noiseRGBoffset = [0,0];
        },

        /*
         * Takes in a preset object built by presets.js
         * Basically an object literal, whose keys correspond to
         * local variables in the shader (but may not always)
         * Each shader should have their own
         * 
         * EXCEPT FOR INTs all others should be assigned directly
         * INT UNIFORMS should be assigned: 
         * blurSizeB = preset.blurSizeB.int;
         */
        loadPreset = function (preset) {

            brightness = preset.brightness;
            contrast = preset.contrast;
            saturation = preset.saturation;

            //rgb channels, 2d vectors in array form =
            rbias = preset.rbias;
            gbias = preset.gbias;    
            bbias = preset.bbias;
            // rmult = preset.rmult;
            // gmult = preset.gmult;
            // bmult = preset.bmult;

            // white colors become intensified
            // remph = preset.remph;
            // gemph = preset.gemph;
            // bemph = preset.bemph;

            // darker colors become intensified
            rscreen = preset.rscreen;
            gscreen = preset.gscreen;
            bscreen = preset.bscreen;

            //colorMod threshold effect; creates grain:
            modr = preset.modr;
            modg = preset.modg;
            modb = preset.modb;

            //blur
            blurSizeR = preset.blurSizeR.int;
            blurSizeG = preset.blurSizeG.int;
            blurSizeB = preset.blurSizeB.int;

            // how you calculate the blur
            sigmaR = preset.sigmaR;
            sigmaG = preset.sigmaG;
            sigmaB = preset.sigmaB;

            //vignette
            vignetteStr = preset.vignetteStr;

            //original image
            origMix = preset.origMix;

            //glitch uniforms - two separate sets
            glitchDensity = preset.glitchDensity;
            glitchLineDensity = preset.glitchLineDensity;
            glitchOscillation = preset.glitchOscillation;
            glitchOffset = preset.glitchOffset;
            glitchBlur = preset.glitchBlur;
            glitchStr = preset.glitchStr;

            glitchDensity2 = preset.glitchDensity2;
            glitchLineDensity2 = preset.glitchLineDensity2;
            glitchOscillation2 = preset.glitchOscillation2;
            glitchOffset2 = preset.glitchOffset2;
            glitchBlur2 = preset.glitchBlur2;
            glitchStr2 = preset.glitchStr2;

            rglitch = preset.rglitch;
            gglitch = preset.gglitch;
            bglitch = preset.bglitch;

            noiseRGBoffset = preset.noiseRGBoffset;

        },


        debugState = function () {
            console.log('brightness', brightness, 'contrast', contrast, 'saturation', saturation);
            console.log('rbias: ('+rbias[0] + ',' + rbias[1] + ')', 
                        'gbias: ('+gbias[0] + ',' + gbias[1] + ')',
                        'bbias: ('+bbias[0] + ',' + bbias[1] + ')');
                        // 'rmult: ('+rmult[0] + ',' + rmult[1] + ')',
                        // 'gmult: ('+gmult[0] + ',' + gmult[1] + ')',
                        // 'bmult: ('+bmult[0] + ',' + bmult[1] + ')');
            console.log('glitch strength', glitchStr, 'glitch density:', glitchDensity, 'glitch line density: ', glitchLineDensity);
        },
        
        // cache some values based on the current state variables:
        // These will be shader specific, and maybe we don't need them
        // in the other shaders, can ignore this for now:
        prepareToShade = function ( ) {
            
            // de-normalize bias values along the canvas dimensions:
            rbiasLocal = [round(rbias[0] * w), round(rbias[1] * h)];
            gbiasLocal = [round(gbias[0] * w), round(gbias[1] * h)];
            bbiasLocal = [round(bbias[0] * w), round(bbias[1] * h)];
            //some fun math for each channel getting the sigma uniforms:
            iniGaussianRx = 1 / (sqrt2Pi * sigmaR);
            iniGaussianRy = exp(-0.5 / (sigmaR * sigmaR));
            iniGaussianRz = iniGaussianRy * iniGaussianRy;

            iniGaussianGx = 1 / (sqrt2Pi * sigmaG);
            iniGaussianGy = exp(-0.5 / (sigmaG * sigmaG));
            iniGaussianGz = iniGaussianGy * iniGaussianGy;

            iniGaussianBx = 1 / (sqrt2Pi * sigmaB);
            iniGaussianBy = exp(-0.5 / (sigmaB * sigmaB));
            iniGaussianBz = iniGaussianBy * iniGaussianBy;

            //----------------------------------------
            //BLUR----------------------------------------
            //this uses a gaussian blur algorithm i found.
            //it starts with getting the blurSize uniforms.
            numBlurPixelsPerSideR = floor(blurSizeR/2);
            numBlurPixelsPerSideG = floor(blurSizeG/2);
            numBlurPixelsPerSideB = floor(blurSizeB/2);

            // uniforms to base glitch color on. currently based on remph gemph bemph
            // glitchBaseUniforms = [remph-1.0, gemph-1.0, bemph-1.0];
            glitchBaseUniforms = [rglitch - 1.0, gglitch - 1.0, bglitch - 1.0];

            // cache inverses:
            invRscreen = 1 - rscreen;
            invGscreen = 1 - gscreen;
            invBscreen = 1 - bscreen;
            invContrast = 1 - contrast;
            invSaturation = 1 - saturation;
            invMix = 1 - origMix;
        },


        // we call this on every pixel, passing in the x and y coordinates within
        // canvas
        shadePixel = function (x, y) {
            // cache the pixel positions inside the image data array:

            // the color data is single dimensional, so we convert the x and y coords
            // to an index within the array (pos), and we cache each of the 
            // color component positions (posR, posG, posB, posA)...
            var pos = (y * w + x) * 4,
                posR = pos, posG = pos + 1, posB = pos + 2, posA = pos + 3,


                // SOMETHING TO KEEP IN MIND:
                // inPxls contains color intensities as unsigned bytes from 0 to 255.
                // intensities in the original shaders were normalized, so below we 
                // normalize inR, inG, inB:

                // get the original color of this pixel:
                inR = inPxls[posR] / 255,
                inG = inPxls[posG] / 255,
                inB = inPxls[posB] / 255,
                //RGB CHANNEL POSITIONS----------------------------------------------------------------
                //create new 2d vectors to store offset positions based on rmult, rbias, etc. uniforms.
                //these new positions get plugged into our channel-specific blur calculations.
                // pr = [(round(rmult[0] * x) + rbiasLocal[0] + w) % w, (round(rmult[1] * y) + rbiasLocal[1] + h) % h],
                // pg = [(round(gmult[0] * x) + gbiasLocal[0] + w) % w, (round(gmult[1] * y) + gbiasLocal[1] + h) % h],
                // pb = [(round(bmult[0] * x) + bbiasLocal[0] + w) % w, (round(bmult[1] * y) + bbiasLocal[1] + h) % h],
                pr = [(round(1 * x) + rbiasLocal[0] + w) % w, (round(1 * y) + rbiasLocal[1] + h) % h],
                pg = [(round(1 * x) + gbiasLocal[0] + w) % w, (round(1 * y) + gbiasLocal[1] + h) % h],
                pb = [(round(1 * x) + bbiasLocal[0] + w) % w, (round(1 * y) + bbiasLocal[1] + h) % h],
                
                //these will be used to store new RGB values along with the coefficient sums.
                avgRValue = coefficientSumR = 0,
                avgGValue = coefficientSumG = 0,
                avgBValue = coefficientSumB = 0,

                offsetR = round((pr[1] * w + pr[0]) * 4),
                offsetG = round((pg[1] * w + pg[0]) * 4) + 1,
                offsetB = round((pb[1] * w + pb[0]) * 4) + 2,

                // coefficientSumR = 0,
                // coefficientSumG = 0,
                // coefficientSumB = 0,

                // incrementalGaussianRx = iniGaussianRx,
                // incrementalGaussianRy = iniGaussianRy,
                // incrementalGaussianRz = iniGaussianRz,

                // incrementalGaussianGx = iniGaussianGx,
                // incrementalGaussianGy = iniGaussianGy,
                // incrementalGaussianGz = iniGaussianGz,
                
                // incrementalGaussianBx = iniGaussianBx,
                // incrementalGaussianBy = iniGaussianBy,
                // incrementalGaussianBz = iniGaussianBz,

                r, g, b,
                channelMix,
                // channelOrigMix,
                //vignette gets applied over the whole image
                // vignetteComponent,
                // vignetteCol,
                // vignetted,
                // wX, eX, nY, sY;

            //these will be used to store new RGB values along with the coefficient sums.
            // if ( offsetR < len ){
            //     avgRValue += inPxls[offsetR] * iniGaussianRx;
            //     coefficientSumR += iniGaussianRx;
            
            //     incrementalGaussianRx *= iniGaussianRy;
            //     incrementalGaussianRy *= iniGaussianRz;
            // }
            // if ( offsetG < len ){
            //     avgGValue += inPxls[offsetG] * iniGaussianGx;
            //     coefficientSumG += iniGaussianGx;

            //     incrementalGaussianGx *= iniGaussianGy;
            //     incrementalGaussianGy *= iniGaussianGz;
            // }
            // if ( offsetB < len ){
            //     avgBValue += inPxls[offsetB] * iniGaussianBx;
            //     coefficientSumB += iniGaussianBx;

            //     incrementalGaussianBx *= iniGaussianBy;
            //     incrementalGaussianBy *= iniGaussianBz;
            // }

            
            // use the new pr, pg, pb positions in rgb averaging

            // wX = eX = pr[0]; nY = sY = pr[1];
            // for (var i = 1, nwVal, seVal; i <= numBlurPixelsPerSideR; i++) {
            //     nwVal = inPxls[(--nY * w + --wX) * 4] * incrementalGaussianRx;
            //     seVal = inPxls[(++sY * w + ++eX) * 4] * incrementalGaussianRx;
            //     if ( !isNaN(nwVal) ){
            //         avgRValue += nwVal;
            //         coefficientSumR += incrementalGaussianRx;
            //     }
            //     if ( !isNaN(seVal) ) {
            //         avgRValue += seVal;
            //         coefficientSumR += incrementalGaussianRx;
            //     }
            //     incrementalGaussianRx *= incrementalGaussianRy;
            //     incrementalGaussianRy *= incrementalGaussianRz;
            // }

            // wX = eX = pr[0]; nY = sY = pr[1];
            // for (i = 1; i <= numBlurPixelsPerSideG; i++) {
            //     nwVal = inPxls[(--nY * w + --wX) * 4] * incrementalGaussianRx;
            //     seVal = inPxls[(++sY * w + ++eX) * 4] * incrementalGaussianRx;
            //     if ( !isNaN(nwVal) ){
            //         avgGValue += nwVal;
            //         coefficientSumG += incrementalGaussianGx;
            //     }
            //     if ( !isNaN(seVal) ) {
            //         avgGValue += seVal;
            //         coefficientSumG += incrementalGaussianGx;
            //     }
            //     incrementalGaussianGx *= incrementalGaussianGy;
            //     incrementalGaussianGy *= incrementalGaussianGz;
            // }

            // wX = eX = pr[0]; nY = sY = pr[1];
            // for (i = 1; i <= numBlurPixelsPerSideB; i++) {
            //     nwVal = inPxls[(--nY * w + --wX) * 4] * incrementalGaussianRx;
            //     seVal = inPxls[(++sY * w + ++eX) * 4] * incrementalGaussianRx;
            //     if ( !isNaN(nwVal) ){
            //         avgBValue += nwVal;
            //         coefficientSumB += incrementalGaussianBx;
            //     }
            //     if ( !isNaN(seVal) ) {
            //         avgBValue += seVal;
            //         coefficientSumB += incrementalGaussianBx;
            //     }
            //     incrementalGaussianBx *= incrementalGaussianBy;
            //     incrementalGaussianBy *= incrementalGaussianBz;
            // }
            
            // create r g b values to pass on to the next effect.
            // r = avgRValue / 255 / coefficientSumR;
            // g = avgGValue / 255 / coefficientSumG;
            // b = avgBValue / 255 / coefficientSumB;

            r = inPxls[offsetR]/255;
            g = inPxls[offsetG]/255; 
            b = inPxls[offsetB]/255;

            //------------------------------------

            //RGB CHANNEL STRENGTH----------------------------------
            //get remph gemph bemph uniforms to multiply our new rgb
            // r = r * remph;
            // g = g * gemph;
            // b = b * bemph;
            //------------

            //RGB THRESHOLDING----------------------------------------------
            //modColor (formerly using texColor properties instead of r/g/b)
            //modulus operator to get some thresholding, based on modr modg modb uniforms
            r -= r - modr * floor(r / modr);
            g -= g - modg * floor(g / modg);
            b -= b - modb * floor(b / modb);
            //----------------

            //RGB SCREEN BLEND MODE------------------------------------------
            //screen blend effect on each channel, using rscreen etc uniforms
            //values of the pixels in the two layers are inverted, multiplied, and then inverted again
            r = 1 - (1 - r) * invRscreen;
            g = 1 - (1 - g) * invGscreen;
            b = 1 - (1 - b) * invBscreen;
            //------------------------------------

            //RGB NOISE--------------------------------------------
            var noisePosR = [ (((x + 0.5)/w) * 0.5) + noiseRGBoffset[0] + 500, 
                              (((y + 0.5)/h) * 0.5) + noiseRGBoffset[1] + 500 ];
            r *= valueNoise(noisePosR) * 0.4 + 0.6;

            var noisePosG = [ (((x + 0.5)/w) * 0.6) + noiseRGBoffset[0] + 600, 
                              (((y + 0.5)/h) * 0.6) + noiseRGBoffset[1] + 600 ];
            g *= valueNoise(noisePosG) * 0.4 + 0.6;

            var noisePosB = [ (((x + 0.5)/w) * 0.7) + noiseRGBoffset[0] + 700, 
                              (((y + 0.5)/h) * 0.7) + noiseRGBoffset[1] + 700 ];
            b *= valueNoise(noisePosB) * 0.4 + 0.6;
            //------------------------------------

            //COMBINE PREVIOUS OPERATIONS-------------------------
            //set a new temporary vec3 to store updated rgb values
            channelMix = [r,g,b];
            //----------------------------

            //BLEND WITH ORIGINAL TEXTURE-------------------------------------------    
            //channelOrigMix is a blend between channelMix and the original texture.
            //mix in the original texture according to the origMix uniform (0.0-1.0)
            //GLSL mix function: 
                //mix(x,y,a)
                //x: Specify the start of the range in which to interpolate.
                //y: Specify the end of the range in which to interpolate.
                //a: Specify the value to use to interpolate between x and y.
                //mix performs a linear interpolation between x and y using a to weight between them. 
                //The return value is computed as xÃ—(1âˆ’a)+yÃ—a.
            
            // channelOrigMix = [
            //     // mix(r, inR, origMix),
            //     // mix(g, inG, origMix),
            //     // mix(b, inB, origMix)
            //     r * invMix + inR * origMix,
            //     g * invMix + inG * origMix,
            //     b * invMix + inB * origMix
            // ];
            //-----------------------------------------------------------

            //BRIGHTNESS, CONTRAST, SATURATION------------------------
            //stuff like luminescence coefficients are just hard coded
            //if you wanted to operate just on the original texture and not the channel split, 
            //you could replace channelOrigMix with texColor and then blend texColor in somewhere later
            //or just write it directly to gl_fragColor
            var LumCoeff = [0.2125, 0.7154, 0.0721],
                AvgLumin = [0.5, 0.5, 0.5],
                // intensityComponent = dotV3(channelOrigMix, LumCoeff),
                intensityComponent = dotV3(channelMix, LumCoeff),
                intensity = [intensityComponent, intensityComponent, intensityComponent];
                satColor = [
                    // mix(intensity[0], channelOrigMix[0], saturation),
                    // mix(intensity[1], channelOrigMix[1], saturation),
                    // mix(intensity[2], channelOrigMix[2], saturation)
                    // intensity[0] * invSaturation + channelOrigMix[0] * saturation,
                    // intensity[1] * invSaturation + channelOrigMix[1] * saturation,
                    // intensity[2] * invSaturation + channelOrigMix[2] * saturation,
                    intensity[0] * invSaturation + channelMix[0] * saturation,
                    intensity[1] * invSaturation + channelMix[1] * saturation,
                    intensity[2] * invSaturation + channelMix[2] * saturation,
                ],
                conColor = [
                    AvgLumin[0] * invContrast + satColor[0] * contrast,
                    AvgLumin[1] * invContrast + satColor[1] * contrast,
                    AvgLumin[2] * invContrast + satColor[2] * contrast,
                ],
                brcosaColor = [
                    brightness * conColor[0],
                    brightness * conColor[1],
                    brightness * conColor[2]
                ];

            
            //VIGNETTE----------------------------------

            // pct = distanceToCenter(x, y); //get the distance from the center
            // pct = exp(pct); //get the exponent of the distance

            //map a new color to the distance, based on the vignetteStr uniform. 
            // vignetteComponent = (1-pct) * (vignetteStr);
            // vignetteCol = [
            //     vignetteComponent,
            //     vignetteComponent,
            //     vignetteComponent
            // ];


            //add vignette color to brightness/contrast/saturation color
            // vignetted = [
            //     brcosaColor[0] + vignetteCol[0], 
            //     brcosaColor[1] + vignetteCol[1], 
            //     brcosaColor[2] + vignetteCol[2], 
            // ];

            //GLITCH RECTANGLES----------------------------------------------------------------
            //4 glitch rectangles using the low level drawing function above outside of main().
            // two sets of uniforms are sent to two rectangles to create the glitching effect
            var normCoords = [ x / w, y / h ],
                glitch1 = glitch(
                    normCoords, //normalized coordinate system of the image in the UI
                    [0, 0], //lower left origin of the rectangle (normalized)
                    [1, 0.2], //width and height of the rectangle (normalized)
                    glitchLineDensity, 
                    glitchStr,
                    glitchBlur,
                    glitchDensity, 
                    glitchBaseUniforms,
                    glitchOffset,
                    glitchOscillation
                ), 

                glitch2 = glitch(
                    normCoords,
                    [0.0, 0.4],
                    [1.0, 0.4],
                    glitchLineDensity,
                    glitchStr,
                    glitchBlur,
                    glitchDensity,
                    glitchBaseUniforms,
                    glitchOffset,
                    glitchOscillation
                ),

                glitch3 = glitch(
                    normCoords,
                    [0.0, 0.2],
                    [1.0, 0.4],
                    glitchLineDensity2,
                    glitchStr2,
                    glitchBlur2,
                    glitchDensity2,
                    glitchBaseUniforms,
                    glitchOffset2,
                    glitchOscillation2
                ), 

                glitch4 = glitch(
                    normCoords,
                    [0.0, 0.8],
                    [1.0, 0.2],
                    glitchLineDensity2,
                    glitchStr2,
                    glitchBlur2,
                    glitchDensity2,
                    glitchBaseUniforms,
                    glitchOffset2,
                    glitchOscillation2
                ),

                // glitched = [
                //     vignetted[0] + glitch1[0] + glitch2[0] + glitch3[0] + glitch4[0],
                //     vignetted[1] + glitch1[1] + glitch2[1] + glitch3[1] + glitch4[1],
                //     vignetted[2] + glitch1[2] + glitch2[2] + glitch3[2] + glitch4[2],
                //     1 + glitch1[3] + glitch2[3] + glitch3[3] + glitch4[3]
                // ];
                glitched = [
                    brcosaColor[0] + glitch1[0] + glitch2[0] + glitch3[0] + glitch4[0],
                    brcosaColor[1] + glitch1[1] + glitch2[1] + glitch3[1] + glitch4[1],
                    brcosaColor[2] + glitch1[2] + glitch2[2] + glitch3[2] + glitch4[2],
                    1 + glitch1[3] + glitch2[3] + glitch3[3] + glitch4[3]
                ];

            // //-----------------------
            outPxls[posR] = min(round(glitched[0] * 255), 255);
            outPxls[posG] = min(round(glitched[1] * 255), 255);
            outPxls[posB] = min(round(glitched[2] * 255), 255);
            outPxls[posA] = min(round(glitched[3] * 255), 255);
            //noise needs a hack since it floors and fracts. i lose one or the other depending on if i pass in a normalized position or a non-normalized position.
            //revelation - gl_FragCoord passes a .5 value per pixel.
            // outPxls[posR] = min(round(valueNoise([(x + 0.5)*0.05,(y + 0.5)*0.05]) * 255), 255);
            // outPxls[posG] = min(round(valueNoise([(x + 0.5)*0.05,(y + 0.5)*0.05]) * 255), 255);
            // outPxls[posB] = min(round(valueNoise([(x + 0.5)*0.05,(y + 0.5)*0.05]) * 255), 255);
            // outPxls[posA] = 255;

            // console.log(valueNoise([x,y]));

            if ( isNaN(glitched[0]) &&  isNaN(glitched[1]) &&  isNaN(glitched[2])) {
                console.log(glitchLineDensity, glitchStr, glitchBlur, glitchDensity, glitchOffset, glitchOscillation, x, y, vignetted, glitch1, glitched, outPxls[posR], outPxls[posG], outPxls[posB], outPxls[posA]);
            }

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