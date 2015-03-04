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

    export function useSynchronousAnimations(commandingSurface: WinJS.UI.PrivateCommandingSurface) {
        commandingSurface._playShowAnimation = function () {
            return WinJS.Promise.wrap();
        };
        commandingSurface._playHideAnimation = function () {
            return WinJS.Promise.wrap();
        };
        return commandingSurface;
    }

    export function show(commandingSurface): WinJS.Promise<any> {
        return new WinJS.Promise(function (c, e, p): void {
            function afterShow(): void {
                commandingSurface.removeEventListener("aftershow", afterShow, false);
                c();
            };
            commandingSurface.addEventListener("aftershow", afterShow, false);
            commandingSurface.show();
        });
    };

    export function hide(commandingSurface): WinJS.Promise<any> {
        return new WinJS.Promise(function (c, e, p): void {
            function afterHide(): void {
                commandingSurface.removeEventListener("afterhide", afterHide, false);
                c();
            };
            commandingSurface.addEventListener("afterhide", afterHide, false);
            commandingSurface._hideOrDismiss();
        });
    };

    export function listenOnce (commandingSurface: WinJS.UI.PrivateCommandingSurface, eventName: string, callback: () => any): void {
        commandingSurface.addEventListener(eventName, function handler() {
            commandingSurface.removeEventListener(eventName, handler, false);
            callback();
        }, false);
    }
}