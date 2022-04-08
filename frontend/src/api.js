const { default: axios } = require("axios");
const MAPBOT_ACCESS_TOKEN = process.env.REACT_APP_MAPBOT_ACCESS_TOKEN;
/**
 * Perform a request with callbacks
 * @param {String} method method to perform
 * @param {String} url Endpoint
 * @param {Object} data Request body
 * @param {Function} callback function to perform
 */
function send(method, url, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
    else callback(null, JSON.parse(xhr.responseText));
  };
  xhr.open(method, url, true);
  if (!data) xhr.send();
  else {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }
};
/**
 * Perform request with promises
 * @param {String} method method to perform
 * @param {String} url endpoint
 * @param {Object} data Request body
 * @param {Function} callback function to perform
 */
function performAxiosRequest(method, url, data, callback) {
  axios({
    method: method,
    url: url,
    data: data
  }).then(function(res){
    callback(null, res);
  })
  .catch(function (err) {
    callback(err, null)
  });
}
/**
 * Perform a request involving a file
 * @param {String} method method to perform
 * @param {String} url Endpoint
 * @param {Object} data Request body
 * @param {Function} callback function to perform
 */
function performAxiosRequestFile(method, url, data, callback) {
  axios({
    method: method,
    url: url,
    headers: {'Content-Type':'multipart/form-data'},
    data: data
  }).then(function(res){
    callback(null, res);
  })
  .catch(function (err) {
    callback(err, null)
  });
}
/**
 * Create and retuarn a promise
 * @param {String} method method to perform
 * @param {String} url endpoint
 * @param {Object} data Request body
 * @returns Promise
 */
function getAxiosPromise(method, url, data) {
  return axios({
    method: method,
    url: url,
    data: data
  });
}
/**
 * Executes the array of promises
 * @param {Array} promises promises to be executed
 * @param {Function} callback to execute with result
 */
function executePromises(promises, callback) {
  Promise.all(promises).then(function (res) {
    callback(null, res);
  })
  .catch(function(err){
    callback(err, null);
  })
}

const baseUrl = 'https://place-holder.live/api/';
const renderRadius = 2000;
const searchRadius = 10000;
/**
 * Deletes a pin
 * @param {Number} pinId the id of the pin to be deleted
 * @param {Function} callback for catching errors
 */
const deletePin = function(pinId, callback){
  let body = {"query": `mutation { deletePin { ...on Return{ return } ...on Error{ message } } }`};
  performAxiosRequest("post", baseUrl + 'pin/' + pinId, body, callback);
}
/**
 * Deletes a polygon
 * @param {Number} polyId the id of the polygon to be deleted
 * @param {Function} callback for catching errors
 */
const deletePolygon = function (polyId, callback) {
  let body = {"query": `mutation { deletePolygon { ...on Return{ return } ...on Error{ message } } }`};
  performAxiosRequest("post", baseUrl + `polygon/${polyId}`, body, callback);
}
/**
 * Searches for pins with the given tags around a position
 * @param {Array} pos The coordinates of thecentre of the search radius
 * @param {Array} tags List of tags to search for
 * @param {Function} callback executes with results
 */
const searchTags = function (pos, tags, callback) {
  let body = {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: ${searchRadius} tags: ${JSON.stringify(tags)}}) { ...on Pins{ pins{ _id owner type features { type properties { name description tags } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest("post", baseUrl + 'pin/', body, callback);
}
/**
 * Creates a pin
 * @param {Object} marker the pin object to be created
 * @param {Function} callback executes with result
 */
const createPin = function (marker, callback) {
  let cleanName = marker.name.replaceAll('"', '');
  let cleanDescription = marker.description.replaceAll('"', '');
  let body = {"query": `mutation 
    { createPin(input: { 
      type: "FeatureCollection", 
      features: { 
        type: "Feature", 
        properties: { 
          name: "${cleanName}" 
          description:"${cleanDescription}" 
          tags:${JSON.stringify(marker.tags)} } 
          geometry: { 
            type: "Point", 
            coordinates: [ ${marker._lngLat.lng}, ${marker._lngLat.lat} ] } } }) 
            { ...on Pin{ _id type owner features { 
              type properties { name description tags } 
              geometry { type coordinates } } } ...on Error{ message } }}`}
  performAxiosRequest("post", baseUrl + 'pin', body, callback);
}
/**
 * Creates a polygon
 * @param {Object} polygon the polygon object to be created
 * @param {Function} callback executes with result
 */
const createPolygon = function (polygon, callback) {
  let coord = JSON.stringify(polygon.geometry.coordinates[0]);
  let cleanName = polygon.name.replaceAll('"', '');
  let cleanDescription = polygon.description.replaceAll('"', '');
  let body = {"query": `mutation { createPolygon(input: { 
    type: "FeatureCollection", 
    features: { 
      type: "Feature", 
      properties: { 
        name: "${cleanName}" 
        description: "${cleanDescription}" } 
        geometry: { 
          type: "Polygon", 
          coordinates: [ ${coord} ] } } })
           { ...on Polygon{ _id type features { 
             type properties { name } geometry { type coordinates }} } 
             ...on Error{ message } }}`};
  performAxiosRequest('post', baseUrl + 'polygon', body, callback);
}
/**
 * Retreives the pins within the given polygon
 * @param {Number} regionId ID of polygon to search within
 * @param {Function} callback executes with result
 */
const getPinsWithinPolygon = function (regionId, callback) {
  let body = {"query": "query { getPinsWithin  { ...on Pins { pins { _id type features { type properties { name tags } geometry { type coordinates } } } } ...on Error{message} }}"}
  performAxiosRequest("post", baseUrl + `polygon/${regionId}`, body, callback)
}
/**
 * Retreives the coordinates of the queried location
 * @param {String} q the query
 * @param {Boolean} autocomplete If true, use the query as a prefix
 * @param {Function} callback executes with result
 */
const getLocationCoord = function (q, autocomplete, callback) {
  performAxiosRequest("get", `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?autocomplete=${autocomplete}&access_token=${MAPBOT_ACCESS_TOKEN}`, null, callback);
}
/**
 * Perform a search for the custom query
 * @param {Array} pos centre of searching radius
 * @param {String} query Search query
 * @param {Function} callback executes with result
 */
const customSearch = function(pos, query, callback){
  let body = {'query': `query { 
    searchByTag(input: { lat: ${pos.lat}, lon: ${pos.lng}, 
      radius: ${searchRadius}, message: "${query}" } ) 
      { ...on Pins{ tags 
        pins{ _id owner type features { 
          type properties { name description tags } 
          geometry { type coordinates } } } } ...on Error{ message }} }`};
  performAxiosRequest('post', baseUrl + 'pin', body, callback);

}
/**
 * Gets the oldest/newest image associated with the given pin
 * @param {Number} id of pin
 * @param {String} goto one of 'OLDEST' or 'NEWEST'
 * @param {Function} callback executes with result
 */
const getImagePage = function(id, goto, callback){

  let q = `query {
    getImagePage(input: {goto: ${goto} }) {
      ... on Image {
        _id
      }
      ... on Error {
        message
      }
    }
  }`;
  let body = {'query': q};
  performAxiosRequest('post', baseUrl + `pin/${id}/image/`, body, callback);
}
/**
 * Uploads an image to the marker
 * @param {Object} marker the marker object to 'attach' the image to
 * @param {Function} callback executes with result
 */
const uploadImage = function (marker, callback) {
  let data = new FormData();
  let title = marker.name.replaceAll('"', '')
  const query = `mutation($file:Upload!){createImage(input:{title: "${title}", image:$file}) { ...on Image{ _id, title, image, pin } ...on Error{ message } }}`;
  data.append("operations", JSON.stringify({ query }));
  const map = {"zero":["variables.file"]}
  data.append('map', JSON.stringify(map));
  data.append('zero', marker.image);
  performAxiosRequest("post", baseUrl + `pin/${marker.id}/image/`, data, callback);
}
/**
 * Sends the recorded voice query and retreives the results
 * @param {Array} pos the centre of the search radius
 * @param {Blob} audio Audio blob containing the query
 * @param {Function} callback executes with result
 */
const voiceSearch = function (pos, audio, callback) {
  let data = new FormData();
  const query = `query($file:Upload!){searchByTag(input:{lat: ${pos.lat}, lon: ${pos.lng}, radius: ${searchRadius}, speech:$file}) { ...on Pins{ tags pins{ _id type owner features { type properties { name description tags } geometry { type coordinates } } } } ...on Error{ message } }}`;
  data.append("operations", JSON.stringify({ query }));
  const map = {"zero":["variables.file"]}
  data.append('map', JSON.stringify(map));
  let f = new File([audio.blob], 'test.wav', { lastModified: new Date().getTime(), type: audio.type });
  
  data.append('zero', f);
  performAxiosRequestFile('post', baseUrl + 'pin', data, callback); 
}
/**
 * Retreives the specified image
 * @param {Number} imgId id of image to be retreived
 * @param {Function} callback executes with result
 */
const getImage = function (imgId, callback) {
  performAxiosRequest("post", baseUrl + `image/${imgId}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"}, callback);
}
/**
 * Retreives numerous images given their IDs
 * @param {Array} idArr IDs of images to be retreived
 * @param {Function} callback executes with result
 */
const getImagesFromIds = function(idArr, callback){
  let p = [];
  for (let img of idArr){
    p.push(getAxiosPromise('post', baseUrl + `image/${img._id}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"}));
  }
  executePromises(p, callback);
}

/**
 * Retreives pins near the given point
 * @param {Array} pos centre of radius to retreive pins within
 * @param {Function} callback executes with result
 */
const getPins = function (pos, callback) {
  let body = {"query": `query
   { 
     getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: ${renderRadius} tags: []}) 
     { 
       ...on Pins{ 
         pins{ _id type owner features { type properties { name description tags } geometry { type coordinates } } } } 
         ...on Error{ message }}}`};
  performAxiosRequest("post", baseUrl + 'pin', body, callback);
}
/**
 * Returns the image corresponding to the given ID, 
 * along with those that come after and before it
 * @param {Number} pinId ID of pin associated with images
 * @param {Number} imageId ID of the current image
 * @param {Function} callback executes with result
 */
const getImageTrio = function (pinId, imageId, callback) {
  let q = `query {
    getAdjacentImage(input: {imageId: "${imageId}"}) {
      ... on ImageAdjacent {
        next {
          _id
          title
          image
          pin
        }
        previous {
          _id
          title
          image
          pin
        }
      }
    }
  }`;
  let body = {'query': q};
  performAxiosRequest('post', baseUrl + `pin/${pinId}/image`, body, function (err, res) {
    if(err) return callback(err, null);
    if (res) {
      if (!res.data.data.getAdjacentImage) {
        return getImage(imageId, function (imgErr, imgRes) {
          if(imgErr) return callback(imgErr, null);
          if(imgRes){
            return callback(null, imgRes);
          }
        });
      }
      let prevId = res.data.data.getAdjacentImage.previous._id;
      let nextId = res.data.data.getAdjacentImage.next._id;
      let b = {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"};
      let curr = getAxiosPromise('post', baseUrl + `image/${imageId}`, b);
      let prev = getAxiosPromise('post', baseUrl + `image/${prevId}`, b);
      let next = getAxiosPromise('post', baseUrl + `image/${nextId}`, b);
      Promise.all([curr, next, prev]).then(function (imgRes) {
        let ids = {current: imageId, previous: prevId, next: nextId};
        let tmp = imgRes.map((a) => a.data.data.getPhoto.url);
        let urls = {current: tmp[0], next: tmp[1], previous: tmp[2]};
        return callback(null, {ids: ids, urls: urls});
      })
      .catch(function (imgErr) {
        return callback(imgErr, null);
      });
    }
  });
}
/**
 * Retreives the newest image associated with the given pin
 * @param {Number} pinId ID of pin associated with image
 * @param {Function} callback executes with result
 */
const getNewestImage = function (pinId, callback) {
  getImagePage(pinId, 'NEWEST', function (err, res) {
    if(err) return callback(err, null)
    if (res) {
      getImage(res.data.data.getImagePage._id, function (imgErr, imgRes) {
        if(imgErr)return callback(imgErr, null);
        if (imgRes) {
          return callback(null, imgRes);
        }
        
      });
    }
  });
}
/**
 * Rereives the oldest image associated with the given pin
 * @param {Number} pinId ID os pin associated with image
 * @param {Function} callback executes with result
 */
const getOldestImage = function(pinId, callback){
  getImagePage(pinId, 'OLDEST', function (err, res) {
    if(err) return callback(err, null)
    if (res) {
      getImage(res.data.data.getImagePage._id, function (imgErr, imgRes) {
        if(imgErr)return callback(imgErr, null);
        if (imgRes) {
          return callback(null, imgRes);
        }
        
      });
    }
  });
}
/**
 * Retreives polygons near the given point
 * @param {Array} pos the centre of the radius to retreive polygons within
 * @param {Function} callback executes with result
 */
const getPolygons = function (pos, callback) {
  let body= {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: ${renderRadius} }) { ...on Polygons{ polygons{ _id type owner features { type properties { name description } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest('post', baseUrl + 'polygon', body, callback);
}
/**
 * Return the IDs of the images associated with the specified pin
 * @param {Number} pinId ID of pin associated with image
 * @param {Function} callback executes with result
 */
const getImageFromPinId = function (pinId, callback) {
  let body = {"query": "query { getImages { ...on Images{ images{_id, title, image, pin} } ...on Error { message } }}"};
  performAxiosRequest('post', baseUrl + `pin/${pinId}/image`, body, callback);
}

/**
 * Gets the images of the specified pins (actual URLs not just IDs)
 * @param {Array} pins pins whose images will be retreieved
 * @param {Function} callback executes with result
 */
const getImagesOfPins = function (pins, callback) {
  let p = [];
  for (let pin of pins){
    let t = getAxiosPromise("post", baseUrl + `pin/${pin._id}/image`, {"query": "query { getImages { ...on Images{ images{_id, title, image, pin} } ...on Error { message } }}"});
    p.push(t);
  }

  Promise.all(p).then(function (vals) {
    let p2 =[];
      for (let i of vals){
        let t = getAxiosPromise("post", baseUrl + `image/${i.data.data.getImages.images[0]._id}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"});
        p2.push(t);
      }
      Promise.all(p2).then(function (imgs) {
        let final = [];
        for (let img of imgs){
          final.push({img: encodeURI(img.data.data.getPhoto.url)});
        }
        callback(null, final)
      })
      .catch(function (imgErr) {
        callback(imgErr, null);
      });
  })
  .catch(function (err) {
    callback(err, null);
  });
}
/**
 * Retreive the ratings of the specified pin
 * @param {Number} id ID of pin to get the ratings for
 * @param {Function} callback executes with result
 */
const getRatings = function (id, callback) {
  let query = `query getRatings($input: RatingSearchInput) {
    getRatings(input: $input) {
      ... on Ratings {
        average
        ratings {_id, stars, createdBy}
      }

      ... on Error {
        message
      }
    }
  }`;

  let body = {
    query,
    variables: {
      input: {
        lId: id
      }
    }
  }

  send("post", baseUrl + 'rating', body, callback);
}
/**
 * Creates a new rating of the specified location
 * @param {Number} stars the rating
 * @param {Number} lId ID of location being rated
 * @param {Function} callback executes with result
 */
const createRating = function (stars, lId, callback) {
  let query = `mutation createRating($input: RatingInput) {
    createRating(input: $input) {
      ... on Rating {
        _id,
        stars,
        lId,
        createdBy
      }

      ... on Error {
        message
      }
    }
  }`;

  let body = {
    query,
    variables: {
      input: {
        stars: stars,
        lId: lId,
      }
    }
  };

  send("post", baseUrl + 'rating', body, callback);
}
/**
 * Updates a location's rating (when a user has already created a rating)
 * @param {Number} stars the rating
 * @param {Number} lId ID of location whose rating is being updated
 * @param {Function} callback executes with result
 */
const updateRating = function (stars, lId, callback) {
  let query = `mutation updateRating($input: RatingInput) {
    updateRating(input: $input) {
      ... on Rating {
        _id,
        stars,
        lId,
        createdBy,
      }

      ... on Error {
        message
      }
    }
  }`;

  let body = {
    query,
    variables: {
      input: {
        stars: stars,
        lId: lId,
      }
    }
  };

  send("post", baseUrl + 'rating', body, callback);
}
/**
 * Registers a user
 * @param {String} username 
 * @param {String} password 
 * @param {Function} callback executes with result
 */
const registerUser = function (username, password, callback) {
  let query = `mutation createUser($input: UserInput) { 
    createUser(input: $input) {
      ... on User {
        username
      }

      ... on Error {
        message
      }
    }
  }`;

  let body = {
    query,
    variables: {
      input: {
        username: username,
        password: password
      }
    }
  };

  send('POST', baseUrl + 'user', body, callback);
}
/**
 * Authenitcates a user
 * @param {String} username 
 * @param {String} password 
 * @param {String} callback executes with result
 */
const signIn = async function (username, password, callback) {
  let query = `query signin($input: UserInput) {
    signin(input: $input) {
      ... on User {
        username
      }

      ... on Error {
        message
      }
    }
  }`;

  let body = {
    query,
    variables: {
      input: {
        username: username,
        password: password
      }
    }
  };

  send('POST', baseUrl + 'user', body, callback);
}


module.exports = {
  registerUser,
  signIn,
  deletePin,
  searchTags,
  getPinsWithinPolygon,
  getImagesOfPins,
  getImage,
  uploadImage,
  createPin,
  getPins,
  getPolygons,
  deletePolygon,
  getLocationCoord,
  getImagesFromIds,
  createPolygon,
  customSearch,
  getImageFromPinId,
  voiceSearch,
  createRating,
  updateRating,
  getRatings,
  getImagePage,
  getImageTrio,
  getOldestImage,
  getNewestImage
}