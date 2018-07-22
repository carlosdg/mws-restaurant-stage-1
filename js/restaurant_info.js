let dbHelper;
var map;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', _ => {
  self.dbHelper = new DBHelper();

  fetchRestaurantFromUrl()
    .then(restaurant => {
      fillBreadcrumb(restaurant);
      fillRestaurantHtml(restaurant);
      initMap(restaurant);
      DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    })
    .catch(console.error);
});

/**
 * Initialize leaflet map
 */
initMap = restaurant => {
  self.map = L.map('map', {
    center: [restaurant.latlng.lat, restaurant.latlng.lng],
    zoom: 16,
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
  ).addTo(map);
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromUrl = () => {
  const id = parseInt(getParameterByName('id'), 10);

  if (isNaN(id)) {
    throw 'Unknown id in URL';
  }

  return self.dbHelper.getRestaurant(id).then(restaurant => {
    if (restaurant) {
      return restaurant;
    }

    // Try to update IDB and then look if we have the restaurant
    return self.dbHelper
      .updateDb()
      .then(_ => self.dbHelper.getRestaurant(id))
      .then(restaurant => {
        if (!restaurant) {
          throw 'Missing data for restaurant';
        }

        return restaurant;
      });
  });
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHtml = restaurant => {
  const name = document.getElementById('restaurant-name');
  name.innerText = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerText = restaurant.address;

  const image = document.getElementById('restaurant-img');
  const imageSources = DBHelper.getRestaurantPhotoSources(restaurant);
  image.className = 'restaurant-img';
  image.setAttribute('alt', '');
  image.setAttribute('role', 'presentation');
  image.setAttribute('src', imageSources[0].url);
  image.setAttribute(
    'srcset',
    imageSources.map(({ url, width }) => `${url} ${width}w`).join(', ')
  );
  image.setAttribute(
    'sizes',
    `
    (max-width: 700px) 100vw,
    (min-width: 701px) 40vw
  `
  );

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerText = restaurant.cuisine_type;

  fillRestaurantHoursHtml(restaurant.operating_hours);
  fillReviewsHtml(restaurant.reviews);
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHtml = operatingHours => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('th');
    day.setAttribute('scope', 'row');
    day.innerHTML = key;
    row.appendChild(day);

    operatingHours[key].split(',').forEach(operatingHour => {
      const time = document.createElement('td');
      time.innerHTML = operatingHour;
      row.appendChild(time);
    });

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHtml = reviews => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHtml(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHtml = review => {
  const li = document.createElement('li');
  li.classList.add('review');

  const rating = document.createElement('p');
  rating.innerHTML = `<strong>Rating:</strong> ${review.rating}`;
  rating.classList.add('review-rating');
  li.appendChild(rating);

  const date = document.createElement('p');
  date.innerHTML = `<strong>Date:</strong> ${review.date}`;
  date.classList.add('review-date');
  li.appendChild(date);

  const name = document.createElement('p');
  name.innerHTML = `<strong>Reviewer:</strong> ${review.name}`;
  name.classList.add('reviewer-name');
  li.appendChild(name);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.classList.add('review-comment');
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = restaurant => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
