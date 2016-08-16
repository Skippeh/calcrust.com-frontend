angular.module("RustCalc").directive("ngTooltip", ["$compile", "$templateRequest", NgTooltipDirective]);

function NgTooltipDirective($compile, $templateRequest)
{
	let defaultOptions = {
		template: false,
		html: false,
		side: ["top", "bottom", "left", "right"]
	};

	return {
		restrict: "A",
		scope: {
			ngTooltipOptions: "&"
		},
		link: function ($scope, $element, attrs)
		{
			let options = angular.extend(defaultOptions, $scope.ngTooltipOptions());
			console.log(options);

			// Force html to be true if the template bool is true.
			if (options.template)
				options.html = true;

			function onTemplate(template)
			{
				console.log("template", template);
				let content;

				if (options.html)
				{
					content = $compile(template)({});
				}
				else
				{
					content = template;
				}

				$element.tooltipster({
					side: options.side,
					contentAsHTML: options.html,
					content: content
				});

				$scope.$on("$destroy", () => {
					$element.tooltipster("destroy");
				});
			}

			if (options.template)
			{
				$templateRequest(attrs.ngTooltip).then(onTemplate);
			}
			else
			{
				let content = attrs.ngTooltip;

				if (options.html)
					content = "<div>" + content + "</div>";

				onTemplate.apply(this, [content]);
			}
		}
	};
}