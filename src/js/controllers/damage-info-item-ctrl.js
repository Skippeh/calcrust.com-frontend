angular.module("RustCalc").controller("DamageInfoItemCtrl", ["$scope", "$rustData", "$http", "$stateParams", "$state", DamageInfoItemCtrl]);

function DamageInfoItemCtrl($scope, $rustData, $http, $stateParams, $state)
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

	$scope.getItemHref = (hitValues) =>
	{
		let hits = $scope.options.showStrongSide ? hitValues.values.totalStrongHits : hitValues.values.totalWeakHits;

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
		else
		{
			count = 1;
		}

		return $state.href("itembps.item.recipe", { id: hitValues.id, count: count });
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
							id: ammoKey,
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