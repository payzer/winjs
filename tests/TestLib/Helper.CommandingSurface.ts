// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
///<reference path="Helper.ts" />
///<reference path="../TestLib/winjs.dev.d.ts" />

module Helper._CommandingSurface {
    "use strict";

    export var Constants = {
        typeSeparator: "separator",
        typeContent: "content",
        typeButton: "button",
        typeToggle: "toggle",
        typeFlyout: "flyout",
        controlCssClass: "win-commandingsurface",
        disposableCssClass: "win-disposable",
        overflowAreaCssClass: "win-commandingsurface-overflowarea",
        emptyCommandingSurfaceCssClass: "win-commandingsurface-empty",
        commandType: "WinJS.UI.AppBarCommand",
        secondaryCommandSection: "secondary",
        commandSelector: ".win-command",

        actionAreaCommandWidth: 68,
        actionAreaSeparatorWidth: 34,
        actionAreaOverflowButtonWidth: 32,

        overflowCommandHeight: 44,
        overflowSeparatorHeight: 12,
        commandingSurfaceMinWidth: 68,

        heightOfMinimal: 24,
        heightOfCompact: 48,
    }

    export function getVisibleCommandsInElement(element: HTMLElement) {
        var result = [];
        var commands = element.querySelectorAll(Constants.commandSelector);
        for (var i = 0, len = commands.length; i < len; i++) {
            if (getComputedStyle(<Element>commands[i]).display !== "none") {
                result.push(commands[i]);
            }
        }
        return result;
    }

    export function verifyOverflowMenuContent(visibleElements: HTMLElement[], expectedLabels: string[]): void {
        var labelIndex = 0;
        for (var i = 0, len = visibleElements.length; i < len; i++) {
            if (visibleElements[i]["winControl"].type === Constants.typeSeparator) {
                LiveUnit.Assert.areEqual(expectedLabels[labelIndex], Constants.typeSeparator);
            } else {
                LiveUnit.Assert.areEqual(expectedLabels[labelIndex], visibleElements[i]["winControl"].label);
            }
            labelIndex++;
        }
    }

    export function verifyActionAreaVisibleCommandsLabels(commandingSurface: WinJS.UI._CommandingSurface, labels: string[]) {
        var commands = getVisibleCommandsInElement((<WinJS.UI.PrivateCommandingSurface>commandingSurface.element.winControl)._dom.actionArea);
        LiveUnit.Assert.areEqual(labels.length, commands.length);
        labels.forEach((label, index) => {
            LiveUnit.Assert.areEqual(label, commands[index].winControl.label);
        });
    }

    export function verifyOverflowAreaCommandsLabels(commandingSurface: WinJS.UI._CommandingSurface, labels: string[]) {
        var control = <WinJS.UI.PrivateCommandingSurface>commandingSurface.element.winControl;
        var commands = getVisibleCommandsInElement(control._dom.overflowArea);
        LiveUnit.Assert.areEqual(labels.length, commands.length);
        labels.forEach((label, index) => {
            LiveUnit.Assert.areEqual(label, commands[index].winControl.label);
        });
    }

    export function verifyRenderedOpened(commandingSurface: WinJS.UI.PrivateCommandingSurface) {
        // Verifies actionarea and overflowarea are opened
        verifyRenderedOpened_actionArea(commandingSurface);
        verifyRenderedOpened_overflowArea(commandingSurface);
    };


    function verifyRenderedOpened_actionArea(commandingSurface: WinJS.UI.PrivateCommandingSurface) {

        var commandElements = Helper._CommandingSurface.getVisibleCommandsInElement(commandingSurface._dom.actionArea),
            commandingSurfaceTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface.element),
            actionAreaTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface._dom.actionArea),
            actionAreaContentBoxHeight = WinJS.Utilities.getContentHeight(commandingSurface._dom.actionArea),
            overflowButtonTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface._dom.overflowButton);

        var heightOfTallestChildElement = 0;
        Array.prototype.forEach.call(commandingSurface._dom.actionArea.children, function (element) {
            var elementHeight = WinJS.Utilities.getTotalHeight(element);
            heightOfTallestChildElement = Math.max(heightOfTallestChildElement, elementHeight);
        });

        LiveUnit.Assert.areEqual(actionAreaTotalHeight, commandingSurfaceTotalHeight, "Height of CommandingSurface should size to its actionarea.");
        LiveUnit.Assert.areEqual(heightOfTallestChildElement, actionAreaContentBoxHeight, "Height of actionarea should size to its content when closedDisplayMode === 'full'");
        LiveUnit.Assert.areEqual(actionAreaTotalHeight, overflowButtonTotalHeight, "overflowButton should stretch to the height of the actionarea");

        // Verify commands are displayed.
        if (Array.prototype.some.call(commandElements, function (commandEl) {
            return getComputedStyle(commandEl).display === "none";
        })) {
            LiveUnit.Assert.fail("CommandingSurface with 'compact' closedDisplayMode should display primary commands.");
        }

        // Verify command labels are displayed.
        if (Array.prototype.some.call(commandElements, function (commandEl) {
            var label = commandEl.querySelector(".win-label");
            return (label && getComputedStyle(label).display == "none");
        })) {
            LiveUnit.Assert.fail("CommandingSurface with 'compact' closedDisplayMode should display primary command labels.");
        }
    };


    function verifyRenderedOpened_overflowArea(commandingSurface: WinJS.UI.PrivateCommandingSurface) {

    };


    export function verifyRenderedClosed(commandingSurface: WinJS.UI.PrivateCommandingSurface) {
        // Verifies actionarea and overflowarea are closed
        verifyRenderedClosed_actionArea(commandingSurface);
        verifyRenderedClosed_oveflowArea(commandingSurface);
    };

    function verifyRenderedClosed_actionArea(commandingSurface: WinJS.UI.PrivateCommandingSurface) {
        var mode = commandingSurface.closedDisplayMode;

        var commandElements = Helper._CommandingSurface.getVisibleCommandsInElement(commandingSurface._dom.actionArea),
            commandingSurfaceTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface.element),
            actionAreaTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface._dom.actionArea),
            actionAreaContentBoxHeight = WinJS.Utilities.getContentHeight(commandingSurface._dom.actionArea),
            overflowButtonTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface._dom.overflowButton);

        switch (mode) {
            case 'none':
                LiveUnit.Assert.areEqual("none", getComputedStyle(commandingSurface.element).display);
                LiveUnit.Assert.areEqual(0, actionAreaTotalHeight);
                LiveUnit.Assert.areEqual(0, overflowButtonTotalHeight);
                break;

            case 'minimal':
                LiveUnit.Assert.areEqual(actionAreaTotalHeight, commandingSurfaceTotalHeight, "Height of CommandingSurface should size to its actionarea.");
                LiveUnit.Assert.areEqual(Helper._CommandingSurface.Constants.heightOfMinimal, actionAreaContentBoxHeight, "invalid ActionArea content height for 'minimal' closedDisplayMode");
                LiveUnit.Assert.areEqual(actionAreaContentBoxHeight, overflowButtonTotalHeight, "overflowButton should stretch to the height of the actionarea");

                // Verify commands are not displayed.
                if (Array.prototype.some.call(commandElements, function (commandEl) {
                    return getComputedStyle(commandEl).display !== "none";
                })) {
                    LiveUnit.Assert.fail("CommandingSurface with 'minimal' closedDisplayMode should not display primary commands.");
                }
                break;

            case 'compact':
                LiveUnit.Assert.areEqual(actionAreaTotalHeight, commandingSurfaceTotalHeight, "Height of CommandingSurface should size to its actionarea.");
                LiveUnit.Assert.areEqual(Helper._CommandingSurface.Constants.heightOfCompact, actionAreaContentBoxHeight, "invalid ActionArea content height for 'compact' closedDisplayMode");
                LiveUnit.Assert.areEqual(actionAreaContentBoxHeight, overflowButtonTotalHeight, "overflowButton should stretch to the height of the actionarea");

                // Verify commands are displayed.
                if (Array.prototype.some.call(commandElements, function (commandEl) {
                    return getComputedStyle(commandEl).display === "none";
                })) {
                    LiveUnit.Assert.fail("CommandingSurface with 'compact' closedDisplayMode should display primary commands.");
                }

                // Verify command labels are not displayed.
                if (Array.prototype.some.call(commandElements, function (commandEl) {
                    var label = commandEl.querySelector(".win-label");
                    return (label && getComputedStyle(label).display !== "none");
                })) {
                    LiveUnit.Assert.fail("CommandingSurface with 'compact' closedDisplayMode should not display primary command labels.");
                }
                break;

            case 'full':
                // closedDisplayMode "full" actionarea, and opened actionarea, render exactly the same.
                verifyRenderedOpened_actionArea(commandingSurface);
                break;

            default:
                LiveUnit.Assert.fail("TEST ERROR: Encountered unknown enum value: " + mode);
                break;
        }
    }

    function verifyRenderedClosed_oveflowArea(commandingSurface: WinJS.UI.PrivateCommandingSurface) {
        var overflowAreaTotalHeight = WinJS.Utilities.getTotalHeight(commandingSurface._dom.overflowArea);
        LiveUnit.Assert.areEqual(0, overflowAreaTotalHeight);
    };

    //export function show(commandingSurface): WinJS.Promise<any> {
    //    return new WinJS.Promise(function (c, e, p): void {
    //        function afterShow(): void {
    //            commandingSurface.removeEventListener("aftershow", afterShow, false);
    //            c();
    //        };
    //        commandingSurface.addEventListener("aftershow", afterShow, false);
    //        commandingSurface.show();
    //    });
    //};

    //export function hide(commandingSurface): WinJS.Promise<any> {
    //    return new WinJS.Promise(function (c, e, p): void {
    //        function afterHide(): void {
    //            commandingSurface.removeEventListener("afterhide", afterHide, false);
    //            c();
    //        };
    //        commandingSurface.addEventListener("afterhide", afterHide, false);
    //        commandingSurface._hideOrDismiss();
    //    });
    //};

    //export function listenOnce (commandingSurface: WinJS.UI.PrivateCommandingSurface, eventName: string, callback: () => any): void {
    //    commandingSurface.addEventListener(eventName, function handler() {
    //        commandingSurface.removeEventListener(eventName, handler, false);
    //        callback();
    //    }, false);
    //}
};