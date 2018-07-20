const dbPromise = idb.open('restaurant_reviews', 1, db => {
  db.createObjectStore('restaurants', { keyPath: 'id' });
});

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get _DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Returns the URL to connect to the API to get the restaurant information
   */
  static _getRestaurantDatabaseUrl(id) {
    return `${DBHelper._DATABASE_URL}/${id}`;
  }

  /**
   * Retrieves all restaurants from the data base
   */
  static _getRestaurantsFromIdb() {
    return dbPromise
      .then(db => db.transaction('restaurants').objectStore('restaurants').getAll())
  }

  /**
   * Retrieves the restaurants with the given ID from the data base
   */
  static _getRestaurantFromIdb(id) {
    return dbPromise
      .then(db => db.transaction('restaurants').objectStore('restaurants').get(id))
  }

  /**
   * Updates the given restaurants in the database
   */
  static _updateRestaurantsFromIdb(restaurants) {
    return dbPromise
      .then(db => {
        const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
        restaurants.forEach(restaurant => store.put(restaurant));
      });
  }

  /**
   * Fetches the restaurants, they are put/updated in IndexedDB.
   * 
   * If the network request fails, the callback is called with the restaurants
   * from IndexedDB.
   * 
   * If the network fetch and IndexedDB fails, it calls the callback with the error
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper._DATABASE_URL)
      .then(response => response.json())
      .then(restaurants => {
        // On network success =>
        // - Update the DB entries for the new restaurants
        DBHelper._updateRestaurantsFromIdb(restaurants);
        
        // - Return the restaurants
        return restaurants;
      })
      // On network fail => try to get the data from IDB
      .catch(_ => DBHelper._getRestaurantsFromIdb())
      // Call the callback with the restaurants of the error
      // (NOTE: we don't break the behavior in .then and .catch because
      //  in that case when the callback throws in .then 
      //  the catch would be called too D:)
      .then(
        restaurants => callback(null, restaurants),
        error => callback(error, null)
      )
  }

  /**
   * Fetches a restaurant, it is put/updated in IndexedDB.
   * 
   * If the network request fails, the callback is called with the restaurant
   * from IndexedDB. 
   * 
   * If the network fetch and IndexedDB fails, it calls the callback with the error
   */
  static fetchRestaurantById(id, callback) {
    const dbUrl = DBHelper._getRestaurantDatabaseUrl(id);
    
    fetch(dbUrl)
      .then(response => response.json())
      .then(restaurant => {
        // On network success => 
        // - Update the DB entry for the new restaurant
        DBHelper._updateRestaurantsFromIdb([restaurant]);
        
        // - Return the restaurants
        return restaurant
      })
      // On network fail => try to get the restaurant from IDB
      .catch(_ => DBHelper._getRestaurantFromIdb(id))
      // Call the callback with the restaurants of the error
      // (NOTE: we don't break the behavior in .then and .catch because
      //  in that case when the callback throws in .then 
      //  the catch would be called too D:)
      .then(
        restaurants => callback(null, restaurants),
        error => callback(error, null)
      )
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }
  
  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
  
  /**
   * Returns the location of the restaurant photos
   */
  static getRestaurantPhotoSources(restaurant) {
    return [
      {
        url: `img/400/${restaurant.id}.jpg`,
        width: 400
      },
      {
        url: `img/800/${restaurant.id}.jpg`,
        width: 800
      }
    ]
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(map);
    return marker;
  }
}

