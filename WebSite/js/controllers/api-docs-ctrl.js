angular.module("RustCalc").controller("ApiDocsCtrl", ["$scope", "$http", "ngDialog", ApiDocsController]);

function ApiDocsController($scope, $http, ngDialog)
{
    $scope.query = function($event)
    {
        $event.preventDefault();
        var url = $event.currentTarget.href;

        $http.get(url).then(function(response)
        {
            ngDialog.open({
                plain: true,
                template: "",
                controller: ["$element", function($element)
                {
                    var content = $element.find(".ngdialog-content");
                    content.html("<h3 style='margin-bottom: 0'>Response</h3><div style='font-size: 0.8em; margin-bottom: 10px'>" + $event.currentTarget.pathname + "</div>");
                    content.append(new JSONFormatter.default(response.data, 3).render());
                }]
            });
        },
        function (error)
        {
            alert("A response error occured, check the console for more information.");
            console.log("Response error: ", error);
        });
    };

    $scope.routes = [
        {
            name: "Items",
            description: "Information about ingame items, for example weapons and deployables.",
            route: "/items",
            methods: [
                {
                    route: "",
                    example: "",
                    description: "Returns all items.",
                    type: "GET",
                    errors: []
                },
                {
                    route: "/[name]",
                    example: "/rifle.ak",
                    description: "Returns the item with the given shortname or name. Case insensitive.",
                    type: "GET",
                    errors: [
                        {
                            code: 404,
                            description: "No item found with the specified shortname or item name."
                        }
                    ]
                },
                {
                    route: "/search/[term]",
                    example: "/search/pistol",
                    description: "Returns the items with names that contain this substring or items that have matching shortnames. Case insensitive.",
                    type: "GET",
                    errors: []
                }
            ]
        },
        {
            name: "Recipes (blueprints)",
            description: "Information about blueprints used for crafting items.",
            route: "/recipes",
            methods: [
                {
                    route: "",
                    example: "",
                    description: "Returns all recipes.",
                    type: "GET",
                    errors: []
                },
                {
                    route: "/[name]",
                    example: "/rifle.ak",
                    description: "Returns the recipe that creates the item with the specified shortname or name. Case insensitive.",
                    type: "GET",
                    errors: [
                        {
                            code: 404,
                            description: "No blueprint found with the specified shortname or name."
                        }
                    ]
                },
                {
                    route: "/search/[name]",
                    example: "/search/pistol",
                    description: "Returns the recipes where the output item's name contains this substring or have matching shortnames. Case insensitive.",
                    type: "GET",
                    errors: []
                }
            ]
        },
        {
            name: "Cookables",
            description: "Information about items that you can cook/smelt.",
            route: "/cookables",
            methods: [
                {
                    route: "",
                    example: "",
                    description: "Returns all cookables.",
                    type: "GET",
                    errors: []
                },
                {
                    route: "/[name]",
                    example: "/metal.ore",
                    description: "Returns the cookable with the specified shortname or name. Case insensitive.",
                    type: "GET",
                    errors: [
                        {
                            code: 404,
                            description: "No cookable found with the specified shortname or name."
                        }
                    ]
                },
                {
                    route: "/search/[term]",
                    example: "/search/metal",
                    description: "Returns the cookables where the output item's name contains this substring or has a matching shortname. Case insensitive.",
                    type: "GET",
                    errors: []
                }
            ]
        }
    ];
}