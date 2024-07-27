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
            <a href="tel:112" class="mt-auto tac w-full p-lg bg-red round-sm txt-white">Contact Emergency Support
            </a>`;
			$("#contact").html(content);
		}

		automatedDetection();
		// $("#user-email").text(user.email);

		const sos = $("#sos");
        const parent = sos.parent();

		// Click event
		sos.on("click", function () {
			console.log("clicked");
			alert("SOS Alert Sent");
			parent.css({
				filter: "drop-shadow(0 0 100px var(--red)) drop-shadow(0 0 70px var(--red))",
				transition: "filter 3s",
			});
		});

		// Touch start event
		sos.on("touchstart", function () {
			console.log("touch start");
			parent.css({
				filter: "drop-shadow(0 0 100px var(--red)) drop-shadow(0 0 70px var(--red))",
				transition: "filter 3s",
			});

			let timer = 0;
			let interval = setInterval(function () {
				timer++;
				if (timer >= 3) {
					console.log("3 seconds hold");
					alert("SOS Alert Sent after 3 seconds hold");
					clearInterval(interval);
				}
			}, 1000);

			sos.on("touchend", function () {
				console.log("touch end");
                if (timer < 3) {
                    parent.css("filter", "none");
                    alert("SOS Alert Cancelled");
                }
				clearInterval(interval);
			});
		});
	} else {
		window.location.href = "/";
	}
});

async function automatedDetection() {
	// Function to calculate distance between two coordinates using the Haversine formula
	function calculateDistance(lat1, lon1, lat2, lon2) {
		const R = 6371; // Radius of the Earth in km
		const dLat = (lat2 - lat1) * (Math.PI / 180);
		const dLon = (lon2 - lon1) * (Math.PI / 180);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * (Math.PI / 180)) *
				Math.cos(lat2 * (Math.PI / 180)) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c; // Distance in km
	}

	// Function to calculate speed (distance / time)
	function calculateSpeed(distance, timeElapsed) {
		return (distance / timeElapsed) * 3.6; // Speed in km/h
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

	// Function to check for sudden changes in speed
	function checkForSuddenSpeedChange(speeds) {
		const threshold = 10; // Define a threshold for sudden speed change
		const lastSpeed = speeds[speeds.length - 1];
		const previousSpeed = speeds[speeds.length - 2];

		if (Math.abs(lastSpeed - previousSpeed) > threshold) {
			showNotification(
				`Sudden change in speed detected: ${lastSpeed} km/h`,
			);
		}
	}

	// Function to check for sudden changes in motion
	function checkForSuddenMotionChange(acceleration) {
		const threshold = 10; // Define a threshold for sudden motion change
		const changeX = Math.abs(acceleration.x);
		const changeY = Math.abs(acceleration.y);
		const changeZ = Math.abs(acceleration.z);

		if (changeX > threshold || changeY > threshold || changeZ > threshold) {
			showNotification("Sudden motion detected!");
		}
	}

	// Main function to track user position and check for sudden changes
	async function trackUserPosition() {
		const positions = [];
		const speeds = [];
		const checkInterval = 3000; // 3 seconds
		let lastAcceleration = { x: 0, y: 0, z: 0 };

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
				speeds.push(speed);

				// Check for sudden changes in speed
				if (speeds.length > 1) {
					checkForSuddenSpeedChange(speeds);
				}

				console.log(positions);
			} catch (error) {
				console.error(`ERROR(${error.code}): ${error.message}`);
			}
		}

		// Update position every 3 seconds
		setInterval(updatePosition, checkInterval);

		// Function to handle device motion
		function handleDeviceMotion(event) {
			const acceleration = event.acceleration;
			checkForSuddenMotionChange(acceleration); // Check for sudden motion changes

			lastAcceleration = acceleration;
		}

		// Listen for device motion events
		window.addEventListener("devicemotion", handleDeviceMotion);
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
