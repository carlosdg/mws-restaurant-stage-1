import { applicationIdb } from "./ApplicationIdb";
import { config } from "./IdbConfig";
import remoteDatabaseRequestInfo from './RemoteDatabaseRequestInfo';

/**
 * Used to retrieve Restaurant data from IndexedDB and
 * to update the restaurant data at IndexedDB from the
 * remote server
 */
export class RestaurantsDatabase {
  /**
   * IndexedDB restaurants object store
   */
  static get IDB_OBJECT_STORE_NAME() {
    return config.RestaurantsDatabase.objectStoreName;
  }

  constructor() {
    // Connect to IDB
    this._dbPromise = applicationIdb.open();
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
    return this._dbPromise.then(db =>
      db
        .transaction(RestaurantsDatabase.IDB_OBJECT_STORE_NAME)
        .objectStore(RestaurantsDatabase.IDB_OBJECT_STORE_NAME)
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

  getFilteredRestaurants({ cuisine = "all", neighborhood = "all" } = {}) {
    return (
      this.getRestaurants()
        // Filter by cuisine
        .then(
          restaurants =>
            cuisine === "all"
              ? restaurants
              : restaurants.filter(r => r.cuisine_type === cuisine)
        )
        // Filter by neighborhood
        .then(
          restaurants =>
            neighborhood === "all"
              ? restaurants
              : restaurants.filter(r => r.neighborhood == neighborhood)
        )
    );
  }

  /**
   * Tries to fetch restaurant information from the remote
   * database and update IDB.
   */
  updateRestaurants() {
    const requestInfo = remoteDatabaseRequestInfo.getAllRestaurants();
    return fetch(requestInfo.url, requestInfo.options)
      .then(response => response.json())
      .then(restaurants => {
        this._updateRestaurants(restaurants);
        return restaurants;
      });
  }

  /**
   * Tries to fetch restaurant information from the remote
   * database and update IDB.
   */
  updateRestaurant(restaurantId) {
    const requestInfo = remoteDatabaseRequestInfo.getRestaurant({restaurantId});
    return fetch(requestInfo.url, requestInfo.options)
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
        .transaction("restaurants", "readwrite")
        .objectStore("restaurants");
      restaurants.forEach(restaurant => store.put(restaurant));
    });
  }
}
