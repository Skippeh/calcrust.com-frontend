angular.module("RustCalc").directive("craftScreen", ["$stateParams", "$rootScope", "$state", CraftScreenDirective]);

function CraftScreenDirective ($stateParams, $rootScope, $state)
{
    return {
        restrict: "E",
        templateUrl: "templates/partials/craft-screen.html",
        scope: {
            recipe: "="
        },
        link: function ($scope, $element, attrs)
        {
            $scope.cleanCount = function ()
            {
                if (isNaN($scope.input.count))
                    $scope.input.count = 1;

                if ($scope.input.count < 1)
                    $scope.input.count = 1;

                if ($scope.input.count > 99999)
                    $scope.input.count = 99999;
            };

            $scope.input = { count: parseInt($stateParams.count) };
            $scope.cleanCount();

            if (isNaN($scope.input.count))
            {
                console.log("NaN");
                $scope.input.count = 1;
            }
            
            $scope.changeCount = function (delta)
            {
                $scope.input.count += delta;
                $scope.cleanCount();
                $scope.onCountChanged();
            }

            $scope.onCountChanged = function ()
            {
                $scope.reqs = $scope.recipe.calculateTotalRequirements($scope.input.count);

                $state.go(".", { id: $scope.recipe.output.item.id, count: $scope.input.count }, { notify: false });
            };
            
            $scope.isResource = function (item)
            {
                return item.item.recipe == null && $scope.recipeInputItems.indexOf(item.item.id) == -1;
            };

            $scope.$watch("recipe", function (recipe, oldVal)
            {
                $scope.reqs1 = $scope.recipe.calculateTotalRequirements(1);
                $scope.reqs = $scope.recipe.calculateTotalRequirements($scope.input.count);

                $scope.recipeInputItems = [];

                for (var i = 0; i < recipe.input.length; ++i)
                {
                    $scope.recipeInputItems.push(recipe.input[i].item.id);
                }
            });
        }
    };
}