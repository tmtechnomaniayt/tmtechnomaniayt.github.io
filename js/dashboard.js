const apiURL = "https://simplitech.me/";

$(document).ready(function () {
	setTimeout(function () {
		$(".loader").fadeOut();
	}, 1000);
	// $("header").load("/components/header/index.html");
	const user = JSON.parse(localStorage.getItem("user"));
	console.log(user);
	if (user) {
		$("#uname").text(user.name);
		if (user.profilePic) {
			$("#profile-pic").attr("src", user.profilePic);
		}

		if (user.emergencyContact.username) {
			const content = `<h3 class="fs-2xl txt-red">Your Prefered Emergency Contact:</h3>
                <a href="">
                    <div class="flex aic gap-sm pt-lg">
                        <img src="/img/user.svg" alt="user" class="h-56 bg-light round-sm" />
                        <div>
                            <h4 id="contactName" class="fs-xl">${user.emergencyContact.username}</h4>
                            <p id="contactNumber" class="fs-lg">${user.emergencyContact.phone}</p>
                        </div>
                    </div>
                </a>`;
			$("#contact").html(content);
		} else {
			const content = `<h3 class="fs-2xl txt-red">You have not set an emergency contact</h3><p class="fs-lg pb-lg">Please set an emergency contact to contact them in case of any emergency, until that you can contact the public emergency contact.</p>
            <button href="tel:112" class="mt-auto tac w-full p-lg bg-red round-sm txt-white">Contact Emergency Support
            </button>`;
			$("#contact").html(content);
		}

		automatedDetection();
		// $("#user-email").text(user.email);
	} else {
		window.location.href = "/";
	}
});

async function automatedDetection() {
	// Function to calculate the distance between two points (Haversine formula)
	function calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 6371e3; // Earth radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // Distance in meters
	}

	// Function to calculate speed (distance / time)
	function calculateSpeed(distance, timeElapsed) {
		return (distance / timeElapsed) * 3.6; // Speed in km/h
	}

	// Function to check for sudden changes in speed and show notification
	function checkForSuddenChange(speeds) {
		const threshold = 6; // Define a threshold for sudden change (km/h)
		for (let i = 1; i < speeds.length; i++) {
			const change = Math.abs(speeds[i] - speeds[i - 1]);
			if (change >= threshold) {
				showNotification(
					`Sudden speed change detected: ${change.toFixed(2)} km/h`,
				);
				break;
			} else {
                console.log("No sudden change detected" + change);
            }
		}
	}

	// Function to show notification
	function showNotification(message) {
		if (Notification.permission === "granted") {
			new Notification(message);
		} else if (Notification.permission !== "denied") {
			Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					new Notification(message);
				}
			});
		}
	}

	// Function to get user's position and track speed
	async function getPositionAndTrack() {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			});
		});
	}

	// Main function to track user position and check for sudden changes
	async function trackUserPosition() {
		const positions = [];
		const checkInterval = 3000; // 3 seconds

		async function updatePosition() {
			try {
				const position = await getPositionAndTrack();
				const { latitude, longitude } = position.coords;
				const timestamp = position.timestamp;
				let speed = 0;

				if (positions.length > 0) {
					const lastPosition = positions[positions.length - 1];
					const distance = calculateDistance(
						lastPosition.latitude,
						lastPosition.longitude,
						latitude,
						longitude,
					);
					const timeElapsed =
						(timestamp - lastPosition.timestamp) / 1000; // in seconds
					speed = calculateSpeed(distance, timeElapsed);
				}

				positions.push({ latitude, longitude, timestamp, speed });

				// Keep only the last 10 data points
				if (positions.length > 10) {
					positions.shift();
				}

				// Extract speeds from the positions array
				const speeds = positions.map((p) => p.speed);

				// Check for sudden changes in speed
				if (speeds.length > 1) {
					checkForSuddenChange(speeds);
				}

				console.log(positions);
			} catch (error) {
				console.error(`ERROR(${error.code}): ${error.message}`);
			}
		}

		// Update position every 3 seconds
		setInterval(updatePosition, checkInterval);
	}

	// Request notification permission on page load
	document.addEventListener("DOMContentLoaded", () => {
		if (Notification.permission !== "granted") {
			Notification.requestPermission();
		}
	});

	// Start tracking user position
	trackUserPosition();
}
