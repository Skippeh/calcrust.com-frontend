angular.module("RustCalc").controller("ItemBPsController", ["$scope", "$rustData", "$rootScope", ItemBPsController]);

function ItemBPsController($scope, $rustData, $rootScope)
{
    $rootScope.page.titlePrefix = "Items & Blueprints";

    $scope.items = Object.values($rustData.items);
    $scope.recipes = $rustData.recipes;

    $scope.categories = [{
        name: "all",
        items: $scope.items
    }].concat(_.map(_.groupBy($scope.items, "category"),
        (items, name) => ({ name, items })
    ));

    $scope.selectCategory = function(category)
    {
        $scope.selectedCategory = category;
    };

    $scope.selectCategory($scope.categories[0]);

    $scope.itemActive = function (item)
    {
        return $scope.stateParams.id === item.id;
    };

    $scope.scrollToTop = function ()
    {
        $(".item-browser .browser-wrapper").scrollTop(0);
    };
}