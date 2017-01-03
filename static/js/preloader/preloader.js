//State to check whether app has loaded
var state_reached = false;
Pace.on("change", function (progress) {
  //  Clock our load progress
  console.log(progress);
  if (progress >= 90 && !(state_reached)) {
    state_reached = true;
    var preloader = document.getElementById("preloader-overlay");
    // Add hide class
    preloader.className += " preloader-hide";
  }

});
