export const config = {
  RestaurantsDatabase: {
    objectStoreName: "restaurants",
    objectStoreParameters: {
      keyPath: "id"
    }
  },
  PendingRequestsDatabase: {
    objectStoreName: "reviews",
    objectStoreParameters: {
      keyPath: "id",
      autoIncrement: true
    }
  },
  ReviewsDatabase: {
    objectStoreName: "pending_requests",
    objectStoreParameters: {
      keyPath: "restaurantId"
    }
  }
};
