angular.module("RustCalc").controller("ItemPageCtrl", ["$scope", "$rustData", "$stateParams", "$state", "$rootScope", ItemPageCtrl]);

function ItemPageCtrl ($scope, $rustData, $stateParams, $state, $rootScope)
{
    $scope.item = $rustData.items[$stateParams.id];
    $rootScope.page.titlePrefix = $scope.item && $scope.item.name || "Item not found";

    $scope.isActive = function (stateName)
    {
        return $state.includes(stateName);
    };

    $scope.getWikiLink = function (item)
    {
        return "http://rust.wikia.com/wiki/" + item.name.replace(/\s/g, "_");
    };

    $scope.getBpImage = function (item)
    {
        if (item.recipe == null)
            return "";

        var prefix = "/img/icons/";

        switch (item.recipe.rarity)
        {
            case "default":
                return prefix + "building.planner_small.png";
            case "fragments":
                return prefix + "blueprint_fragment_small.png";
            case "page":
                return prefix + "blueprint_page_small.png";
            case "book":
                return prefix + "blueprint_book_small.png";
            case "library":
                return prefix + "blueprint_library_small.png";
        }

        return "";
    };
}