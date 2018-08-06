import idb from "idb";
import { config } from "./IdbConfig";

/**
 * Singleton class to access the IndexedDB database of this application.
 * On construction it opens the IDB database and stores the promise to access the db.
 */
class ApplicationIdbSingleton {
  /**
   * This application IndexedDB database name
   */
  static get DB_NAME() {
    return "restaurant_reviews";
  }

  /**
   * This application IndexedDB database version
   */
  static get DB_VERSION() {
    return 1;
  }

  /**
   * Connect to IDB and store the promise to access the application database
   */
  constructor() {
    this._openIdbPromise = idb.open(
      ApplicationIdbSingleton.DB_NAME,
      ApplicationIdbSingleton.DB_VERSION,
      db =>
        Object.values(config).forEach(
          ({ objectStoreName, objectStoreParameters }) =>
            db.createObjectStore(objectStoreName, objectStoreParameters)
        )
    );
  }

  /**
   * Returns the promise to use IDB (following Jake Archibald's idb library)
   */
  open() {
    return this._openIdbPromise;
  }
}

export const applicationIdb = new ApplicationIdbSingleton();
