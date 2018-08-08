# Restaurant Reviews (Mobile Web Specialist Certification Course)

This is the project made for [Udacity's Mobile Web Specialist nanodegree](https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024). This project was divided into three stages, you can see the ending result of each stage in the corresponding branches:

- [stage-1](https://github.com/carlosdg/mws-restaurant-stage-1/tree/stage-1)
- [stage-2](https://github.com/carlosdg/mws-restaurant-stage-1/tree/stage-2)
- [stage-3](https://github.com/carlosdg/mws-restaurant-stage-1/tree/stage-3)

The main purpose of this project is to learn/improve the skills at:

- Building Offline Capable Web Applications
- Building Performant Web Applications
- Building Accessible and Responsive Web Applications

After finishing the course, I've refactor parts of the code and I've used this project to practise with other technologies like [webpack](https://webpack.js.org/) and [docker](https://www.docker.com/)

## About Restaurants Reviews

This is an application about restaurants, users can:

- See information of restaurants
  - Weekly schedule
  - Location
  - Cuisine type

- Mark restaurants as favorite

- Search restaurants filtered by neighborhood and/or cuisine type

- Post reviews of a restaurant

- See other users reviews of a restaurant

All the restaurants and reviews data is retrieved from an external database via a [REST API](https://en.wikipedia.org/wiki/Representational_state_transfer). This data is stored on [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) so users can access the application with some content while being offline. Also, the waiting time for the application to load after the first load is very small because we first load the cached content and then update the application if the user is online.

Users can send reviews and favorite restaurants while being offline, once they are online the requests will be sent to the remote database even if they leave the application, in this last case the data will be sent only when the users come back to the application

## Run

First download the code from github

```
git clone https://github.com/carlosdg/mws-restaurant-stage-1 && cd mws-restaurant-stage-1
```

Now you have to create a `.env` file to store some environment variables needed for the application. The file should be like the following:

```bash
# MODE specifies whether webpack should build the public folder for production or development
# Values are "production" or "development" (without quotes)
MODE=development

# REMOTE_DB_BASE_URL specifies what is the base URL of the remote database server
# This is from where the application will try to fetch the restaurant and reviews data
# It has to include the URL scheme, host and port (if the port is different than the
# default one for the protocol)
REMOTE_DB_BASE_URL=http://localhost:1337

# MAPBOX_API_KEY specifies the API key for mapbox
MAPBOX_API_KEY=api_key
```

Install the app dependencies and generate the `public` folder

```
npm install && npm run build
```

Now you can start a server listening on port 8080 with

```
npm start
```

## Authors

- Carlos Domínguez García

**Note**: this project was started off from the [Udacity's mws-restaurant-stage-1 repository](https://github.com/udacity/mws-restaurant-stage-1). They created that repository as a starting point for the nanodegree project.
