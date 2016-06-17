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

            $scope.input = { count: parseInt($stateParams.count), calculateTotalRequirements: true };
            $scope.cleanCount();

            if (isNaN($scope.input.count))
            {
                console.log("NaN");
                $scope.input.count = 1;
            }
            
            $scope.changeCount = function (delta, $event)
            {
                if ($event.ctrlKey)
                {
                    delta = delta > 0 ? 1 : -1;
                    var roundFunc = delta > 0 ? Math.floor : Math.ceil;
                    var amountForStack = ($scope.recipe.output.item.maxStack / $scope.recipe.output.count);
                    var roundedStacks = Math.round(amountForStack);
                    var difference = amountForStack - roundedStacks;

                    var currentStacks = roundFunc($scope.input.count / amountForStack + (difference * delta));
                    currentStacks += delta;
                    
                    $scope.input.count = Math.floor(currentStacks * amountForStack);
                }
                else
                {
                    $scope.input.count += delta;
                }

                $scope.cleanCount();
                $scope.onCountChanged();
            }

            $scope.onCountChanged = function ()
            {
                $scope.reqs = $scope.recipe.calculateRequirements($scope.input.count, $scope.input.calculateTotalRequirements);
                $state.go(".", { id: $scope.recipe.output.item.id, count: $scope.input.count }, { notify: false });
            };
            
            $scope.isSubcomponent = function (item)
            {
                return $scope.recipeInputItems.indexOf(item.item.id) == -1;
            };

            function onInputChanged()
            {
                $scope.reqs1 = $scope.recipe.calculateRequirements(1, $scope.input.calculateTotalRequirements);
                $scope.reqs = $scope.recipe.calculateRequirements($scope.input.count, $scope.input.calculateTotalRequirements);

                $scope.recipeInputItems = [];

                for (var i = 0; i < $scope.recipe.input.length; ++i)
                {
                    $scope.recipeInputItems.push($scope.recipe.input[i].item.id);
                }
            }

            $scope.$watch("recipe", function ()
            {
                onInputChanged();
            });

            $scope.$watch("input.calculateTotalRequirements", function()
            {
                onInputChanged();
            })
        }
    };
}