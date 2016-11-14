angular.module("RustCalc").controller("DamageInfoItemCtrl", ["$scope", "$rustData", "$http", "$stateParams", "$state", DamageInfoItemCtrl]);

function DamageInfoItemCtrl($scope, $rustData, $http, $stateParams, $state)
{
	let itemId = $stateParams.id;
	let buildingGrade = $stateParams.grade;
	$scope.loading = true;

	$scope.options = {
		showStrongSide: true
	};

	$scope.filter = {
		name: ""
	};

	function calculateTime(numHits, fireDelay, reloadTime, magazineSize)
	{
		if (numHits <= 1)
		{
			return 0;
		}

		var totalFireTime = numHits * fireDelay;
		var totalReloads = magazineSize > 0 ? Math.floor(numHits / magazineSize) : 0;
		totalFireTime += reloadTime * totalReloads;

		return totalFireTime;
	}

	function getTimes(hitValues, weapon)
	{
		let weaponMeta = weapon.meta.weapon;

		let strongTime = calculateTime(hitValues.totalStrongHits, weaponMeta.fireDelay,
																  weaponMeta.reloadTime,
																  weaponMeta.magazineSize);

		let weakTime = calculateTime(hitValues.totalWeakHits,	  weaponMeta.fireDelay,
																  weaponMeta.reloadTime,
																  weaponMeta.magazineSize);

		return {
			strongTime,
			weakTime,
			weakItemsRequired: 2,
			strongItemsRequired: 3
		};
	}

	$rustData.requestDestructible($stateParams.id, buildingGrade, function (data, error)
	{
		$scope.loading = false;

		if (error)
		{
			$scope.error = error;
			return;
		}

		$scope.data = data;
		$scope.explosiveArray = [];
		$scope.meleeArray = [];
		$scope.weaponArray = [];

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
			let weaponItem = $rustData.items[key];

			switch (attackInfos.type)
			{
				case "melee":
				case "explosive":
				{
					if (attackInfos.values.weakDps <= 0 && attackInfos.values.strongDps <= 0)
						continue;

					let result = {
						id: key,
						name: $rustData.items[key].name,
						values: attackInfos.values,
						type: attackInfos.type
					};

					if (attackInfos.type == "melee")
					{
						let times = getTimes(attackInfos.values, weaponItem);
						result.strongTime = times.strongTime;
						result.weakTime = times.weakTime;

						result.strongItemsRequired = times.strongItemsRequired;
						result.weakItemsRequired= times.weakItemsRequired;

						$scope.meleeArray.push(result);
						continue;
					}
					else
					{
						result.strongItemsRequired = Math.ceil(result.values.totalStrongHits);
						result.weakItemsRequired = Math.ceil(result.values.totalWeakHits);
					}

					$scope.explosiveArray.push(result);
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
							
						let times = getTimes(ammunition, weaponItem);

						$scope.weaponArray.push({
							id: ammoKey,
							name: $rustData.items[key].name + " - " + ammoItem.name,
							values: ammunition,
							type: attackInfos.type,
							strongTime: times.strongTime,
							weakTime: times.weakTime,
							strongItemsRequired: times.strongItemsRequired,
							weakItemsRequired: times.weakItemsRequired
						});
					}

					break;
				}
			}
		}

		let sortArray = (array) => {
			array.sort(firstBy((a, b) => {
				return a.values.totalStrongHits - b.values.totalStrongHits;
			}).thenBy((a, b) => {
				if (a.strongTime != null && b.strongTime == null)
					return 1;

				if (b.strongTime != null && a.strongTime == null)
					return -1;

				return a.strongTime - b.strongTime;
			}));
		};

		sortArray($scope.meleeArray);
		sortArray($scope.weaponArray);
		sortArray($scope.explosiveArray);
	});
}