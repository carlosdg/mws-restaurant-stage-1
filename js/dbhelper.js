/**
 * Database helper functions.
 */
class DBHelper {
  /**
   * Remote database URL
   */
  static get REMOTE_DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * IndexedDB database name
   */
  static get IDB_NAME() {
    return 'restaurant_reviews';
  }

  /**
   * IndexedDB database version
   */
  static get IDB_VERSION() {
    return 1;
  }

  /**
   */
  constructor() {
    // Connect to IDB
    this._dbPromise = idb.open(DBHelper.IDB_NAME, DBHelper.IDB_VERSION, db =>
      db.createObjectStore('restaurants', { keyPath: 'id' })
    );
  }

  /**
   * Retrieves all restaurants from IDB
   */
  getRestaurants() {
    return this._dbPromise.then(db =>
      db
        .transaction('restaurants')
        .objectStore('restaurants')
        .getAll()
    );
  }

  /**
   * Retrieves the restaurant with the given ID from IDB
   */
  getRestaurant(id) {
    return this._dbPromise.then(db =>
      db
        .transaction('restaurants')
        .objectStore('restaurants')
        .get(id)
    );
  }

  getNeighborhoods() {
    return (
      this.getRestaurants()
        // Get all neighborhoods from all restaurants
        .then(restaurants =>
          restaurants.map(restaurant => restaurant.neighborhood)
        )
        // Remove duplicates from neighborhoods
        .then(neighborhoods =>
          neighborhoods.filter(
            (neighborhood, i) => neighborhoods.indexOf(neighborhood) === i
          )
        )
    );
  }

  getCuisines() {
    return (
      this.getRestaurants()
        // Get all cuisines from all restaurants
        .then(restaurants =>
          restaurants.map(restaurant => restaurant.cuisine_type)
        )
        // Remove duplicates from cuisines
        .then(cuisines =>
          cuisines.filter((cuisine, i) => cuisines.indexOf(cuisine) === i)
        )
    );
  }

  getFilteredRestaurants({ cuisine = 'all', neighborhood = 'all' } = {}) {
    return (
      this.getRestaurants()
        // Filter by cuisine
        .then(
          restaurants =>
            cuisine === 'all'
              ? restaurants
              : restaurants.filter(r => r.cuisine_type === cuisine)
        )
        // Filter by neighborhood
        .then(
          restaurants =>
            neighborhood === 'all'
              ? restaurants
              : restaurants.filter(r => r.neighborhood == neighborhood)
        )
    );
  }

  /**
   * Tries to fetch restaurant information from the remote
   * database and update IDB.
   *
   * @returns {Promise} A promise that resolves with this instance
   *                    of DBHelper once IDB has been updated.
   *                    Or rejects with an error
   */
  updateRestaurants() {
    return fetch(DBHelper.REMOTE_DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => this._updateRestaurants(restaurants))
      .then(_ => this);
  }

  /**
   * Tries to fetch restaurant information from the remote
   * database and update IDB.
   *
   * @returns {Promise} A promise that resolves with this instance
   *                    of DBHelper once IDB has been updated.
   *                    Or rejects with an error
   */
  updateRestaurant(id) {
    return fetch(DBHelper.REMOTE_DATABASE_URL + '/' + id)
      .then(response => response.json())
      .then(restaurant => this._updateRestaurants([restaurant]))
      .then(_ => this);
  }

  /**
   * Puts in IDB the given restaurants
   */
  _updateRestaurants(restaurants) {
    return this._dbPromise.then(db => {
      const store = db
        .transaction('restaurants', 'readwrite')
        .objectStore('restaurants');
      restaurants.forEach(restaurant => store.put(restaurant));
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Returns the location of the restaurant photos.
   * If no photo was found we return the icon of the app
   */
  static getRestaurantPhotoSources(restaurant) {
    const imageName = restaurant.photograph;

    if (imageName) {
      return [
        {
          url: `img/400/${imageName}.jpg`,
          width: 400
        },
        {
          url: `img/800/${imageName}.jpg`,
          width: 800
        }
      ];
    } else {
      return [
        {
          url: 'img/icons/icon96.png',
          width: 96
        },
        {
          url: 'img/icons/icon144.png',
          width: 144
        },
        {
          url: 'img/icons/icon192.png',
          width: 192
        },
        {
          url: 'img/icons/icon256.png',
          width: 256
        },
        {
          url: 'img/icons/icon512.png',
          width: 512
        },
      ]
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(map);
    return marker;
  }
}
