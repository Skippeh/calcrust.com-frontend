angular.module("RustCalc").directive("loadingOverlay", [LoadingOverlayDirective]);

function LoadingOverlayDirective()
{
    return {
        restrict: "E",
        replace: true,
        template: "<div class='overlay centered-page'>" +
                      "<div class='sk-folding-cube'>" +
                        "<div class='sk-cube1 sk-cube'></div>" +
                        "<div class='sk-cube2 sk-cube'></div>" +
                        "<div class='sk-cube4 sk-cube'></div>" +
                        "<div class='sk-cube3 sk-cube'></div>" +
                      "</div>" +
                  "</div>"
    };
}