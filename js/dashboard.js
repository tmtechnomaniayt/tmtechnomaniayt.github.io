const apiURL = "https://simplitech.me/";

$(document).ready(function () {
    setTimeout(function () {
		$(".loader").fadeOut();
	}, 1000);
	// $("header").load("/components/header/index.html");
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        $("#uname").text(user.name);
        $("#user-email").text(user.email);
    } else {
        window.location.href = "/";
    }
});