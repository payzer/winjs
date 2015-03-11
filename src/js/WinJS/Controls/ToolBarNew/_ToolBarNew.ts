// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/// <reference path="../../Core.d.ts" />
import Animations = require("../../Animations");
import _Base = require("../../Core/_Base");
import _BaseUtils = require("../../Core/_BaseUtils");
import BindingList = require("../../BindingList");
import ControlProcessor = require("../../ControlProcessor");
import _Constants = require("../ToolBarNew/_Constants");
import _Command = require("../AppBar/_Command");
import _CommandingSurface = require("../CommandingSurface");
import _TCommandingSurface = require("../CommandingSurface/_CommandingSurface");
import _Control = require("../../Utilities/_Control");
import _Dispose = require("../../Utilities/_Dispose");
import _ElementUtilities = require("../../Utilities/_ElementUtilities");
import _ErrorFromName = require("../../Core/_ErrorFromName");
import _Events = require('../../Core/_Events');
import _Flyout = require("../../Controls/Flyout");
import _Global = require("../../Core/_Global");
import _Hoverable = require("../../Utilities/_Hoverable");
import _KeyboardBehavior = require("../../Utilities/_KeyboardBehavior");
import Menu = require("../../Controls/Menu");
import _MenuCommand = require("../Menu/_Command");
import Promise = require('../../Promise');
import _Resources = require("../../Core/_Resources");
import Scheduler = require("../../Scheduler");
import _ShowHideMachine = require('../../Utilities/_ShowHideMachine');
import _WriteProfilerMark = require("../../Core/_WriteProfilerMark");


require(["require-style!less/styles-toolbarnew"]);
require(["require-style!less/colors-toolbarnew"]);

"use strict";

var strings = {
    get ariaLabel() { return _Resources._getWinJSString("ui/toolbarnewAriaLabel").value; },
    get overflowButtonAriaLabel() { return _Resources._getWinJSString("ui/toolbarnewOverflowButtonAriaLabel").value; },
    get badData() { return "Invalid argument: The data property must an instance of a WinJS.Binding.List"; },
    get mustContainCommands() { return "The toolbarnew can only contain WinJS.UI.Command or WinJS.UI.AppBarCommand controls"; }
};

var CommandLayoutPipeline = {
    newDataStage: 3,
    measuringStage: 2,
    layoutStage: 1,
    idle: 0,
};

var Orientation = {
    bottom: "bottom",
    top: "top",
}

var ClosedDisplayMode = {
    /// <field locid="WinJS.UI.ToolBarNew.ClosedDisplayMode.compact" helpKeyword="WinJS.UI.ToolBarNew.ClosedDisplayMode.compact">
    /// When the ToolBarNew is closed, the height of the actionarea is reduced such that button commands are still visible, but their labels are hidden.
    /// </field>
    compact: "compact",
    /// <field locid="WinJS.UI.ToolBarNew.ClosedDisplayMode.full" helpKeyword="WinJS.UI.ToolBarNew.ClosedDisplayMode.full">
    /// When the ToolBarNew is closed, the height of the actionarea is always sized to content and does not change between opened and closed states.
    /// </field>
    full: "full",
};

var closedDisplayModeClassMap = {};
closedDisplayModeClassMap[ClosedDisplayMode.compact] = _Constants.ClassNames.compactClass;
closedDisplayModeClassMap[ClosedDisplayMode.full] = _Constants.ClassNames.fullClass;

/// <field>
/// <summary locid="WinJS.UI.ToolBarNew">
/// Represents a toolbar for displaying commands.
/// </summary>
/// </field>
/// <icon src="ui_winjs.ui.toolbar.12x12.png" width="12" height="12" />
/// <icon src="ui_winjs.ui.toolbar.16x16.png" width="16" height="16" />
/// <htmlSnippet supportsContent="true"><![CDATA[<div data-win-control="WinJS.UI.ToolBarNew">
/// <button data-win-control="WinJS.UI.Command" data-win-options="{id:'',label:'example',icon:'back',type:'button',onclick:null,section:'primary'}"></button>
/// </div>]]></htmlSnippet>
/// <part name="toolbar" class="win-toolbar" locid="WinJS.UI.ToolBarNew_part:toolbar">The entire ToolBarNew control.</part>
/// <part name="toolbar-overflowbutton" class="win-toolbar-overflowbutton" locid="WinJS.UI.ToolBarNew_part:ToolBarNew-overflowbutton">The toolbar overflow button.</part>
/// <part name="toolbar-overflowarea" class="win-toolbar-overflowarea" locid="WinJS.UI.ToolBarNew_part:ToolBarNew-overflowarea">The container for toolbar commands that overflow.</part>
/// <resource type="javascript" src="//$(TARGET_DESTINATION)/js/WinJS.js" shared="true" />
/// <resource type="css" src="//$(TARGET_DESTINATION)/css/ui-dark.css" shared="true" />
export class ToolBarNew {
    private _id: string;
    private _disposed: boolean;
    //private _commandingSurface: _TCommandingSurface._CommandingSurface = new _CommandingSurface();

    // <field locid="WinJS.UI.ToolBarNew.ClosedDisplayMode" helpKeyword="WinJS.UI.ToolBarNew.ClosedDisplayMode">
    /// Display options for the actionarea when the ToolBarNew is closed.
    /// </field>
    static ClosedDisplayMode = ClosedDisplayMode;

    static supportedForProcessing: boolean = true;

    private _element: HTMLElement;
    /// <field type="HTMLElement" domElement="true" hidden="true" locid="WinJS.UI.ToolBarNew.element" helpKeyword="WinJS.UI.ToolBarNew.element">
    /// Gets the DOM element that hosts the ToolBarNew.
    /// </field>
    get element() {
        return this._element;
    }

    /// <field type="WinJS.Binding.List" locid="WinJS.UI.ToolBarNew.data" helpKeyword="WinJS.UI.ToolBarNew.data">
    /// Gets or sets the Binding List of WinJS.UI.Command for the ToolBarNew.
    /// </field>
    get data() {
        return this._data;
    }
    set data(value: BindingList.List<_Command.ICommand>) {
        this._writeProfilerMark("set_data,info");

        if (value !== this.data) {
            if (!(value instanceof BindingList.List)) {
                throw new _ErrorFromName("WinJS.UI.ToolBarNew.BadData", strings.badData);
            }

            if (this._data) {
                this._removeDataListeners();
            }
            this._data = value;
            this._addDataListeners();
            this._dataUpdated();
        }
    }

    private _closedDisplayMode: string;
    /// <field type="String" locid="WinJS.UI.ToolBarNew.closedDisplayMode" helpKeyword="WinJS.UI.ToolBarNew.closedDisplayMode">
    /// Gets or sets the closedDisplayMode for the ToolBarNew. Values are "none", "minimal", "compact", and "full".
    /// </field>
    get closedDisplayMode() {
        return this._closedDisplayMode;
    }
    set closedDisplayMode(value: string) {
        this._writeProfilerMark("set_closedDisplayMode,info");

        var isChangingState = (value !== this._closedDisplayMode);
        if (ClosedDisplayMode[value] && isChangingState) {
            this._closedDisplayMode = value;
            this._machine.updateDom();
        }
    }

    private _orientation: string;
    /// <field type="String" hidden="true" locid="WinJS.UI.ToolBarNew.orientation" helpKeyword="WinJS.UI.ToolBarNew.orientation">
    /// Gets or sets which direction the ToolBarNew opens. Values are "top" for top-to-bottom and "bottom" for bottom-to-top.
    /// </field>
    get orientation(): string {
        return this._orientation;
    }
    set orientation(value: string) {
        var isChangingState = (value !== this._orientation);
        if (Orientation[value] && isChangingState) {
            this._orientation = value;
        }
    }

    /// <field type="Boolean" hidden="true" locid="WinJS.UI.ToolBarNew.opened" helpKeyword="WinJS.UI.ToolBarNew.opened">
    /// Gets or sets whether the ToolBarNew is currently opened.
    /// </field>
    get opened(): boolean {
        return !this._machine.hidden;
    }
    set opened(value: boolean) {
        this._machine.hidden = !value;
    }


    constructor(element?: HTMLElement, options: any = {}) {

        this._commandingSurface = new _CommandingSurface();
        /// <signature helpKeyword="WinJS.UI.ToolBarNew.ToolBarNew">
        /// <summary locid="WinJS.UI.ToolBarNew.constructor">
        /// Creates a new ToolBarNew control.
        /// </summary>
        /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.UI.ToolBarNew.constructor_p:element">
        /// The DOM element that will host the control. 
        /// </param>
        /// <param name="options" type="Object" locid="WinJS.UI.ToolBarNew.constructor_p:options">
        /// The set of properties and values to apply to the new ToolBarNew control.
        /// </param>
        /// <returns type="WinJS.UI.ToolBarNew" locid="WinJS.UI.ToolBarNew.constructor_returnValue">
        /// The new ToolBarNew control.
        /// </returns>
        /// </signature>

        // TODO

    }

    dispose() {
        /// <signature helpKeyword="WinJS.UI.ToolBarNew.dispose">
        /// <summary locid="WinJS.UI.ToolBarNew.dispose">
        /// Disposes this ToolBarNew.
        /// </summary>
        /// </signature>
        if (this._disposed) {
            return;
        }

        // TODO

        _Dispose.disposeSubTree(this.element);
        this._disposed = true;
    }

    forceLayout() {
        /// <signature helpKeyword="WinJS.UI.ToolBarNew.forceLayout">
        /// <summary locid="WinJS.UI.ToolBarNew.forceLayout">
        /// Forces the ToolBarNew to update its layout. Use this function when the window did not change size, but the container of the ToolBarNew changed size.
        /// </summary>
        /// </signature>

        // TODO

    }

    private _writeProfilerMark(text: string) {
        _WriteProfilerMark("WinJS.UI.ToolBarNew:" + this._id + ":" + text);
    }


    //private _getDataFromDOMElements(): BindingList.List<_Command.ICommand> {
    //    this._writeProfilerMark("_getDataFromDOMElements,info");

    //    ControlProcessor.processAll(this._mainActionArea, /*skip root*/ true);

    //    var commands: _Command.ICommand[] = [];
    //    var childrenLength = this._mainActionArea.children.length;
    //    var child: Element;
    //    for (var i = 0; i < childrenLength; i++) {
    //        child = this._mainActionArea.children[i];
    //        if (child["winControl"] && child["winControl"] instanceof _Command.AppBarCommand) {
    //            commands.push(child["winControl"]);
    //        } else if (!this._overflowButton) {
    //            throw new _ErrorFromName("WinJS.UI.ToolBarNew.MustContainCommands", strings.mustContainCommands);
    //        }
    //    }
    //    return new BindingList.List(commands);
    //}

    static supportedForProcessing: boolean = true;
}

// addEventListener, removeEventListener, dispatchEvent
_Base.Class.mix(ToolBarNew, _Control.DOMEventMixin);
