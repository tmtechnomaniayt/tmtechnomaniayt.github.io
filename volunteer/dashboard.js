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
			$("#profilePic").attr("src", user.profilePic);
		}

		$("#profilePic").click(function () {
			localStorage.removeItem("user");
		});

		getVictims();
		setInterval(getVictims, 15000);

		$(".completesos").click(async function (e) {
			e.preventDefault();
			const link = $(this).attr("data-url");
			const victimId = $(this).attr("victim");
			try {
				await completeSOS(victimId);
				window.open(link, "_blank");
			} catch (error) {
				console.error("Error completing SOS:", error);
			}
		});
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
					$("#victims").html("");
					result.forEach((element) => {
						const victim = `<li class="p-lg border-1 border-red solid round-md">
						<img src="${element.picture}" alt="Victim" class="w-full aspect-square round-sm" />
						<h4 class="txt-red fs-2xl">${element.name}</h4>
						<p class="fs-xxl">${element.phone}</p>
						<div class="flex gap-sm">
						<a href="tel:${element.phone}" target="_blank" class="p-lg round-32 txt-white bg-red mr-sm">Call</a>
						<a victim="${element._id}" data-url="https://www.google.com/maps/dir/?api=1&destination=${element.lastLoc.coordinates[1]},${element.lastLoc.coordinates[0]}" class="completesos p-lg round-32 txt-white bg-red">Navigate</a>
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
		{
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		},
	);
}

async function completeSOS(victimId) {
    alert("You are assigned to help victimId: " + victimId);
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        console.error("User data not found in localStorage.");
        return;
    }
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const data = {
                    userId: user._id,
                    victimId: victimId,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                try {
                    const response = await fetch(apiURL + "completesos", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    console.log(result);
                    getVictims();
                    resolve(result);
                } catch (error) {
                    console.error("Failed to complete SOS:", error);
                    reject(error);
                }
            },
            (error) => {
                console.error(`ERROR(${error.code}): ${error.message}`);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            },
        );
    });
}
