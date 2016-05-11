angular.module("RustCalc").config(["$stateProvider", RouteConfig]);

function RouteConfig ($stateProvider)
{
    $stateProvider
        .state("default", {
            url: "/",
            templateUrl: "templates/home.html"
        })
        .state("itembps", {
            url: "/items",
            abstract: true,
            templateUrl: "templates/itembps.html",
            controller: "ItemBPsController"
        })
        .state("itembps.default", {
            url: "",
            templateUrl: "templates/itembps-default.html"
        })
        .state("itembps.item", {
            url: "/:id",
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
        .state("bugreport", {
            url: "/bugreport",
            templateUrl: "templates/bugreport.html",
            controller: "BugReportCtrl"
        })
        .state("api-docs", {
            url: "/api-docs",
            templateUrl: "templates/api-docs.html",
            controller: "ApiDocsCtrl"
        })
        .state("404", {
            url: "*path",
            templateUrl: "templates/not-found.html"
        });

    //$routeProvider
    //.when("/", {
    //    templateUrl: "templates/home.html"
    //})
    //.when("/blueprint/:id/:count?", {
    //    templateUrl: "templates/blueprint.html",
    //    controller: "BlueprintPageCtrl"
    //})
    //.when("/item/:id", {
    //    templateUrl: "templates/item.html"
    //})
    //.when("/not-found", {
    //    templateUrl: "templates/not-found.html"
    //})
    //.otherwise({
    //    redirectTo: "/not-found"
    //});
}