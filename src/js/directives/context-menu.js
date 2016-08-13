angular.module("RustCalc").directive("ngContextMenu", ["$parse", "$templateRequest", "$sce", "$compile", ContextMenuDirective]);

function ContextMenuDirective($parse, $templateRequest, $sce, $compile)
{
	let defaultOptions = {
		closeOnClick: true, // If true, the context menu will close when it's clicked.
		onOpen: null // Called when the context menu is about to open, calling event.preventDefault prevents it. 1 parameter being the contextmenu event.
	};

	return {
		restrict: "A",
		scope: {
			ngContextOptions: "=?",
			ngContextScope: "=?"
		},
		link: function ($scope, $element, attrs)
		{
			let options = angular.extend(defaultOptions, $scope.ngContextOptions);
			let templatePath = attrs.ngContextMenu;
			let scope = ($scope.ngContextScope && angular.extend($scope.$parent || $scope, $scope.ngContextScope)) || $scope.$parent || $scope;

			$scope.element = null;

			function showContextMenu(x, y)
			{
				$templateRequest($sce.getTrustedResourceUrl(templatePath)).then(template => {
					let compiled = $compile(template)(scope);
					let element = angular.element(compiled);

					if ($scope.element)
					{
						$scope.element.remove();
					}

					$("body").append(element);

					element.css({
						top: y,
						left: x
					});

					$scope.element = element;

					function onBodyClicked(ev)
					{
						if (!$scope.element)
						{
							$("body").off("click", onBodyClicked);
							return;
						}

						if (!$.contains($scope.element[0], ev.target) && $scope.element[0] != ev.target)
						{
							$scope.element.remove();
							$("body").off("click", onBodyClicked);
						}
						else
						{
							if (options.closeOnClick)
							{
								$scope.element.remove();
								$("body").off("click", onBodyClicked);
							}
						}
					}

					$("body").on("click", onBodyClicked);

					// Unsubscribe when scope is destroyed.
					$scope.$on("$destroy", () => {
						$("body").off("click", onBodyClicked);
					});
				});
			}

			function onContextMenu(ev)
			{
				options.onOpen && options.onOpen(ev);

				if (ev.isDefaultPrevented())
					return;

				showContextMenu(ev.pageX, ev.pageY);

				ev.preventDefault();
			}

			function onBodyContextMenu(ev)
			{
				if (($scope.element && options.closeOnClick) || ($scope.element && (!$.contains($element[0], ev.target) || $element[0] != ev.target)))
				{
					// Don't close if right clicking the context menu and closeOnClick is disabled.
					if (!$scope.closeOnClick && $.contains($scope.element[0], ev.target) || $scope.element[0] == ev.target)
					{
						return;
					}

					$scope.element.remove();
				}
			}

			$element.on("contextmenu", onContextMenu);

			$("body").on("contextmenu", onBodyContextMenu);

			$scope.$on("$destroy", () => {
				$element.off("contextmenu", onContextMenu);
				$("body").off("contextmenu", onBodyContextMenu);
			});
		}
	}
}