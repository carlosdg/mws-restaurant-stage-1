/**
 * Remote database base URL. If it is specified as an environtment variable
 * we use that, else we default to localhost
 */
const remoteDbBaseUrl = process.env.REMOTE_DB_BASE_URL || "http://localhost:1337";

/**
 * Helper function to make more readable code below
 */
function CreateRemoteRequest(url, options = { method: "GET" }) {
  return { url, options };
}

export default {
  /**
   * Returns the request information needed to get all restaurants
   * from the remote database
   */
  getAllRestaurants() {
    return CreateRemoteRequest(`${remoteDbBaseUrl}/restaurants`);
  },

  /**
   * Returns the request information needed to get a restaurant
   * from the remote database
   */
  getRestaurant({ restaurantId }) {
    return CreateRemoteRequest(`${remoteDbBaseUrl}/restaurants/${restaurantId}`);
  },

  /**
   * Returns the request information needed to get all reviews of 
   * a particular restaurant from the remote database
   */
  getAllRestaurantReviews({ restaurantId }) {
    return CreateRemoteRequest(`${remoteDbBaseUrl}/reviews/?restaurant_id=${restaurantId}`);
  },

  /**
   * Returns the request information needed to send a new review to the
   * remote database
   */
  postNewReview({ restaurantId, name, rating, comments }) {
    const body = JSON.stringify({
      restaurant_id: restaurantId,
      name,
      rating,
      comments
    });
    return CreateRemoteRequest(`${remoteDbBaseUrl}/reviews`, { method: "POST", body });
  },

  /**
   * Returns the request information needed to update the favorite
   * status of a restaurant in the remote server
   */
  putRestaurantFavorite({ restaurantId, isFavorite }) {
    return CreateRemoteRequest(
      `${remoteDbBaseUrl}/restaurants/${restaurantId}/?is_favorite=${isFavorite}`,
      { method: "PUT" }
    );
  },
}