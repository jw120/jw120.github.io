/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Main programme
	 *
	 */
	"use strict";
	var board_1 = __webpack_require__(1);
	var event_1 = __webpack_require__(10);
	var state_1 = __webpack_require__(5);
	var utils_1 = __webpack_require__(7);
	utils_1.runWhenDocumentReady(function () {
	    /** Holds all the game's state. This is used in many functions as if it was a global variable, its properties
	     * are mutated but the object itself (i.e., the value of the reference) is not modified anywhere*/
	    var state = {};
	    state_1.resetState(state);
	    // Draw the board for the first time
	    board_1.redrawBoard(state);
	    // Handle mouse clicks on the canvas
	    state.canvas.addEventListener("click", function (e) { return event_1.canvasClickHandler(state, e); }, false);
	    state.canvas.addEventListener("mousedown", function (e) { return event_1.canvasMouseDownHandler(state, e); }, false);
	    state.canvas.addEventListener("mouseup", function (e) { return event_1.canvasMouseUpOrOutHandler(state, e); }, false);
	    // If user drags the mouse off the canvas, treat this as a mouseup
	    state.canvas.addEventListener("mouseout", function (e) {
	        if (e && e.target && e.target === state.canvas) {
	            event_1.canvasMouseUpOrOutHandler(state, e);
	        }
	    }, false);
	    window.onresize = function () {
	        state_1.updateScale(state);
	        board_1.redrawBoard(state);
	    };
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Functions to (re)draw the board and the score
	 *
	 */
	"use strict";
	var canvas_1 = __webpack_require__(2);
	var constants_1 = __webpack_require__(3);
	var state_1 = __webpack_require__(5);
	var utils_1 = __webpack_require__(7);
	/** Shortcut to constants.boardDimensions to reduce verbosity */
	var dim = constants_1.default.boardDimensions;
	/** Shortcut to constants.colours to reduce verbosity */
	var col = constants_1.default.colours;
	/** Draw the Simon board on the canvas */
	function redrawBoard(state) {
	    // Draw the borders
	    canvas_1.fillCentredCircle(state.context, 0, 0, dim.outerBorderOutsideRadius, col.stripe);
	    canvas_1.fillCentredRectangle(state.context, 0, 0, dim.stripeWidth, dim.outerBorderOutsideRadius + dim.outerBorderInsideRadius, col.stripe);
	    canvas_1.fillCentredRectangle(state.context, 0, 0, dim.outerBorderOutsideRadius + dim.outerBorderInsideRadius, dim.stripeWidth, col.stripe);
	    canvas_1.fillCentredCircle(state.context, 0, 0, dim.innerBorderOutsideRadius, col.stripe);
	    canvas_1.fillCentredCircle(state.context, 0, 0, dim.innerBorderInsideRadius, col.centralBackground);
	    // Draw the labels for the control buttons
	    canvas_1.centredText(state.context, -0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.6, "POWER", constants_1.default.fonts.buttonLabels);
	    canvas_1.centredText(state.context, 0 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.6, "START", constants_1.default.fonts.buttonLabels);
	    canvas_1.centredText(state.context, +0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.6, "STRICT", constants_1.default.fonts.buttonLabels);
	    // Draw the rings around the control buttons
	    canvas_1.fillCentredCircle(state.context, -0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3, dim.centralButtonRingRadius, col.buttonRing);
	    canvas_1.fillCentredCircle(state.context, 0 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3, dim.centralButtonRingRadius, col.buttonRing);
	    canvas_1.fillCentredCircle(state.context, +0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3, dim.centralButtonRingRadius, col.buttonRing);
	    // Draw control buttons
	    redrawButton(state, "StartButton");
	    redrawButton(state, "PowerButton");
	    redrawButton(state, "StrictButton");
	    // Draw the note buttons
	    redrawNotes(state);
	    // Add the score
	    redrawScore(state);
	}
	exports.redrawBoard = redrawBoard;
	/** Redraw all the note buttons */
	function redrawNotes(state) {
	    redrawButton(state, "BlueButton");
	    redrawButton(state, "YellowButton");
	    redrawButton(state, "GreenButton");
	    redrawButton(state, "RedButton");
	}
	exports.redrawNotes = redrawNotes;
	/** Redraw a button based on its current state */
	function redrawButton(state, b) {
	    switch (b) {
	        case "BlueButton":
	            canvas_1.fillNoteButtonShapeCleanAlpha(state.context, 0, dim.innerBorderOutsideRadius, dim.outerBorderInsideRadius, dim.stripeWidth / 2, col.stripe, col.blueNote, state.depressed === b || state.playing === state_1.buttonToNote(b) ? constants_1.default.alphas.brightNote : constants_1.default.alphas.normalNote);
	            break;
	        case "YellowButton":
	            canvas_1.fillNoteButtonShapeCleanAlpha(state.context, 1, dim.innerBorderOutsideRadius, dim.outerBorderInsideRadius, dim.stripeWidth / 2, col.stripe, col.yellowNote, state.depressed === b || state.playing === state_1.buttonToNote(b) ? constants_1.default.alphas.brightNote : constants_1.default.alphas.normalNote);
	            break;
	        case "GreenButton":
	            canvas_1.fillNoteButtonShapeCleanAlpha(state.context, 2, dim.innerBorderOutsideRadius, dim.outerBorderInsideRadius, dim.stripeWidth / 2, col.stripe, col.greenNote, state.depressed === b || state.playing === state_1.buttonToNote(b) ? constants_1.default.alphas.brightNote : constants_1.default.alphas.normalNote);
	            break;
	        case "RedButton":
	            canvas_1.fillNoteButtonShapeCleanAlpha(state.context, 3, dim.innerBorderOutsideRadius, dim.outerBorderInsideRadius, dim.stripeWidth / 2, col.stripe, col.redNote, state.depressed === b || state.playing === state_1.buttonToNote(b) ? constants_1.default.alphas.brightNote : constants_1.default.alphas.normalNote);
	            break;
	        case "PowerButton":
	            canvas_1.fillCentredCircleCleanAlpha(state.context, -0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3, dim.centralButtonRadius, col.buttonRing, col.powerButton, state.power ? constants_1.default.alphas.onSwitch : constants_1.default.alphas.offSwitch);
	            break;
	        case "StartButton":
	            canvas_1.fillCentredCircleCleanAlpha(state.context, 0 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3, dim.centralButtonRadius, col.buttonRing, col.startButton, constants_1.default.alphas.offSwitch);
	            break;
	        case "StrictButton":
	            canvas_1.fillCentredCircleCleanAlpha(state.context, +0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3, dim.centralButtonRadius, col.buttonRing, col.strictButton, state.strict && state.power ? constants_1.default.alphas.onSwitch : constants_1.default.alphas.offSwitch);
	            break;
	        default:
	            utils_1.assertNever(b); // TS Compiler will throw an error if above cases are not exhaustive
	            throw Error("Unknown button type in drawButton: " + b);
	    }
	}
	exports.redrawButton = redrawButton;
	function redrawScore(state) {
	    var show;
	    if (state.score === "Blank") {
	        show = "";
	    }
	    else if (state.score === "Dashes") {
	        show = "--";
	    }
	    else if (state.score === "Plings") {
	        show = "!!";
	    }
	    else if (state.score === "Win") {
	        show = "WIN";
	    }
	    else if (typeof state.score === "number") {
	        show = (state.score >= 0 && state.score <= 9) ? "0" + state.score : state.score.toString();
	    }
	    else {
	        throw Error("Bad score in redrawScore:" + state.score);
	    }
	    canvas_1.fillCentredRectangle(state.context, 0, -0.3 * dim.innerBorderInsideRadius, 1.4 * dim.innerBorderInsideRadius, 0.7 * dim.innerBorderInsideRadius, col.centralBackground);
	    canvas_1.centredText(state.context, 0, -0.3 * dim.innerBorderInsideRadius, show, constants_1.default.fonts.score);
	}
	exports.redrawScore = redrawScore;
	/* Update score in X/blank/X/blank sequence, calling next step after delay and then final callback*/
	function flashScore(state, x, n, finalCb) {
	    state.score = n % 2 ? "Blank" : x;
	    redrawScore(state);
	    if (n > 0) {
	        utils_1.timeout(constants_1.default.durations.flash, function () { return flashScore(state, x, n - 1, finalCb); });
	    }
	    else {
	        utils_1.timeout(constants_1.default.durations.finalFlash, function () { return finalCb(state); });
	    }
	}
	exports.flashScore = flashScore;


/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
	 * Functions to draw onto the canvas. Functions simply operate on the given
	 * canvas context (which they preserve) and have no game or state logic.
	 *
	 */
	"use strict";
	/** Fill a rectangle of given width and height that is centred on given coordinates */
	function fillCentredRectangle(ctx, x, y, w, h, fillStyle) {
	    ctx.save();
	    ctx.fillStyle = fillStyle;
	    ctx.fillRect(x - w / 2, y - h / 2, w, h);
	    ctx.restore();
	}
	exports.fillCentredRectangle = fillCentredRectangle;
	/** Fill a circle of given radius that is centered of given coordinates */
	function fillCentredCircle(ctx, x, y, r, fillStyle, alpha) {
	    ctx.save();
	    ctx.beginPath();
	    ctx.arc(x, y, r, 0, 2 * Math.PI);
	    ctx.fillStyle = fillStyle;
	    if (alpha) {
	        ctx.globalAlpha = alpha;
	    }
	    ctx.fill();
	    ctx.restore();
	}
	exports.fillCentredCircle = fillCentredCircle;
	/** Fill a circle of given radius that is centered of given coordinates first with
	 * background fill style (and 100% alpha) then with given fillstyle and alpha
	*/
	function fillCentredCircleCleanAlpha(ctx, x, y, r, bgFillStyle, fillStyle, alpha) {
	    ctx.save();
	    ctx.beginPath();
	    ctx.arc(x, y, r, 0, 2 * Math.PI);
	    ctx.fillStyle = bgFillStyle;
	    ctx.fill();
	    ctx.fillStyle = fillStyle;
	    ctx.globalAlpha = alpha;
	    ctx.fill();
	    ctx.restore();
	}
	exports.fillCentredCircleCleanAlpha = fillCentredCircleCleanAlpha;
	/** Draw given text centred on coordinate */
	function centredText(ctx, x, y, t, font) {
	    ctx.save();
	    ctx.font = font;
	    ctx.textAlign = "center";
	    ctx.textBaseline = "middle";
	    ctx.fillText(t, x, y);
	    ctx.restore();
	}
	exports.centredText = centredText;
	/** Fill the note button shape (a quadrant with missing borders along axis and the middle) centred on the origin
	 * twice: once with background fill style (and 100% alpha) and then with given fillstyle and alpha
	 */
	function fillNoteButtonShapeCleanAlpha(ctx, quadrant, // numbered clockwise 0..3 starting at bottom-right
	    rIn, // Inside radius
	    rOut, // Outside radius
	    offset, // Perpendicular distance from vertices to nearest axis
	    bgFillStyle, fillStyle, alpha) {
	    /** Angle to axis of an inside vertex of the note button */
	    var thetaIn = Math.atan2(offset, rIn);
	    /** Angle to axis of an outside vertex of the note button */
	    var thetaOut = Math.atan2(offset, rOut);
	    /** Angle to rotate the whole button to be in the approprate quadrant */
	    var thetaRotate = (quadrant % 4) * Math.PI / 2;
	    ctx.save();
	    ctx.beginPath();
	    moveToPolar(ctx, rIn, thetaIn + thetaRotate);
	    lineToPolar(ctx, rOut, thetaOut + thetaRotate);
	    ctx.arc(0, 0, rOut, thetaOut + thetaRotate, Math.PI * 0.5 - thetaOut + thetaRotate);
	    lineToPolar(ctx, rIn, Math.PI * 0.5 - thetaIn + thetaRotate);
	    ctx.arc(0, 0, rIn, Math.PI * 0.5 - thetaIn + thetaRotate, thetaIn + thetaRotate, true);
	    ctx.fillStyle = bgFillStyle;
	    ctx.fill();
	    ctx.globalAlpha = alpha;
	    ctx.fillStyle = fillStyle;
	    ctx.fill();
	    ctx.restore();
	}
	exports.fillNoteButtonShapeCleanAlpha = fillNoteButtonShapeCleanAlpha;
	/** Helper function to move to given location in polar coordinated */
	function moveToPolar(ctx, r, theta) {
	    ctx.moveTo(r * Math.cos(theta), r * Math.sin(theta));
	}
	/** Helper function to add a line to the given location in polar coordinates */
	function lineToPolar(ctx, r, theta) {
	    ctx.lineTo(r * Math.cos(theta), r * Math.sin(theta));
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Module holding all the game's constant parameters
	 *
	 * Used as
	
	 * import constant from "./constant";
	 * let x = constants.boardDimensions.outerBorderOutsideRadius;
	 * let y = constants.durations.maxReplyaNote.milliseconds();
	 *
	 */
	"use strict";
	var duration_1 = __webpack_require__(4);
	;
	var stripeWidth = 10;
	var outsideRadius = 100;
	var insideRadius = 30;
	/** Values for the constants default export */
	var constants = {
	    logging: true,
	    window: {
	        widthReserved: 20,
	        heightReserved: 100
	    },
	    boardDimensions: {
	        canvasSize: 100,
	        stripeWidth: stripeWidth,
	        outerBorderOutsideRadius: outsideRadius,
	        outerBorderInsideRadius: outsideRadius - stripeWidth,
	        innerBorderInsideRadius: insideRadius,
	        innerBorderOutsideRadius: insideRadius + stripeWidth,
	        centralButtonRadius: 5,
	        centralButtonRingRadius: 6
	    },
	    durations: {
	        flash: duration_1.ms(300),
	        finalFlash: duration_1.ms(800),
	        tuneNote: duration_1.ms(800),
	        tuneGap: duration_1.ms(400),
	        replayWait: duration_1.ms(5000),
	        afterReplay: duration_1.ms(1000),
	        afterFailure: duration_1.ms(1000),
	        failureSound: duration_1.ms(1500)
	    },
	    alphas: {
	        normalNote: 0.75,
	        brightNote: 1,
	        offSwitch: 0.5,
	        onSwitch: 1
	    },
	    audio: {
	        blue: 329.628,
	        yellow: 277.183,
	        red: 440,
	        green: 164.814,
	        failure: 66,
	        gain: 0.1
	    },
	    colours: {
	        stripe: "black",
	        powerButton: "limegreen",
	        startButton: "red",
	        strictButton: "yellow",
	        buttonRing: "black",
	        redNote: "red",
	        yellowNote: "yellow",
	        greenNote: "limegreen",
	        blueNote: "dodgerblue",
	        centralBackground: "lightgray"
	    },
	    fonts: {
	        buttonLabels: "3px sans-serif",
	        score: "20px sans-serif"
	    },
	    game: {
	        winCondition: 20
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = constants;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Duration type used for time intervals. Used to reduce mistakes as setTimeout use milliseconds but
	 * the audio interface uses seconds
	 *
	 */
	"use strict";
	/** Create a Duration object from a millisecond value */
	function ms(x) {
	    return {
	        millseconds: function () { return x; },
	        seconds: function () { return x / 1000; }
	    };
	}
	exports.ms = ms;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Define the games shared state and related initialization, types and conversions
	 *
	 */
	"use strict";
	var constants_1 = __webpack_require__(3);
	var sound_1 = __webpack_require__(6);
	var utils_1 = __webpack_require__(7);
	/** Reset the given state (e.g. at start, power off or after a win), preserve graphics and audio contexts and id */
	function resetState(state) {
	    state.canvas = state.canvas || document.getElementById("board");
	    state.context = state.context || utils_1.getContext2D(state.canvas);
	    state.scale = undefined;
	    state.depressed = null;
	    state.playing = null;
	    state.score = "Blank";
	    state.audio = state.audio || sound_1.newAudioState();
	    state.tune = [];
	    state.notesMatched = null;
	    state.id = state.id ? state.id++ : 0;
	    state.power = false;
	    state.strict = false;
	    updateScale(state);
	}
	exports.resetState = resetState;
	/** Modify state to reflect canvas and window size */
	function updateScale(state) {
	    // We set the canvas to fill most of the available window
	    state.canvas.width = window.innerWidth - constants_1.default.window.widthReserved;
	    state.canvas.height = window.innerHeight - constants_1.default.window.heightReserved;
	    // We transform the canvas so a square with coordinates (-100, -100) to (100, 100)
	    // appears as the largest centred squate that will fit on the canvas
	    state.scale = Math.min(state.canvas.width, state.canvas.height) / (2 * constants_1.default.boardDimensions.canvasSize);
	    state.context.transform(state.scale, 0, 0, state.scale, state.canvas.width / 2, state.canvas.height / 2);
	}
	exports.updateScale = updateScale;
	/** Helper function to convert between Buttons and Notes */
	function buttonToNote(b) {
	    switch (b) {
	        case "BlueButton":
	            return "BlueNote";
	        case "YellowButton":
	            return "YellowNote";
	        case "GreenButton":
	            return "GreenNote";
	        case "RedButton":
	            return "RedNote";
	        case "StartButton":
	        case "PowerButton":
	        case "StrictButton":
	            throw Error("Bad button type in buttonToNote:" + b);
	        default:
	            utils_1.assertNever(b); // TS Compiler will throw an error if above cases are not exhaustive
	            throw Error("Unknown button in buttonToNote:" + b);
	    }
	}
	exports.buttonToNote = buttonToNote;
	/** Helper function to convert between Notes and Buttons */
	function noteToButton(n) {
	    switch (n) {
	        case "BlueNote":
	            return "BlueButton";
	        case "YellowNote":
	            return "YellowButton";
	        case "GreenNote":
	            return "GreenButton";
	        case "RedNote":
	            return "RedButton";
	        default:
	            utils_1.assertNever(n); // TS Compiler will throw an error if above cases are not exhaustive
	            throw Error("Bad note in noteToButton:" + n);
	    }
	}
	exports.noteToButton = noteToButton;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Manage sound playing and state, no game logic
	 *
	 */
	"use strict";
	var constants_1 = __webpack_require__(3);
	var utils_1 = __webpack_require__(7);
	/** Initialize sound system, updating state */
	function newAudioState() {
	    // Get the AudioContext from either the standard AudioContext or the Safari-esque webkitAudioContext
	    var context = undefined;
	    if ("AudioContext" in window) {
	        context = new AudioContext();
	    }
	    else if ("webkitAudioContext" in window) {
	        context = new webkitAudioContext();
	    }
	    if (!context) {
	        throw Error("Failed to create AudioContext");
	    }
	    var gainNode = context.createGain();
	    gainNode.gain.value = constants_1.default.audio.gain;
	    gainNode.connect(context.destination);
	    return { context: context, gainNode: gainNode, playingSound: null };
	}
	exports.newAudioState = newAudioState;
	/** Start playing the given note, stopping after the optional duration and applying the optional callback */
	function startPlayingSound(audio, n, dur, cb) {
	    utils_1.eventLog("StrtPl", n, "");
	    var osc = audio.context.createOscillator();
	    if (!osc) {
	        throw Error("Failed to create oscillator node");
	    }
	    osc.type = "square";
	    osc.connect(audio.gainNode);
	    switch (n) {
	        case "BlueNote":
	            osc.frequency.value = constants_1.default.audio.blue;
	            break;
	        case "YellowNote":
	            osc.frequency.value = constants_1.default.audio.yellow;
	            break;
	        case "RedNote":
	            osc.frequency.value = constants_1.default.audio.red;
	            break;
	        case "GreenNote":
	            osc.frequency.value = constants_1.default.audio.green;
	            break;
	        default:
	            utils_1.assertNever(n); // Compiler will give a type error if the cases above are not exhaustive
	            throw Error("bad note in startPlayingSound: " + n);
	    }
	    osc.start();
	    audio.playingSound = osc;
	    if (dur !== undefined) {
	        osc.stop(audio.context.currentTime + dur.seconds());
	    }
	    if (cb !== undefined) {
	        osc.onended = cb;
	    }
	}
	exports.startPlayingSound = startPlayingSound;
	/** Stop playing any sound without calling any onended callback */
	function resetPlayingSound(audio) {
	    if (audio.playingSound) {
	        audio.playingSound.onended = function () { };
	        try {
	            audio.playingSound.stop();
	        }
	        catch (e) {
	            if (e.name === "InvalidStateError") {
	                utils_1.log("Ignored InvalidStateError in stop() during resetPlayingSound - Safari workaround");
	            }
	            else {
	                utils_1.log("Ignored unexpected error in stop", e);
	            }
	        }
	        audio.playingSound = null;
	    }
	}
	exports.resetPlayingSound = resetPlayingSound;
	/** Play the failure sound and follow the given callback when sound ends */
	function playFailureSound(audio, cb) {
	    var osc = audio.context.createOscillator();
	    if (!osc) {
	        throw Error("Failed to create oscillator node");
	    }
	    osc.type = "square";
	    osc.connect(audio.gainNode);
	    osc.frequency.value = constants_1.default.audio.failure;
	    osc.start();
	    osc.stop(audio.context.currentTime + constants_1.default.durations.failureSound.seconds());
	    osc.onended = cb;
	}
	exports.playFailureSound = playFailureSound;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Utiity functions
	 *
	 */
	"use strict";
	var consoleLog = __webpack_require__(8);
	/** Run the given function when document load is complete */
	function runWhenDocumentReady(fn) {
	    if (document.readyState !== "loading") {
	        fn();
	    }
	    else {
	        document.addEventListener("DOMContentLoaded", fn);
	    }
	}
	exports.runWhenDocumentReady = runWhenDocumentReady;
	/** Used in default clauses of switch statements where the compiler should be able to tell that the
	 * cases are exhaustive. Taken from https://github.com/Microsoft/TypeScript/pull/9163#issuecomment-226038986
	 */
	function assertNever(x) {
	    throw new Error("Unexpected object: " + x);
	}
	exports.assertNever = assertNever;
	/** Distance between two points */
	function dist(x1, y1, x2, y2) {
	    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	}
	exports.dist = dist;
	/** Return the rendering context from the given canvas, throws on failure  */
	function getContext2D(cvs) {
	    var c = cvs.getContext("2d");
	    if (c) {
	        return c;
	    }
	    else {
	        throw Error("Cannot get canvas context");
	    }
	}
	exports.getContext2D = getContext2D;
	/** Wrapped version of setTimeout which takes a Duration (or null for zero) and reverses argument order */
	function timeout(dur, cb) {
	    setTimeout(cb, dur === null ? 0 : dur.millseconds(), cb);
	}
	exports.timeout = timeout;
	function eventLog(triggerName, target, action) {
	    consoleLog.fixed([6, 0, 12, 0, 0], triggerName, " ", target, " : ", action);
	}
	exports.eventLog = eventLog;
	function stepLog(stepName, message) {
	    consoleLog.fixed([6, 0, 12, 0, 0], stepName, " ", (Date.now() % 100000).toString(), " : ", message);
	}
	exports.stepLog = stepLog;
	function log() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i - 0] = arguments[_i];
	    }
	    consoleLog.free.apply(null, args);
	}
	exports.log = log;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/*
	 * Provide lightly structured output to console.log() switched on by either
	 * DEBUG environment variable existing or the localstorage debug string existing and not being empty, "0" or "false" (case insensitive)
	 *
	 * We use the format console.log("%s %f", "Hi", 2) instead of just console.log("Hi", 2) as the latter shows across multi-lines in Safari
	 *
	 * Intended use within code:
	 *  import * as consoleLog from "consoleLog";
	 *  consoleLog.fixed([10, 10], "A", "B", "C"); // pads the first two fields to 10 spaces (and truncates if longer)
	 *  consoleLog.free("A", "B", "C"); // space sepearated
	 *
	 * Then to active logging under node:
	 *  DEBUG=YES node prog.js
	 *
	 * Or to activate in the browser, use (in the console window)
	 *  window.localStorage.settItem("debug", 1)
	 * And to deactivate
	 *  window.localStorage.setItem("debug", 0)
	 *
	 * Disadvantages of this module
	 *  - In browser logging shows the filename of the line number of the fuction in this file, not the caller
	 *  - In Safari, the font is not fixed width so the fixed() function has little impact
	 *
	 */
	"use strict";
	/** If debugging activated, pass all the argyments as a substituted string to console.log after padding/truncating to given widths (if non-zero) */
	function fixed(widths) {
	    var args = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        args[_i - 1] = arguments[_i];
	    }
	    if (debugging()) {
	        var paddedArgs = args.map(function (x, i) { return padTo(expandUN(x), widths[i]); });
	        console.log.apply(console, [typeTemplate(paddedArgs)].concat(paddedArgs));
	    }
	}
	exports.fixed = fixed;
	/** If debugging is activated, pass all the arguments as a substituted string to console.log */
	function free() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i - 0] = arguments[_i];
	    }
	    if (debugging()) {
	        console.log.apply(console, [typeTemplate(args)].concat(args));
	    }
	}
	exports.free = free;
	/** Helper function to see if debugging has been turned on by localStorage or environment variable */
	function debugging() {
	    if (typeof window !== "undefined" && window.localStorage) {
	        var d = window.localStorage.getItem("debug");
	        return d !== null && d !== "" && d !== "0" && d.toLowerCase() !== "false";
	    }
	    if (typeof process !== "undefined" && process.env && process.env.DEBUG) {
	        return true;
	    }
	    return false;
	}
	/** Helper function to turn undefined and null into a string, passing through anything else */
	function expandUN(s) {
	    if (s === null) {
	        return "null";
	    }
	    else if (s === undefined) {
	        return "undefined";
	    }
	    return s;
	}
	/** Helper function to truncate or right-pad the string (with spaces) to given width; does nothing if width is non-positive or argument */
	function padTo(x, width) {
	    if (!width || width <= 0) {
	        return x;
	    }
	    var s = x.toString();
	    var paddingNeeded = width - s.length;
	    if (paddingNeeded > 0) {
	        return s + "                                                                      ".substr(0, paddingNeeded);
	    }
	    else {
	        return s.substr(0, width);
	    }
	}
	/** Helper function to provide a template for console.log string substitution based on the types of the given arguments */
	function typeTemplate(args) {
	    return args.map(function (x) {
	        switch (typeof x) {
	            case "string":
	            case "undefined":
	            case "null":
	                return "%s";
	            case "number":
	                return "%f"; // There is also a %i available for integers, but we just use the float template for all numbers
	            default:
	                return "%o";
	        }
	    }).join(" ");
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	(function () {
	  try {
	    cachedSetTimeout = setTimeout;
	  } catch (e) {
	    cachedSetTimeout = function () {
	      throw new Error('setTimeout is not defined');
	    }
	  }
	  try {
	    cachedClearTimeout = clearTimeout;
	  } catch (e) {
	    cachedClearTimeout = function () {
	      throw new Error('clearTimeout is not defined');
	    }
	  }
	} ())
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = cachedSetTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    cachedClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        cachedSetTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Provides event handlers for top-level event logic (detect which button, filter for power on and do redraws of
	 * any previously depressed buttons etc). Actual handling of valid events passed to functions from handlers.ts
	 *
	 */
	"use strict";
	var board_1 = __webpack_require__(1);
	var constants_1 = __webpack_require__(3);
	var handlers_1 = __webpack_require__(11);
	var utils_1 = __webpack_require__(7);
	/** Shortcut to constants.boardDimensions to reduce verbosity */
	var dim = constants_1.default.boardDimensions;
	/** Callback function that handles clicks on the canvas */
	function canvasClickHandler(state, event) {
	    var clicked = findCanvasButton(scaledCoords(state, event.pageX, event.pageY));
	    if (state.power) {
	        switch (clicked) {
	            case "PowerButton":
	                handlers_1.handlePowerClick(state);
	                break;
	            case "StrictButton":
	                handlers_1.handleStrictClick(state);
	                break;
	            case "StartButton":
	                handlers_1.handleStartClick(state);
	                break;
	            // Clicks on note buttons are ignored (we instead handle mouse up/down)
	            case "BlueButton":
	            case "RedButton":
	            case "YellowButton":
	            case "GreenButton":
	                utils_1.eventLog("Click", clicked, "ignored click on note button");
	                break;
	            case null:
	                utils_1.eventLog("Click", clicked, "ignored null click");
	                break;
	            default:
	                utils_1.assertNever(clicked); // TS Compiler will throw an error if above cases are not exhaustive
	        }
	    }
	    else {
	        if (clicked === "PowerButton") {
	            handlers_1.handlePowerClick(state);
	        }
	        else {
	            utils_1.eventLog("Click", clicked, "ignored as power off");
	        }
	    }
	    clearDepressed(state, clicked); // if we have a stray note lit up, unlight it
	}
	exports.canvasClickHandler = canvasClickHandler;
	/** Callback function to handle mouse down events on our canvas */
	function canvasMouseDownHandler(state, event) {
	    if (state.power) {
	        var down = findCanvasButton(scaledCoords(state, event.pageX, event.pageY));
	        switch (down) {
	            case "RedButton":
	            case "YellowButton":
	            case "BlueButton":
	            case "GreenButton":
	                handlers_1.handleNoteDown(state, down);
	                break;
	            case "StartButton":
	            case "StrictButton":
	            case "PowerButton":
	            case null:
	                utils_1.eventLog("Down", down, "ignored down on control/null button");
	                clearDepressed(state, down); // if we have a stray note lit up, unlight it
	                break;
	            default:
	                utils_1.assertNever(down); // Compiler will throw a type error if cases are not exhaustive
	        }
	    }
	}
	exports.canvasMouseDownHandler = canvasMouseDownHandler;
	/** Return a callback function to handle mouseup and mouseout events on our canvas */
	function canvasMouseUpOrOutHandler(state, event) {
	    if (state.power) {
	        switch (state.depressed) {
	            case "RedButton":
	            case "YellowButton":
	            case "BlueButton":
	            case "GreenButton":
	                handlers_1.handleUpFromNote(state);
	                break;
	            case "StartButton":
	            case "StrictButton":
	            case "PowerButton":
	            case null:
	                utils_1.eventLog("Up", "", "ignored from " + state.depressed);
	                break;
	            default:
	                utils_1.assertNever(state.depressed); // Compiler will throw a type error if cases are not exhaustive
	        }
	    }
	}
	exports.canvasMouseUpOrOutHandler = canvasMouseUpOrOutHandler;
	/** Helper function to turn clicks in our normalized coordinates to buttons  */
	function findCanvasButton(coords) {
	    var x = coords[0];
	    var y = coords[1];
	    var r = Math.sqrt(x * x + y * y);
	    if (r > dim.innerBorderOutsideRadius && r < dim.outerBorderInsideRadius) {
	        if (Math.abs(x) > dim.stripeWidth / 2 && Math.abs(y) > dim.stripeWidth / 2) {
	            var theta = Math.atan2(y, x);
	            if (theta > Math.PI / 2) {
	                return "YellowButton";
	            }
	            else if (theta > 0) {
	                return "BlueButton";
	            }
	            else if (theta < -Math.PI / 2) {
	                return "GreenButton";
	            }
	            else {
	                return "RedButton";
	            }
	        }
	    }
	    if (r < dim.innerBorderInsideRadius) {
	        if (utils_1.dist(x, y, -0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3) < dim.centralButtonRadius) {
	            return "PowerButton";
	        }
	        if (utils_1.dist(x, y, 0 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3) < dim.centralButtonRadius) {
	            return "StartButton";
	        }
	        if (utils_1.dist(x, y, +0.5 * dim.innerBorderInsideRadius, dim.innerBorderInsideRadius * 0.3) < dim.centralButtonRadius) {
	            return "StrictButton";
	        }
	    }
	    return null;
	}
	/** Helper function to return scaled coordinates */
	function scaledCoords(state, pageX, pageY) {
	    // Pixel coordinates of click relative to canvas
	    var pixelX = pageX - state.canvas.offsetLeft;
	    var pixelY = pageY - state.canvas.offsetTop;
	    // Coordinates on our -100..100 system
	    var x = (pixelX - state.canvas.width / 2) / state.scale;
	    var y = (pixelY - state.canvas.height / 2) / state.scale;
	    return [x, y];
	}
	/** Helper function to handle an old depressed button, does nothing if old depressed button is the same as the one as the given button */
	function clearDepressed(state, newButton) {
	    var oldDepressed = state.depressed;
	    if (oldDepressed && oldDepressed !== newButton) {
	        board_1.redrawButton(state, oldDepressed);
	    }
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Event handlers for specific events interactions on our buttons
	 *
	 */
	"use strict";
	var board_1 = __webpack_require__(1);
	var constants_1 = __webpack_require__(3);
	var replay_timeout_1 = __webpack_require__(12);
	var sound_1 = __webpack_require__(6);
	var state_1 = __webpack_require__(5);
	var tune_1 = __webpack_require__(13);
	var utils_1 = __webpack_require__(7);
	/** Handle a click on the power button */
	function handlePowerClick(state) {
	    utils_1.eventLog("Click", "PowerButton", "redrew");
	    if (state.power) {
	        sound_1.resetPlayingSound(state.audio);
	        state_1.resetState(state);
	        board_1.redrawBoard(state);
	    }
	    else {
	        state.power = true;
	        state.score = "Dashes";
	        board_1.redrawScore(state);
	        board_1.redrawButton(state, "PowerButton");
	    }
	}
	exports.handlePowerClick = handlePowerClick;
	/** Handle a click on the strict button (with power on) */
	function handleStrictClick(state) {
	    utils_1.eventLog("Click", "StrictButton", "redrew");
	    state.strict = !state.strict;
	    board_1.redrawButton(state, "StrictButton");
	}
	exports.handleStrictClick = handleStrictClick;
	/** Handle a click on the start button (with power on) */
	function handleStartClick(state) {
	    utils_1.eventLog("Click", "StartButton", "start sequence beginning");
	    newRound(state);
	}
	exports.handleStartClick = handleStartClick;
	/** Handle a mouseDown event on a note Button given that power is on */
	function handleNoteDown(state, b) {
	    if (state.notesMatched !== null) {
	        utils_1.eventLog("Down", "b", "note down during replay phase");
	        state.depressed = b;
	        utils_1.eventLog("Down", b, "redrew as depressed");
	        board_1.redrawButton(state, b);
	        if (state_1.buttonToNote(b) === state.tune[state.notesMatched]) {
	            sound_1.startPlayingSound(state.audio, state_1.buttonToNote(b), undefined, function () { return endPlayingNote(state); });
	        }
	        else {
	            replayFailure(state, b);
	        }
	    }
	    else {
	        utils_1.eventLog("Down", "b", "note down outside replay, ignored");
	    }
	}
	exports.handleNoteDown = handleNoteDown;
	/** Handle a mouseDown event given that state.depressed is a note button and power is on) */
	function handleUpFromNote(state) {
	    utils_1.eventLog("Up", undefined, "from note, stops sound ");
	    sound_1.resetPlayingSound(state.audio);
	    if (state.depressed !== null) {
	        endPlayingNote(state);
	    }
	}
	exports.handleUpFromNote = handleUpFromNote;
	/** Helper function to handle the ending of the playing of a correct note as part of replay */
	function endPlayingNote(state) {
	    if (state.notesMatched !== null) {
	        if (state.depressed !== null) {
	            // Unlight the button
	            var oldPlaying = state.depressed;
	            state.depressed = null;
	            board_1.redrawButton(state, oldPlaying);
	            state.notesMatched = state.notesMatched + 1;
	            if (state.notesMatched >= state.tune.length) {
	                if (state.notesMatched >= constants_1.default.game.winCondition) {
	                    board_1.flashScore(state, "Win", 5, function () {
	                        utils_1.timeout(constants_1.default.durations.afterFailure, function () { return newRound(state); });
	                    });
	                }
	                else {
	                    utils_1.timeout(constants_1.default.durations.afterReplay, function () {
	                        tune_1.extendTune(state);
	                        board_1.redrawScore(state);
	                        tune_1.playTune(state, 0);
	                    });
	                }
	            }
	            else {
	                replay_timeout_1.setReplayTimeout(state);
	            }
	        }
	    }
	}
	/** Helper function to start a new round */
	function newRound(state) {
	    board_1.flashScore(state, "Dashes", 3, function () {
	        tune_1.resetTune(state);
	        tune_1.extendTune(state);
	        board_1.redrawScore(state);
	        tune_1.playTune(state, 0);
	    });
	}
	/** Replay has failed - play failure sound and restart; unlights the button provided if any */
	function replayFailure(state, b) {
	    // If note is still playing (as this function was called from a timeout), stop it
	    if (state.audio.playingSound) {
	        state.audio.playingSound.stop();
	        state.audio.playingSound = null;
	    }
	    sound_1.playFailureSound(state.audio, function () {
	        state.depressed = null;
	        if (b) {
	            board_1.redrawButton(state, b);
	        }
	        else {
	            board_1.redrawNotes(state); // If failure from a timeout,redraw all the notes
	        }
	    });
	    state.notesMatched = null;
	    board_1.flashScore(state, "Plings", 3, function () {
	        utils_1.timeout(constants_1.default.durations.afterFailure, function () {
	            if (state.strict) {
	                newRound(state);
	            }
	            else {
	                state.score = state.tune.length;
	                board_1.redrawScore(state);
	                tune_1.playTune(state, 0);
	                state.notesMatched = 0;
	            }
	        });
	    });
	}
	exports.replayFailure = replayFailure;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Support setting timeouts during replay phase, and then when they are called checking the relevant
	 * portion of the game state and, if it has not advanced, trigger replayFailure
	 *
	 */
	"use strict";
	var constants_1 = __webpack_require__(3);
	var handlers_1 = __webpack_require__(11);
	var utils_1 = __webpack_require__(7);
	/** Establish timeout for replays */
	function setReplayTimeout(state) {
	    var oldR = makeReplayState(state); // Relevant game state when the timeout is set
	    utils_1.eventLog("TOSET", null, "Setting replay timeout at " + showReplayState(oldR));
	    utils_1.timeout(constants_1.default.durations.replayWait, function () {
	        var newR = makeReplayState(state); // Relevant game state when the timeout is triggered
	        utils_1.eventLog("TOCHK", null, "Was " + showReplayState(oldR) + ", now " + showReplayState(newR));
	        // If relevant game state has not changed and the power is on, then replay has failed
	        if (state.power && equalReplayState(oldR, newR)) {
	            utils_1.eventLog("TOFAIL", null, "Failure triggered");
	            handlers_1.replayFailure(state, null);
	        }
	    });
	}
	exports.setReplayTimeout = setReplayTimeout;
	/** Helper function to construct a ReplayState */
	function makeReplayState(state) {
	    return {
	        id: state.id,
	        match: state.notesMatched
	    };
	}
	/** Helper function to produce a string representation of a ReplayState for debugging messages */
	function showReplayState(r) {
	    return "(" + r.id + ", " + r.match + ")";
	}
	/** Helper function to test two replay states for value equality */
	function equalReplayState(r1, r2) {
	    return r1.id === r2.id && r1.match === r2.match;
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Manage playing the tune for the player to follow
	 *
	 */
	"use strict";
	var board_1 = __webpack_require__(1);
	var constants_1 = __webpack_require__(3);
	var replay_timeout_1 = __webpack_require__(12);
	var sound_1 = __webpack_require__(6);
	var state_1 = __webpack_require__(5);
	var utils_1 = __webpack_require__(7);
	/** Reset the current tune (e.g., after pressing Start button) */
	function resetTune(state) {
	    state.tune = [];
	}
	exports.resetTune = resetTune;
	/** Add a random note to the tune */
	function extendTune(state) {
	    state.tune.push(randomNote());
	    state.score = state.tune.length;
	}
	exports.extendTune = extendTune;
	/** Play the tunye starting from the given note (calls itself recursively to iterate over the whole tune) */
	function playTune(state, i) {
	    utils_1.stepLog("Play" + i, "starting");
	    // Incremenent id whenever we start playing a new tune
	    if (i === 0) {
	        state.id = state.id + 1;
	    }
	    if (i < state.tune.length) {
	        var nextNote_1 = state.tune[i];
	        state.playing = nextNote_1;
	        state.notesMatched = null;
	        board_1.redrawButton(state, state_1.noteToButton(nextNote_1));
	        sound_1.startPlayingSound(state.audio, nextNote_1, constants_1.default.durations.tuneNote, function () {
	            state.playing = null;
	            board_1.redrawButton(state, state_1.noteToButton(nextNote_1));
	            utils_1.timeout(i < state.tune.length - 1 ? constants_1.default.durations.tuneGap : null, function () { return playTune(state, i + 1); });
	        });
	    }
	    else {
	        utils_1.stepLog("Play", "finished, notesMatched to zero");
	        state.notesMatched = 0;
	        replay_timeout_1.setReplayTimeout(state);
	    }
	}
	exports.playTune = playTune;
	/** Helper function to return a random note */
	function randomNote() {
	    switch (Math.floor(Math.random() * 4)) {
	        case 0: return "BlueNote";
	        case 1: return "YellowNote";
	        case 2: return "GreenNote";
	        case 3: return "RedNote";
	        default: throw Error("Unknown note in randomNote");
	    }
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map