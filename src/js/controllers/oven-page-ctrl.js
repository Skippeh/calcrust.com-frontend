angular.module("RustCalc").controller("OvenPageCtrl", ["$scope", "$rustData", "$stateParams", "$element", "$state", OvenPageCtrl]);

function OvenPageCtrl($scope, $rustData, $stateParams, $element, $state)
{
	$scope.options = {
		predictByproduct: true
	};

	$scope.item = $rustData.items[$stateParams.id];
	$scope.slots = new Array($scope.item.meta.slots);
	$scope.overflow = {};

	for (let i = 0; i < $scope.slots.length; ++i)
		$scope.slots[i] = { index: i };

	if ($scope.item == null || $scope.item.meta == null || $scope.item.meta.type != "oven" || !$scope.item.meta.cookables.length)
	{
		$scope.item = null;
		return;
	}

	// Get all cookables that can be cooked using the current oven.
	$scope.cookables = $scope.item.meta.cookables;

	// Handle dragging
	let sourceSlot = null;

	$element.on("dragstart", ".item-container .item-slot", ev => {
		if (sourceSlot != null)
			return;

		let dragEv = ev.originalEvent;
		let slot = $scope.slots[parseInt(ev.target.attributes["data-slot"].value)];
		sourceSlot = slot;

		if (slot.item == null || slot.output)
		{
			return;
		}

		let image = $(ev.target).find("img")[0];
		let offsetX = 0;
		let offsetY = 0;

		let imagePosition = $(image).offset();
		let mousePosition = { top: ev.pageY, left: ev.pageX };
		let offset = { top: mousePosition.top - imagePosition.top, left: mousePosition.left - imagePosition.left };

		dragEv.dataTransfer.setDragImage(image, offset.left, offset.top);
		$scope.$apply();
	});

	$element.on("dragover", ".item-container .item-slot", ev => {
		let attribute = ev.target.attributes["data-slot"];

		if (attribute == null || sourceSlot == null)
			return;

		let slot = $scope.slots[parseInt(attribute.value)];

		if (!slot.output)
		{
			ev.preventDefault();
		}
	});

	$element.on("drop", ".item-container .item-slot", ev => {
		if (sourceSlot == null)
			return;

		let dragEv = ev.originalEvent;
		let destSlot = $scope.slots[parseInt(ev.target.attributes["data-slot"].value)];

		if (sourceSlot != destSlot)
		{
			moveSlotItems(sourceSlot, destSlot);
		}

		sourceSlot = null;
		$scope.calculate();
		$scope.$apply();
	});

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
		let items = $scope.slots.filter(slot => slot.item != null && !slot.output && slot.item.meta != null &&  slot.item.meta.type == "cookable");
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

	function getFreeSlot(direction, itemType, outputsOnly, startIndex) // direction is either 1 or -1. if 1, search starts from 0, if -1 then search starts from num slots and counts down.
	{
		if (direction < -1)
			direction = -1;
		if (direction > 1)
			direction = 1;

		let start;

		if (typeof startIndex == "number")
			start = startIndex;
		else
			start = direction == 1 ? 0 : $scope.slots.length - 1;

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

	function addToSlots(direction, item, outputsOnly, startIndex)
	{
		if (Array.isArray(item))
		{
			for (let i = 0; i < item.length; ++i)
			{
				console.log(item[i]);
				addToSlots(direction, item[i], outputsOnly, startIndex);
			}

			return;
		}

		let count = item.count;
		while (count > 0)
		{
			let slot = getFreeSlot(direction, item.item, outputsOnly, startIndex);

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

	function moveSlotItems(sourceSlot, destSlot, amount)
	{
		if (typeof amount == "undefined")
			amount = sourceSlot.count;

		if (amount > sourceSlot.item.maxStack)
			amount = sourceSlot.item.maxStack;

		if (destSlot.item == null)
		{
			destSlot.item = sourceSlot.item;
			destSlot.count = amount;

			sourceSlot.count -= amount;

			if (sourceSlot.count <= 0)
			{
				sourceSlot.item = null;
				sourceSlot.count = 0;
			}

			return;
		}
		else
		{
			if (sourceSlot.item != destSlot.item)
			{
				if (amount != sourceSlot.count) // Don't do anything if we're not moving the full stack.
					return;

				let destItem = destSlot.item;
				let destCount = destSlot.count;

				destSlot.item = sourceSlot.item;
				destSlot.count = sourceSlot.count;
				sourceSlot.item = destItem;
				sourceSlot.count = destCount;
				return;
			}
			else
			{
				let newCount = destSlot.count + amount;
				let overflow = newCount - destSlot.item.maxStack;
				newCount -= (overflow > 0 ? overflow : 0)

				destSlot.count = newCount;
				sourceSlot.count -= amount;

				// Empty source slot if empty
				if (sourceSlot.count <= 0)
				{
					sourceSlot.item = null;
					sourceSlot.count = 0;
				}

				if (overflow > 0)
				{
					addToSlots(1, { item: destSlot.item, count: overflow }, false);
				}
			}
		}
	}

	function getStateString()
	{
		let result = "";

		for (let i = 0; i < $scope.slots.length; ++i)
		{
			let slot = $scope.slots[i];

			if (slot.item != null && slot.item.meta != null && (slot.item.meta.type == "burnable" || slot.item.meta.type == "cookable"))
			{
				result += slot.index.toString() + "," + slot.item.id + "," + slot.count + ";";
			}
		}

		return result.substr(0, result.length - 1); // Exclude last semi colon.
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

			if (oven != null)
			{
				let fuelNeeded = oven.fuelConsumed * cookable.count;

				if (fuelNeeded > mostFuelNeeded)
					mostFuelNeeded = fuelNeeded;
			}
		});

		let fuel = $scope.getFuel();
		let toAdd = mostFuelNeeded - fuel.count;

		if (toAdd > 0)
		{
			addToSlots(1, { item: $scope.item.meta.fuelType, count: toAdd });
			$scope.calculate();
		}
	};

	$scope.calculate = (updateUrl) =>
	{
		if (typeof updateUrl == "undefined")
			updateUrl = true;

		var startDate = new Date();

		$scope.clearOutput();
		let fuel = $scope.getFuel();
		let cookables = $scope.getCookables();

		if ($scope.options.predictByproduct)
		{
			let fuelType = $scope.item.meta.fuelType;
			let fuelByproduct = fuelType.meta.byproductItem;

			if (fuelByproduct != null)
			{
				addToSlots(-1, { item: fuelByproduct, count: Math.floor(fuel.count * fuelType.meta.byproductChance) }, true); // stupid but testing predicting average byproduct creation.
			}
		}

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

		if (updateUrl)
		{
			let state = btoa(getStateString());
			$state.go(".", { id: $stateParams.id, state: state }, { notify: false });
		}

		console.log("exec time (ms): " + new Date(new Date() - startDate).getMilliseconds());
	};


	if ($stateParams.state != null)
	{
		// Load state from url
		try
		{
			let state = atob($stateParams.state);
			let strItems = state.split(/;/g);
			let items = strItems.map(strItem => {
				let values = strItem.split(/,/g);
				let item = $rustData.items[values[1]];

				if (item == null)
				{
					throw "No item found with id \"" + values[1] + "\".";
				}

				return { index: parseInt(values[0]), item: item, count: parseInt(values[2]) };
			});

			items.forEach(item => {
				addToSlots(1, { item: item.item, count: item.count }, false, item.index);
			});
		}
		catch (ex)
		{
			alert("Failed to load state: " + ex);
		}
	}
	else
	{
		// Add debug items
		addToSlots(1, [
			{ item: $rustData.items["metal.ore"], count: 100 }
		]);

		$scope.autoAddFuel();
	}

	$scope.calculate(false);
}