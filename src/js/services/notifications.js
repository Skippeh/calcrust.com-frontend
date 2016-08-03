angular.module("RustCalc").service("$notifications", ["$localStorage", "$rootScope", NotificationsService]);

function NotificationsService($localStorage, $rootScope)
{
	class Instance
	{
		constructor() {
			this.notifications = [
				{
					id: "downtime-0",
					type: "info",
					title: "Scheduled downtime",
					content: "Start: 2016-08-08 00:00 UTC<br/>End: 2016-08-08 04:00 UTC",
					endDate: new Date(Date.UTC(2016, 7, 8, 4, 0, 0)) // NOTE: Month starts from 0 and not 1!
				}
			];
		}

		show() {
			var now = new Date();
			this.notifications.filter(notification => !$localStorage.notifications[notification.id] && (notification.endDate === undefined || now < notification.endDate)).forEach(notification => {
				var options = {
					onHidden: () => {
						$rootScope.$apply(() => {
							$localStorage.notifications[notification.id] = true;
						});
					}
				};

				angular.extend(options, notification.options);
				window.toastr[notification.type](notification.content, notification.title, options);
			});
		}
	}

	return new Instance();
}