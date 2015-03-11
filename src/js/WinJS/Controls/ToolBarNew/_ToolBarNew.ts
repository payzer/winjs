// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/// <reference path="../../Core.d.ts" />
import Animations = require("../../Animations");
import _Base = require("../../Core/_Base");
import _BaseUtils = require("../../Core/_BaseUtils");
import BindingList = require("../../BindingList");
import ControlProcessor = require("../../ControlProcessor");
import _Command = require("../AppBar/_Command");
import _Control = require("../../Utilities/_Control");
import _Dispose = require("../../Utilities/_Dispose");
import _ElementUtilities = require("../../Utilities/_ElementUtilities");
import _ErrorFromName = require("../../Core/_ErrorFromName");
import _Flyout = require("../../Controls/Flyout");
import _Global = require("../../Core/_Global");
import _Hoverable = require("../../Utilities/_Hoverable");
import _KeyboardBehavior = require("../../Utilities/_KeyboardBehavior");
import Menu = require("../../Controls/Menu");
import _MenuCommand = require("../Menu/_Command");
import _Resources = require("../../Core/_Resources");
import Scheduler = require("../../Scheduler");
import _WriteProfilerMark = require("../../Core/_WriteProfilerMark");

require(["require-style!less/styles-toolbarnew"]);
require(["require-style!less/colors-toolbarnew"]);

"use strict";

    interface ICommandInfo {
        command: _Command.ICommand;
        width: number;
        priority: number;
    }

interface ICommandWithType {
    element: HTMLElement;
    type: string;
}

interface IFocusableElementsInfo {
    elements: HTMLElement[];
    focusedIndex: number;
}

interface IDataChangeInfo {
    currentElements: HTMLElement[];
    dataElements: HTMLElement[];
    deletedElements: HTMLElement[];
    addedElements: HTMLElement[];
}

var strings = {
    get ariaLabel() { return _Resources._getWinJSString("ui/toolbarAriaLabel").value; },
    get overflowButtonAriaLabel() { return _Resources._getWinJSString("ui/toolbarOverflowButtonAriaLabel").value; },
    get badData() { return "Invalid argument: The data property must an instance of a WinJS.Binding.List"; },
    get mustContainCommands() { return "The toolbar can only contain WinJS.UI.Command or WinJS.UI.AppBarCommand controls"; }
};

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
    private _element: HTMLElement;
    private _data: BindingList.List<_Command.ICommand>;
    private _chosenCommand: _Command.ICommand;
    private _measured = false;
    private _customContentCommandsWidth: { [uniqueID: string]: number };
    private _initializing = true;
    private _inlineOverflowArea: HTMLElement;
    private _hoverable = _Hoverable.isHoverable; /* force dependency on hoverable module */
    private _winKeyboard: _KeyboardBehavior._WinKeyboard;
    private _refreshPending: boolean;
    private _refreshBound: Function;
    private _resizeHandlerBound: (ev: any) => any;
    private _dataChangedEvents = ["itemchanged", "iteminserted", "itemmoved", "itemremoved", "reload"];
    private _extraClass: string;


    /// <field type="HTMLElement" domElement="true" hidden="true" locid="WinJS.UI.ToolBarNew.element" helpKeyword="WinJS.UI.ToolBarNew.element">
    /// Gets the DOM element that hosts the ToolBarNew.
    /// </field>
    get element() {
        return this._element;
    }

    
    constructor(element?: HTMLElement, options: any = {}) {
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
