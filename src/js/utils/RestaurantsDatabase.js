class RestaurantsDatabase {
  /**
   * Remote database URL
   */
  static get REMOTE_DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  static get IDB_OBJECT_STORE_NAME() {
    return 'restaurants';
  }

  /**
   */
  constructor() {
    // Connect to IDB
    this._dbPromise = IdbProxy.open();
  }

  /**
   * Retrieves all restaurants from IDB
   */
  getRestaurants() {
    return this._dbPromise.then(db =>
      db
        .transaction(RestaurantsDatabase.IDB_OBJECT_STORE_NAME)
        .objectStore(RestaurantsDatabase.IDB_OBJECT_STORE_NAME)
        .getAll()
    );
  }

  /**
   * Retrieves the restaurant with the given ID from IDB.

   */
  getRestaurant(id) {
    return this._dbPromise
      .then(db =>
        db
          .transaction(RestaurantsDatabase.IDB_OBJECT_STORE_NAME)
          .objectStore(RestaurantsDatabase.IDB_OBJECT_STORE_NAME)
          .get(id)
      )
      // .then(restaurant => {
      //   if (restaurant) {
      //     return restaurant;
      //   } else {
      //     return this.updateRestaurant(id);
      //   }
      // });
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
   *                    of RestaurantsDatabase once IDB has been updated.
   *                    Or rejects with an error
   */
  updateRestaurants() {
    return fetch(RestaurantsDatabase.REMOTE_DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => {
        this._updateRestaurants(restaurants);
        return restaurants;
      });
  }

  /**
   * Tries to fetch restaurant information from the remote
   * database and update IDB.
   *
   * @returns {Promise} A promise that resolves with this instance
   *                    of RestaurantsDatabase once IDB has been updated.
   *                    Or rejects with an error
   */
  updateRestaurant(id) {
    return fetch(RestaurantsDatabase.REMOTE_DATABASE_URL + '/' + id)
      .then(response => response.json())
      .then(restaurant => {
        this._updateRestaurants([restaurant]);
        return restaurant;
      });
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
}