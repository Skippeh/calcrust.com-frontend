angular.module("RustCalc", ["perfect_scrollbar", "ui.router"]).config(["$locationProvider", ModuleConfig]);

function ModuleConfig ($locationProvider)
{
    $.featherlight.defaults.closeOnClick = "anywhere";
    $.featherlight.defaults.closeIcon = "";

    $locationProvider.html5Mode(true);
}

console.log("Hello! If you want the item and blueprint data it's available as a global variable: RustData, or at /data/rust.json.");

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