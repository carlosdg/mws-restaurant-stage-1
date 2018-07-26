let dbHelper;
var map;
var markers = [];

/**
 * As soon as the page is loaded:
 *  - Initialize the map
 *  - Initialize the application with the restaurant data from IDB
 *  - Fetch new data from the remote server to update IDB and update the application
 */
document.addEventListener('DOMContentLoaded', _ => {
  self.dbHelper = new DBHelper();
  initMap();
  main();

  self.dbHelper.updateRestaurants().then(updatedDbHelper => {
    self.dbHelper = updatedDbHelper;
    main();
  });
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
  self.map = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  });

  L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={accessToken}',
    {
      accessToken:
        'pk.eyJ1IjoiY2FybG9zLWRvbWluZ3VleiIsImEiOiJjampvOWE0ZnIxNnd3M3Zyc3pxM2ZnNHJkIn0.y4purOXmeN0qCA2vW4etCg',
      maxZoom: 18,
      attribution:
        'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }
  ).addTo(self.map);
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
function updateNeighborhoods() {
  self.dbHelper
    .getNeighborhoods()
    .then(neighborhoods => fillNeighborhoodFilterHtml(neighborhoods))
    .catch(console.error);
}

/**
 * Set neighborhood filter HTML.
 */
function fillNeighborhoodFilterHtml(neighborhoods) {
  const select = document.getElementById('neighborhoods-select');

  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
function updateCuisines() {
  self.dbHelper
    .getCuisines()
    .then(cuisines => fillCuisineFilterHtml(cuisines))
    .catch(console.error);
}

/**
 * Set cuisine filter HTML.
 */
function fillCuisineFilterHtml(cuisines) {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  // If the index is not valid we use 'all' as default
  const cuisine = cSelect[cIndex] ? cSelect[cIndex].value : 'all';
  const neighborhood = nSelect[nIndex] ? nSelect[nIndex].value : 'all';

  self.dbHelper
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
  const ul = document.getElementById('restaurants-list');

  // Remove all restaurants
  ul.innerHTML = '';

  // Add new restaurants
  restaurants.forEach(restaurant =>
    ul.append(createRestaurantInfoItemHtml(restaurant))
  );
}

/**
 * Create restaurant HTML.
 */
function createRestaurantInfoItemHtml(restaurant) {
  const li = document.createElement('li');
  li.classList.add('restaurant-info-preview');

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('restaurant-info-header');
  li.appendChild(headerDiv);

  const name = document.createElement('h3');
  name.classList.add('restaurant-preview-name');
  name.innerText = restaurant.name;
  headerDiv.append(name);

  const toggleRestaurantFavoriteButton = createToggleFavoriteButton(restaurant);
  headerDiv.append(toggleRestaurantFavoriteButton);

  const image = document.createElement('img');
  const imageSources = DBHelper.getRestaurantPhotoSources(restaurant);
  image.classList.add('restaurant-preview-img');
  image.setAttribute('alt', `promotional image of the restaurant "${restaurant.name}"`);

  // Small image to load something super fast (same image as favicon)
  image.setAttribute('src', 'img/icons/icon16.png');

  // Lazy load the image
  image.onload = function() {
    image.setAttribute(
      'srcset',
      imageSources.map(({ url, width }) => `${url} ${width}w`).join(', ')
    );
    image.setAttribute('sizes', '300px');
    image.onload = null;
  };
  li.append(image);

  const address = document.createElement('p');
  address.classList.add('restaurant-preview-address');
  address.setAttribute('title', 'Restaurant address');
  address.innerText = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  const description =
    'View details of the restaurant "' + restaurant.name + '"';
  more.setAttribute('aria-label', description);
  more.setAttribute('title', description);
  more.setAttribute('href', DBHelper.urlForRestaurant(restaurant));
  more.classList.add('restaurant-preview-details-link');
  more.innerText = 'View Details';
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
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);

    // Add marker to the list
    self.markers.push(marker);

    // Treat it as a link (a feature for convenience)
    const navigateToRestaurantPage = () =>
      (window.location.href = marker.options.url);
    marker.on('click', navigateToRestaurantPage);
    marker.on('touch', navigateToRestaurantPage);
  });
}

function createToggleFavoriteButton(restaurant) {
  const ADD_TO_FAVORITES_LABEL = 'Add restaurant to favorites';
  const REMOVE_FROM_FAVORITES_LABEL = 'Remove restaurant from favorites';

  const btn = document.createElement('button');
  btn.classList.add('favorite-btn');
  btn.setAttribute('title', ADD_TO_FAVORITES_LABEL);
  btn.setAttribute('aria-label', ADD_TO_FAVORITES_LABEL);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M6.855,14.365l-1.817,6.36c-0.115,0.402,0.034,0.835,0.372,1.082c0.34,0.247,0.797,0.257,1.145,0.024L12,18.202l5.445,3.63 C17.613,21.944,17.807,22,18,22c0.207,0,0.414-0.064,0.59-0.192c0.338-0.247,0.487-0.68,0.372-1.082l-1.817-6.36l4.48-3.584 c0.308-0.247,0.442-0.651,0.343-1.033s-0.414-0.67-0.804-0.734l-5.497-0.916l-2.772-5.545c-0.34-0.678-1.449-0.678-1.789,0 L8.333,8.098L2.836,9.014c-0.39,0.064-0.704,0.353-0.804,0.734s0.035,0.786,0.343,1.033L6.855,14.365z');

  btn.appendChild(svg);
  svg.appendChild(path);

  btn.addEventListener('click', addRestaurantToFavorites);
  btn.addEventListener('touch', addRestaurantToFavorites);

  function addRestaurantToFavorites() {
    // Add/remove favorite class
    btn.classList.toggle('favorite');

    // Update the label and title to say add or remove
    if (btn.classList.contains('favorite')) {
      btn.setAttribute('aria-label', REMOVE_FROM_FAVORITES_LABEL);
      btn.setAttribute('title', REMOVE_FROM_FAVORITES_LABEL);
    } else {
      btn.setAttribute('aria-label', ADD_TO_FAVORITES_LABEL);
      btn.setAttribute('title', ADD_TO_FAVORITES_LABEL);
    }
  }

  return btn;
}
