angular.module("RustCalc").controller("DamageInfoItemCtrl", ["$scope", "$rustData", "$http", "$stateParams", DamageInfoItemCtrl]);

function DamageInfoItemCtrl($scope, $rustData, $http, $stateParams)
{
	let itemId = $stateParams.id;
	let buildingGrade = $stateParams.grade;
	$scope.loading = true;

	$scope.options = {
		showStrongSide: true
	};

	$scope.ceil = (val) =>
	{
		return Math.ceil(val);
	};

	$rustData.requestDestructible($stateParams.id, buildingGrade, function (data, error)
	{
		$scope.loading = false;

		if (error)
		{
			$scope.error = error;
			return;
		}

		$scope.data = data;
		$scope.dataArray = [];

		let values;

		if (buildingGrade != null)
		{
			values = data.values[buildingGrade]
		}
		else
		{
			values = data.values;
		}

		for (let key in values)
		{
			if (!values.hasOwnProperty(key))
				continue;

			let attackInfos = values[key];

			switch (attackInfos.type)
			{
				case "melee":
				case "explosive":
				{
					if (attackInfos.values.weakDps <= 0 && attackInfos.values.strongDps <= 0)
						continue;

					$scope.dataArray.push({
						name: $rustData.items[key].name,
						values: attackInfos.values,
						type: attackInfos.type,
						time: null
					});
					break;
				}
				case "weapon":
				{
					var ammunitions = attackInfos.ammunitions;

					for (let ammoKey in ammunitions)
					{
						var ammunition = ammunitions[ammoKey];
						var ammoItem = $rustData.items[ammoKey];

						if (ammunition.weakDps <= 0 && ammunition.strongDps <= 0)
							continue;

						$scope.dataArray.push({
							name: $rustData.items[key].name + " - " + ammoItem.name,
							values: ammunition,
							type: attackInfos.type,
							time: null
						});
					}

					break;
				}
			}
		}

		// Sort
		$scope.dataArray.sort((a, b) =>
		{
			return a.values.totalStrongHits - b.values.totalStrongHits;
		});

		console.log($scope.dataArray);
	});
}