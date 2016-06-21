var Presets = (function(){ 
    var presets = {
    "default": {
        "first-pass": {
            "firstScreenR": 0,
            "firstScreenG": 0,
            "firstScreenB": 0,
            "fakeShadowOffset": 0.25,
            "sigma": 10
        },
        "oil": {
            "oilBlend": 0
        },
        "blender": {
            "brightness": 1.5,
            "contrast": 2.5,
            "saturation": 1,
            "rbias": [0, 0],
            "gbias": [0, 0],
            "bbias": [0, 0],
            "rmult": [1, 1],
            "gmult": [1, 1],
            "bmult": [1, 1],
            "remph": 1,
            "gemph": 1,
            "bemph": 1,
            "modr": 0.01,
            "modg": 0.01,
            "modb": 0.01,
            "sigmaR": 0.1,
            "blurSizeR": {
                "int": 0
            },
            "sigmaG": 0.1,
            "blurSizeG": {
                "int": 20
            },
            "sigmaB": 0.1,
            "blurSizeB": {
                "int": 0
            },
            "texOffset": [1, 1],
            "origMix": 0,
            "vignetteStr": 0,
            "rscreen": 0,
            "gscreen": 0,
            "bscreen": 0,
            "glitchDensity": 0.3,
            "glitchLineDensity": 100,
            "glitchOscillation": 0,
            "glitchOffset": 0,
            "glitchBlur": 0,
            "glitchStr": 0.3,
            "glitchDensity2": 0.82,
            "glitchLineDensity2": 400,
            "glitchOscillation2": 6,
            "glitchOffset2": 0.28,
            "glitchBlur2": 0,
            "glitchStr2": 0.3,
            "rglitch": 1,
            "gglitch": 1,
            "bglitch": 1,
            "glitchColorRandom": 0,
            "noiseRGBoffset": [0, 0],
        },
        "last-pass": {
            "blurSize": {
                "int": 50
            },
            "horizontalPass": {
                "int": 1
            },
            "sigma": 9.0,
            "blurSizeSplit": {
                "int": 10
            },
            "sigmaSplit": 9.0,
            "windNoise": [0, 0],
            "windStrMod": 0,
            "windOscMod1": 0,
            "windOscMod2": 0,
            "windBlendStr": 0,
            "splitBlurOffset": [0, 0],
            "splitBlurPos": 0,
            "splitBlurStr": 0,
            "splitBlurBlend": 0
        }
    },
    "optimistic": {
        "color": {
            "blender": {
                "saturation": 1.6291,
                "noiseRGBoffset": [18.2, 0.2]
            },
        },
        "channel": {
            "blender": {
                "bbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        }
    },
    "exhilarated": {
        "color": {
            "blender": {
                "saturation": 1.2,
                "noiseRGBoffset": [-1, 0.5],
                "rscreen": -0.3345,
                "gscreen": -0.6182,
                "bscreen": -0.7855
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.6927,
                "glitchLineDensity": 106.3636,
                "glitchOscillation": 0.2727,
                "glitchOffset": 0.54,
                "glitchBlur": 0,
                "glitchStr": 1.0,
                "glitchDensity2": 0.7691,
                "glitchLineDensity2": 124.5455,
                "glitchOscillation2": 4.8182,
                "glitchOffset2": 0.0018,
                "glitchBlur2": 0,
                "glitchStr2": 1.0,
                "rglitch": 2,
                "gglitch": 1,
                "bglitch": 1
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windNoise": [-4.75, -2.5],
                "windStrMod": 6.6757,
                "windOscMod1": 75.9459,
                "windOscMod2": 95.4054,
                "windBlendStr": 0,
            }
        }
    },
    "jubilant": {
        "color": {
            "blender": {
                "saturation": 1.2,
                "noiseRGBoffset": [8.5, 0],
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 0.4459,
                "splitBlurStr": 30,
                "splitBlurBlend": -0.0486
            }
        },
        "channel": {
            "blender": {
                "gbias": [
                    Utils.randBtwn(-1.5, 1.5) / 100,
                    Utils.randBtwn(-1.5, 1.5) / 100
                ]
            }
        }
    },
    "joyful": {
        "color": {
            "blender": {
                "saturation": 1.42,
                "noiseRGBoffset": [-5.8, 0.5]
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 3.5811,
                "splitBlurStr": 30,
                "splitBlurBlend": -0.0703
            }
        },
        "channel": {
            "blender": {
                "gbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 2.1351,
                "windOscMod1": 10.5405,
                "windOscMod2": 9.4595,
            }
        }
    },
    "inspired": {
        "color": {
            "blender": {
                "saturation": 1.54,
                "noiseRGBoffset": [-15.8, 0.5],
                "rscreen": -1,
                "gscreen": 0,
                "bscreen": -0.4218
            }
        },
        "channel": {
            "blender": {
                "bbias": [
                    Utils.randBtwn(-1.5, 1.5) / 100,
                    Utils.randBtwn(-1.5, 1.5) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windNoise": [-1.25, 1.25],
                "windStrMod": 5.4865,
                "windOscMod1": 35.4054,
                "windOscMod2": 100,
            }
        }
    },
    "tranquil": {
        "color": {
            "blender": {
                "noiseRGBoffset": [9.3, -0.2],
                "rscreen": -1,
                "gscreen": 0.0655,
                "bscreen": -0.1455
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        }
    },
    "invigorated": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-3.0667, -2.1176],
                "rscreen": -1,
                "gscreen": -0.3491,
                "bscreen": 0.2327
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.5291,
                "glitchLineDensity": 97.2727,
                "glitchOscillation": 3.9091,
                "glitchOffset": 0.46,
                "glitchBlur": 0,
                "glitchStr": 1.0,
                "glitchDensity2": 0.0,
                "glitchLineDensity2": 4.5455,
                "glitchOscillation2": 3.7273,
                "glitchOffset2": 0.6418,
                "glitchBlur2": 0.0491,
                "glitchStr2": 0.9836,
                "rglitch": 1.4818,
                "gglitch": 1,
                "bglitch": 1.5436
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windNoise": [-1.25, 1.25],
                "windStrMod": 8.1081,
                "windOscMod1": 1.3514,
                "windOscMod2": 19.1892,
            }
        }
    },
    "energized": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-17.99, -23.95],
                "saturation": 1.22
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.8164,
                "glitchLineDensity": 300.9091,
                "glitchOscillation": 9.5455,
                "glitchOffset": 0.1218,
                "glitchBlur": 0,
                "glitchStr": 1.0,
                "glitchDensity2": 0.3836,
                "glitchLineDensity2": 250,
                "glitchOscillation2": 1,
                "glitchOffset2": 0.5509,
                "glitchBlur2": 0,
                "glitchStr2": 1.0,
                "rglitch": 2,
                "gglitch": 1.1364,
                "bglitch": 1
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1.5, 1.5) / 100,
                    Utils.randBtwn(-1.5, 1.5) / 100
                ]
            }
        }
    },
    "wild": {
        "color": {
            "blender": {
                "noiseRGBoffset": [7.5333, 6.7059],
                "saturation": 1.48,
                "rscreen": -0.0727,
                "gscreen": -0.6982,
                "bscreen": 0.2255
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 3.7432,
                "splitBlurStr": 30,
                "splitBlurBlend": -0.1
            }
        },
        "channel": {
            "blender": {
                "bbias": [
                    Utils.randBtwn(-2, 2) / 100,
                    Utils.randBtwn(-2, 2) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 9.1081,
                "windOscMod1": 100,
                "windOscMod2": 100,
            }
        }
    },
    "calm": {
        "color": {
            "blender": {
                "noiseRGBoffset": [2.8, 0]
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        },
    },
    "relaxed": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-2.9, 0]
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.6091,
                "glitchLineDensity": 73.6364,
                "glitchOscillation": 10.8182,
                "glitchOffset": 0.4236,
                "glitchBlur": 0.3291,
                "glitchStr": 0.6818,
                "glitchDensity2": 0.4309,
                "glitchLineDensity2": 117.2727,
                "glitchOscillation2": 3.7273,
                "glitchOffset2": 0.5255,
                "glitchBlur2": 0,
                "glitchStr2": 0.5327,
                "rglitch": 1.4491,
                "gglitch": 1.3364,
                "bglitch": 1
            },
            "last-pass": {
                "splitBlurPos": 1.7703,
                "splitBlurStr": 3.6486,
                "splitBlurBlend": -0.1
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        }
    },
    "carefree": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-1.4, -2.9],
                "saturation": 1.25,
                "rscreen": 0.2473,
                "gscreen": -0.1091,
                "bscreen": -0.4655
            },
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 4.3108,
                "splitBlurStr": 17.5946,
                "splitBlurBlend": -0.1
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 1.9189,
                "windOscMod1": 83.5135,
                "windOscMod2": 0.8108,
                "windBlendStr": -0.0811,
                "windNoise": [0.25, 0.5]
            }
        }
    },
    "refreshed": {
        "color": {
            "blender": {
                "noiseRGBoffset": [9.3, 0]
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.1945,
                "glitchLineDensity": 35.4545,
                "glitchOscillation": 2.0909,
                "glitchOffset": 0.5473,
                "glitchBlur": 0.0018,
                "glitchStr": 1.0,
                "rglitch": 1.3909,
                "gglitch": 1,
                "bglitch": 1.6891,
            },
            "last-pass": {
                "splitBlurPos": 5,
                "splitBlurStr": 26.027,
                "splitBlurBlend": -0.1
            }
        },
        "channel": {
            "blender": {
                "rbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        }
    },
    "peaceful": {
        "color": {
            "blender": {
                "noiseRGBoffset": [2.8, 0],
                "saturation": 0.66
            },
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 3.1486,
                "splitBlurStr": 26.027,
                "splitBlurBlend": -0.1
            }
        },
        "channel": {
            "blender": {
                "gbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        }
    },
    "anxious": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-7.6, -7.5],
                "rscreen": -0.3345,
                "gscreen": -0.6182,
                "bscreen": -0.7855
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 2.5,
                "splitBlurStr": 30,
                "splitBlurBlend": -0.1
            }
        },
        "channel": {
            "blender": {
                "bbias": [
                    Utils.randBtwn(-2, 2) / 100,
                    Utils.randBtwn(-2, 2) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 8.7838,
                "windOscMod1": 94.3243,
                "windOscMod2": 88.3784,
                "windBlendStr": -0.0811,
                "windNoise": [-3.25, -0.75]
            }
        }
    },
    "worried": {
        "color": {
            "blender": {
                "noiseRGBoffset": [19.1, -0.1],
                "rscreen": -0.4727,
                "gscreen": -0.3691,
                "bscreen": -0.08
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 4.0135,
                "splitBlurStr": 30,
                "splitBlurBlend": 0.0324
            },
            "blender": {
                "glitchDensity": 0.7836,
                "glitchLineDensity": 75.4546,
                "glitchOscillation": 9.5455,
                "glitchOffset": 0.5473,
                "glitchBlur": 0.0018,
                "glitchStr": 1,
                "glitchDensity2": 0.8164,
                "glitchLineDensity2": 197.2727,
                "glitchOscillation2": 14.2727,
                "glitchOffset2": 0.1327,
                "glitchBlur2": 0.4745,
                "glitchStr2": 1,
                "rglitch": 1,
                "gglitch": 1.2345,
                "bglitch": 1.78
            }
        },
        "channel": {
            "blender": {
                "gbias": [
                    Utils.randBtwn(-2, 2) / 100,
                    Utils.randBtwn(-2, 2) / 100
                ]
            }
        }
    },
    "indifferent": {
        "color": {
            "blender": {
                "noiseRGBoffset": [5.7, 5.7],
                "rscreen": -0.0655,
                "gscreen": -0.3927,
                "bscreen": 0.0509
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 1.7162,
                "splitBlurStr": 9.8108,
                "splitBlurBlend": 0.0324
            }
        },
        "channel": {
            "blender": {
                "gbias": [
                    Utils.randBtwn(-2, 2) / 100,
                    Utils.randBtwn(-2, 2) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 1.4324,
                "windOscMod1": 94.3243,
                "windOscMod2": 88.3784,
                "windBlendStr": -0.0811,
                "windNoise": [-3.25, -0.75]
            }
        }
    },
    "confident": {
        "color": {
            "blender": {
                "noiseRGBoffset": [5.2, -4.1176],
                "saturation": 0.8,
                "rscreen": 0.3855,
                "gscreen": -0.6182,
                "bscreen": -0.7855
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.5145,
                "glitchLineDensity": 84.5455,
                "glitchOscillation": 15.7273,
                "glitchOffset": 0.5473,
                "glitchBlur": 0.0018,
                "glitchStr": 1,
                "glitchDensity2": 0.0,
                "glitchLineDensity2": 197.2727,
                "glitchOscillation2": 4.0909,
                "glitchOffset2": 0.1327,
                "glitchBlur2": 0.1036,
                "glitchStr2": 1,
                "rglitch": 2,
                "gglitch": 1,
                "bglitch": 1
            },
            "last-pass": {
                "splitBlurPos": 2.6351,
                "splitBlurStr": 30,
                "splitBlurBlend": 0.0624
            }
        },
        "channel": {
            "blender": {
                "bbias": [
                    Utils.randBtwn(-1, 1) / 100,
                    Utils.randBtwn(-1, 1) / 100
                ]
            }
        }
    },
    "silly": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-8.7, 0],
                "rscreen": 0.3855,
                "gscreen": 0.2255,
                "bscreen": -1
            }
        },
        "glitch": {
            "last-pass": {
                "splitBlurPos": 3.8784,
                "splitBlurStr": 30,
                "splitBlurBlend": 0.0324
            }
        },
        "channel": {
            "blender": {
                "gbias": [
                    Utils.randBtwn(-1.5, 1.5) / 100,
                    Utils.randBtwn(-1.5, 1.5) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 2.8919,
                "windOscMod1": 1.3514,
                "windOscMod2": 18.6486,
                "windBlendStr": -0.0811,
                "windNoise": [-3.25, -0.75]
            }
        }
    },
    "creative": {
        "color": {
            "blender": {
                "noiseRGBoffset": [-11.8, 0],
                "rscreen": 0.4,
                "gscreen": -0.4218,
                "bscreen": -0.0073
            }
        },
        "glitch": {
            "blender": {
                "glitchDensity": 0.3473,
                "glitchLineDensity": 84.5455,
                "glitchOscillation": 15.7273,
                "glitchOffset": 0.5473,
                "glitchBlur": 0.0018,
                "glitchStr": 0.7582,
                "glitchDensity2": 0.7836,
                "glitchLineDensity2": 102.7273,
                "glitchOscillation2": 4.0909,
                "glitchOffset2": 0.7764,
                "glitchBlur2": 0.1036,
                "glitchStr2": 0.7073,
                "rglitch": 1.6891,
                "gglitch": 1,
                "bglitch": 1.3582
            },
            "last-pass": {
                "splitBlurPos": 2.2568,
                "splitBlurStr": 15.6486,
                "splitBlurBlend": 0.0324
            }
        },
        "channel": {
            "blender": {
                "bbias": [
                    Utils.randBtwn(-2, 2) / 100,
                    Utils.randBtwn(-2, 2) / 100
                ]
            }
        },
        "wind": {
            "last-pass": {
                "windStrMod": 1.8108,
                "windOscMod1": 100,
                "windOscMod2": 84.5946,
                "windBlendStr": -0.0811,
                "windNoise": [-3.25, -0.75]
            }
        }
    }
};
    /**
     * Exposes a single `getPreset` method, for building a preset object, which we use in setting
     * the uniforms in the shaders. Depends on $.extend
     */
    return {
        /**
         * Creates a preset object for the shaders, based on the passed in parameters, follows
         * these steps:
         *    1. start with the default preset values (in `presets.default`)
         *    2. If a mood and at least one effect is requested, merge the uniforms corresponding
         *       to that mood and effect into the presets, and return the result.
         *
         * @param {string} mood The mood for which the preset is requested, i.e. "optimistic"
         * @param {string | Array} effects The effect whose preset is requested: 
         *     "color", "glitch", "channel", or "wind". Can be an array if requesting 
         *     multiple effects - i.e. ["color", "wind"]. If no effects are provided,
         *     we grab them all!
         * @param {boolean} includeDefaults If set to false, the method will only merge
         *     the requested effect presets. default is true
         * @return {Object} The merged preset object.
         */
        getPreset : function(mood, effects, includeDefaults) {
            var preset = {};
            if (includeDefaults || includeDefaults === undefined) {
                preset = $.extend(true, preset, presets.default);
            }
            if (!mood || !presets[mood.toLowerCase()]) {
                return preset;
            }
            mood = mood.toLowerCase();
            // if no effects are provided explicitly, we"ll return them all
            if (!effects) effects = Object.keys(presets[mood]);
            if (Utils.isArray(effects)) {
                // effects must be an array of effects:
                Utils.each(effects, function(id, effect) {
                    effect = effect.toLowerCase();

                    if (presets[mood][effect]) {
                        preset = $.extend(true, preset, presets[mood][effect]);
                    }
                });
            }
            // effects must be a string matching a single effect:
            else if (presets[mood][effects]) {
                preset = $.extend(true, preset, presets[mood][effects]);
            }
            return preset;
        },

        // builds a composite preset when passed in ids for 
        getCompositePreset : function(color, channelSeparation, wind, distress) {  
            var preset = {},
                colorMood = Utils.keyToMood(color).emotion,
                channelMood = Utils.keyToMood(channelSeparation).emotion,
                windMood = Utils.keyToMood(wind).emotion,
                distressMood = Utils.keyToMood(distress).emotion;

            preset = $.extend(true, preset, presets.default);        

            if (colorMood && presets[colorMood] && presets[colorMood].color) {
                preset = $.extend(true, preset, presets[colorMood].color);
            } 

            if (channelMood && presets[channelMood] && presets[channelMood].channel) {
                preset = $.extend(true, preset, presets[colorMood].channel);
            }

            if (windMood && presets[windMood] && presets[windMood].wind) {
                preset = $.extend(true, preset, presets[windMood].channel);
            }

            if (distressMood && presets[distressMood] && presets[distressMood].glitch) {
                preset = $.extend(true, preset, presets[distressMood].glitch);
            }

            return preset;
        }
    };
}());