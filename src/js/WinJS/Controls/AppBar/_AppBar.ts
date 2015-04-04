// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/// <reference path="../../Core.d.ts" />
import Animations = require("../../Animations");
import _Base = require("../../Core/_Base");
import _BaseUtils = require("../../Core/_BaseUtils");
import BindingList = require("../../BindingList");
import ControlProcessor = require("../../ControlProcessor");
import _Constants = require("../AppBar/_Constants");
import _Command = require("../AppBar/_Command");
import _CommandingSurface = require("../CommandingSurface");
import _ICommandingSurface = require("../CommandingSurface/_CommandingSurface");
import _Control = require("../../Utilities/_Control");
import _Dispose = require("../../Utilities/_Dispose");
import _ElementUtilities = require("../../Utilities/_ElementUtilities");
import _ErrorFromName = require("../../Core/_ErrorFromName");
import _Events = require('../../Core/_Events');
import _Flyout = require("../../Controls/Flyout");
import _Global = require("../../Core/_Global");
import _Hoverable = require("../../Utilities/_Hoverable");
import _KeyboardBehavior = require("../../Utilities/_KeyboardBehavior");
import _KeyboardInfo = require('../../Utilities/_KeyboardInfo');
import Menu = require("../../Controls/Menu");
import _MenuCommand = require("../Menu/_Command");
import Promise = require('../../Promise');
import _Resources = require("../../Core/_Resources");
import Scheduler = require("../../Scheduler");
import _OpenCloseMachine = require('../../Utilities/_OpenCloseMachine');
import _Signal = require('../../_Signal');
import _WinRT = require('../../Core/_WinRT');
import _WriteProfilerMark = require("../../Core/_WriteProfilerMark");

require(["require-style!less/styles-appbar"]);
require(["require-style!less/colors-appbar"]);

"use strict";

var strings = {
    get ariaLabel() { return _Resources._getWinJSString("ui/appBarAriaLabel").value; },
    get overflowButtonAriaLabel() { return _Resources._getWinJSString("ui/appBarOverflowButtonAriaLabel").value; },
    get mustContainCommands() { return "The AppBar can only contain WinJS.UI.Command or WinJS.UI.AppBarCommand controls"; },
    get duplicateConstruction() { return "Invalid argument: Controls may only be instantiated one time for each DOM element"; }
};

var ClosedDisplayMode = {
    /// <field locid="WinJS.UI.AppBar.ClosedDisplayMode.none" helpKeyword="WinJS.UI.AppBar.ClosedDisplayMode.none">
    /// When the AppBar is closed, it is not visible and doesn't take up any space.
    /// </field>
    none: "none",
    /// <field locid="WinJS.UI.AppBar.ClosedDisplayMode.minimal" helpKeyword="WinJS.UI.AppBar.ClosedDisplayMode.minimal">
    /// When the AppBar is closed, its height is reduced to the minimal height required to display only its overflowbutton. All other content in the AppBar is not displayed.
    /// </field>
    minimal: "minimal",
    /// <field locid="WinJS.UI.AppBar.ClosedDisplayMode.compact" helpKeyword="WinJS.UI.AppBar.ClosedDisplayMode.compact">
    /// When the AppBar is closed, its height is reduced such that button commands are still visible, but their labels are hidden.
    /// </field>
    compact: "compact",
    /// <field locid="WinJS.UI.AppBar.ClosedDisplayMode.full" helpKeyword="WinJS.UI.AppBar.ClosedDisplayMode.full">
    /// When the AppBar is closed, its height is always sized to content.
    /// </field>
    full: "full",
};

var closedDisplayModeClassMap = {};
closedDisplayModeClassMap[ClosedDisplayMode.none] = _Constants.ClassNames.noneClass;
closedDisplayModeClassMap[ClosedDisplayMode.minimal] = _Constants.ClassNames.minimalClass;
closedDisplayModeClassMap[ClosedDisplayMode.compact] = _Constants.ClassNames.compactClass;
closedDisplayModeClassMap[ClosedDisplayMode.full] = _Constants.ClassNames.fullClass;

var Placement = {
    /// <field locid="WinJS.UI.AppBar.Placement.top" helpKeyword="WinJS.UI.AppBar.Placement.top">
    /// The AppBar appears at the top of the main view
    /// </field>
    top: "top",
    /// <field locid="WinJS.UI.AppBar.Placement.bottom" helpKeyword="WinJS.UI.AppBar.Placement.bottom">
    /// The AppBar appears at the bottom of the main view
    /// </field>
    bottom: "bottom",
};
var placementClassMap = {};
placementClassMap[Placement.top] = _Constants.ClassNames.placementTopClass;
placementClassMap[Placement.bottom] = _Constants.ClassNames.placementBottomClass;

// Versions of add/removeClass that are no ops when called with falsy class names.
function addClass(element: HTMLElement, className: string): void {
    className && _ElementUtilities.addClass(element, className);
}
function removeClass(element: HTMLElement, className: string): void {
    className && _ElementUtilities.removeClass(element, className);
}

/// <field>
/// <summary locid="WinJS.UI.AppBar">
/// Represents an appbar for displaying commands.
/// </summary>
/// </field>
/// <icon src="ui_winjs.ui.appbar.12x12.png" width="12" height="12" />
/// <icon src="ui_winjs.ui.appbar.16x16.png" width="16" height="16" />
/// <htmlSnippet supportsContent="true"><![CDATA[<div data-win-control="WinJS.UI.AppBar">
/// <button data-win-control="WinJS.UI.Command" data-win-options="{id:'',label:'example',icon:'back',type:'button',onclick:null,section:'primary'}"></button>
/// </div>]]></htmlSnippet>
/// <part name="appbar" class="win-appbar" locid="WinJS.UI.AppBar_part:appbar">The entire AppBar control.</part>
/// <part name="appbar-overflowbutton" class="win-appbar-overflowbutton" locid="WinJS.UI.AppBar_part:AppBar-overflowbutton">The appbar overflow button.</part>
/// <part name="appbar-overflowarea" class="win-appbar-overflowarea" locid="WinJS.UI.AppBar_part:AppBar-overflowarea">The container for appbar commands that overflow.</part>
/// <resource type="javascript" src="//$(TARGET_DESTINATION)/js/WinJS.js" shared="true" />
/// <resource type="css" src="//$(TARGET_DESTINATION)/css/ui-dark.css" shared="true" />
export class AppBar {
    private _id: string;
    private _disposed: boolean;
    private _commandingSurface: _ICommandingSurface._CommandingSurface;
    private _isOpenedMode: boolean;

    private _dom: {
        root: HTMLElement;
        commandingSurfaceEl: HTMLElement;
    }

    /// <field locid="WinJS.UI.AppBar.ClosedDisplayMode" helpKeyword="WinJS.UI.AppBar.ClosedDisplayMode">
    /// Display options for the AppBar when closed.
    /// </field>
    static ClosedDisplayMode = ClosedDisplayMode;

    /// <field locid="WinJS.UI.AppBar.Placement" helpKeyword="WinJS.UI.AppBar.Placement">
    /// Display options for AppBar placement in relation to the main view.
    /// </field>
    static Placement = Placement;

    static supportedForProcessing: boolean = true;

    /// <field type="HTMLElement" domElement="true" hidden="true" locid="WinJS.UI.AppBar.element" helpKeyword="WinJS.UI.AppBar.element">
    /// Gets the DOM element that hosts the AppBar.
    /// </field>
    get element() {
        return this._dom.root;
    }

    /// <field type="WinJS.Binding.List" locid="WinJS.UI.AppBar.data" helpKeyword="WinJS.UI.AppBar.data">
    /// Gets or sets the Binding List of WinJS.UI.Command for the AppBar.
    /// </field>
    get data() {
        return this._commandingSurface.data;
    }
    set data(value: BindingList.List<_Command.ICommand>) {
        this._commandingSurface.data = value;
    }

    /// <field type="String" locid="WinJS.UI.AppBar.closedDisplayMode" helpKeyword="WinJS.UI.AppBar.closedDisplayMode">
    /// Gets or sets the closedDisplayMode for the AppBar. Values are "none", "minimal", "compact" and "full".
    /// </field>
    get closedDisplayMode() {
        return this._commandingSurface.closedDisplayMode;
    }
    set closedDisplayMode(value: string) {
        if (ClosedDisplayMode[value]) {
            this._commandingSurface.closedDisplayMode = value;
        }
    }

    private _placement: string;
    /// <field type="Boolean" hidden="true" locid="WinJS.UI.AppBar.placement" helpKeyword="WinJS.UI.AppBar.placement">
    /// Gets or sets a value that specifies whether the AppBar appears at the top or bottom of the main view.
    /// </field>
    get placement(): string {
        return this._placement;
    }
    set placement(value: string) {
        if (Placement[value] && this._placement !== value) {
            this._placement = value;
            switch (value) {
                case Placement.top:
                    this._commandingSurface.overflowDirection = "bottom";
                    break;
                case Placement.bottom:
                    this._commandingSurface.overflowDirection = "top";
                    break;
            }
            this._commandingSurface.deferredDomUpate();
        }
    }

    /// <field type="Boolean" hidden="true" locid="WinJS.UI.AppBar.opened" helpKeyword="WinJS.UI.AppBar.opened">
    /// Gets or sets whether the AppBar is currently opened.
    /// </field>
    get opened(): boolean {
        return this._commandingSurface.opened;
    }
    set opened(value: boolean) {
        this._commandingSurface.opened = value;
    }

    constructor(element?: HTMLElement, options: any = {}) {
        /// <signature helpKeyword="WinJS.UI.AppBar.AppBar">
        /// <summary locid="WinJS.UI.AppBar.constructor">
        /// Creates a new AppBar control.
        /// </summary>
        /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.UI.AppBar.constructor_p:element">
        /// The DOM element that will host the control.
        /// </param>
        /// <param name="options" type="Object" locid="WinJS.UI.AppBar.constructor_p:options">
        /// The set of properties and values to apply to the new AppBar control.
        /// </param>
        /// <returns type="WinJS.UI.AppBar" locid="WinJS.UI.AppBar.constructor_returnValue">
        /// The new AppBar control.
        /// </returns>
        /// </signature>

        this._writeProfilerMark("constructor,StartTM");

        // Check to make sure we weren't duplicated
        if (element && element["winControl"]) {
            throw new _ErrorFromName("WinJS.UI.AppBar.DuplicateConstruction", strings.duplicateConstruction);
        }

        this._initializeDom(element || _Global.document.createElement("div"));
        var stateMachine = new _OpenCloseMachine.OpenCloseMachine({
            eventElement: this.element,
            onOpen: () => {

                this._synchronousOpen();

                // Animate
                return Promise.wrap();
            },

            onClose: () => {
                this._synchronousClose()
                // Animate
                return Promise.wrap();
            },
            onUpdateDom: () => {
                this._updateDomImpl();
            },
            onUpdateDomWithIsOpened: (isOpened: boolean) => {
                this._isOpenedMode = isOpened;
                this._updateDomImpl();
            }
        });
        // Initialize private state.
        this._disposed = false;
        this._commandingSurface = new _CommandingSurface._CommandingSurface(this._dom.commandingSurfaceEl, { openCloseMachine: stateMachine });
        addClass(<HTMLElement>this._dom.commandingSurfaceEl.querySelector(".win-commandingsurface-actionarea"), _Constants.ClassNames.actionAreaCssClass);
        addClass(<HTMLElement>this._dom.commandingSurfaceEl.querySelector(".win-commandingsurface-overflowarea"), _Constants.ClassNames.overflowAreaCssClass);
        addClass(<HTMLElement>this._dom.commandingSurfaceEl.querySelector(".win-commandingsurface-overflowbutton"), _Constants.ClassNames.overflowButtonCssClass);
        addClass(<HTMLElement>this._dom.commandingSurfaceEl.querySelector(".win-commandingsurface-ellipsis"), _Constants.ClassNames.ellipsisCssClass);
        this._isOpenedMode = _Constants.defaultOpened;

        // Initialize public properties.
        this.closedDisplayMode = _Constants.defaultClosedDisplayMode;
        this.placement = _Constants.defaultPlacement;
        this.opened = this._isOpenedMode;
        _Control.setOptions(this, options);

        // Wire up event handlers
        this._handleIHM();

        // Exit the Init state.
        _ElementUtilities._inDom(this.element).then(() => {
            return this._commandingSurface.initialized;
        }).then(() => {
                stateMachine.exitInit();
                this._writeProfilerMark("constructor,StopTM");
            });
    }

    /// <field type="Function" locid="WinJS.UI.AppBar.onbeforeopen" helpKeyword="WinJS.UI.AppBar.onbeforeopen">
    /// Occurs immediately before the control is opened. Is cancelable.
    /// </field>
    onbeforeopen: (ev: CustomEvent) => void;
    /// <field type="Function" locid="WinJS.UI.AppBar.onafteropen" helpKeyword="WinJS.UI.AppBar.onafteropen">
    /// Occurs immediately after the control is opened.
    /// </field>
    onafteropen: (ev: CustomEvent) => void;
    /// <field type="Function" locid="WinJS.UI.AppBar.onbeforeclose" helpKeyword="WinJS.UI.AppBar.onbeforeclose">
    /// Occurs immediately before the control is closed. Is cancelable.
    /// </field>
    onbeforeclose: (ev: CustomEvent) => void;
    /// <field type="Function" locid="WinJS.UI.AppBar.onafterclose" helpKeyword="WinJS.UI.AppBar.onafterclose">
    /// Occurs immediately after the control is closed.
    /// </field>
    onafterclose: (ev: CustomEvent) => void;

    open(): void {
        /// <signature helpKeyword="WinJS.UI.AppBar.open">
        /// <summary locid="WinJS.UI.AppBar.open">
        /// Opens the AppBar
        /// </summary>
        /// </signature>
        this._commandingSurface.open();
    }

    close(): void {
        /// <signature helpKeyword="WinJS.UI.AppBar.close">
        /// <summary locid="WinJS.UI.AppBar.close">
        /// Closes the AppBar
        /// </summary>
        /// </signature>
        this._commandingSurface.close();
    }

    dispose() {
        /// <signature helpKeyword="WinJS.UI.AppBar.dispose">
        /// <summary locid="WinJS.UI.AppBar.dispose">
        /// Disposes this AppBar.
        /// </summary>
        /// </signature>
        if (this._disposed) {
            return;
        }

        this._disposed = true;
        // Disposing the _commandingSurface will trigger dispose on its OpenCloseMachine and synchronously complete any animations that might have been running.
        this._commandingSurface.dispose();

        _Dispose.disposeSubTree(this.element);
    }

    forceLayout() {
        /// <signature helpKeyword="WinJS.UI.AppBar.forceLayout">
        /// <summary locid="WinJS.UI.AppBar.forceLayout">
        /// Forces the AppBar to update its layout. Use this function when the window did not change size, but the container of the AppBar changed size.
        /// </summary>
        /// </signature>
        this._commandingSurface.forceLayout();
    }

    private _writeProfilerMark(text: string) {
        _WriteProfilerMark("WinJS.UI.AppBar:" + this._id + ":" + text);
    }

    private _initializeDom(root: HTMLElement): void {

        this._writeProfilerMark("_intializeDom,info");

        // Attaching JS control to DOM element
        root["winControl"] = this;

        this._id = root.id || _ElementUtilities._uniqueID(root);

        if (!root.hasAttribute("tabIndex")) {
            root.tabIndex = -1;
        }

        _ElementUtilities.addClass(root, _Constants.ClassNames.controlCssClass);
        _ElementUtilities.addClass(root, _Constants.ClassNames.disposableCssClass);

        // Make sure we have an ARIA role
        var role = root.getAttribute("role");
        if (!role) {
            root.setAttribute("role", "menubar");
        }

        var label = root.getAttribute("aria-label");
        if (!label) {
            root.setAttribute("aria-label", strings.ariaLabel);
        }

        // Create element for commandingSurface and reparent any declarative Commands.
        // commandingSurface will parse child elements as AppBarCommands.
        var commandingSurfaceEl = document.createElement("DIV");
        _ElementUtilities._reparentChildren(root, commandingSurfaceEl);
        root.appendChild(commandingSurfaceEl);

        this._dom = {
            root: root,
            commandingSurfaceEl: commandingSurfaceEl,
        };
    }

    private _synchronousOpen(): void {
        this._isOpenedMode = true;
        this._updateDomImpl();
    }

    private _synchronousClose(): void {
        this._isOpenedMode = false;
        this._updateDomImpl();
    }

    // State private to the _updateDomImpl family of method. No other methods should make use of it.
    //
    // Nothing has been rendered yet so these are all initialized to undefined. Because
    // they are undefined, the first time _updateDomImpl is called, they will all be
    // rendered.
    private _updateDomImpl_renderedState = {
        isOpenedMode: <boolean>undefined,
        placement: <string>undefined,
        closedDisplayMode: <string>undefined,
    };
    private _updateDomImpl(): void {
        var rendered = this._updateDomImpl_renderedState;

        if (rendered.isOpenedMode !== this._isOpenedMode) {
            if (this._isOpenedMode) {
                this._updateDomImpl_renderOpened();
            } else {
                this._updateDomImpl_renderClosed();
            }
            rendered.isOpenedMode = this._isOpenedMode;
        }

        if (rendered.placement !== this.placement) {
            removeClass(this._dom.root, placementClassMap[rendered.placement]);
            addClass(this._dom.root, placementClassMap[this.placement]);
            rendered.placement = this.placement;
        }

        if (rendered.closedDisplayMode !== this.closedDisplayMode) {
            removeClass(this._dom.root, closedDisplayModeClassMap[rendered.closedDisplayMode]);
            addClass(this._dom.root, closedDisplayModeClassMap[this.closedDisplayMode]);
            rendered.closedDisplayMode = this.closedDisplayMode;
        }

        this._commandingSurface.updateDomImpl();
    }
    private _updateDomImpl_renderOpened(): void {
        addClass(this._dom.root, _Constants.ClassNames.openedClass);
        removeClass(this._dom.root, _Constants.ClassNames.closedClass);
        this._commandingSurface.synchronousOpen();
    }
    private _updateDomImpl_renderClosed(): void {
        addClass(this._dom.root, _Constants.ClassNames.closedClass);
        removeClass(this._dom.root, _Constants.ClassNames.openedClass);
        this._commandingSurface.synchronousClose();
    }

    private _handleIHM() {
        if (_WinRT.Windows.UI.ViewManagement.InputPane) {

            var keyboardInfo = _KeyboardInfo._KeyboardInfo;

            // Get the top offset for top appbars.
            var _getTopOfVisualViewport = (): number => {
                return keyboardInfo._visibleDocTop;
            };

            // Get the bottom offset for bottom appbars.
            var _getAdjustedBottom = (): number => {
                // Need the distance the IHM moved as well.
                return keyboardInfo._visibleDocBottomOffset;
            };

            var _showingKeyboard = () => {
                var _showingKeyboard = function () {
                    _Global.setTimeout(_ensurePosition,
                        keyboardInfo._animationShowLength + keyboardInfo._scrollTimeout);
                };
            };

            var _hidingKeyboard = () => {
                _ensurePosition();
            };

            //var _showingKeyboard = function _LegacyAppBar_showingKeyboard(event: _WinRT.Windows.UI.ViewManagement.InputPaneVisibilityEventArgs) {
            //    // Remember keyboard showing state.
            //    this._keyboardObscured = false;
            //    this._needToHandleHidingKeyboard = false;

            //    // If we're already moved, then ignore the whole thing
            //    if (keyboardInfo._visible && this._alreadyInPlace()) {
            //        return;
            //    }

            //    this._needToHandleShowingKeyboard = true;
            //    // If focus is in the appbar, don't cause scrolling.
            //    if (this.opened && this._element.contains(_Global.document.activeElement)) {
            //        event.ensuredFocusedElementInView = true;
            //    }

            //    // Check if appbar moves or if we're ok leaving it obscured instead.
            //    if (this._placement === Placement.bottom) {
            //        // Remember that we're obscured
            //        this._keyboardObscured = true;
            //    } else {
            //        // Don't be obscured, clear _scrollHappened flag to give us inference later on when to re-show ourselves.
            //        this._scrollHappened = false;
            //    }

            //    // Also set timeout regardless, so we can clean up our _keyboardShowing flag.
            //    var that = this;
            //    _Global.setTimeout(function () { _checkKeyboardTimer(); },
            //        keyboardInfo._animationShowLength + keyboardInfo._scrollTimeout);
            //};

            //var _hidingKeyboard = function _LegacyAppBar_hidingKeyboard() {
            //    // We'll either just reveal the current space under the IHM or restore the window height.

            //    // We won't be obscured
            //    this._keyboardObscured = false;
            //    this._needToHandleShowingKeyboard = false;
            //    this._needToHandleHidingKeyboard = true;

            //    // We'll either just reveal the current space or resize the window
            //    if (!keyboardInfo._isResized) {
            //        // If we're not completely hidden, only fake hiding under keyboard, or already animating,
            //        // then snap us to our final position.
            //        if (this._visible || this._animating) {
            //            // Not resized, update our final position immediately
            //            this._checkScrollPosition();
            //            this._element.style.display = "";
            //        }
            //        this._needToHandleHidingKeyboard = false;
            //    }
            //    // Else resize should clear keyboardHiding.
            //};


            //var _resize = function _LegacyAppBar_resize(event: any) {
            //    // If we're hidden by the keyboard, then hide bottom appbar so it doesn't pop up twice when it scrolls
            //    if (this._needToHandleShowingKeyboard) {
            //        // Top is allowed to scroll off the top, but we don't want bottom to peek up when
            //        // scrolled into view since we'll show it ourselves and don't want a stutter effect.
            //        if (this._visible) {
            //            if (this._placement !== Placement.top && !this._keyboardObscured) {
            //                // If viewport doesn't match window, need to vanish momentarily so it doesn't scroll into view,
            //                // however we don't want to toggle the visibility="hidden" hidden flag.
            //                this._element.style.display = "none";
            //            }
            //        }
            //        // else if we're top we stay, and if there's a flyout, stay obscured by the keyboard.
            //    } else if (this._needToHandleHidingKeyboard) {
            //        this._needToHandleHidingKeyboard = false;
            //        if (this._visible || this._animating) {
            //            // Snap to final position
            //            this._checkScrollPosition();
            //            this._element.style.display = "";
            //        }
            //    }

            //    //// Make sure everything still fits.
            //    //if (!this._initializing) {
            //    //    this._layoutImpl.resize(event);
            //    //}
            //};

            var _checkKeyboardTimer = () => {
                //if (!this._scrollHappened) {
                //    resume();
                //}
            };

            var _manipulationChanged = (event: any) => {
                //// See if we're at the manipulation stopped state, and we had a scroll happen,
                //// which is implicitly after the keyboard animated.
                //if (event.currentState === 0 && this._scrollHappened) {
                //    resume();
                //}
            };

            var resume = (): void => {
                // Formerly titled, mayEdgeBackIn this function is where the AppBar should do any work that was
                // put on hold or reset because of the IHM showing/hiding events.
            }

            //var _mayEdgeBackIn = function _LegacyAppBar_mayEdgeBackIn() {
            //    // May need to react to IHM being resized event
            //    if (this._needToHandleShowingKeyboard) {
            //        // If not top appbar or viewport isn't still at top, then need to show again
            //        this._needToHandleShowingKeyboard = false;
            //        // If obscured (IHM + flyout showing), it's ok to stay obscured.
            //        // If bottom we have to move, or if top scrolled off screen.
            //        if (!this._keyboardObscured &&
            //            (this._placement !== Placement.top || keyboardInfo._visibleDocTop !== 0)) {
            //            var toPosition = this._visiblePosition;
            //            this._lastPositionVisited = displayModeVisiblePositions.hidden;
            //            this._changeVisiblePosition(toPosition, false);
            //        } else {
            //            // Ensure any animations dropped during the showing keyboard are caught up.
            //            this._checkDoNext();
            //        }
            //    }
            //    this._scrollHappened = false;
            //};

            var _ensurePosition = () => {
                // Position the _LegacyAppBar element relative to the top or bottom edge of the visible
                // document, based on the the visible position we think we need to be in.
                var offSet = _computePositionOffset();
                this.element.style.bottom = offSet.bottom;
                this.element.style.top = offSet.top;

            };

            var _computePositionOffset = (): { top: string; bottom: string } => {
                // Calculates and returns top and bottom offsets for the _LegacyAppBar element, relative to the top or bottom edge of the visible
                // document.
                var positionOffSet = { top: "", bottom: "" };

                if (this._placement === Placement.bottom) {
                    // If the IHM is open, the bottom of the visual viewport may or may not be obscured
                    // Use _getAdjustedBottom to account for the IHM if it is covering the bottom edge.
                    positionOffSet.bottom = _getAdjustedBottom() + "px";
                } else if (this._placement === Placement.top) {
                    positionOffSet.top = _getTopOfVisualViewport() + "px";
                }

                return positionOffSet;
            };

            //var _checkScrollPosition = () => {
            //    // If IHM has appeared, then remember we may come in
            //    if (this._needToHandleShowingKeyboard) {
            //        // Tag that it's OK to edge back in.
            //        this._scrollHappened = true;
            //        return;
            //    }

            //    // We only need to update if we're not completely hidden.
            //    if (this._visible || this._animating) {
            //        this._ensurePosition();
            //        // Ensure any animations dropped during the showing keyboard are caught up.
            //        this._checkDoNext();
            //    }
            //};

            var _alreadyInPlace = () => {
                // See if we're already where we're supposed to be.
                var offSet = _computePositionOffset();
                return (offSet.top === this.element.style.top && offSet.bottom === this.element.style.bottom);
            };

            // React to Soft Keyboard events
            var inputPane = _WinRT.Windows.UI.ViewManagement.InputPane.getForCurrentView();
            inputPane.addEventListener("showing", _showingKeyboard, false);
            inputPane.removeEventListener("hiding", _hidingKeyboard, false);
            //_Global.document.addEventListener("scroll", _checkScrollPosition, false);
            //_Global.document.addEventListener("MSManipulationStateChanged", _manipulationChanged, false);
        }
    }
}

_Base.Class.mix(AppBar, _Events.createEventProperties(
        _Constants.EventNames.beforeOpen,
        _Constants.EventNames.afterOpen,
        _Constants.EventNames.beforeClose,
        _Constants.EventNames.afterClose));

// addEventListener, removeEventListener, dispatchEvent
_Base.Class.mix(AppBar, _Control.DOMEventMixin);
