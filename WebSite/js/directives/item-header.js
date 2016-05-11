angular.module("RustCalc").directive("itemHeader", [ItemHeaderDirective]);

function ItemHeaderDirective ()
{
    return {
        restrict: "E",
        templateUrl: "templates/item-header.html",
        scope: {
            item: "="
        },
        link: function ($scope, $element, attrs)
        {
            $scope.openImageModal = function ()
            {
                $.featherlight("/img/icons/" + $scope.item.id + ".png");
            };
        }
    }
}