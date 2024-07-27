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
		const sosParent = sos.parent();
		const sosChoices = ["police", "ambulance", "fire", "towing"];
		let sosStatus = false;
		let choiceShown = false;
		let isHolding = false;

		sos.on("touchend", function () {
			isHolding = false;
			console.log("touchend");
		});

		// function to handle tap and touch holds
		sos.on("touchstart", function () {
			console.log("touchstart");
			isHolding = true;
			if (!sosStatus) {
				sosParent.css({
					filter: "drop-shadow(0 0 100px var(--red)) drop-shadow(0 0 70px var(--red))",
					transition: "filter 3s",
				});
			}

			let timer = 0;
			let interval = setInterval(function () {
				timer++;
				if (timer >= 3 && isHolding) {
					clearInterval(interval);
					sendSOS();
					console.log(timer);
					alert("SOS Alert Sent");
				}
			}, 1000);
			setTimeout(() => {
				if (timer >= 1 && !isHolding) {
					sosParent.css("filter", "none");
					console.log(timer);
					alert("SOS Alert Cancelled");
					clearInterval(interval);
				} else if (timer == 0 && !isHolding) {
					console.log(timer);
					choiceShown = !choiceShown;
					clearInterval(interval);
					if (choiceShown) {
						sosChoices.forEach((choice) => {
							$(`#${choice}`).removeClass("none");
						});
					} else {
						sosChoices.forEach((choice) => {
							$(`#${choice}`).addClass("none");
						});
						sosParent.css("filter", "none");
					}
				}
			}, 300);
		});

        sosChoices.forEach((choice) => {
            $(`#${choice}`).on("click", function () {
                sendSOS(choice);
                alert("SOS Alert Sent");
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

async function sendSOS(choice) {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		console.error("User data not found in localStorage.");
        window.location.href = "/login";
		return;
	}
    let sosType = "sos";
    if (choice) {
        sosType = choice;
    }

	// Get user's current location
	navigator.geolocation.getCurrentPosition(
		async (position) => {
			const data = {
                userId: user._id,
				lat: position.coords.latitude,
				lng: position.coords.longitude,
                sosType: sosType
			};

			// Attempt to access the camera
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "user" },
				});

				const video = document.createElement("video");
				video.setAttribute("autoplay", true);
				video.setAttribute("playsinline", true);
				video.style.display = "none";
				document.body.appendChild(video);
				video.srcObject = stream;

				video.onloadedmetadata = async () => {
					const canvas = document.createElement("canvas");
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					const context = canvas.getContext("2d");
					context.drawImage(video, 0, 0, canvas.width, canvas.height);

					// Reduce image size to a maximum of 1MB
					const maxSize = 1024 * 1024; // 1MB
					let quality = 0.9; // Start with a high quality
					let imageBlob = await new Promise((resolve) => {
						canvas.toBlob(
							(blob) => {
								resolve(blob);
							},
							"image/jpeg",
							quality,
						);
					});

					// Adjust quality until the size is under the limit
					while (imageBlob.size > maxSize && quality > 0.1) {
						quality -= 0.1; // Decrease quality
						imageBlob = await new Promise((resolve) => {
							canvas.toBlob(
								(blob) => {
									resolve(blob);
								},
								"image/jpeg",
								quality,
							);
						});
					}

					const image = await new Promise((resolve) => {
						const reader = new FileReader();
						reader.onloadend = () => {
							resolve(reader.result);
						};
						reader.readAsDataURL(imageBlob);
					});

					data.picture = image; // Add picture to data

					// Send the SOS data
					await sendSOSData(data);

					// Clean up
					document.body.removeChild(video);
					stream.getTracks().forEach((track) => track.stop()); // Stop the video stream
				};

			} catch (error) {
				console.error("Failed to access the camera:", error);
				// Proceed to send SOS data without a picture
				await sendSOSData(data);
			}
		},
		(error) => {
			console.error(`ERROR(${error.code}): ${error.message}`);
		}
	);
}

// Helper function to send SOS data
async function sendSOSData(data) {
	try {
		const response = await fetch(apiURL + "sos", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		const result = await response.json();
		console.log(result);
	} catch (error) {
		console.error("Failed to send SOS data:", error);
	}
}


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
				user: user,
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
