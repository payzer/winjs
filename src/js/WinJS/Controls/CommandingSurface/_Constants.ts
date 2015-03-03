// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

// CommandingSurface class names
export var controlCssClass = "win-commandingsurface";
export var actionAreaCssClass = "win-commandingsurface-actionarea";
export var overflowButtonCssClass = "win-commandingsurface-overflowbutton";
export var spacerCssClass = "win-commandingsurface-spacer";
export var ellipsisCssClass = "win-commandingsurface-ellipsis";
export var overflowAreaCssClass = "win-commandingsurface-overflowarea";
export var contentFlyoutCssClass = "win-commandingsurface-contentflyout";
export var emptyCommandingSurfaceCssClass = "win-commandingsurface-empty";
export var menuCssClass = "win-menu";
export var menuContainsToggleCommandClass = "win-menu-containstogglecommand";
export var menuContainsFlyoutCommandClass = "win-menu-containsflyoutcommand";

export var EventNames = {
    /*Update the string literals to the proper open/close nomenclature once we move the state machine and splitview over to the new names. */
    beforeOpen: "beforeshow",
    afterOpen: "aftershow",
    beforeClose: "beforehide",
    afterClose: "afterhide"
};

export var contentMenuCommandDefaultLabel = "Custom content";

export var defaultClosedDisplayMode = "compact";

// Constants for commands
export var typeSeparator = "separator";
export var typeContent = "content";
export var typeButton = "button";
export var typeToggle = "toggle";
export var typeFlyout = "flyout";
