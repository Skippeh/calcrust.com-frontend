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
			weakTime
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
			let weaponItem = $rustData.items[key];

			switch (attackInfos.type)
			{
				case "melee":
				case "explosive":
				{
					if (attackInfos.values.weakDps <= 0 && attackInfos.values.strongDps <= 0)
						continue;

					let result = {
						name: $rustData.items[key].name,
						values: attackInfos.values,
						type: attackInfos.type
					};

					if (attackInfos.type == "melee")
					{
						let times = getTimes(attackInfos.values, weaponItem);
						result.strongTime = times.strongTime;
						result.weakTime = times.weakTime;
					}

					$scope.dataArray.push(result);
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

						$scope.dataArray.push({
							name: $rustData.items[key].name + " - " + ammoItem.name,
							values: ammunition,
							type: attackInfos.type,
							strongTime: times.strongTime,
							weakTime: times.weakTime
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