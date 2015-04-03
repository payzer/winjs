// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/// <reference path="../../../../typings/require.d.ts" />

import _Global = require('../Core/_Global');
import Promise = require('../Promise');
import _Signal = require('../_Signal');
import _WinRT = require('../Core/_WinRT');

"use strict";

var _Constants = {
    visualViewportClass: "win-visualviewport-space",
}

interface IRect {
    top: number;
    right: number;
    bottom: number;
    left: number
}

// This module provides ...

// WWA Soft Keyboard offsets
export var _keyboardInfo: any = {
    // Determine if the keyboard is visible or not.
    get _visible() {

        try {
            return (
                _WinRT.Windows.UI.ViewManagement.InputPane &&
                _WinRT.Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect.height > 0
                );
        } catch (e) {
            return false;
        }
    },

    // See if we have to reserve extra space for the IHM
    get _extraOccluded() {
        var occluded = 0;
        if (_WinRT.Windows.UI.ViewManagement.InputPane) {
            try {
                occluded = _WinRT.Windows.UI.ViewManagement.InputPane.getForCurrentView().occludedRect.height;
            } catch (e) {
            }
        }

        // Nothing occluded if not visible.
        if (occluded && !_keyboardInfo._isResized) {
            // View hasn't been resized, need to return occluded height.
            return occluded;
        }

        // View already has space for keyboard or there's no keyboard
        return 0;

    },

    // See if the view has been resized to fit a keyboard
    get _isResized() {
        // Compare ratios.  Very different includes IHM space.
        var heightRatio = _Global.document.documentElement.clientHeight / _Global.innerHeight,
            widthRatio = _Global.document.documentElement.clientWidth / _Global.innerWidth;

        // If they're nearly identical, then the view hasn't been resized for the IHM
        // Only check one bound because we know the IHM will make it shorter, not skinnier.
        return (widthRatio / heightRatio < 0.99);

    },

    // Get the bottom of our visible area.
    get _visibleDocBottom() {
        return _keyboardInfo._visibleDocTop + _keyboardInfo._visibleDocHeight;

    },

    // Get the height of the visible document, e.g. the height of the visual viewport minus any IHM occlusion.
    get _visibleDocHeight() {
        return _keyboardInfo._visualViewportHeight - _keyboardInfo._extraOccluded;

    },

    // Get total length of the IHM showPanel animation
    get _animationShowLength() {
        if (_WinRT.Windows.UI.Core.AnimationMetrics) {
            var a = _WinRT.Windows.UI.Core.AnimationMetrics,
                animationDescription = new a.AnimationDescription(a.AnimationEffect.showPanel, a.AnimationEffectTarget.primary);
            var animations = animationDescription.animations;
            var max = 0;
            for (var i = 0; i < animations.size; i++) {
                var animation = animations[i];
                max = Math.max(max, animation.delay + animation.duration);
            }
            return max;
        } else {
            return 0;
        }
    },
    get _visibleDocTop(): number { return impl.visibleDocTop(); },
    get _visibleDocBottomOffset(): number { return impl.visibleDocBottomOffset(); },
    get _visualViewportSpace(): IRect { return impl.visualViewportSpace() },
};

var impl: {
    visibleDocTop: () => number;
    visibleDocBottomOffset: () => number;
    visualViewportSpace: () => IRect;
};

if (document.body) {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init, false);
}

function init() {
    // Feature detect for -ms-device-fixed positioning and fill out the
    // remainder of our WWA Soft KeyBoard handling logic with mixins.
    var visualViewportElement = _Global.document.createElement("DIV");
    visualViewportElement.className = _Constants.visualViewportClass;
    _Global.document.body.appendChild(visualViewportElement);

    var hasDeviceFixed = _Global.getComputedStyle(visualViewportElement).position === "-ms-device-fixed";
    if (!hasDeviceFixed && _WinRT.Windows.UI.ViewManagement.InputPane) {
        // If we are in WWA with IE 10 mode, use special keyboard handling knowledge for IE10 IHM.
        impl =
        _Global.document.body.removeChild(visualViewportElement);
    } else {
        // If we are in WWA on IE 11 or outside of WWA on any web browser use general positioning logic.
        propertiesMixin = _keyboardInfo_Mixin;
    }

    for (var propertyName in propertiesMixin) {
        Object.defineProperty(_keyboardInfo, propertyName, {
            get: propertiesMixin[propertyName],
        });
    }
}

// Mixin for WWA's Soft Keyboard offsets when -ms-device-fixed CSS positioning is supported, or for general _Overlay positioning whenever we are in a web browser outside of WWA.
// If we are in an instance of WWA, all _Overlay elements will use -ms-device-fixed positioning which fixes them to the visual viewport directly.
var _keyboardInfo_Mixin = {

    // Get the top offset of our visible area, aka the top of the visual viewport.
    // This is always 0 when _Overlay elements use -ms-device-fixed positioning.
    _visibleDocTop: function _visibleDocTop() {
        return 0;
    },

    // Get the bottom offset of the visual viewport, plus any IHM occlusion.
    _visibleDocBottomOffset: function _visibleDocBottomOffset() {
        // For -ms-device-fixed positioned elements, the bottom is just 0 when there's no IHM.
        // When the IHM appears, the text input that invoked it may be in a position on the page that is occluded by the IHM.
        // In that instance, the default browser behavior is to resize the visual viewport and scroll the input back into view.
        // However, if the viewport resize is prevented by an IHM event listener, the keyboard will still occlude
        // -ms-device-fixed elements, so we adjust the bottom offset of the appbar by the height of the occluded rect of the IHM.
        return (_keyboardInfo._isResized) ? 0 : _keyboardInfo._extraOccluded;
    },

    //// Get the visual viewport height. window.innerHeight doesn't return floating point values which are present with high DPI.
    //_visualViewportHeight: function _visualViewportHeight() {
    //    var boundingRect = _keyboardInfo._visualViewportSpace;
    //    return boundingRect.bottom - boundingRect.top;
    //},

    //// Get the visual viewport width. window.innerWidth doesn't return floating point values which are present with high DPI.
    //_visualViewportWidth: function _visualViewportWidth() {
    //    var boundingRect = _keyboardInfo._visualViewportSpace;
    //    return boundingRect.right - boundingRect.left;
    //},

    _visualViewportSpace: function _visualViewportSpace() {
        var visualViewportSpace: HTMLElement = <HTMLElement>_Global.document.body.querySelector("." + _Constants.visualViewportClass);
        if (!visualViewportSpace) {
            visualViewportSpace = _Global.document.createElement("DIV");
            visualViewportSpace.className = _Constants.visualViewportClass;
            _Global.document.body.appendChild(visualViewportSpace);
        }
        return visualViewportSpace.getBoundingClientRect();
    },
};

//// Mixin for WWA's Soft Keyboard offsets in IE10 mode, where -ms-device-fixed positioning is not available.
//// In that instance, all _Overlay elements fall back to using CSS fixed positioning.
//// This is for backwards compatibility with Apache Cordova Apps targeting WWA since they target IE10.
//// This is essentially the original logic for WWA _Overlay / Soft Keyboard interactions we used when windows 8 first launched.
//var Win8WWA_Impl = {
//    // Get the top of our visible area in terms of its absolute distance from the top of document.documentElement.
//    // Normalizes any offsets which have have occured between the visual viewport and the layout viewport due to resizing the viewport to fit the IHM and/or optical zoom.
//    _visibleDocTop: function _visibleDocTop_Win8WWA() {
//        return _Global.pageYOffset - _Global.document.documentElement.scrollTop;
//    },

//    // Get the bottom offset of the visual viewport from the bottom of the layout viewport, plus any IHM occlusion.
//    _visibleDocBottomOffset: function _visibleDocBottomOffset_Windows8WWA() {
//        return _Global.document.documentElement.clientHeight - _keyboardInfo._visibleDocBottom;
//    },

//    //_visualViewportHeight: function _visualViewportHeight_Windows8WWA() {
//    //    return _Global.innerHeight;
//    //},

//    //_visualViewportWidth: function _visualViewportWidth_Windows8WWA() {
//    //    return _Global.innerWidth;
//    //},
//    _visualViewportSpace: function _visualViewportSpace() {
//        var visualViewportSpace = {
//            left: 0,
//            top: 0,
//            right: window.innerWidth,
//            bottom: window.innerHeight,
//        }
//            },
//};


//var _addMixin = function () {
//    if (_keyboardInfo._visibleDocTop === undefined) {


//        //// Mixin for WWA's Soft Keyboard offsets when -ms-device-fixed CSS positioning is supported, or for general _Overlay positioning whenever we are in a web browser outside of WWA.
//        //// If we are in an instance of WWA, all _Overlay elements will use -ms-device-fixed positioning which fixes them to the visual viewport directly.
//        //var _keyboardInfo_Mixin = {

//        //    // Get the top offset of our visible area, aka the top of the visual viewport.
//        //    // This is always 0 when _Overlay elements use -ms-device-fixed positioning.
//        //    _visibleDocTop: function _visibleDocTop() {
//        //        return 0;
//        //    },

//        //    // Get the bottom offset of the visual viewport, plus any IHM occlusion.
//        //    _visibleDocBottomOffset: function _visibleDocBottomOffset() {
//        //        // For -ms-device-fixed positioned elements, the bottom is just 0 when there's no IHM.
//        //        // When the IHM appears, the text input that invoked it may be in a position on the page that is occluded by the IHM.
//        //        // In that instance, the default browser behavior is to resize the visual viewport and scroll the input back into view.
//        //        // However, if the viewport resize is prevented by an IHM event listener, the keyboard will still occlude
//        //        // -ms-device-fixed elements, so we adjust the bottom offset of the appbar by the height of the occluded rect of the IHM.
//        //        return (_keyboardInfo._isResized) ? 0 : _keyboardInfo._extraOccluded;
//        //    },

//        //    //// Get the visual viewport height. window.innerHeight doesn't return floating point values which are present with high DPI.
//        //    //_visualViewportHeight: function _visualViewportHeight() {
//        //    //    var boundingRect = _keyboardInfo._visualViewportSpace;
//        //    //    return boundingRect.bottom - boundingRect.top;
//        //    //},

//        //    //// Get the visual viewport width. window.innerWidth doesn't return floating point values which are present with high DPI.
//        //    //_visualViewportWidth: function _visualViewportWidth() {
//        //    //    var boundingRect = _keyboardInfo._visualViewportSpace;
//        //    //    return boundingRect.right - boundingRect.left;
//        //    //},

//        //    _visualViewportSpace: function _visualViewportSpace() {
//        //        var visualViewportSpace: HTMLElement = <HTMLElement>_Global.document.body.querySelector("." + _Constants.visualViewportClass);
//        //        if (!visualViewportSpace) {
//        //            visualViewportSpace = _Global.document.createElement("DIV");
//        //            visualViewportSpace.className = _Constants.visualViewportClass;
//        //            _Global.document.body.appendChild(visualViewportSpace);
//        //        }
//        //        return visualViewportSpace.getBoundingClientRect();
//        //    },
//        //};

//        //// Mixin for WWA's Soft Keyboard offsets in IE10 mode, where -ms-device-fixed positioning is not available.
//        //// In that instance, all _Overlay elements fall back to using CSS fixed positioning.
//        //// This is for backwards compatibility with Apache Cordova Apps targeting WWA since they target IE10.
//        //// This is essentially the original logic for WWA _Overlay / Soft Keyboard interactions we used when windows 8 first launched.
//        //var _keyboardInfo_Windows8WWA_Mixin = {
//        //    // Get the top of our visible area in terms of its absolute distance from the top of document.documentElement.
//        //    // Normalizes any offsets which have have occured between the visual viewport and the layout viewport due to resizing the viewport to fit the IHM and/or optical zoom.
//        //    _visibleDocTop: function _visibleDocTop_Windows8WWA() {
//        //        return _Global.pageYOffset - _Global.document.documentElement.scrollTop;
//        //    },

//        //    // Get the bottom offset of the visual viewport from the bottom of the layout viewport, plus any IHM occlusion.
//        //    _visibleDocBottomOffset: function _visibleDocBottomOffset_Windows8WWA() {
//        //        return _Global.document.documentElement.clientHeight - _keyboardInfo._visibleDocBottom;
//        //    },

//        //    //_visualViewportHeight: function _visualViewportHeight_Windows8WWA() {
//        //    //    return _Global.innerHeight;
//        //    //},

//        //    //_visualViewportWidth: function _visualViewportWidth_Windows8WWA() {
//        //    //    return _Global.innerWidth;
//        //    //},
//        //    _visualViewportSpace: function _visualViewportSpace() {
//        //        var visualViewportSpace = {
//        //            left: 0,
//        //            top: 0,
//        //            right: window.innerWidth,
//        //            bottom: window.innerHeight,
//        //        }
//        //    },
//        //};

//        //// Feature detect for -ms-device-fixed positioning and fill out the
//        //// remainder of our WWA Soft KeyBoard handling logic with mixins.
//        //var visualViewportSpace = _Global.document.createElement("DIV");
//        //visualViewportSpace.className = _Constants.visualViewportClass;
//        //_Global.document.body.appendChild(visualViewportSpace);

//        //var propertiesMixin: any,
//        //    hasDeviceFixed = _Global.getComputedStyle(visualViewportSpace).position === "-ms-device-fixed";
//        //if (!hasDeviceFixed && _WinRT.Windows.UI.ViewManagement.InputPane) {
//        //    // If we are in WWA with IE 10 mode, use special keyboard handling knowledge for IE10 IHM.
//        //    propertiesMixin = _keyboardInfo_Windows8WWA_Mixin;
//        //    _Global.document.body.removeChild(visualViewportSpace);
//        //} else {
//        //    // If we are in WWA on IE 11 or outside of WWA on any web browser use general positioning logic.
//        //    propertiesMixin = _keyboardInfo_Mixin;
//        //}

//        //for (var propertyName in propertiesMixin) {
//        //    Object.defineProperty(_keyboardInfo, propertyName, {
//        //        get: propertiesMixin[propertyName],
//        //    });
//        //}
//    }
//};