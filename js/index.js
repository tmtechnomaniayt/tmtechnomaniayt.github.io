const apiURL = "http://98.70.99.231/";

$(document).ready(function () {
	// $("header").load("/components/header/index.html");
	// $("footer").load("/components/footer/index.html");
	setTimeout(function () {
		$(".loader").fadeOut();
	}, 1000);

	if (localStorage.getItem("user") && this.location.pathname === "/") {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user.type === "user") {
			window.location.href = "/user/dashboard";
		} else if (user.type === "volunteer") {
			window.location.href = "/volunteer/dashboard";
		} else if (user.type === "service") {
			window.location.href = "/service/dashboard";
		}
	}

	// TODO: Handle PWA install event specifically to user type
	if (this.location.pathname.includes("/userSignup")) {
		console.log("userSignup");
		const name = $("#name");
		const phone = $("#phone");
		const email = $("#email");
		const password = $("#password");
		const submit = $("button[type='submit']");

		submit.on("click", async () => {
			console.log("submit");

			// Get values from inputs
			const nameValue = name.val();
			const phoneValue = phone.val();
			const emailValue = email.val();
			const passwordValue = password.val();

			// Validate input fields
			if (!nameValue) {
				alert("Please enter your name");
				return;
			}

			if (!phoneValue) {
				alert("Please enter your phone number");
				return;
			}

			if (!emailValue) {
				alert("Please enter your email");
				return;
			}

			if (!passwordValue) {
				alert("Please enter your password");
				return;
			}

			// Validate phone number length (assuming 10 digits for example)
			if (phoneValue.length !== 10) {
				alert("Phone number must be 10 digits");
				return;
			}

			// Validate email format
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(emailValue)) {
				alert("Please enter a valid email address");
				return;
			}

			// Validate password difficulty (e.g., at least 8 characters, 1 number, 1 uppercase letter and 1 special character)
			const passwordPattern = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
			if (!passwordPattern.test(passwordValue)) {
				alert(
					"Password must be at least 8 characters long and include at least one number and one uppercase letter",
				);
				return;
			}

			// Upload the user data to server, get the user ID, and store it in localStorage as user

			// get user location lat long
			navigator.geolocation.getCurrentPosition(async (position) => {
				const user = {
					type: "user",
					name: nameValue,
					phone: phoneValue,
					email: emailValue,
					password: passwordValue,
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				};

				console.log(user);

				await signUpAndGenerateID(user);
			});

			// await signUpAndGenerateID(user);

			// localStorage.setItem("user", JSON.stringify(user));
		});
	} else if (this.location.pathname.includes("/volunteerSignup")) {
		console.log("volunteerSignup");
		const name = $("#name");
		const phone = $("#phone");
		const email = $("#email");
		const submit = $("button[type='submit']");

		submit.on("click", async () => {
			console.log("submit");

			// Get values from inputs
			const nameValue = name.val();
			const phoneValue = phone.val();
			const emailValue = email.val();

			// Validate input fields
			if (!nameValue) {
				alert("Please enter your name");
				return;
			}

			if (!phoneValue) {
				alert("Please enter your phone number");
				return;
			}

			if (!emailValue) {
				alert("Please enter your email");
				return;
			}

			// Validate phone number length (assuming 10 digits for example)
			if (phoneValue.length !== 10) {
				alert("Phone number must be 10 digits");
				return;
			}

			// Validate email format
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(emailValue)) {
				alert("Please enter a valid email address");
				return;
			}

			// Upload the volunteer data as new registraction request to server and contact the volunteer for further steps manually

			const user = {
				type: "volunteer",
				name: nameValue,
				phone: phoneValue,
				email: emailValue,
			};

			await signUpAndGenerateID(user);

			// localStorage.setItem("user", JSON.stringify(user));
		});
	} else if (this.location.pathname.includes("/serviceSignup")) {
		console.log("serviceSignup");
		const name = $("#name");
		const phone = $("#phone");
		const email = $("#email");
		const service = $("#service");
		const submit = $("button[type='submit']");

		submit.on("click", async () => {
			console.log("submit");

			// Get values from inputs
			const nameValue = name.val();
			const phoneValue = phone.val();
			const emailValue = email.val();
			const serviceValue = service.val();

			// Validate input fields
			if (!nameValue) {
				alert("Please enter your name");
				return;
			}

			if (!phoneValue) {
				alert("Please enter your phone number");
				return;
			}

			if (!emailValue) {
				alert("Please enter your email");
				return;
			}

			if (!serviceValue || serviceValue === "choose") {
				alert("Please choose your service");
				return;
			}

			// Validate phone number length (assuming 10 digits for example)
			if (phoneValue.length !== 10) {
				alert("Phone number must be 10 digits");
				return;
			}

			// Validate email format
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailPattern.test(emailValue)) {
				alert("Please enter a valid email address");
				return;
			}

			// Upload the volunteer data as new registraction request to server and contact the volunteer for further steps manually

			const user = {
				type: "service",
				name: nameValue,
				phone: phoneValue,
				email: emailValue,
				service: serviceValue,
			};

			await signUpAndGenerateID(user);

			// localStorage.setItem("user", JSON.stringify(user));
		});
	} else if (this.location.pathname.includes("/login")) {
		console.log("login");
	} else if (this.location.pathname.includes("/install")) {
		console.log("install");
		const installButton = $("#install");
		let deferredPrompt; // Variable to store the install prompt

		// Function to register the service worker
		const registerServiceWorker = async () => {
			if ("serviceWorker" in navigator) {
				try {
					const registration = await navigator.serviceWorker.register(
						"/js/sw.js",
					);
					console.log(
						"Service Worker registered! Scope:",
						registration.scope,
					);
				} catch (error) {
					console.error("Service Worker registration failed:", error);
				}
			} else {
				console.error(
					"Service Worker is not supported in this browser.",
				);
			}
		};

		// Check if PWA is already installed
		const checkIfInstalled = async () => {
			const registration =
				await navigator.serviceWorker.getRegistration();
			if (registration) {
				alert("This PWA is already installed."); // Alert user
				installButton.hide(); // Hide the install button if installed
			}
		};

		// Listen for the beforeinstallprompt event
		window.addEventListener("beforeinstallprompt", (e) => {
			e.preventDefault(); // Prevent the mini info bar from appearing
			deferredPrompt = e; // Store the event
			installButton.show(); // Show the install button
			console.log("beforeinstallprompt event fired");
		});

		// Install button click event handler
		installButton.on("click", async () => {
			if (deferredPrompt) {
				// Check if the prompt exists
				deferredPrompt.prompt(); // Show the installation prompt
				const result = await deferredPrompt.userChoice; // Wait for user choice
				if (result.outcome === "accepted") {
					console.log("PWA installed successfully!");
				} else {
					console.log("PWA installation dismissed.");
				}
				deferredPrompt = null; // Clear the prompt
				installButton.hide(); // Hide the install button after use
			} else {
				console.warn("No installation prompt available.");
			}
		});

		// Register the service worker when the page loads
		registerServiceWorker();
		// Check if PWA is already installed
		checkIfInstalled();
	}

	$("#animateLeft").click(() => {
		$("#home").animate({ left: "-100%", opacity: 0 }, 300, function () {
			$("#home").css("display", "none");
			$("#join").css("display", "flex");
			$("#join").animate({ right: "-100%", opacity: 0 }, 0);
			$("#join").animate({ right: "0", opacity: 1 }, 300);
		});
	});

	$("a").click(function (event) {
		// Check if the link is not an anchor link to the same page
		if (this.href.indexOf("#") >= 0) {
			return;
		} else if (!this.href) {
			return;
		} else {
			console.log(this.href);
			event.preventDefault();
			const linkLocation = this.href;
			$("body").fadeOut(500, function () {
				window.location.href = linkLocation;
			});
		}
	});
});

// Upload user data to server and get the user ID generated by the server to store it in localStorage and process to install PWA
async function signUpAndGenerateID(user) {
	const url = apiURL + "signup";
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(user),
	});
	console.log(response);
	const userData = await response.json();
	console.log(userData);
	if (response.status === 201) {
		console.log(userData);
		localStorage.setItem("user", JSON.stringify(userData));
		window.location.href = "/install";
	} else {
		alert("Error signing up. Please try again later.");
	}
}
