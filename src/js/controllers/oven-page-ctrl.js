angular.module("RustCalc").controller("OvenPageCtrl", ["$scope", "$rustData", "$stateParams", "$element", "$state", "$templateCache", "$compile", "$localStorage", OvenPageCtrl]);

function OvenPageCtrl($scope, $rustData, $stateParams, $element, $state, $templateCache, $compile, $localStorage)
{
	$scope.options = {
		estimateByproduct: $localStorage.cooking.estimateByproduct
	};

	$scope.$watch("options.estimateByproduct", value => {
		$localStorage.cooking.estimateByproduct = value;
	});

	$scope.slotContextMenuOptions = {
		closeOnClick: false,
		onOpen: ev => {
			if ($(ev.target).hasClass("output"))
			{
				ev.preventDefault();
			}
		}
	};

	$scope.meta = {
		ttc: 0 // total time to cook
	};

	$scope.item = $rustData.items[$stateParams.id];
	$scope.slots = new Array($scope.item.meta.oven.slots);
	$scope.overflow = {};

	for (let i = 0; i < $scope.slots.length; ++i)
		$scope.slots[i] = { index: i, output: false, item: null, count: 0 };

	if ($scope.item == null || $scope.item.meta.oven == null || !$scope.item.meta.oven.cookables.length)
	{
		$scope.item = null;
		return;
	}

	// Get all cookables that can be cooked using the current oven.
	$scope.cookables = $scope.item.meta.oven.cookables;

	// Handle dragging
	{
		let sourceSlot = null;
		let validDrop = false;
		let moveHalf = false;
		let copySlot = false;
		let evenSlots = false;
		let evenedSlots = {};
		let startCount = 0; // The starting stack size of the slot we're evening over multiple slots.

		$element.on("dragstart", ".item-container .item-slot", ev => {
			if (sourceSlot != null)
				return;

			let dragEv = ev.originalEvent;
			let slot = $scope.slots[parseInt(ev.target.attributes["data-slot"].value)];
			sourceSlot = slot;
			startCount = slot.count;
			evenedSlots[slot.index] = slot;

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

			dragEv.dataTransfer.setDragImage && dragEv.dataTransfer.setDragImage(image, offset.left, offset.top);
			dragEv.dataTransfer.setData && dragEv.dataTransfer.setData("text", "");

			if (ev.ctrlKey)
			{
				dragEv.dataTransfer.effectAllowed = "copy";
				moveHalf = true;
			}
			else if (ev.shiftKey)
			{
				dragEv.dataTransfer.effectAllowed = "copy";
				copySlot = true;
			}
			else if (ev.altKey)
			{
				dragEv.dataTransfer.effectAllowed = "copy";
				evenSlots = true;
			}

			$scope.$apply();
		});

		$element.on("dragover", ".item-container .item-slot", ev => {
			let attribute = ev.target.attributes["data-slot"];

			if (attribute == null || sourceSlot == null)
				return;

			let slot = $scope.slots[parseInt(attribute.value)];

			if (!slot.output)
			{
				if (evenSlots && slot.item == null && evenedSlots[slot.index] == null)
				{
					evenedSlots[slot.index] = slot;
					let slots = Object.values(evenedSlots);
					let numSlots = slots.length;
					let splitCount = Math.floor(startCount / numSlots);

					if (splitCount < 1)
						return;

					Object.values(evenedSlots).forEach(slot => {
						slot.count = splitCount;
						slot.item = sourceSlot.item;
					});

					let currentSum = splitCount * numSlots;
					let amountLeft = startCount - currentSum;

					if (amountLeft > 0)
					{
						for (let i = slots.length - 1; i >= 0; --i)
						{
							++slots[i].count;
							--amountLeft;

							if (amountLeft <= 0)
								break;
						}
					}

					$scope.calculate();
					$scope.$apply();
				}

				ev.preventDefault();
				return;
			}
		});

		$element.on("drop", ".item-container .item-slot", ev => {
			if (sourceSlot == null)
				return;

			let dragEv = ev.originalEvent;
			let destSlot = $scope.slots[parseInt(ev.target.attributes["data-slot"].value)];

			if (sourceSlot != destSlot && !evenSlots)
			{
				if (!copySlot)
					moveSlotItems(sourceSlot, destSlot, moveHalf ? Math.ceil(sourceSlot.count / 2) : sourceSlot.count);
				else
					addToSlots(1, sourceSlot, false, destSlot.index);
			}

			validDrop = true;
		});

		// Unset source slot since the drop event is only called if dropped on a valid element.
		$element.on("dragend", ".item-container .item-slot", ev => {
			if (!validDrop && !evenSlots)
			{
				sourceSlot.item = null;
				sourceSlot.count = 0;
			}

			validDrop = false;
			sourceSlot = null;
			moveHalf = false;
			copySlot = false;
			evenSlots = false;
			evenedSlots = {};

			$scope.calculate();
			$scope.$apply();
		});

		function onKeyUp($event)
		{
			// Prevent toolbar from opening in some browsers.
			if ($event.keyCode == 18 || $event.which == 18)
				$event.preventDefault();
		}

		$("body").on("keyup", onKeyUp);

		// Unsubscribe from events
		$scope.$on("$destroy", ev => {
			$element.off("dragstart drop dragend", ".item-container .item-slot");
			$("body").off("keyup", onKeyUp);
		});
	}

	$scope.getFuel = () =>
	{
		let fuelType = $scope.item.meta.oven.fuelType;

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
		let items = $scope.slots.filter(slot => slot.item != null && !slot.output && slot.item.meta.cookable != null);
		items = items.map(slot => ({ count: slot.count, item: $rustData.cookables[slot.item.id] }));
		return items;
	};

	$scope.clear = (includeInputs) =>
	{
		if (typeof includeInputs === "undefined")
			includeInputs = true;

		$scope.overflow = {};
		$scope.slots.forEach(slot => {
			if (slot.output || includeInputs)
			{
				slot.output = false;
				slot.item = null;
				slot.count = 0;
			}
		});

		if (includeInputs)
			updateUrlState();
	};

	function getFreeSlot(direction, itemType, outputsOnly, startIndex) // direction is either 1 or -1. if 1, search starts from 0, if -1 then search starts from num slots and counts down.
	{
		if (typeof outputsOnly == "undefined")
			outputsOnly = false;

		if (direction < -1)
			direction = -1;
		if (direction > 1)
			direction = 1;

		let start;

		if (typeof startIndex == "number")
			start = startIndex;
		else
			start = direction == 1 ? 0 : $scope.slots.length - 1;

		if (start < 0)
			start = 0;
		if (start >= $scope.slots.length)
			start = $scope.slots.length - 1;

		// Just an overly complicated loop that loops from start to end or end to start depending on the value of direction.
		for (let i = start; (direction == 1 && i < $scope.slots.length) || (direction == -1 && i >= 0); i += direction)
		{
			let slot = $scope.slots[i];

			if (slot.item == null)
			{
				slot.output = outputsOnly;
				return slot;
			}
			else if (itemType != null)
			{
				if (slot.output == outputsOnly && slot.item == itemType && slot.count < itemType.maxStack)
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
				addToSlots(direction, item[i], outputsOnly, startIndex);
			}

			return;
		}

		let count = item.count;
		while (count > 0)
		{
			let slot = getFreeSlot(direction, item.item, outputsOnly, startIndex);

			if (slot == null)
			{
				addOverflow(item);
				break;
			}

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
	$scope.addToSlots = addToSlots;

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
		let result = {};

		for (let i = 0; i < $scope.slots.length; ++i)
		{
			let slot = $scope.slots[i];

			if (slot.item != null && !slot.output && (slot.item.meta.burnable != null || slot.item.meta.cookable != null || slot.item.meta.consumable != null))
			{
				if (result[slot.item.id] == null)
				{
					result[slot.item.id] = [];
				}

				let stateItem = result[slot.item.id];
				stateItem.push([slot.index, slot.count]);
			}
		}

		if (!Object.keys(result).length)
			return "";

		return JSON.stringify(result);
	}

	function getFuelTime()
	{
		let fuel = $scope.getFuel();
		let fuelUnits = fuel.count * fuel.item.meta.burnable.fuelAmount;
		let ovenTemp = $scope.item.meta.oven.temperature;
		return fuelUnits / (ovenTemp / 200);
	}

	function addOverflow(item)
	{
		let overflowSlot = $scope.overflow[item.item.id];

		if (overflowSlot == null)
		{
			$scope.overflow[item.item.id] = overflowSlot = { item: item.item, count: 0 };
		}

		overflowSlot.count += item.count;
	}

	function updateUrlState()
	{
		let state = btoa(getStateString());
		$state.go(".", { id: $stateParams.id, state: state }, { notify: false, location: "replace" });
	}

	$scope.hasOverflow = function()
	{
		for (let key in $scope.overflow)
		{
			if ($scope.overflow.hasOwnProperty(key))
				return true;
		}

		return false;
	};

	$scope.autoAddFuel = () =>
	{
		// First clear all fuel
		$scope.slots.forEach(slot => {
			if (slot.item && !slot.output && slot.item.meta.burnable != null)
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
				let fuelNeeded = Math.ceil(oven.fuelConsumed * cookable.count);

				if (fuelNeeded > mostFuelNeeded)
					mostFuelNeeded = fuelNeeded;
			}
		});

		if (mostFuelNeeded > 0)
		{
			addToSlots(1, { item: $scope.item.meta.oven.fuelType, count: mostFuelNeeded });
		}
	};

	$scope.calculate = (updateUrl) =>
	{
		if (typeof updateUrl == "undefined")
			updateUrl = true;

		//let startDate = new Date();

		$scope.clear(false);
		let fuel = $scope.getFuel();
		let cookables = $scope.getCookables();

		cookables.forEach(cookable => {
			let oven = cookable.item.usableOvens[$scope.item.id];
			if (oven != null)
			{
				let count = cookable.count;
				let fuelPerItem = oven.fuelConsumed;
				let totalFuel = fuelPerItem * count;

				if (totalFuel > fuel.count)
				{
					count = Math.floor(fuel.count / fuelPerItem);
				}

				addToSlots(-1, { item: cookable.item.output.item, count: count * cookable.item.output.count }, true);
			}
		});

		if ($scope.options.estimateByproduct && $scope.item.meta.oven.allowByproductCreation)
		{
			let fuelType = $scope.item.meta.oven.fuelType;
			let fuelByproduct = fuelType.meta.burnable.byproductItem;

			if (fuelByproduct != null)
			{
				addToSlots(-1, { item: fuelByproduct, count: Math.floor(fuel.count * fuelType.meta.burnable.byproductChance) }, true); // stupid but testing predicting average byproduct creation.
			}
		}

		$scope.meta.ttc = Math.ceil(getFuelTime());

		if (updateUrl)
		{
			updateUrlState();
		}

		//console.log("exec time (ms): " + new Date(new Date() - startDate).getMilliseconds());
	};

	if ($stateParams.state != null)
	{
		// Load state from url
		try
		{
			let state = JSON.parse(atob($stateParams.state));

			let items = [];
			for (let itemId in state)
			{
				if (!state.hasOwnProperty(itemId))
					continue;

				let stateItem = state[itemId];
				let item = $rustData.items[itemId];

				if (item == null)
				{
					throw "No item found with id '" + itemId + "'.";
				}
				
				for (let i = 0; i < stateItem.length; ++i)
				{
					let itemSlot = stateItem[i];
					let index = itemSlot[0];
					let count = itemSlot[1];

					items.push({ item: item, count: count, index: index });
					addToSlots(-1, { item: item, count: count }, false, index);
				}
			}
		}
		catch (ex)
		{
			alert("Failed to load state: " + ex);
		}
	}

	$scope.calculate(false);
}