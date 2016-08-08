angular.module("RustCalc").controller("OvenPageCtrl", ["$scope", "$rustData", "$stateParams", OvenPageCtrl]);

function OvenPageCtrl($scope, $rustData, $stateParams)
{
	$scope.item = $rustData.items[$stateParams.id];
	$scope.slots = new Array($scope.item.meta.slots);
	$scope.overflow = {};

	for (let i = 0; i < $scope.slots.length; ++i)
		$scope.slots[i] = {};

	if ($scope.item == null || $scope.item.meta == null || $scope.item.meta.type != "oven" || !$scope.item.meta.cookables.length)
	{
		$scope.item = null;
		return;
	}

	// Get all cookables that can be cooked using the current oven.
	$scope.cookables = $scope.item.meta.cookables;

	// Fill with hardcoded data for now.
	$scope.slots[0].item = $rustData.items["wood"];
	$scope.slots[0].count = 100;

	$scope.slots[1].item = $rustData.items["metal.ore"];
	$scope.slots[1].count = 500;

	$scope.slots[2].item = $rustData.items["sulfur.ore"];
	$scope.slots[2].count = 1000;

	$scope.slots[3].item = $rustData.items["metal.ore"];
	$scope.slots[3].count = 925;

	$scope.getFuel = () =>
	{
		let fuelType = $scope.item.meta.fuelType;

		if (fuelType == null)
		{
			throw "not implemented";
		}
		else
		{
			let result = { item: fuelType, count: 0 };

			$scope.slots.forEach(slot => {
				if (!slot.output && slot.item == fuelType)
				{
					result.count += slot.count;
				}
			});

			return result;
		}
	};

	$scope.getCookables = () =>
	{
		let items = $scope.slots.filter(slot => slot.item != null && !slot.output && slot.item.meta.type == "cookable");
		items = items.map(slot => ({ count: slot.count, item: $rustData.cookables[slot.item.id] }));
		return items;
	};

	$scope.clearOutput = () =>
	{
		$scope.overflow = {};
		$scope.slots.forEach(slot => {
			if (slot.output)
			{
				slot.output = false;
				slot.item = null;
				slot.count = 0;
			}
		});
	};

	function getFreeSlot(direction, itemType, outputsOnly) // direction is either 1 or -1. if 1, search starts from 0, if -1 then search starts from num slots and counts down.
	{
		if (direction < -1)
			direction = -1;
		if (direction > 1)
			direction = 1;

		let start = direction == 1 ? 0 : $scope.slots.length - 1;

		// Just an overly complicated loop that loops from start to end or end to start depending on the value of direction.
		for (let i = start; (direction == 1 && i < $scope.slots.length) || (direction == -1 && i >= 0); i += direction)
		{
			let slot = $scope.slots[i];

			if (slot.item == null)
			{
				if (!slot.output || (outputsOnly && slot.output))
				{
					return slot;
				}
			}
			else if (itemType != null)
			{
				if (slot.item == itemType && slot.count < itemType.maxStack)
				{
					return slot;
				}
			}
		}

		return null;
	}

	function addToSlots(direction, item, outputsOnly)
	{
		let count = item.count;
		while (count > 0)
		{
			let slot = getFreeSlot(direction, item.item, outputsOnly);

			if (slot == null)
				throw "not implemented";

			if (slot.item == null)
			{
				slot.item = item.item;
				slot.count = 0;
				slot.output = outputsOnly;
			}

			let available = item.item.maxStack - slot.count;
			let add = count;

			if (add > available)
				add = available;

			slot.count += add;
			count -= add;
		}
	}

	$scope.test = (slot) =>
	{
		if (!slot.item)
		{
			slot.item = $rustData.items["wood"];
			slot.count = 0;
		}

		slot.count += 10;

		if (slot.count > slot.item.maxStack)
			slot.count = slot.item.maxStack;

		$scope.calculate();
	};

	$scope.autoAddFuel = () =>
	{
		// First clear all fuel
		$scope.slots.forEach(slot => {
			if (slot.item && !slot.output && slot.item.meta.type == "burnable")
			{
				slot.item = null;
				slot.count = 0;
			}
		});

		let cookables = $scope.getCookables();
		let mostFuelNeeded = 0;

		cookables.forEach(cookable => {
			let oven = cookable.item.usableOvens[$scope.item.id];
			let fuelNeeded = oven.fuelConsumed * cookable.count;

			if (fuelNeeded > mostFuelNeeded)
				mostFuelNeeded = fuelNeeded;
		});

		let fuel = $scope.getFuel();
		let toAdd = mostFuelNeeded - fuel.count;

		if (toAdd > 0)
		{
			addToSlots(1, { item: $scope.item.meta.fuelType, count: toAdd });
			$scope.calculate();
		}
	};

	$scope.calculate = () =>
	{
		var startDate = new Date();

		$scope.clearOutput();
		let fuel = $scope.getFuel();
		let cookables = $scope.getCookables();
		console.log(fuel, cookables);

		cookables.forEach(cookable => {
			let oven = cookable.item.usableOvens[$scope.item.id];
			if (oven != null)
			{
				let count = cookable.count;
				let fuelPerItem = oven.fuelConsumed;
				let totalFuel = fuelPerItem * count;

				if (totalFuel > fuel.count)
				{
					count = Math.ceil(fuel.count / fuelPerItem);
				}

				addToSlots(-1, { item: cookable.item.output.item, count: count * cookable.item.output.count }, true);
			}
		});

		console.log("exec time (ms): " + new Date(new Date() - startDate).getMilliseconds());
	};

	$scope.calculate();
}