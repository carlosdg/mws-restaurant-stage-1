import { FavoriteButton } from "./utils/FavoriteButton";
import Helper from "./utils/Helper";
import { pendingRequestsDatabase } from "./utils/PendingRequestsDatabase";
import { RestaurantsDatabase } from "./utils/RestaurantsDatabase";
import remoteDatabaseRequestInfo from './utils/RemoteDatabaseRequestInfo';

self.restaurantDb = null;
self.map = null;
self.markers = [];

/**
 * As soon as the page is loaded:
 *  - Initialize the map
 *  - Initialize the application with the restaurant data from IDB
 *  - Fetch new data from the remote server to update IDB and update the application
 */
document.addEventListener("DOMContentLoaded", _ => {
  Helper.registerServiceWorker();
  self.restaurantDb = new RestaurantsDatabase();
  initMap();
  main();

  self.restaurantDb.updateRestaurants().then(_ => main());
});

function main() {
  updateRestaurants();
  updateNeighborhoods();
  updateCuisines();
}

/**
 * Initialize leaflet map.
 */
function initMap() {
  self.map = L.map("map", {
    center: [40.722216, -73.987501],
    zoom: 12,
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
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
function updateNeighborhoods() {
  self.restaurantDb
    .getNeighborhoods()
    .then(neighborhoods => fillNeighborhoodFilterHtml(neighborhoods))
    .catch(console.error);
}

/**
 * Set neighborhood filter HTML.
 */
function fillNeighborhoodFilterHtml(neighborhoods) {
  const select = document.getElementById("neighborhoods-select");

  neighborhoods.forEach(neighborhood => {
    const option = document.createElement("option");
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
function updateCuisines() {
  self.restaurantDb
    .getCuisines()
    .then(cuisines => fillCuisineFilterHtml(cuisines))
    .catch(console.error);
}

/**
 * Set cuisine filter HTML.
 */
function fillCuisineFilterHtml(cuisines) {
  const select = document.getElementById("cuisines-select");

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById("cuisines-select");
  const nSelect = document.getElementById("neighborhoods-select");

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  // If the index is not valid we use 'all' as default
  const cuisine = cSelect[cIndex] ? cSelect[cIndex].value : "all";
  const neighborhood = nSelect[nIndex] ? nSelect[nIndex].value : "all";

  self.restaurantDb
    .getFilteredRestaurants({ cuisine, neighborhood })
    .then(restaurants => {
      updateRestaurantInfoListHtml(restaurants);
      updateMapMarkers(restaurants);
    })
    .catch(console.error);
}

/**
 * Clears current restaurants and their HTML.
 * Create all restaurants HTML and add them to the webpage.
 */
function updateRestaurantInfoListHtml(restaurants) {
  const ul = document.getElementById("restaurants-list");

  // Remove all restaurants
  ul.innerHTML = "";

  // Add new restaurants
  restaurants.forEach(restaurant =>
    ul.append(createRestaurantInfoItemHtml(restaurant))
  );
}

/**
 * Create restaurant HTML.
 */
function createRestaurantInfoItemHtml(restaurant) {
  const li = document.createElement("li");
  li.classList.add("restaurant-info-preview");

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("restaurant-info-header");
  li.appendChild(headerDiv);

  const name = document.createElement("h3");
  name.classList.add("restaurant-preview-name");
  name.innerText = restaurant.name;
  headerDiv.append(name);

  const toggleRestaurantFavoriteButton = createToggleFavoriteButton(restaurant);
  headerDiv.append(toggleRestaurantFavoriteButton);

  const image = document.createElement("img");
  const imageSources = Helper.getRestaurantPhotoSources(restaurant);
  image.classList.add("restaurant-preview-img");
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
    image.setAttribute("sizes", "300px");
    image.onload = null;
  };
  li.append(image);

  const address = document.createElement("p");
  address.classList.add("restaurant-preview-address");
  address.setAttribute("title", "Restaurant address");
  address.innerText = restaurant.address;
  li.append(address);

  const more = document.createElement("a");
  const description =
    'View details of the restaurant "' + restaurant.name + '"';
  more.setAttribute("aria-label", description);
  more.setAttribute("title", description);
  more.setAttribute("href", Helper.urlForRestaurant(restaurant));
  more.classList.add("restaurant-preview-details-link");
  more.innerText = "View Details";
  li.append(more);

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
function updateMapMarkers(restaurants) {
  // Remove all previous markers
  self.markers.forEach(m => self.map.removeLayer(m));
  self.markers = [];

  // Add new markers
  restaurants.forEach(restaurant => {
    // Create marker for the current restaurant
    const marker = Helper.mapMarkerForRestaurant(restaurant, self.map);

    // Add marker to the list
    self.markers.push(marker);

    // Treat it as a link (a feature for convenience)
    const navigateToRestaurantPage = () =>
      (window.location.href = marker.options.url);
    marker.on("click", navigateToRestaurantPage);
    marker.on("touch", navigateToRestaurantPage);
  });
}

function createToggleFavoriteButton(restaurant) {
  const btn = new FavoriteButton(null, restaurant.is_favorite);

  btn.addEventListener("click", addRestaurantToFavorites);
  btn.addEventListener("touch", addRestaurantToFavorites);

  function addRestaurantToFavorites() {
    const request = remoteDatabaseRequestInfo.putRestaurantFavorite({ 
      restaurantId: restaurant.id,
      isFavorite: btn.isFavorite
    });
    pendingRequestsDatabase.registerRequest(request);
  }

  return btn.domButton;
}
