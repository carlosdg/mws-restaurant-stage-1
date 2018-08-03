/**
 * Used to retrieve Reviews data from IndexedDB and
 * to update the reviews data at IndexedDB from the
 * remote server
 */
class ReviewsDatabase {
  /**
   * Remote database URL
   */
  static getRemoteDatabaseUrl(restaurantId) {
    const port = 1337;
    return `http://localhost:${port}/reviews/?restaurant_id=${restaurantId}`;
  }

  /**
   * IndexedDB reviews object store
   */
  static get IDB_OBJECT_STORE_NAME() {
    return "reviews";
  }

  constructor() {
    this._dbPromise = IdbProxy.open();
  }

  /**
   * Returns a promise for all the reviews for the given restaurant
   * from IDB
   */
  getReviews(restaurantId) {
    return this._dbPromise
      .then(db =>
        db
          .transaction(ReviewsDatabase.IDB_OBJECT_STORE_NAME)
          .objectStore(ReviewsDatabase.IDB_OBJECT_STORE_NAME)
          .get(restaurantId)
      )
      .then(idbResponse => (idbResponse ? idbResponse.reviews : null));
  }

  /**
   * Tries to fetch the reviews of the given restaurant
   * from the remote database and update IDB.
   */
  updateReviews(restaurantId) {
    return fetch(ReviewsDatabase.getRemoteDatabaseUrl(restaurantId))
      .then(response => response.json())
      .then(reviews => {
        this._updateReviews({ restaurantId, reviews });
        return reviews;
      });
  }

  /**
   * Stores the data to the IDB. The data has the following format
   * {
   *  restaurantId: <int>,
   *  reviews: <Array<Objects>>
   * }
   */
  _updateReviews(idbData) {
    return this._dbPromise.then(db =>
      db
        .transaction(ReviewsDatabase.IDB_OBJECT_STORE_NAME, "readwrite")
        .objectStore(ReviewsDatabase.IDB_OBJECT_STORE_NAME)
        .put(idbData)
    );
  }
}
