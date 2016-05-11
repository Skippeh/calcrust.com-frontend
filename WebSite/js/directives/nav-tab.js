angular.module("RustCalc").directive("navTabs", [NavTabs]).directive("navTab", [NavTab]);

function NavTabs ()
{
    return {
        restrict: "E",
        templateUrl: "templates/partials/nav-tabs.html",
        transclude: true,
        replace: true,
        link: function ($scope, $element, attrs)
        {
            
        }
    }
}

function NavTab ()
{
    return {
        restrict: "E",
        templateUrl: "templates/partials/nav-tab.html",
        scope: {
            href: "@",
            active: "=",
            target: "@"
        },
        transclude: true,
        link: function ($scope, $element, attrs)
        {

        }
    }
}