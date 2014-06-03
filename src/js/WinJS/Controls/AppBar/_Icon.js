﻿// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
// Glyph Enumeration
/// <dictionary>Segoe</dictionary>
define([
     ], function appBarIconInit() {
    "use strict";

    var glyphs = ["previous",
                    "next",
                    "play",
                    "pause",
                    "edit",
                    "save",
                    "clear",
                    "delete",
                    "remove",
                    "add",
                    "cancel",
                    "accept",
                    "more",
                    "redo",
                    "undo",
                    "home",
                    "up",
                    "forward",
                    "right",
                    "back",
                    "left",
                    "favorite",
                    "camera",
                    "settings",
                    "video",
                    "sync",
                    "download",
                    "mail",
                    "find",
                    "help",
                    "upload",
                    "emoji",
                    "twopage",
                    "leavechat",
                    "mailforward",
                    "clock",
                    "send",
                    "crop",
                    "rotatecamera",
                    "people",
                    "closepane",
                    "openpane",
                    "world",
                    "flag",
                    "previewlink",
                    "globe",
                    "trim",
                    "attachcamera",
                    "zoomin",
                    "bookmarks",
                    "document",
                    "protecteddocument",
                    "page",
                    "bullets",
                    "comment",
                    "mail2",
                    "contactinfo",
                    "hangup",
                    "viewall",
                    "mappin",
                    "phone",
                    "videochat",
                    "switch",
                    "contact",
                    "rename",
                    "pin",
                    "musicinfo",
                    "go",
                    "keyboard",
                    "dockleft",
                    "dockright",
                    "dockbottom",
                    "remote",
                    "refresh",
                    "rotate",
                    "shuffle",
                    "list",
                    "shop",
                    "selectall",
                    "orientation",
                    "import",
                    "importall",
                    "browsephotos",
                    "webcam",
                    "pictures",
                    "savelocal",
                    "caption",
                    "stop",
                    "showresults",
                    "volume",
                    "repair",
                    "message",
                    "page2",
                    "calendarday",
                    "calendarweek",
                    "calendar",
                    "characters",
                    "mailreplyall",
                    "read",
                    "link",
                    "accounts",
                    "showbcc",
                    "hidebcc",
                    "cut",
                    "attach",
                    "paste",
                    "filter",
                    "copy",
                    "emoji2",
                    "important",
                    "mailreply",
                    "slideshow",
                    "sort",
                    "manage",
                    "allapps",
                    "disconnectdrive",
                    "mapdrive",
                    "newwindow",
                    "openwith",
                    "contactpresence",
                    "priority",
                    "uploadskydrive",
                    "gototoday",
                    "font",
                    "fontcolor",
                    "contact2",
                    "folder",
                    "audio",
                    "placeholder",
                    "view",
                    "setlockscreen",
                    "settile",
                    "cc",
                    "stopslideshow",
                    "permissions",
                    "highlight",
                    "disableupdates",
                    "unfavorite",
                    "unpin",
                    "openlocal",
                    "mute",
                    "italic",
                    "underline",
                    "bold",
                    "movetofolder",
                    "likedislike",
                    "dislike",
                    "like",
                    "alignright",
                    "aligncenter",
                    "alignleft",
                    "zoom",
                    "zoomout",
                    "openfile",
                    "otheruser",
                    "admin",
                    "street",
                    "map",
                    "clearselection",
                    "fontdecrease",
                    "fontincrease",
                    "fontsize",
                    "cellphone",
                    "reshare",
                    "tag",
                    "repeatone",
                    "repeatall",
                    "outlinestar",
                    "solidstar",
                    "calculator",
                    "directions",
                    "target",
                    "library",
                    "phonebook",
                    "memo",
                    "microphone",
                    "postupdate",
                    "backtowindow",
                    "fullscreen",
                    "newfolder",
                    "calendarreply",
                    "unsyncfolder",
                    "reporthacked",
                    "syncfolder",
                    "blockcontact",
                    "switchapps",
                    "addfriend",
                    "touchpointer",
                    "gotostart",
                    "zerobars",
                    "onebar",
                    "twobars",
                    "threebars",
                    "fourbars",
                    "scan",
                    "preview"];

    // Provide properties to grab resources for each of the icons
    /// <summary locid="WinJS.UI.AppBarIcon">
    /// The AppBarIcon enumeration provides a set of glyphs for use with the AppBarCommand icon property.
    /// </summary>
    WinJS.Namespace.define("WinJS.UI.AppBarIcon",
        glyphs.reduce(function (fixedIcons, item) {
            fixedIcons[item] = { get: function () { return WinJS.Resources._getWinJSString("ui/appBarIcons/" + item).value; } };
            return fixedIcons;
        }, {}));
});