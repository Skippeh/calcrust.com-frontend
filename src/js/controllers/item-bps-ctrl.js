angular.module("RustCalc").controller("ItemBPsController", ["$scope", "$filter", "$rustData", "$rootScope", "$state", ItemBPsController]);

function ItemBPsController ($scope, $filter, $rustData, $rootScope, $state)
{
    $rootScope.page.titlePrefix = "Items & Blueprints";

    $scope.blueprintFilter =
    {
        name: ""
    };

    $scope.itemFilter = {
        name: ""
    };

    $scope.filteredRecipes = [];
    $scope.filteredItems = [];

    function applyRecipeFilter()
    {
        if (typeof $scope.rustData == "undefined")
            return;

        var blueprints = Object.values($scope.rustData.recipes);
        blueprints = blueprints.filter($scope.filterBlueprints);
        blueprints = $filter("orderBy")(blueprints, "output.item.name");

        $scope.filteredRecipes = blueprints;
        $(".blueprint-browser .browser-wrapper").scrollTop(0); // Reset scroll position to top of list.
    }

    function applyItemFilter ()
    {
        if (typeof $scope.rustData == "undefined")
            return;

        var items = $scope.itemsArray.filter($scope.filterItems);
        items = $filter("orderBy")(items, "name");

        $scope.filteredItems = items;
        $(".item-browser .browser-wrapper").scrollTop(0); // Reset scroll position to top of list.
    }

    $scope.$watch("blueprintFilter", applyRecipeFilter, true);
    $scope.$watch("itemFilter", applyItemFilter, true);

    $scope.filterBlueprints = function (recipe)
    {
        return recipe.output.item.name.toLowerCase().indexOf($scope.blueprintFilter.name.toLowerCase()) != -1;
    };
    
    $scope.filterItems = function (item)
    {
        return item.name.toLowerCase().indexOf($scope.itemFilter.name.toLowerCase()) != -1;
    };
    
    $scope.bpActive = function (recipe)
    {
        return $scope.stateParams.id == recipe.output.item.id && ($state.includes("itembps.item.recipe") || $state.includes("itembps.item.recipes"));
    }

    $scope.itemActive = function (item)
    {
        return $scope.stateParams.id == item.id && $state.includes("itembps.item.info");
    }

    $scope.rustData = $rustData;
    $scope.itemsArray = Object.keys($rustData.items).map(function (key) { return $rustData.items[key]; });

    applyRecipeFilter();
    applyItemFilter();
}