/**
 * Helper functions.
 */
export default class Helper {
  /**
   * Register a service worker controlling the root
   */
  static registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      return navigator.serviceWorker
        .register("service_worker.js")
        .then(reg => console.log("Registration success", reg))
        .catch(error => console.error("Error", error));
    } else {
      return null;
    }
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
          url: "img/icons/icon16.png",
          width: 16
        },
        {
          url: "img/icons/icon96.png",
          width: 96
        },
        {
          url: "img/icons/icon144.png",
          width: 144
        },
        {
          url: "img/icons/icon192.png",
          width: 192
        },
        {
          url: "img/icons/icon256.png",
          width: 256
        },
        {
          url: "img/icons/icon512.png",
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
        url: Helper.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(map);
    return marker;
  }
}
