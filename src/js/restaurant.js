import { FavoriteButton } from "./utils/FavoriteButton";
import Helper from "./utils/Helper";
import { pendingRequestsDatabase } from "./utils/PendingRequestsDatabase";
import { RestaurantsDatabase } from "./utils/RestaurantsDatabase";
import { ReviewsDatabase } from "./utils/ReviewsDatabase";
import remoteDatabaseRequestInfo from './utils/RemoteDatabaseRequestInfo';

self.map = null;
self.favoriteBtn = null;

document.addEventListener("DOMContentLoaded", () => {
  Helper.registerServiceWorker();

  // Get ID of this restaurant
  const restaurantId = parseInt(getParameterByName("id"), 10);
  if (isNaN(restaurantId)) {
    throw "Unknown id in URL";
  }

  // Initialize databases.
  const restaurantsDb = new RestaurantsDatabase();
  const reviewsDb = new ReviewsDatabase();

  // Get restaurant from IDB to put something in the HTML so the user can see immediately.
  // Then request the restaurant from the remote Database to update the data and update the app
  restaurantsDb
    .getRestaurant(restaurantId)
    .then(restaurant => updateAppHtml(restaurant))
    .catch(error => console.error("Error using IDB restaurants", error))
    .then(() => restaurantsDb.updateRestaurant(restaurantId))
    .then(updatedRestaurant => updateAppHtml(updatedRestaurant))
    .catch(error => console.error("Error using updated restaurants", error));

  // Get reviews from IDB. Then update IDB and
  // show the updated reviews
  reviewsDb
    .getReviews(restaurantId)
    .then(reviews => fillReviewsHtml(reviews))
    .catch(error => console.error("Error using IDB reviews", error))
    .then(() => reviewsDb.updateReviews(restaurantId))
    .then(updatedReviews => fillReviewsHtml(updatedReviews))
    .catch(error => console.error("Error using updated reviews", error));

  // Add the submit event listener to the review form
  addReviewSubmitEventListener(restaurantId);
});

/**
 * Init or update the page HTML
 */
function updateAppHtml(restaurant) {
  initMap(restaurant);
  initFavoriteButton(restaurant);
  fillBreadcrumb(restaurant);
  fillRestaurantHtml(restaurant);
  fillRestaurantHoursHtml(restaurant.operating_hours);
}

/**
 * Initialize leaflet map
 */
function initMap(restaurant) {
  if (!self.map) {
    self.map = L.map("map", {
      center: [restaurant.latlng.lat, restaurant.latlng.lng],
      zoom: 16,
      scrollWheelZoom: false
    });

    L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={accessToken}",
      {
        accessToken: process.env.MAPBOX_API_KEY || '',
        maxZoom: 18,
        attribution:
          'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: "mapbox.streets"
      }
    ).addTo(self.map);

    Helper.mapMarkerForRestaurant(restaurant, self.map);
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHtml(restaurant) {
  const name = document.getElementById("restaurant-name");
  name.innerText = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerText = restaurant.address;

  const image = document.getElementById("restaurant-img");
  const imageSources = Helper.getRestaurantPhotoSources(restaurant);
  image.className = "restaurant-img";
  image.setAttribute(
    "alt",
    `promotional image of the restaurant "${restaurant.name}"`
  );

  // Small image to load something super fast (same image as favicon)
  image.setAttribute("src", "img/icons/icon16.png");

  // Lazy load the image
  image.onload = function() {
    image.setAttribute(
      "srcset",
      imageSources.map(({ url, width }) => `${url} ${width}w`).join(", ")
    );
    image.setAttribute(
      "sizes",
      `(max-width: 700px) 100vw, (min-width: 701px) 40vw`
    );
    image.onload = null;
  };

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerText = restaurant.cuisine_type;
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHtml(operatingHours) {
  const hours = document.getElementById("restaurant-hours");
  hours.innerHTML = "";

  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("th");
    day.setAttribute("scope", "row");
    day.innerHTML = key;
    row.appendChild(day);

    operatingHours[key].split(",").forEach(operatingHour => {
      const time = document.createElement("td");
      time.innerHTML = operatingHour;
      row.appendChild(time);
    });

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHtml(reviews) {
  const ul = document.getElementById("reviews-list");

  if (!reviews) {
    ul.innerHTML = "No reviews yet!";
  } else {
    ul.innerHTML = "";
    reviews.forEach(review => ul.appendChild(createReviewHtml(review)));
  }
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHtml(review) {
  const li = document.createElement("li");
  li.classList.add("review");

  const rating = document.createElement("p");
  rating.innerHTML = `<strong>Rating:</strong> ${review.rating}`;
  rating.classList.add("review-rating");
  li.appendChild(rating);

  const date = document.createElement("p");
  date.innerHTML = `<strong>Date:</strong> ${new Date(
    review.updatedAt
  ).toUTCString()}`;
  date.classList.add("review-date");
  li.appendChild(date);

  const name = document.createElement("p");
  name.innerHTML = `<strong>Reviewer:</strong> ${review.name}`;
  name.classList.add("reviewer-name");
  li.appendChild(name);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  comments.classList.add("review-comment");
  li.appendChild(comments);

  return li;
}

/**
 * Fill the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant) {
  const breadcrumb = document.getElementById("breadcrumb");
  breadcrumb.innerHTML = "";

  const homeLi = document.createElement("li");
  const homeLink = document.createElement("a");
  homeLink.innerText = "Home";
  homeLink.setAttribute("href", "/");
  homeLink.classList.add("inline-link");

  const li = document.createElement("li");
  li.innerHTML = restaurant.name;

  homeLi.appendChild(homeLink);
  breadcrumb.appendChild(homeLi);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function initFavoriteButton(restaurant) {
  // If this is the first time calling the function it will initialize the
  // button. If this is not the first time, it will just update the state
  // of the button
  if (!self.favoriteBtn) {
    const domButton = document.querySelector(
      "#restaurant-container .favorite-btn"
    );
    self.favoriteBtn = new FavoriteButton(domButton, restaurant.is_favorite);

    self.favoriteBtn.addEventListener("click", addRestaurantToFavorites);
    self.favoriteBtn.addEventListener("touch", addRestaurantToFavorites);

    function addRestaurantToFavorites() {
      const request = remoteDatabaseRequestInfo.putRestaurantFavorite({ 
        restaurantId: restaurant.id,
        isFavorite: btn.isFavorite
      });
      pendingRequestsDatabase.registerRequest(request);
    }
  } else {
    self.favoriteBtn.setState(restaurant.is_favorite);
  }
}

function addReviewSubmitEventListener(restaurantId) {
  // Review UL DOM element to append new reviews. This is so the user has
  // instant feedback
  const reviewList = document.getElementById("reviews-list");

  // Add event listener to the form
  document
    .getElementById("form-submit-review")
    .addEventListener("submit", event => {
      event.preventDefault();

      const form = event.target;
      const reviewInfo = {
        restaurantId,
        name: form["input-name"].value,
        rating: parseInt(form["select-rating"].value, 10),
        comments: form["textarea-review"].value,
        updatedAt: Date.now()
      };

      const request = remoteDatabaseRequestInfo.postNewReview(reviewInfo);
      pendingRequestsDatabase.registerRequest(request);

      reviewList.appendChild(createReviewHtml(reviewInfo));
    });
}
