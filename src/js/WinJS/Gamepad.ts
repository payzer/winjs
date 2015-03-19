import _Global = require("./Core/_Global");

import _Base = require("./Core/_Base");
import _BaseUtils = require("./Core/_BaseUtils");
import _Events = require("./Core/_Events");

"use strict";

var AnalogStickThreshold = 0.75;

// Button codes mimic Xbox vkeys
var ButtonCodes = {
    a: 0xC3,
    b: 0xC4,
    x: 0xC5,
    y: 0xC6,
    rightBumper: 0xC7,
    leftBumper: 0xC8,
    leftTrigger: 0xC9,
    rightTrigger: 0xCA,
    dpad_up: 0xCB,
    dpad_down: 0xCC,
    dpad_left: 0xCD,
    dpad_right: 0xCE,
    menu: 0xCF,
    start: 0xCF,
    view: 0xD0,
    select: 0xD0,
    leftstick_button: 0xD1,
    rightstick_button: 0xD2,
    leftstick_up: 0xD3,
    leftstick_down: 0xD4,
    leftstick_right: 0xD5,
    leftstick_left: 0xD6,
    rightstick_up: 0xD7,
    rightstick_down: 0xD8,
    rightstick_right: 0xD9,
    rightstick_left: 0xDA
};

var EventNames = {
    buttonPressed: "buttonpressed",
    buttonReleased: "buttonreleased"
};

if (navigator.getGamepads) {
    rafHandle = _Global.requestAnimationFrame(pollingLoop);

    // The following event handler assures that when the window/app loses focus,
    // we no longer generate gamepad events.
    _Global.addEventListener("blur", function () {
        _Global.cancelAnimationFrame(rafHandle);

        var wasDisabled = disabled;
        setDisabled(true);
        var calls = setDisabledCalls;
        _Global.addEventListener("focus", function onFocus() {
            if (calls === setDisabledCalls) {
                // Only restore 'disabled' state if no calls to setDisabled has been
                // made since the window/app was blurred.
                setDisabled(wasDisabled);
            }
            _Global.removeEventListener("focus", onFocus);
        });
    });
}

export function setDisabled(value: boolean) {
    setDisabledCalls++;
    if (disabled && !value) {
        rafHandle = _Global.requestAnimationFrame(pollingLoop);
    }
    disabled = value;
}

export function setDisableDOMKeyEvents(value: boolean) {
    disableDOMEvents = value;
}

var axesStates: boolean[] = [];
var buttonStates: boolean[] = [];
var disabled = false;
var disableDOMEvents = false;
var setDisabledCalls = 0;
var rafHandle = 0;

function pollingLoop(t: number) {
    var gamepads = _Global.navigator.getGamepads();
    var gamepadConnected = false;
    var activeElement = _Global.document.activeElement;

    if (disabled || !gamepads) {
        return;
    }

    for (var i = 0, l = gamepads.length; i < l; i++) {
        var gamepad = gamepads[i];
        if (!gamepad || !gamepad.buttons || !gamepad.axes) {
            continue;
        }
        gamepadConnected = true;

        for (var j = 0, l2 = gamepad.buttons.length; j < l2; j++) {
            var button = gamepad.buttons[j];

            if (button.pressed) {
                if (!buttonStates[j]) {
                    // Button is down, was up - fire down
                    var buttonCode = getButtonCodeFromButtonIndex(j);
                    !disableDOMEvents && activeElement.dispatchEvent(createKeyEvent("keydown", buttonCode));
                    eventSrc.dispatchEvent(EventNames.buttonPressed, buttonCode);
                }
            } else {
                if (buttonStates[j]) {
                    // Button is up, was down - fire up
                    var buttonCode = getButtonCodeFromButtonIndex(j);
                    !disableDOMEvents && activeElement.dispatchEvent(createKeyEvent("keyup", buttonCode));
                    eventSrc.dispatchEvent(EventNames.buttonReleased, buttonCode);
                }
            }
            buttonStates[j] = button.pressed;
        }

        var axes = [
            gamepad.axes[1] < -AnalogStickThreshold, gamepad.axes[1] > AnalogStickThreshold,
            gamepad.axes[0] < -AnalogStickThreshold, gamepad.axes[0] > AnalogStickThreshold,
            gamepad.axes[3] < -AnalogStickThreshold, gamepad.axes[3] > AnalogStickThreshold,
            gamepad.axes[2] < -AnalogStickThreshold, gamepad.axes[2] > AnalogStickThreshold
        ];
        for (var j = 0, l2 = axes.length; j < l2; j++) {
            if (axes[j]) {
                if (!axesStates[j]) {
                    var buttonCode = getButtonCodeFromAxisIndex(j);
                    !disableDOMEvents && activeElement.dispatchEvent(createKeyEvent("keydown", buttonCode));
                    eventSrc.dispatchEvent(EventNames.buttonPressed, buttonCode);
                }
            } else {
                if (axesStates[j]) {
                    var buttonCode = getButtonCodeFromAxisIndex(j);
                    !disableDOMEvents && activeElement.dispatchEvent(createKeyEvent("keyup", buttonCode));
                    eventSrc.dispatchEvent(EventNames.buttonReleased, buttonCode);
                }
            }
            axesStates[j] = axes[j];
        }
    }
    rafHandle = _Global.requestAnimationFrame(pollingLoop);
}

function createKeyEvent(type: string, keyCode: number) {
    var event = document.createEvent("Event");
    event.initEvent(type, true, true);
    event["keyCode"] = keyCode;
    return event;
}

function getButtonCodeFromButtonIndex(buttonIndex: number) {
    switch (buttonIndex) {
        case 0:
            return ButtonCodes.a;
        case 1:
            return ButtonCodes.b;
        case 2:
            return ButtonCodes.x;
        case 3:
            return ButtonCodes.y;
        case 4:
            return ButtonCodes.leftBumper;
        case 5:
            return ButtonCodes.rightBumper;
        case 6:
            return ButtonCodes.leftTrigger;
        case 7:
            return ButtonCodes.rightTrigger;
        case 8:
            return ButtonCodes.select;
        case 9:
            return ButtonCodes.start;
        case 10:
            return ButtonCodes.leftstick_button;
        case 11:
            return ButtonCodes.rightstick_button;
        case 12:
            return ButtonCodes.dpad_up;
        case 13:
            return ButtonCodes.dpad_down;
        case 14:
            return ButtonCodes.dpad_left;
        case 15:
            return ButtonCodes.dpad_right;
    }
    return -1;
}

function getButtonCodeFromAxisIndex(axisIndex: number) {
    switch (axisIndex) {
        case 0:
            return ButtonCodes.leftstick_up;
        case 1:
            return ButtonCodes.leftstick_down;
        case 2:
            return ButtonCodes.leftstick_left;
        case 3:
            return ButtonCodes.leftstick_right;
        case 4:
            return ButtonCodes.rightstick_up;
        case 5:
            return ButtonCodes.rightstick_down;
        case 6:
            return ButtonCodes.rightstick_left;
        case 7:
            return ButtonCodes.rightstick_right;
    }
    return -1;
}

// Publish to WinJS namespace
var toPublish = {
    Buttons: ButtonCodes,
    setDisabled: setDisabled,
    setDisableDOMKeyEvents: setDisableDOMKeyEvents,
    onbuttonpressed: _Events._createEventProperty(EventNames.buttonPressed),
    onbuttonreleased: _Events._createEventProperty(EventNames.buttonReleased)
};
toPublish = _BaseUtils._merge(toPublish, _Events.eventMixin);
toPublish["_listeners"] = {};
var eventSrc = <_Events.eventMixin><any>toPublish;
_Base.Namespace.define("WinJS.Gamepad", toPublish);