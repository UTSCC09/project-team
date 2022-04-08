# Place-Holder

## Project URL

https://place-holder.live/

## Project Video URL 

https://youtu.be/PklQZB_9jc4

## Project Description

An application that allows users to browse locations on an interactive map that users can review, and share images of places of interest. Users can search for locations to go to with the use of Wit.ai to lookup by typing into the search bar or by speaking. Users can also view uploaded photos of the location as well as access the 360 view of the location to get a better idea of the location. Should users desire to go to a pin location, there is an option to generate directions to go there based on user's location. 

Authenticated users are able to create pins for locations to go to or define a named region in which it will highlight all the pins associated with a brief description. Authenticated users can choose to delete their own pins should they find it's not the same location anymore.

## Development

**Task:** Leaving deployment aside, explain how the app is built. Please describe the overall code design and be specific about the programming languages, framework, libraries and third-party api that you have used. 

The overall code design is split the frontend and backend to their own separate folders and package.json in order for dockerizing to be more efficient.

Disclaimer: Api tokens used for third party libraries are stored in a .env file that is delibrately not pushed onto the Github repo due to security concerns of malicious use of the tokens.

### Backend
The backened server is hosted using NodeJS and Express that uses GraphQL to resolve the requests and used the Mongoose library to handle the MongoDB to manage the data. All GraphQL schemas for the endpoints reside in the graphql/schemas in order to avoid confusion with the MongoDB schema models. Due to GraphQL requests always responding with a 200 status even through the backend won't return a meaningful response (for example, when a user fails to login), instead of using a default return type, the utilization of GraphQLUnion types are defined for each endpoint to allow app defined Error messages to be returned so that the frontend is able to process what went wrong.

Authentication and sessions are done using the `express-session` library and passwords are hashed using `bcrypt`. Furthermore, request inputs received are all sanitized first using the `validator` library before it is handled by the resolvers.

Do note that the pin-resolver.js in particular uses a third party api called `node-wit` which is used to handle search requests for pins that the Wit Ai account for the app is trained to answer.

### Frontend

## Deployment

The application is hosted on a Digital Ocean droplet dockerized in the following containers:
  - nginx: handles reverse proxy of requests on ports 80 and 443 between the backend and frontend as well as directing to the ssl certificates
  - frontend: Serves the static frontend content
  - backend: Handles the api requests for the app and also communicates with the db
  - db: Manges to MongoDB data and requests
  - cerbot: manages handling the Lets Encrypt secret that gets provided to the nginx

Changes that are ready and tested locally would be merged into the `deployment` branch before being deployed manually. There is a known security issue with the frontend where npm install is forcing install ignoring warnings which is due to dependency problems with one of the React and mapbox libraries that was not able to be fixed in time.


## Maintenance

Once the app is deployed there is manual regression testing to ensure all the currently working features are still working. Data should persist due to using mounted volumes for the Docker containers. Due to the nature of app using Google maps as well as Voice searching with Wit.Ai, writing up automation tests for these were time consuming and difficult. 

## Challenges

**Task:** What is the top 3 most challenging things that you have learned/developed for you app? Please restrict your answer to only three items. 

1. Setting up the Docker containers on Digital Ocean droplet to reverse proxy with nginx
2.
3. 

## Contributions

**Task:** Describe the contribution of each team member to the project. Please provide the full name of each team member (but no student number). 

- John Guirgis 
- Peter Lang 
- Kent Leng
    - Deployed the web app onto Digital Ocean droplet
    - Dockerized the project and setup the reverse proxy with nginx and the SSL certificate
    - Setup the base line style for using GraphQL schemas on the backend
    - Login flow for the frontend and backend
    - General debugging fixes for backend related things

# One more thing? 

There was an email notice that the Digital Ocean Droplet will go under maintenace on April 13 00:00 UTC for 2 hours. It lists that the Droplet-dependant services will be down such as Load Balancers, Managed Databases, and Kubernetes. However, since all of these features are either not used or implemented on the apps end the web app should not be affected. 
