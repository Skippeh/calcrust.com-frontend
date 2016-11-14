angular.module("RustCalc").directive("damageTable", ["$state", "$rustData", DamageTableDirective]);

function DamageTableDirective($state, $rustData)
{
	return {
		restrict: "E",
		templateUrl: "templates/partials/damage-table.html",
		scope: {
			values: "=",
			strongSide: "=",
			filter: "="
		},
		link: ($scope, $element, attrs) =>
		{
			$scope.getItemHref = (hitValues) =>
			{
				let hits = $scope.strongSide ? hitValues.values.totalStrongHits : hitValues.values.totalWeakHits;

				if (hits == -1)
				{
					hits = 1;
				}
				
				let count = Math.ceil(hits);
				let item = $rustData.items[hitValues.id];

				if (hitValues.type == "weapon")
				{
					count = Math.ceil(count / item.recipe.output.count);
				}
				else if (hitValues.type == "melee")
				{
					count = Math.floor($scope.strongSide ? hitValues.totalStrongItems : hitValues.totalWeakItems);
				}
				else if (hitValues.type == "explosive")
				{
					count = Math.ceil(hits);
				}

				return $state.href("itembps.item.recipe", { id: hitValues.id, count: count });
			};

			$scope.ceil = (val) =>
			{
				return Math.ceil(val);
			};
		}
	};
}