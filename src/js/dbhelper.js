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
          url: 'img/icons/icon16.png',
          width: 16
        },
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
        }
      ];
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

class FavoriteButton {
  /**
   * Creates a favorite button from the given button element.
   * If no element is passed, a new element is created.
   * The initial state can also be determined by the isFavorite parameter
   */
  constructor(buttonElement, isFavorite) {
    if (buttonElement) {
      this.domButton = buttonElement
    } else {
      this.domButton = FavoriteButton.createElement();
    }

    if (isFavorite) { this.updateState(); }
  }

  addEventListener(event, listener) {
    const boundListener = listener.bind(this);

    this.domButton.addEventListener(event, (...args) => {
      this.updateState();
      boundListener(...args);
    });
  }

  updateState() {
    const isFavorite = this.domButton.classList.contains('favorite');

    if (isFavorite) {
      this.domButton.classList.remove('favorite');
      this.domButton.setAttribute('title', FavoriteButton.ADD_LABEL);
      this.domButton.setAttribute('aria-label', FavoriteButton.ADD_LABEL);  
    } else {
      this.domButton.classList.add('favorite');
      this.domButton.setAttribute('title', FavoriteButton.REMOVE_LABEL);
      this.domButton.setAttribute('aria-label', FavoriteButton.REMOVE_LABEL);
    }  
  }

  get domElement() {
    return this.domButton;
  }

  static get ADD_LABEL() {
    return 'Add restaurant to favorites';
  }

  static get REMOVE_LABEL() {
    return 'Remove restaurant from favorites';
  }

  static createElement() {
    const btn = document.createElement('button');
    btn.setAttribute('title', FavoriteButton.ADD_LABEL);
    btn.setAttribute('aria-label', FavoriteButton.ADD_LABEL);
    btn.classList.add('favorite-btn');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M6.855,14.365l-1.817,6.36c-0.115,0.402,0.034,0.835,0.372,1.082c0.34,0.247,0.797,0.257,1.145,0.024L12,18.202l5.445,3.63 C17.613,21.944,17.807,22,18,22c0.207,0,0.414-0.064,0.59-0.192c0.338-0.247,0.487-0.68,0.372-1.082l-1.817-6.36l4.48-3.584 c0.308-0.247,0.442-0.651,0.343-1.033s-0.414-0.67-0.804-0.734l-5.497-0.916l-2.772-5.545c-0.34-0.678-1.449-0.678-1.789,0 L8.333,8.098L2.836,9.014c-0.39,0.064-0.704,0.353-0.804,0.734s0.035,0.786,0.343,1.033L6.855,14.365z'
    );

    btn.appendChild(svg);
    svg.appendChild(path);

    return btn;
  }
}
