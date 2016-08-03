﻿angular.module("RustCalc", ["templates", "perfect_scrollbar", "ui.router", "ngDialog", "ngStorage"]).config(["$locationProvider", "$compileProvider", ModuleConfig]);

function ModuleConfig ($locationProvider, $compileProvider)
{
    $.featherlight.defaults.closeOnClick = "anywhere";
    $.featherlight.defaults.closeIcon = "";

    $locationProvider.html5Mode(true);

    $compileProvider.debugInfoEnabled(false);

    window.toastr.options = {
        closeButton: true,
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
        newestOnTop: false
    };
}

Object.values = function (obj)
{
    var result = [];

    for (var key in obj)
    {
        if (!obj.hasOwnProperty(key))
            continue;

        result.push(obj[key]);
    }

    return result;
};

console.log("Hello! If you want the item and blueprint data it's available as a global variable: RustData, or at /api-docs.");