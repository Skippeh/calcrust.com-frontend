+function ()
{
    var module = angular.module("RustCalc");

    module.filter("friendlyRecipeInput", function ()
    {
        return function (array)
        {
            if (typeof (array) != "object" || typeof (array.length) != "number")
            {
                throw "friendlyRecipeInput only takes Array of RecipeItem.";
            }

            var sortedArray = array.sort(function (item1, item2) { return item1.item.name > item2.item.name; });

            var output = "";

            for (var i = 0; i < sortedArray.length; ++i)
            {
                var item = sortedArray[i];
                output += item.count + " " + item.item.name;

                if (i < sortedArray.length - 1)
                    output += ", ";
            }

            return output;
        };
    });

    module.filter("limitLength", function ()
    {
        return function (object, maxLength)
        {
            var str = object.toString();

            if (str.length > maxLength + 3)
            {
                str = str.substr(0, maxLength) + "...";
            }

            return str;
        };
    });

    module.filter("friendlyTime", function ()
    {
        return function (totalSeconds)
        {
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds / 60) % 60);
            var seconds = totalSeconds % 60;

            if (hours <= 0 && minutes <= 0)
                return seconds + "s";
            else if (hours <= 0)
                return minutes + "m" + seconds + "s";
            else
                return hours + "h" + minutes + "m" + seconds + "s";
        };
    });

    module.filter("capitalize", function ()
    {
        return function (str)
        {
            return str.substr(0, 1).toUpperCase() + str.substr(1);
        };
    });
}();