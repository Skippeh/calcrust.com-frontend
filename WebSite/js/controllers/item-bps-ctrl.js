angular.module("RustCalc").controller("ItemBPsController", ["$scope", "$filter", "$rustData", "$rootScope", "$state", ItemBPsController]);

function ItemBPsController ($scope, $filter, $rustData, $rootScope, $state)
{
    $rootScope.page.titlePrefix = "Items & Blueprints";

    $scope.blueprintFilter =
    {
        name: "",
        categories: { "default": true, fragments: true, page: true, book: true, library: true }
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
        return $scope.blueprintFilter.categories[recipe.rarity] === true && recipe.output.item.name.toLowerCase().indexOf($scope.blueprintFilter.name.toLowerCase()) != -1;
    };
    
    $scope.filterItems = function (item)
    {
        return item.name.toLowerCase().indexOf($scope.itemFilter.name.toLowerCase()) != -1;
    };

    $scope.toggleBpCategory = function (categoryName, $event)
    {
        var categories = $scope.blueprintFilter.categories;

        var active = categories[categoryName] == true;

        if ($event.ctrlKey)
            categories[categoryName] = !active;
        else
        {
            for (var key in categories)
            {
                if (!categories.hasOwnProperty(key))
                    continue;

                categories[key] = false;
            }

            categories[categoryName] = true;
        }
    };

    $scope.resetBpCategories = function ()
    {
        var newValue = true;

        if ($scope.allCategoriesActive())
        {
            newValue = false;
        }

        $scope.blueprintFilter.categories["default"] = newValue;
        $scope.blueprintFilter.categories["fragments"] = newValue;
        $scope.blueprintFilter.categories["page"] = newValue;
        $scope.blueprintFilter.categories["book"] = newValue;
        $scope.blueprintFilter.categories["library"] = newValue;
    };

    $scope.allCategoriesActive = function ()
    {
        return !Object.keys($scope.blueprintFilter.categories).filter(function (val) { return !$scope.blueprintFilter.categories[val]; }).length;
    }

    $scope.categoryActive = function (categoryName)
    {
        return $scope.blueprintFilter.categories[categoryName] === true;
    };

    $scope.bpActive = function (recipe)
    {
        return $scope.stateParams.id == recipe.output.item.id && $state.includes("itembps.item.recipe");
    }

    $scope.itemActive = function (item)
    {
        return $scope.stateParams.id == item.id && $state.includes("itembps.item");
    }

    $scope.rustData = $rustData;
    $scope.itemsArray = Object.keys($rustData.items).map(function (key) { return $rustData.items[key]; });

    applyRecipeFilter();
    applyItemFilter();
}