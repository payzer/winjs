// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/// <reference path="../../../../typings/require.d.ts" />

import _Base = require('../Core/_Base');
import _AppBar = require('./AppBar/_AppBar');

var module: typeof _AppBar = null;

_Base.Namespace.define("WinJS.UI", {
    AppBar: {
        get: () => {
            if (!module) {
                require(["./AppBar/_AppBar"], (m: typeof _AppBar) => {
                    module = m;
                });
            }
            return module.AppBar;
        }
    }
});

/*

                // Get the top offset for top appbars.
                _getTopOfVisualViewport: function _LegacyAppBar_getTopOfVisualViewPort() {
                    return _Overlay._Overlay._keyboardInfo._visibleDocTop;
                },

                // Get the bottom offset for bottom appbars.
                _getAdjustedBottom: function _LegacyAppBar_getAdjustedBottom() {
                    // Need the distance the IHM moved as well.
                    return _Overlay._Overlay._keyboardInfo._visibleDocBottomOffset;
                },

                _showingKeyboard: function _LegacyAppBar_showingKeyboard(event) {
                    // Remember keyboard showing state.
                    this._keyboardObscured = false;
                    this._needToHandleHidingKeyboard = false;

                    // If we're already moved, then ignore the whole thing
                    if (_Overlay._Overlay._keyboardInfo._visible && this._alreadyInPlace()) {
                        return;
                    }

                    this._needToHandleShowingKeyboard = true;
                    // If focus is in the appbar, don't cause scrolling.
                    if (this.opened && this._element.contains(_Global.document.activeElement)) {
                        event.ensuredFocusedElementInView = true;
                    }

                    // Check if appbar moves or if we're ok leaving it obscured instead.
                    if (this._visible && this._placement !== _Constants.appBarPlacementTop && _Overlay._Overlay._isFlyoutVisible()) {
                        // Remember that we're obscured
                        this._keyboardObscured = true;
                    } else {
                        // Don't be obscured, clear _scrollHappened flag to give us inference later on when to re-show ourselves.
                        this._scrollHappened = false;
                    }

                    // Also set timeout regardless, so we can clean up our _keyboardShowing flag.
                    var that = this;
                    _Global.setTimeout(function (e) { that._checkKeyboardTimer(e); }, _Overlay._Overlay._keyboardInfo._animationShowLength + _Overlay._Overlay._scrollTimeout);
                },

                _hidingKeyboard: function _LegacyAppBar_hidingKeyboard() {
                    // We'll either just reveal the current space under the IHM or restore the window height.

                    // We won't be obscured
                    this._keyboardObscured = false;
                    this._needToHandleShowingKeyboard = false;
                    this._needToHandleHidingKeyboard = true;

                    // We'll either just reveal the current space or resize the window
                    if (!_Overlay._Overlay._keyboardInfo._isResized) {
                        // If we're not completely hidden, only fake hiding under keyboard, or already animating,
                        // then snap us to our final position.
                        if (this._visible || this._animating) {
                            // Not resized, update our final position immediately
                            this._checkScrollPosition();
                            this._element.style.display = "";
                        }
                        this._needToHandleHidingKeyboard = false;
                    }
                    // Else resize should clear keyboardHiding.
                },

                _resize: function _LegacyAppBar_resize(event) {
                    // If we're hidden by the keyboard, then hide bottom appbar so it doesn't pop up twice when it scrolls
                    if (this._needToHandleShowingKeyboard) {
                        // Top is allowed to scroll off the top, but we don't want bottom to peek up when
                        // scrolled into view since we'll show it ourselves and don't want a stutter effect.
                        if (this._visible) {
                            if (this._placement !== _Constants.appBarPlacementTop && !this._keyboardObscured) {
                                // If viewport doesn't match window, need to vanish momentarily so it doesn't scroll into view,
                                // however we don't want to toggle the visibility="hidden" hidden flag.
                                this._element.style.display = "none";
                            }
                        }
                        // else if we're top we stay, and if there's a flyout, stay obscured by the keyboard.
                    } else if (this._needToHandleHidingKeyboard) {
                        this._needToHandleHidingKeyboard = false;
                        if (this._visible || this._animating) {
                            // Snap to final position
                            this._checkScrollPosition();
                            this._element.style.display = "";
                        }
                    }

                    // Make sure everything still fits.
                    if (!this._initializing) {
                        this._layoutImpl.resize(event);
                    }
                },

                _checkKeyboardTimer: function _LegacyAppBar_checkKeyboardTimer() {
                    if (!this._scrollHappened) {
                        this._mayEdgeBackIn();
                    }
                },

                _manipulationChanged: function _LegacyAppBar_manipulationChanged(event) {
                    // See if we're at the not manipulating state, and we had a scroll happen,
                    // which is implicitly after the keyboard animated.
                    if (event.currentState === 0 && this._scrollHappened) {
                        this._mayEdgeBackIn();
                    }
                },

                _mayEdgeBackIn: function _LegacyAppBar_mayEdgeBackIn() {
                    // May need to react to IHM being resized event
                    if (this._needToHandleShowingKeyboard) {
                        // If not top appbar or viewport isn't still at top, then need to show again
                        this._needToHandleShowingKeyboard = false;
                        // If obscured (IHM + flyout showing), it's ok to stay obscured.
                        // If bottom we have to move, or if top scrolled off screen.
                        if (!this._keyboardObscured &&
                            (this._placement !== _Constants.appBarPlacementTop || _Overlay._Overlay._keyboardInfo._visibleDocTop !== 0)) {
                            var toPosition = this._visiblePosition;
                            this._lastPositionVisited = displayModeVisiblePositions.hidden;
                            this._changeVisiblePosition(toPosition, false);
                        } else {
                            // Ensure any animations dropped during the showing keyboard are caught up.
                            this._checkDoNext();
                        }
                    }
                    this._scrollHappened = false;
                },

                _ensurePosition: function _LegacyAppBar_ensurePosition() {
                    // Position the _LegacyAppBar element relative to the top or bottom edge of the visible
                    // document, based on the the visible position we think we need to be in.
                    var offSet = this._computePositionOffset();
                    this._element.style.bottom = offSet.bottom;
                    this._element.style.top = offSet.top;

                },

                _computePositionOffset: function _LegacyAppBar_computePositionOffset() {
                    // Calculates and returns top and bottom offsets for the _LegacyAppBar element, relative to the top or bottom edge of the visible
                    // document.
                    var positionOffSet = {};

                    if (this._placement === _Constants.appBarPlacementBottom) {
                        // If the IHM is open, the bottom of the visual viewport may or may not be obscured
                        // Use _getAdjustedBottom to account for the IHM if it is covering the bottom edge.
                        positionOffSet.bottom = this._getAdjustedBottom() + "px";
                        positionOffSet.top = "";
                    } else if (this._placement === _Constants.appBarPlacementTop) {
                        positionOffSet.bottom = "";
                        positionOffSet.top = this._getTopOfVisualViewport() + "px";
                    }

                    return positionOffSet;
                },

                _checkScrollPosition: function _LegacyAppBar_checkScrollPosition() {
                    // If IHM has appeared, then remember we may come in
                    if (this._needToHandleShowingKeyboard) {
                        // Tag that it's OK to edge back in.
                        this._scrollHappened = true;
                        return;
                    }

                    // We only need to update if we're not completely hidden.
                    if (this._visible || this._animating) {
                        this._ensurePosition();
                        // Ensure any animations dropped during the showing keyboard are caught up.
                        this._checkDoNext();
                    }
                },

                _alreadyInPlace: function _LegacyAppBar_alreadyInPlace() {
                    // See if we're already where we're supposed to be.
                    var offSet = this._computePositionOffset();
                    return (offSet.top === this._element.style.top && offSet.bottom === this._element.style.bottom);
                },

*/