angular.module("RustCalc").service("$rustData", ["$http", RustDataService]);

function RustDataService ($http)
{
    var items = {};
    var recipes = {};
    var cookables = {};

    // Recipe
    function Recipe(input, output, ttc, rarity, level, price, parent)
    {
        this.input = input; // Array of RecipeItem
        this.output = output; // RecipeItem
        this.ttc = ttc; // Int (time to craft)
        this.level = level; // Int (level required to unlock)
        this.price = price; // Int (xp required to unlock)
        this.parent = parent; // Item (parent item required to be unlocked to unlock this)

        this.calculateRequirements = function (count, calculateTotalRequirements)
        {
            if (typeof (count) == "undefined")
                count = 1;

            var neededItems = calculateTotalRequirements ? this.calculateNeededItems() : angular.copy(this.input);
            var result = {
                ttc: calculateTotalRequirements ? this.calculateTtc(neededItems, count) : this.ttc * count,
                items: neededItems
            };

            for (var i = 0; i < result.items.length; ++i)
            {
                result.items[i].count = Math.ceil(result.items[i].count * count);
            }

            return result;
        };

        this.calculateTtc = function (items, count)
        {
            var ttc = this.ttc * count;

            for (var i = 0; i < items.length; ++i)
            {
                var recipeItem = items[i];

                if (recipeItem.item.recipe != null)
                {
                    var divide = 1;

                    if (recipeItem.item.recipe != null)
                        divide = recipeItem.item.recipe.output.count;

                    ttc += (recipeItem.count / divide) * recipeItem.item.recipe.ttc * count;
                }
            }

            return Math.round(ttc);
        };

        this.calculateNeededItems = function ()
        {
            var result = [];
            
            function findItem (item)
            {
                for (var i = 0; i < result.length; ++i)
                {
                    if (result[i].item == item)
                        return result[i];
                }

                return null;
            }

            function addItem (recipeItem, times)
            {
                if (typeof (times) == "undefined")
                {
                    times = 1;
                }

                var existingItem = findItem(recipeItem.item);

                if (existingItem == null)
                {
                    var newItem = { item: recipeItem.item, count: recipeItem.count * times };
                    result.push(newItem);
                }
                else
                {
                    existingItem.count += recipeItem.count * times;
                }
            }
            
            for (var i = 0; i < this.input.length; ++i)
            {
                var recipeItem = this.input[i];

                if (recipeItem.item.recipe != null)
                {
                    var inputRecipe = recipeItem.item.recipe;
                    var craftsNeeded = recipeItem.count / inputRecipe.output.count;
                    //console.log("Crafts needed for " + recipeItem.count + " " + recipeItem.item.name + ": " + craftsNeeded);

                    var requirements = inputRecipe.calculateNeededItems();
                    //console.log("Requirements for " + recipeItem.item.name, requirements);

                    for (var j = 0; j < requirements.length; ++j)
                    {
                        addItem(requirements[j], craftsNeeded);
                    }

                    addItem(recipeItem);
                }
                else
                {
                    addItem(recipeItem);
                }
            }

            return result;
        };
    };

    // RecipeItem
    function RecipeItem(itemId, count)
    {
        this.item = typeof itemId === "string" ? items[itemId] : itemId; // Item
        this.count = count; // Int

        RecipeItem.prototype.toString = function ()
        {
            return "RecipeItem: " + this.item.name + " (" + this.count + ")";
        };
    }

    // Item
    function Item(name, description, maxStack, category, meta)
    {
        this.name = name;
        this.description = description;
        this.maxStack = maxStack;
        this.recipe = null; // The recipe that produces this item. May be null.
        this.category = category;
        this.meta = meta;

        if (this.meta && this.meta.type == "oven")
            this.meta.cookables = [];

        this.getRecipesWhereInput = function ()
        {
            var inputRecipes = [];
            
            for (var itemId in recipes)
            {
                if (!recipes.hasOwnProperty(itemId))
                    continue;

                var recipe = recipes[itemId];

                for (var i = 0; i < recipe.input.length; ++i)
                {
                    if (recipe.input[i].item.id == this.id)
                    {
                        inputRecipes.push({ item: recipe.output.item, count: recipe.input[i].count });
                        break;
                    }
                }
            }

            return inputRecipes;
        };
    };

    // Cookable
    function Cookable(usableOvens, ttc, outputId, outputCount)
    {
        this.usableOvens = {}; // Dictionary of objects containing the item that can cook this and the amount of fuel used for 1.
        this.ttc = ttc; // Time to cook
        this.output = {
            count: outputCount,
            item: items[outputId]
        };

        // Set oven items to their item definitions.
        for (var i = 0; i < usableOvens.length; ++i)
        {
            this.usableOvens[usableOvens[i].item] = { fuelConsumed: usableOvens[i].fuelConsumed, item: items[usableOvens[i].item] };
        }
    }
    
    return {
        items: items,
        recipes: recipes,
        cookables: cookables,
        load: function (callback)
        {
            $http({
                method: "GET",
                url: "https://api.calcrust.com/dump"
            }).then(
            function onSuccess(response)
            {
                var data = response.data.data;

                this.meta = data.meta;
                this.meta.lastUpdate = new Date(this.meta.lastUpdate);

                // Parse items
                for (var itemId in data.items)
                {
                    if (!data.items.hasOwnProperty(itemId))
                        continue;

                    var loadItem = data.items[itemId];
                    this.items[itemId] = new Item(loadItem.name, loadItem.description, loadItem.maxStack, loadItem.category, loadItem.meta);
                }
                
                // Set various meta values
                for (var itemId in this.items)
                {
                    if (!this.items.hasOwnProperty(itemId))
                        continue;

                    let item = this.items[itemId];

                    if (item.meta != null)
                    {
                        // Set oven fuel type item.
                        if (item.meta.type == "oven" && item.meta.fuelType != null)
                        {
                            item.meta.fuelType = this.items[item.meta.fuelType];
                        }
                        // Set burnable byproduct item.
                        else if (item.meta.type == "burnable" && item.meta.byproductItem != null)
                        {
                            item.meta.byproductItem = this.items[item.meta.byproductItem];
                        }
                    }
                }

                // Parse recipes
                for (var key in data.recipes)
                {
                    if (!data.recipes.hasOwnProperty(key))
                        continue;

                    var loadRecipe = data.recipes[key];
                    
                    var input = [];
                    var output = [];

                    // Parse input
                    for (var i = 0; i < loadRecipe.input.length; ++i)
                    {
                        var loadItem = loadRecipe.input[i];
                        var item = this.items[loadItem.item];
                        
                        if (item == null)
                        {
                            console.error("No item found with id \"" + loadItem.item + "\".");
                            continue;
                        }

                        input.push(new RecipeItem(item, loadItem.count));
                    }

                    // Parse output
                    var loadItem = loadRecipe.output;
                    var item = this.items[loadItem.item];

                    if (item == null)
                        console.error("No item found with id \"" + loadItem.item + "\".");

                    output = new RecipeItem(item, loadItem.count);

                    this.recipes[key] = new Recipe(input, output, loadRecipe.ttc, loadRecipe.rarity, loadRecipe.level, loadRecipe.price, this.items[loadRecipe.parent] || null);
                }

                // Set the items recipe if they have one and id.
                for (var itemId in this.items)
                {
                    if (!this.items.hasOwnProperty(itemId))
                        continue;

                    var item = this.items[itemId];

                    item.id = itemId;

                    if (typeof this.recipes[itemId] === "object")
                        item.recipe = this.recipes[itemId];

                    //for (var i = 0; i < this.recipes.length; ++i)
                    //{
                    //    if (this.recipes[i].output.item == item)
                    //        item.recipe = this.recipes[i];
                    //}
                }

                // Parse cookables
                for (var itemId in data.cookables)
                {
                    if (!data.cookables.hasOwnProperty(itemId))
                        continue;

                    var loadCookable = data.cookables[itemId];
                    var cookable = new Cookable(loadCookable.ovenList, loadCookable.ttc, loadCookable.output.item, loadCookable.output.count);

                    for (var i in cookable.usableOvens)
                    {
                        if (!cookable.usableOvens.hasOwnProperty(i))
                            continue;

                        cookable.usableOvens[i].item.meta.cookables.push(cookable);
                    }

                    this.cookables[itemId] = cookable;
                }
                
                callback && callback(this, null);
            }.bind(this),
            function onError(response)
            {
                alert("Failed to load data, check console for more info.");
                console.error("Failed loading data:", response);
                callback && callback(null, response);
            });
        },
        requestDamageInfo: function(callback)
        {
            $http({
                method: "GET",
                url: "https://api.calcrust.com/damages"
            }).then(function(response)
            {
                var data = response.data.data;
                var items = this.items;

                data = data.map(function(shortname)
                {
                    return items[shortname];
                });

                callback(data);
            }.bind(this), function(error)
            {
                callback(null, error);
            }.bind(this));
        }
    };
}