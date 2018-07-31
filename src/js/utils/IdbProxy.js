/**
 * Proxy class to open IndexedDB. When open is called after the first time
 * it will return the cached promise instead of trying to open the IDB again.
 */
class IdbProxy {
  /**
   * IndexedDB database name
   */
  static get NAME() {
    return 'restaurant_reviews';
  }

  /**
   * IndexedDB database version
   */
  static get VERSION() {
    return 1;
  }

  /**
   * Returns the promise to use IDB (following Jake Archibald's idb library)
   */
  static open() {
    // The first time opening IDB there will be no cached promise. 
    // So we open it and cache the promise for future access
    if (!IdbProxy._cachedPromise) {
      IdbProxy._cachedPromise = idb.open(IdbProxy.NAME, IdbProxy.VERSION, db => {
          db.createObjectStore(RestaurantsDatabase.IDB_OBJECT_STORE_NAME, { keyPath: 'id' });
          db.createObjectStore(ReviewsDatabase.IDB_OBJECT_STORE_NAME, { keyPath: 'restaurantId' });
          db.createObjectStore(PendingRequestsDatabase.IDB_OBJECT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      });
    }

    return IdbProxy._cachedPromise;
  }
}