const apiURL = "https://simplitech.me/";

$(document).ready(function () {
	setTimeout(function () {
		$(".loader").fadeOut();
	}, 100);
	// $("header").load("/components/header/index.html");
	const user = JSON.parse(localStorage.getItem("user"));
	console.log(user);
	if (user) {
		$("#uname").text(user.name);
		if (user.profilePic) {
			$("#profile-pic").attr("src", user.profilePic);
		}

        $("profile-pic").click(function () {
            localStorage.removeItem("user");
        });

		setInterval(getVictims, 15000);
	} else {
		window.location.href = "/";
	}
});

async function locationUpdate() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		console.error("User data not found in localStorage.");
		return;
	}

	// Get user's current location
	navigator.geolocation.getCurrentPosition(
		async (position) => {
			const data = {
				userId: user._id,
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};

			try {
				const response = await fetch(apiURL + "location", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
				const result = await response.json();
				console.log(result);
			} catch (error) {
				console.error("Failed to update location:", error);
			}
		},
		(error) => {
			console.error(`ERROR(${error.code}): ${error.message}`);
		},
	);
}

async function getVictims() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		console.error("User data not found in localStorage.");
		return;
	}
	navigator.geolocation.getCurrentPosition(
		async (position) => {
			const data = {
				userId: user._id,
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};

			try {
				const response = await fetch(apiURL + "victims", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
				const result = await response.json();
				console.log(result);

				// results array could be empty, so check if it's empty and write code accordingly
				if (result.length == 0) {
					const msg = "No victims found nearby.";
					console.log(msg);
					$("#victims").html(msg);
				} else {
					result.forEach(element => {
						const victim = `<li class="flex aic gap-sm p-lg fd-column">
						<img src="${element.picture}" alt="Victim" class="w-full aspect-square" />
						<h4 class="txt-red fs-2xl">${element.name}</h4>
						<p class="fs-xxl">${element.phone}</p>
						<div class="flex gap-sm">
						<a href="tel:${element.phone}" class="p-lg round-sm txt-white">Call</a>

						// map link using google maps and lat, lng
						<a href="https://www.google.com/maps/dir/?api=1&destination=${element.lastLoc.coordinates[1]},${element.lastLoc.coordinates[0]}" class="p-lg round-sm txt-white">Navigate</a>
						</div>
						</li>`;
						$("#victims").append(victim);
					});
				}
			} catch (error) {
				console.error("Failed to get victims:", error);
			}
		},
		(error) => {
			console.error(`ERROR(${error.code}): ${error.message}`);
		},
	);
}