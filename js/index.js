$(document).ready(function () {
	// $("header").load("/components/header/index.html");
	// $("footer").load("/components/footer/index.html");

	// remove loader after 1 second with fadeOut
	setTimeout(function () {
		$(".loader").fadeOut();
	}, 1000);

	// check if localStorage has user data and redirect to dashboard based on type user / volunteer / service

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

			// Validate password difficulty (e.g., at least 8 characters, 1 number, 1 uppercase letter)
			const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
			if (!passwordPattern.test(passwordValue)) {
				alert(
					"Password must be at least 8 characters long and include at least one number and one uppercase letter",
				);
				return;
			}

			// Upload the user data to server, get the user ID, and store it in localStorage as user

			const user = {
				type: "user",
				name: nameValue,
				phone: phoneValue,
				email: emailValue,
				password: passwordValue,
			};

			await signUpAndGenerateID(user);

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
		const install = $("#install");
		install.on("click", installPWA);
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
async function signUpAndGenerateID(user) {}

const installPWA = async () => {
	// Check if the browser supports service workers
	if ("serviceWorker" in navigator) {
		// Register the service worker
		const registration = await navigator.serviceWorker.register("/js/sw.js");
		console.log("Service Worker registered! Scope: ", registration.scope);
	} else {
		console.error("Service Worker is not supported in this browser.");
	}
}

