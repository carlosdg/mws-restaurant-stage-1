import { IdbProxy } from "./IdbProxy";
import { config } from "./IdbConfig";

/**
 * Proxy for PendingRequestsDatabase. It ensures that only an object
 * is created, next calls will result in returning a cached object.
 *
 * This is because PendingRequestsDatabase construction should only
 * happen once in the application lifetime. It registers an online event
 * listener and tries to send all pending requests found in IDB from previous
 * sessions. Those should only happen once
 */
export class PendingRequestsDatabaseProxy {
  static open() {
    if (!PendingRequestsDatabaseProxy._cachedObject) {
      PendingRequestsDatabaseProxy._cachedObject = new PendingRequestsDatabase();
    }

    return PendingRequestsDatabaseProxy._cachedObject;
  }
}

/**
 * Registers requests to send to the server.
 * If a given request fails because the application is offline, it is
 * stored in IDB.
 *
 * The objects that are stored in the pending requests object store have the
 * following properties:
 *
 * - id: ID of the object to store in IDB
 * - url: URL to send the fetch request
 * - options: fetch options.
 *
 * Example:
 * {
 *  id: 1,
 *  url: 'http://localhost:1337/reviews/',
 *  options: {
 *    method: 'POST',
 *    body: '{ "restaurant_id": 1, "name": "Nice Bot", "rating": 5, "comments": "Nice" }'
 *  }
 * }
 */
class PendingRequestsDatabase {
  static get IDB_OBJECT_STORE_NAME() {
    return config.PendingRequestsDatabase.objectStoreName;
  }

  constructor() {
    // Little trick so they are always bound to this and we don't have
    // to create bound functions every time that we need them as callback
    this._sendPendingRequest = this._sendPendingRequest.bind(this);
    this._sendAllPendingRequests = this._sendAllPendingRequests.bind(this);

    // Connect to IDB
    this._dbPromise = IdbProxy.open();

    // Try to send any pending request in IDB (if any)
    this._sendAllPendingRequests()
      .then(promises => Promise.all(promises))
      .finally(() => {
        // Register event listener so every time the user goes online
        // we try to send all pending requests
        window.addEventListener("online", this._sendAllPendingRequests);
      });
  }

  /**
   * Try to send the given request. If it success we do nothing more.
   * If it fails we put the request information into the pending requests
   * object store
   */
  registerRequest({ url, options }) {
    return fetch(url, options).catch(error => {
      // Add the request info to the pending requests
      this._dbPromise.then(db =>
        db
          .transaction(
            PendingRequestsDatabase.IDB_OBJECT_STORE_NAME,
            "readwrite"
          )
          .objectStore(PendingRequestsDatabase.IDB_OBJECT_STORE_NAME)
          .put({ url, options })
      );

      // Rethrow the error in case the caller wants to know if the request
      // failed this first time
      throw error;
    });
  }

  /**
   * Tries to send all pending requests and delete the ones that success
   */
  _sendAllPendingRequests() {
    return this._dbPromise.then(db =>
      // Get all pending requests
      db
        .transaction(PendingRequestsDatabase.IDB_OBJECT_STORE_NAME)
        .objectStore(PendingRequestsDatabase.IDB_OBJECT_STORE_NAME)
        .getAll()
        // Send all requests and delete the ones that success from the object store
        .then(pendingRequests => pendingRequests.map(this._sendPendingRequest))
    );
  }

  /**
   * Tries to send a pending request and if it success, it is deleted from
   * the object store
   */
  _sendPendingRequest({ id, url, options }) {
    return fetch(url, options)
      .then(_ => this._dbPromise)
      .then(db =>
        db
          .transaction(
            PendingRequestsDatabase.IDB_OBJECT_STORE_NAME,
            "readwrite"
          )
          .objectStore(PendingRequestsDatabase.IDB_OBJECT_STORE_NAME)
          .delete(id)
      );
  }
}
