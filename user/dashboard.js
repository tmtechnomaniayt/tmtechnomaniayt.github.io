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

		// automatedDetection();
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
			});
		});
	} else {
		window.location.href = "/";
	}
});

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
				sosType: sosType,
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
				data.picture = "no image";
				await sendSOSData(data);
			}
		},
		(error) => {
			console.error(`ERROR(${error.code}): ${error.message}`);
		},
		{
			enableHighAccuracy: true,
			timeout: 10000, // 10 seconds
			maximumAge: 0,
		},
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
	console.log(user);
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
				const response = await fetch(apiURL + "updatelocation", {
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
		{
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		},
	);
}

setInterval(locationUpdate, 15000);
