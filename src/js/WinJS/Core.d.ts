// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.

interface Gamepad {
    id: string;
    index: number;
    connected: boolean;
    timestamp: number;
    mapping: string;
    axes: number[];
    buttons: GamepadButton[];
}

interface GamepadButton {
    pressed: boolean;
    value: number;
}

interface Navigator {
    getGamepads(): Gamepad[];
}

interface Object {
    [key: string]: any;
}
