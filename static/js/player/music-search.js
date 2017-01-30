var search_button = document.getElementById("search-button");
var overlay_search_button = document.getElementById("overlay-search-button");
// Default search state
var search_state = false;
var search_overlay = document.getElementById("search-overlay");
var content = document.getElementById("content");
var wrapper = document.getElementById("wrapper");

function activateSearch() {
  // Show search overlay
  search_overlay.style.display = "block";
  // Keep search initialised with previously saved search value
  // player.updateSearch($("#input").val());
  //  Keep focus on search
  $('#input').val('');
  $('#input').focus();
  $('#music_ui').addClass('blur');
}

function deactivateSearch() {
  // Hide search overlay
  search_overlay.style.display = "none";
  // Redirect to our main library
  window.location.href = "/#playlist/LIBRARY";
  $('#music_ui').removeClass('blur');
}

// Add instant search to our custom search feature
$(".search-input").on("keyup", function (evt) {
  player.updateSearch(evt.target.value);
});

search_button.addEventListener("click", function () {

  // Display search results under our search input
  search_overlay.appendChild(content);
  search_state = true;
  activateSearch();
});
overlay_search_button.addEventListener("click", function () {
  search_overlay.removeChild(content);
  wrapper.appendChild(content);
  search_state = false;
  deactivateSearch();
});
