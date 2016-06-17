angular.module("RustCalc", ["perfect_scrollbar", "ui.router", "ngDialog", "ngStorage"]).config(["$locationProvider", "$compileProvider", ModuleConfig]);

function ModuleConfig ($locationProvider, $compileProvider)
{
    $.featherlight.defaults.closeOnClick = "anywhere";
    $.featherlight.defaults.closeIcon = "";

    $locationProvider.html5Mode(true);

    $compileProvider.debugInfoEnabled(false);
}

console.log("Hello! If you want the item and blueprint data it's available as a global variable: RustData, or at /api-docs.");

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