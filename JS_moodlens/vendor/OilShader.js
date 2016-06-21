var OilShader = (function () {
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
        pow = Math.pow,
        
        e = Math.E,
        PI = Math.PI, 
        sqrt2Pi = sqrt(2 * PI),


        // helper functions:        
        mod = function(x, y) {
            return x - y * floor(x / y);
        },

        mix = function(x, y, a) {
            var result;
            if(Utils.isArray(x)) {
                if(x.length === 2) {
                    return mixV2(x, y, a);
                } else if (x.length === 3) {
                    return mixV3(x, y, a);
                } else if (x.length === 4) {
                    return mixV4(x, y, a);
                }
            } else {
                result = x * (1 - a) + y * a;            
            }
            return result;
        },

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
        
        dotV3 = function(v1, v2) {
            return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
        },

        dotV2 = function(v1, v2) {
            return v1[0] * v2[0] + v1[1] * v2[1];
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

        rand = function(co) {
            return fract(sin(dotV2(co, [12.9898, 78.233])) * 43758.5453);
        },

        noise2f = function(p) {
            var ip = [floor(p[0]), floor(p[1])];
            var u = [fract(p[0]), fract(p[1])];

            u[0] = u[0] * u[0] * (3 - 2 * u[0]);
            u[1] = u[1] * u[1] * (3 - 2 * u[1]);

            var res = mix(
                mix(rand(ip), rand([ip[0]+1, ip[1]]), u[0]),
                mix(rand([ip[0], ip[1]+1]), rand([ip[0]+1,ip[1]+1]), u[0]),
                u[1]
            );

            return res * res;
        },

        fbm = function(c) {
            var f = 0;
            var w = 0.1;
            for (var i = 0; i < 8; i++) {
                f += w * noise2f(c);
                c[0] *= 2.0;
                c[1] *= 2.0;
                w *= 0.5;
            }
            return f;
        },

        pattern = function(p, q, r) {
            var aa = [p[0] + 0 * 1 * 5, p[1] + 0 * 1 * 5];
            q[0] = fbm(aa);
            var bb = [p[0] + 1, p[1] + 1];
            q[1] = fbm(bb);
            var cc = [p[0] + 1 * q[0] + 1.7 + 0.15 * 1 * 2,
                      p[1] + 1 * q[1] + 9.2 + 0.15 * 1 * 2];
            r[0] = fbm(cc);
            var dd = [p[0] + 1 * q[0] + 8.3 + 0.126 * 1 * 2,
                      p[1] + 1 * q[1] + 2.8 + 0.126 * 1 * 2];
            r[1] = fbm(dd);
            var ee = [p[0] + 1 * r[0] + 0 * 1,
                      p[1] + 1 * r[1] + 0 * 1];
            var result = fbm(ee);
            var resultsComb = [result, q[0], q[1], r[0], r[1]];
            return resultsComb;
        },

        screenV3 = function(s, d) {
            var r = s[0] + d[0] - s[0] * d[0];
            var g = s[1] + d[1] - s[1] * d[1];
            var b = s[2] + d[2] - s[2] * d[2];
            var rgb = [r,g,b];
            return rgb;
        },

        overlayFloat = function(s, d) {
            return (d < 0.5) ? 2 * s * d : 1 - 2 * (1-s) * (1-d);
        },

        overlayV3 = function(s, d) {
            var c = [0,0,0];
            c[0] = overlayFloat(s[0],d[0]);
            c[1] = overlayFloat(s[1],d[1]);
            c[2] = overlayFloat(s[2],d[2]);
            return c;
        },

        rgb2hsv = function(c) {
            var k = [0, -1/3, 2/3, -1];

            var p = mixV4([c[2],c[1],k[3],k[2]], [c[1],c[2],k[0],k[1]], step(c[2],c[1]));
            var q = mixV4([p[0],p[1],p[3],c[0]], [c[0],p[1],p[2],p[0]], step(p[0],c[0]));

            var d = q[0] - min(q[3], q[1]);
            var e = 0.0000000001;

            return [abs(q[2] + (q[3] - q[1]) / (6 * d + e)), d / (q[0] + e), q[0]];
        },

        hsv2rgb = function(c) {
            var k = [1, 2/3, 1/3, 3];
            var px = abs(fract(c[0] + k[0]) * 6 - k[3]);
            var py = abs(fract(c[0] + k[1]) * 6 - k[3]);
            var pz = abs(fract(c[0] + k[2]) * 6 - k[3]);
            var p = [px, py, pz];

            var r = c[2] * mix(k[0], clamp(p[0] - k[0], 0, 1), c[1]);
            var g = c[2] * mix(k[0], clamp(p[1] - k[0], 0, 1), c[1]);
            var b = c[2] * mix(k[0], clamp(p[2] - k[0], 0, 1), c[1]);

            var rgb = [r,g,b];
            return rgb;
        },

        saturation = function(s, d) {
            d = rgb2hsv(d);
            d[1] = rgb2hsv(s)[1];
            return hsv2rgb(d);
        },

        sampleThis = function(_x, _y, delta, coordX, coordY) {
            
            var u = (coordX + _x);///w; //this gives a normalized value.
            var v = (coordY + _y);///h;

            // u *= w;
            // v *= h;

            u += delta[0];
            v += delta[1];

            // var u = coordX + _x;    //this does NOT give a normalized value.
            // u += delta[0];
            // var v = coordY + _y;
            // v += delta[1];
            // v = h - v;

            // var u = coordX + delta[0];
            // var v = coordX + delta[1];

            var newPos = round((v) * w + (u)) * 4;
            if (newPos > 0 && newPos < inPxls.length - 4) {
                var rgb =   [   inPxls[newPos]  /255,
                                inPxls[newPos+1]/255,
                                inPxls[newPos+2]/255];
                return rgb;
            } else {
                var outOfRange = [0,0,0];
                return outOfRange;
            }
        },

        length1V = function(x) {
            var xx = x * x;
            return sqrt(xx);
        },

        length2V = function(x, y) {
            var xx = x * x;
            var yy = y * y;
            return sqrt(xx + yy);
        },

        length3V = function(x,y,z) {
            var xx = x * x;
            var yy = y * y;
            var zz = z * z;
            return sqrt(xx + yy + zz);
        },

        ////// uniforms:

        color1 = [0.101961, 0.619608, 0.666667],
        color2 = [0.666667, 0.666667, 0.498039],
        color3 = [0,0,0.164706],
        color4 = [0.666667,1,1],
        radius = 10,
        lumi = [0.2126, 0.7152, 0.0722],
       
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


        getColorAt = function (x, y, normalized) {
            var pos = getPosAt(x, y),
                colors = [inPxls[pos++], inPxls[pos++], inPxls[pos++], inPxls[pos]];

            if (pos < 0 || pos > (h * w * 4))
                return [0,0,0,255];
            if (normalized) {
                colors[0] /= 255;
                colors[1] /= 255;
                colors[2] /= 255;
                colors[3] /= 255; 
            }
            return colors;
        },

        colorPixelAt = function (x, y, color, normalized) {
            var pos = getPosAt(x, y);
            outPxls[pos++] = (normalized) ? color[0] * 255 : color[0];
            outPxls[pos++] = (normalized) ? color[1] * 255 : color[1];
            outPxls[pos++] = (normalized) ? color[2] * 255 : color[2];
            outPxls[pos] = 255;
        },

        getPosAt = function (x, y) {
            return floor((y * w + x) * 4);
        },


        // we call this on every pixel, passing in the x and y coordinates within
        // canvas
        shadePixel = function (x, y) {
            // cache the pixel positions inside the image data array:
            // var hey = [0,98];
            // console.log(rand(hey));
            
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

            inC = getColorAt(x, y);

            var src_size = [1/w, 1/h];
            var uv = [x/w, y/h];
            var n = ((radius + 1) * (radius + 1));
            var i;
            var j;
            var m0 = [0,0,0];
            var m1 = [0,0,0];
            var m2 = [0,0,0];
            var m3 = [0,0,0];
            var s0 = [0,0,0];
            var s1 = [0,0,0];
            var s2 = [0,0,0];
            var s3 = [0,0,0];

            var c = [0,0,0];
            var q = [0,0];
            var r = [0,0];

            var c3 = [1000 * uv[0], 1000 * uv[1]];
            var c3forF = [c3[0] * 0.01, c3[1] * 0.01];
            // var f = pattern(c3forF, q, r);  //THIS NEEDS TO SET A BUNCH OF THINGS, NOT JUST F!!!!

            var patternResult = pattern(c3forF, q, r);
            
            var f = patternResult[0];
            q = [patternResult[1], patternResult[2]];
            r = [patternResult[3], patternResult[4]];

            var colR = mix(color1[0],color2[0],clamp((f*f)*4,0,1));
            var colG = mix(color1[1],color2[1],clamp((f*f)*4,0,1));
            var colB = mix(color1[2],color2[2],clamp((f*f)*4,0,1));

            colR = color2[0];
            colG = color2[1];
            colB = color2[2];

            colR = mix(colR, color3[0], clamp(length2V(q[0], q[1]), 0.0, 1.0));
            colG = mix(colG, color3[1], clamp(length2V(q[0], q[1]), 0.0, 1.0));
            colB = mix(colB, color3[2], clamp(length2V(q[0], q[1]), 0.0, 1.0));

            colR = mix(colR, color4[0], clamp(length1V(r[0]), 0.0, 1.0));
            colG = mix(colG, color4[1], clamp(length1V(r[0]), 0.0, 1.0));
            colB = mix(colB, color4[2], clamp(length1V(r[0]), 0.0, 1.0));

            var col2R = (0.2*f*f*f+0.6*f*f+0.5*f)*colR;
            var col2G = (0.2*f*f*f+0.6*f*f+0.5*f)*colG;
            var col2B = (0.2*f*f*f+0.6*f*f+0.5*f)*colB;



            var delta = [col2R * 0.025, col2G * 0.025];


            
            var hc1 = sampleThis(-1,-1,delta,x,y);
            var hc2 = sampleThis( 0,-1,delta,x,y);
            var hc3 = sampleThis( 1,-1,delta,x,y);
            var hc4 = sampleThis(-1, 1,delta,x,y);
            var hc5 = sampleThis( 0, 1,delta,x,y);
            var hc6 = sampleThis( 1, 1,delta,x,y);

            hc1 = [hc1[0] *  1.0, hc1[1] *  1.0, hc1[2] *  1.0];
            hc2 = [hc2[0] *  2.0, hc2[1] *  2.0, hc2[2] *  2.0];
            hc3 = [hc3[0] *  1.0, hc3[1] *  1.0, hc3[2] *  1.0];
            hc4 = [hc4[0] * -1.0, hc4[1] * -1.0, hc4[2] * -1.0];
            hc5 = [hc5[0] * -2.0, hc5[1] * -2.0, hc5[2] * -2.0];
            hc6 = [hc6[0] * -1.0, hc6[1] * -1.0, hc6[2] * -1.0];

            var hc = [
                    hc1[0] + hc2[0] + hc3[0] + hc4[0] + hc5[0] + hc6[0],
                    hc1[1] + hc2[1] + hc3[1] + hc4[1] + hc5[1] + hc6[1],
                    hc1[2] + hc2[2] + hc3[2] + hc4[2] + hc5[2] + hc6[2]
                 ];

            var vc1 = sampleThis(-1,-1,delta,x,y);
            var vc2 = sampleThis(-1, 0,delta,x,y);
            var vc3 = sampleThis(-1, 1,delta,x,y);
            var vc4 = sampleThis( 1,-1,delta,x,y);
            var vc5 = sampleThis( 1, 0,delta,x,y);
            var vc6 = sampleThis( 1, 1,delta,x,y);

            vc1 = [vc1[0] *  1.0, vc1[1] *  1.0, vc1[2] *  1.0];
            vc2 = [vc2[0] *  2.0, vc2[1] *  2.0, vc2[2] *  2.0];
            vc3 = [vc3[0] *  1.0, vc3[1] *  1.0, vc3[2] *  1.0];
            vc4 = [vc4[0] * -1.0, vc4[1] * -1.0, vc4[2] * -1.0];
            vc5 = [vc5[0] * -2.0, vc5[1] * -2.0, vc5[2] * -2.0];
            vc6 = [vc6[0] * -1.0, vc6[1] * -1.0, vc6[2] * -1.0];

            var vc = [
                    vc1[0] + vc2[0] + vc3[0] + vc4[0] + vc5[0] + vc6[0],
                    vc1[1] + vc2[1] + vc3[1] + vc4[1] + vc5[1] + vc6[1],
                    vc1[2] + vc2[2] + vc3[2] + vc4[2] + vc5[2] + vc6[2]
                    ];

            var c2 = sampleThis(0,0,delta,x,y);

            var vcvc = [vc[0] * vc[0], vc[1] * vc[1], vc[2] * vc[2]];
            var hchc = [hc[0] * hc[0], hc[1] * hc[1], hc[2] * hc[2]];
            var vcvchchc = [vcvc[0] + hchc[0], vcvc[1] + hchc[1], vcvc[2] + hchc[2]];

            c2[0] -= pow(c2[0], 0.2126) * pow(dotV3(lumi, vcvchchc), 0.5);
            c2[1] -= pow(c2[1], 0.2126) * pow(dotV3(lumi, vcvchchc), 0.5);
            c2[2] -= pow(c2[2], 0.2126) * pow(dotV3(lumi, vcvchchc), 0.5);

            uv = [uv[0] + delta[0], uv[1] + delta[1]];
            for (var j = -radius; j <= 0; ++j) {
                for (var i = -radius; i <= 0; ++i) {

                    var newU = (x + i * src_size[0]);
                    var newV = (y + j * src_size[1]);
                    var newPos = round(newV * w + newU) * 4;
                    if (newPos > 0 && newPos < inPxls.length - 4) {
                        var newR = inPxls[newPos] / 255;
                        var newG = inPxls[newPos+1] / 255;
                        var newB = inPxls[newPos+2] / 255;
                        c = [newR, newG, newB]; 
                    } else { //overflow
                        c = [0,0,0];
                    }
                    m0[0] += c[0];
                    m0[1] += c[1];
                    m0[2] += c[2];
                    s0[0] += c[0] * c[0];
                    s0[1] += c[1] * c[1];
                    s0[2] += c[2] * c[2];
                }
            }

            for (var j = -radius; j <= 0; ++j) {
                for (var i = 0; i <= radius; ++i) {
                    var newU = x + i * src_size[0];
                    var newV = y + j * src_size[1];
                    var newPosR = round((newV * w + newU) * 4);
                    var newPosG = round((newV * w + newU) * 4) + 1;
                    var newPosB = round((newV * w + newU) * 4) + 2;
                    if (newPosR > 0 && newPosR < inPxls.length - 4) {
                        var newR = inPxls[newPosR] / 255;
                        var newG = inPxls[newPosG] / 255;
                        var newB = inPxls[newPosB] / 255;
                        c = [newR, newG, newB];
                    } else { //overflow
                        c = [0,0,0];
                    }
                    m1[0] += c[0];
                    m1[1] += c[1];
                    m1[2] += c[2];
                    s1[0] += c[0] * c[0];
                    s1[1] += c[1] * c[1];
                    s1[2] += c[2] * c[2];
                }
            }

            for (var j = 0; j <= radius; ++j) {
                for (var i = 0; i <= radius; ++i) {
                    var newU = x + i * src_size[0];
                    var newV = y + j * src_size[1];
                    var newPosR = round((newV * w + newU) * 4);
                    var newPosG = round((newV * w + newU) * 4) + 1;
                    var newPosB = round((newV * w + newU) * 4) + 2;
                    if (newPosR > 0 && newPosR < inPxls.length - 4) {
                        var newR = inPxls[newPosR] / 255;
                        var newG = inPxls[newPosG] / 255;
                        var newB = inPxls[newPosB] / 255;
                        c = [newR, newG, newB];
                    } else { //overflow
                        c = [0,0,0];
                    }
                    m2[0] += c[0];
                    m2[1] += c[1];
                    m2[2] += c[2];
                    s2[0] += c[0] * c[0];
                    s2[1] += c[1] * c[1];
                    s2[2] += c[2] * c[2];
                }
            }

            for (var j = 0; j <= radius; ++j) {
                for (var i = -radius; i <= 0; ++i) {
                    var newU = x + i * src_size[0];
                    var newV = y + j * src_size[1];
                    var newPosR = round((newV * w + newU) * 4);
                    var newPosG = round((newV * w + newU) * 4) + 1;
                    var newPosB = round((newV * w + newU) * 4) + 2;
                    if (newPosR > 0 && newPosR < inPxls.length - 4) {
                        var newR = inPxls[newPosR] / 255;
                        var newG = inPxls[newPosG] / 255;
                        var newB = inPxls[newPosB] / 255;
                        c = [newR, newG, newB];
                    } else { //overflow
                        c = [0,0,0];
                    }
                    m3[0] += c[0];
                    m3[1] += c[1];
                    m3[2] += c[2];
                    s3[0] += c[0] * c[0];
                    s3[1] += c[1] * c[1];
                    s3[2] += c[2] * c[2];
                }
            }

            var result = [0,0,0,0];
            var min_sigma2 = 100;

            

            m0[0] /= n;
            m0[1] /= n;
            m0[2] /= n;

            s0[0] = abs(s0[0] / n - m0[0] * m0[0]);
            s0[1] = abs(s0[1] / n - m0[1] * m0[1]);
            s0[2] = abs(s0[2] / n - m0[2] * m0[2]);

            
            var sigma2 = s0[0] + s0[1] + s0[2];

            if (sigma2 < min_sigma2) {
                min_sigma2 = sigma2;
                result = [m0[0], m0[1], m0[2], 1];
            }

            m1[0] /= n;
            m1[1] /= n;
            m1[2] /= n;
            
            s1[0] = abs(s1[0] / n - m1[0] * m1[0]);
            s1[1] = abs(s1[1] / n - m1[1] * m1[1]);
            s1[2] = abs(s1[2] / n - m1[2] * m1[2]);

            sigma2 = s1[0] + s1[1] + s1[2];

            if (sigma2 < min_sigma2) {
                min_sigma2 = sigma2;
                result = [m1[0], m1[1], m1[2], 1];
            }

            m2[0] /= n;
            m2[1] /= n;
            m2[2] /= n;
            
            s2[0] = abs(s2[0] / n - m2[0] * m2[0]);
            s2[1] = abs(s2[1] / n - m2[1] * m2[1]);
            s2[2] = abs(s2[2] / n - m2[2] * m2[2]);

            sigma2 = s2[0] + s2[1] + s2[2];

            if (sigma2 < min_sigma2) {
                min_sigma2 = sigma2;
                result = [m2[0], m2[1], m2[2], 1];
            }

            m3[0] /= n;
            m3[1] /= n;
            m3[2] /= n;
            
            s3[0] = abs(s3[0] / n - m3[0] * m3[0]);
            s3[1] = abs(s3[1] / n - m3[1] * m3[1]);
            s3[2] = abs(s3[2] / n - m3[2] * m3[2]);

            sigma2 = s3[0] + s3[1] + s3[2];

            if (sigma2 < min_sigma2) {
                min_sigma2 = sigma2;
                result = [m3[0], m3[1], m3[2], 1];
            }

            var resultRGB = [result[0],result[1],result[2]];

            var res2 = overlayV3(screenV3(resultRGB, c2), resultRGB);

            var anotherX = uv[0] + col2R * 0.05;
            var anotherY = uv[1] + col2G * 0.05;

            anotherX *= w;
            anotherY *= h;

            anotherX = round(anotherX);
            anotherY = round(anotherY);

            // console.log(anotherX, anotherY);
            var anotherPosR = round((anotherY * w + anotherX) * 4);
            var anotherPosG = round((anotherY * w + anotherX) * 4) + 1;
            var anotherPosB = round((anotherY * w + anotherX) * 4) + 2;
            var col3 = [0,0,0];
            if (anotherPosR > 0 && anotherPosR < inPxls.length - 4) {
                var anotherR = inPxls[anotherPosR] / 255;
                var anotherG = inPxls[anotherPosG] / 255;
                var anotherB = inPxls[anotherPosB] / 255;

                col3 = [anotherR, anotherG, anotherB];
            } else {
                col3 = [0,0,0];
            }


            var col4 = [0,0,0];
            col4 = saturation(col3, res2); 

            outPxls[posR] = min((col4[0] * 255), 255);
            outPxls[posG] = min((col4[1] * 255), 255);
            outPxls[posB] = min((col4[2] * 255), 255);
            outPxls[posA] = 255;

            

            //result[] is a big problem.
            //rgb2hsv is broken.
            //hsv2rgb is broken.

            //i think mix is ok. i should make a vec3 mix.
            //vec3 mix is now ok. making vec4 mix.
            //all mixes tested and working. math is good. alpha blending is weirdly off but no problem there.

            //now fix rgb2hsv with new mixes.
            //rgb2hsv is fixed.

            //hsv2rgb appears to have no problem.

            //now trying saturation - appears to be ok.
            //changed screen to screenV3 and works.
            //overlay is ok.

            //values gotten by resultRGB and result definitely wrong.
            //testing more variables.
            //sigma2 doesn't give the right result, either at the end or its creation.
            //c2 is no good.
            //i think sampleThis() might be the culprit.

            //pattern results are not identical. but this shouldn't matter i believe - they are giving noise results.
            //fbm sometimes gives apparently identical results, sometimes not. noise should be next.

            //RANDOM GIVES DIFFERENT RESULTS!! but... this may be ok?!?!

            //fixed sampleThis, i believe. wrap around happens.
            //also some apparently subtle differences in sampleThis.

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