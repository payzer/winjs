// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
import _CommandingSurfaceConstants = require("../CommandingSurface/_Constants");

// toolbar class names
export var ClassNames = {
    controlCssClass: "win-toolbar",
    disposableCssClass: "win-disposable",
    actionAreaCssClass: "win-toolbar-actionarea",
    overflowButtonCssClass: "win-toolbar-overflowbutton",
    spacerCssClass: "win-toolbar-spacer",
    ellipsisCssClass: "win-toolbar-ellipsis",
    overflowAreaCssClass: "win-toolbar-overflowarea",
    contentFlyoutCssClass: "win-toolbar-contentflyout",
    emptytoolbarCssClass: "win-toolbar-empty",
    menuCssClass: "win-menu",
    menuContainsToggleCommandClass: "win-menu-containstogglecommand",
    menuContainsFlyoutCommandClass: "win-menu-containsflyoutcommand",
    openingClass: "win-toolbar-opening",
    openedClass: "win-toolbar-opened",
    closingClass: "win-toolbar-closing",
    closedClass: "win-toolbar-closed",
    noneClass: "win-toolbar-closeddisplaynone",
    minimalClass: "win-toolbar-closeddisplayminimal",
    compactClass: "win-toolbar-closeddisplaycompact",
    fullClass: "win-toolbar-closeddisplayfull",
    topToBottomClass: "win-toolbar-toptobottom",
    bottomToTopClass: "win-toolbar-bottomtotop",
};

export var EventNames = {
    /* TODO Update the string literals to the proper open/close nomenclature once we move the state machine and splitview over to the new names. */
    beforeShow: "beforeshow",
    afterShow: "aftershow",
    beforeHide: "beforehide",
    afterHide: "afterhide"
};

export var controlMinWidth: number = _CommandingSurfaceConstants.controlMinWidth;

export var defaultClosedDisplayMode = "compact";
export var defaultOpened = false;

// Constants for commands
export var typeSeparator = "separator";
export var typeContent = "content";
export var typeButton = "button";
export var typeToggle = "toggle";
export var typeFlyout = "flyout";