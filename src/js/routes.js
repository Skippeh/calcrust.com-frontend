angular.module("RustCalc").config(["$stateProvider", RouteConfig]);

function RouteConfig ($stateProvider)
{
    $stateProvider
        .state("itembps", {
            url: "/",
            abstract: true,
            templateUrl: "templates/itembps.html",
            controller: "ItemBPsController"
        })
        .state("itembps.default", {
            url: "",
            templateUrl: "templates/itembps-default.html"
        })
        .state("itembps.item", {
            url: ":id",
            abstract: true,
            templateUrl: "templates/item.html",
            controller: "ItemPageCtrl"
        })
        .state("itembps.item.info", {
            url: "/info",
            templateUrl: "templates/item-info.html"
        })
        .state("itembps.item.recipes", {
            url: "/blueprints",
            templateUrl: "templates/item-recipes.html",
            controller: "ItemRecipesPageCtrl"
        })
        .state("itembps.item.recipe", {
            url: "/blueprint/:count",
            params: { count: "1" },
            templateUrl: "templates/item-blueprint.html",
            controller: "ItemRecipePageCtrl"
        })
        .state("damagetables", {
            url: "/damagetables",
            templateUrl: "templates/damagetables.html",
            controller: "DamageTablesCtrl"
        })
        .state("cookingcalc", {
            url: "/cookingcalc",
            templateUrl: "templates/cookingcalc.html",
            controller: "CookingCalcCtrl"
        })
        .state("changelog", {
            url: "/changelog",
            templateUrl: "templates/changelog.html"
        })
        .state("api-docs", {
            url: "/api-docs",
            templateUrl: "templates/api-docs.html",
            controller: "ApiDocsCtrl"
        })
        .state("404", {
            url: "*path",
            templateUrl: "templates/not-found.html",
            controller: ["$location", ($location) => {
                // Redirect old item links (will probably remove this in the future).
                const url = $location.url();
                if (url.startsWith("/items")) {
                    $location.url(url.substr("/items".length));
                }
            }]
        });
}
