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

        if (user.emergencyContact.username){
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
            const content = `<h3 class="fs-2xl txt-red">You have not set an emergency contact</h3>
                <a href="/emergency-contact">
                    <button class="btn btn-primary">Set Emergency Contact</button>
                </a>`;
            $("#contact").html(content);
        }
        // $("#user-email").text(user.email);
    } else {
        window.location.href = "/";
    }
});