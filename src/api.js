const { default: axios } = require("axios");
//const { base } = require("../api/db/models/pin-model");
const MAPBOT_ACCESS_TOKEN = 'pk.eyJ1Ijoiam9obmd1aXJnaXMiLCJhIjoiY2wwNnMzdXBsMGR2YTNjcnUzejkxMHJ2OCJ9.l5e_mV0U2tpgICFgkHoLOg';
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
  })
}

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

function getAxiosPromise(method, url, data) {
  return axios({
    method: method,
    url: url,
    data: data
  });
}

function executePromises(promises, callback) {
  Promise.all(promises).then(function (res) {
    console.log(res)
    callback(null, res);
  })
  .catch(function(err){
    callback(err, null);
  })
}

const baseUrl = 'http://localhost:8000/'
const renderRadius = 2000;
const searchRadius = 10000;

const deletePin = function(pinId, callback){
  let body = {"query": `mutation { deletePin { ...on Return{ return } ...on Error{ message } } }`};
  performAxiosRequest("post", baseUrl + 'pin/' + pinId, body, callback);
}

const deletePolygon = function (polyId, callback) {
  let body = {"query": `mutation { deletePolygon { ...on Return{ return } ...on Error{ message } } }`};
  performAxiosRequest("post", baseUrl + `polygon/${polyId}`, body, callback);
}

const searchTags = function (pos, tags, callback) {
  let body = {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: ${searchRadius} tags: ${JSON.stringify(tags)}}) { ...on Pins{ pins{ _id owner type features { type properties { name description tags } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest("post", baseUrl + 'pin/', body, callback);
}

const createPin = function (marker, callback) {
  console.log(marker);
  let body = {"query": `mutation 
    { createPin(input: { 
      type: "FeatureCollection", 
      features: { 
        type: "Feature", 
        properties: { 
          name: "${marker.name}" 
          description:"${marker.description}" 
          tags:${JSON.stringify(marker.tags)} } 
          geometry: { 
            type: "Point", 
            coordinates: [ ${marker._lngLat.lng}, ${marker._lngLat.lat} ] } } }) 
            { ...on Pin{ _id type owner features { 
              type properties { name description tags } 
              geometry { type coordinates } } } ...on Error{ message } }}`}
  performAxiosRequest("post", baseUrl + 'pin', body, callback);
}
const createPolygon = function (polygon, callback) {
  let coord = JSON.stringify(polygon.geometry.coordinates[0])
  let body = {"query": `mutation { createPolygon(input: { 
    type: "FeatureCollection", 
    features: { 
      type: "Feature", 
      properties: { 
        name: "${polygon.name}" 
        description: "${polygon.description}" } 
        geometry: { 
          type: "Polygon", 
          coordinates: [ ${coord} ] } } })
           { ...on Polygon{ _id type features { 
             type properties { name } geometry { type coordinates }} } 
             ...on Error{ message } }}`};
  performAxiosRequest('post', baseUrl + 'polygon', body, callback);
}

const getPinsWithinPolygon = function (regionId, callback) {
  let body = {"query": "query { getPinsWithin  { ...on Pins { pins { _id type features { type properties { name tags } geometry { type coordinates } } } } ...on Error{message} }}"}
  performAxiosRequest("post", baseUrl + `polygon/${regionId}`, body, callback)
}

const getLocationCoord = function (q, autocomplete, callback) {
  performAxiosRequest("get", `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?autocomplete=${autocomplete}&access_token=${MAPBOT_ACCESS_TOKEN}`, null, callback);
}

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

const uploadImage = function (marker, callback) {
  let data = new FormData();
  const query = `mutation($file:Upload!){createImage(input:{title: "${marker.name}", image:$file}) { ...on Image{ _id, title, image, pin } ...on Error{ message } }}`;
  data.append("operations", JSON.stringify({ query }));
  const map = {"zero":["variables.file"]}
  data.append('map', JSON.stringify(map));
  console.log(marker.image);
  data.append('zero', marker.image);
  performAxiosRequest("post", baseUrl + `pin/${marker.id}/image/`, data, callback);
}

const voiceSeach = function (pos, audio, callback) {
  //return;
  let data = new FormData();
  const query = `query($file:Upload!){searchByTag(input:{lat: ${pos.lat}, lon: ${pos.lng}, radius: ${searchRadius}, speech:$file}) { ...on Pins{ tags pins{ _id type features { type properties { name description tags } geometry { type coordinates } } } } ...on Error{ message } }}`;
  data.append("operations", JSON.stringify({ query }));
  const map = {"zero":["variables.file"]}
  data.append('map', JSON.stringify(map));
  console.log(audio.blob);
  let f = new File([audio.blob], 'test.wav', { lastModified: new Date().getTime(), type: audio.type });
  
  data.append('zero', f);
  //let id = marker.id;
  performAxiosRequestFile('post', baseUrl + 'pin', data, callback); 
}

const getImage = function (imgId, callback) {
  console.log(imgId);
  performAxiosRequest("post", baseUrl + `image/${imgId}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"}, callback);
}

const getImagesFromIds = function(idArr, callback){
  let p = [];
  for (let img of idArr){
    p.push(getAxiosPromise('post', baseUrl + `image/${img._id}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"}));
  }
  executePromises(p, callback);
}


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
      console.log(res);
      if (!res.data.data.getAdjacentImage) {
        return getImage(imageId, function (imgErr, imgRes) {
          if(imgErr) return callback(imgErr, null);
          if(imgRes){
            console.log(imgRes);
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
        console.log(imgRes);
        //let ids = [... new Set([imageId, prevId, nextId])]; //remove duplicates: https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
        //let urls = [... new Set(imgRes.map(a => a.data.data.getPhoto.url))];
        let ids = {current: imageId, previous: prevId, next: nextId};
        let tmp = imgRes.map((a) => a.data.data.getPhoto.url);
        console.log(tmp);
        let urls = {current: tmp[0], next: tmp[1], previous: tmp[2]};
        return callback(null, {ids: ids, urls: urls});
      })
      .catch(function (imgErr) {
        return callback(imgErr, null);
      });
    }
  });
}

const getNewestImage = function (pinId, callback) {
  getImagePage(pinId, 'NEWEST', function (err, res) {
    if(err) return callback(err, null)
    if (res) {
      console.log(res);
      getImage(res.data.data.getImagePage._id, function (imgErr, imgRes) {
        if(imgErr)return callback(imgErr, null);
        if (imgRes) {
          console.log(imgRes);
          return callback(null, imgRes);
        }
        
      });
    }
  });
}

const getOldestImage = function(pinId, callback){
  getImagePage(pinId, 'OLDEST', function (err, res) {
    if(err) return callback(err, null)
    if (res) {
      console.log(res);
      getImage(res.data.data.getImagePage._id, function (imgErr, imgRes) {
        if(imgErr)return callback(imgErr, null);
        if (imgRes) {
          console.log(imgRes);
          return callback(null, imgRes);
        }
        
      });
    }
  });
}

const getPolygons = function (pos, callback) {
  let body= {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: ${renderRadius} }) { ...on Polygons{ polygons{ _id type owner features { type properties { name description } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest('post', baseUrl + 'polygon', body, callback);
}

const getImageFromPinId = function (pinId, callback) {
  let body = {"query": "query { getImages { ...on Images{ images{_id, title, image, pin} } ...on Error { message } }}"};
  performAxiosRequest('post', baseUrl + `pin/${pinId}/image`, body, callback);
}


const getImagesOfPins = function (pins, callback) {
  let p = [];
  for (let pin of pins){
    console.log(pins)
    let t = getAxiosPromise("post", baseUrl + `pin/${pin._id}/image`, {"query": "query { getImages { ...on Images{ images{_id, title, image, pin} } ...on Error { message } }}"});
    p.push(t);
  }

  console.log(p);
  Promise.all(p).then(function (vals) {
    console.log(vals);
    let p2 =[];
      for (let i of vals){
        let t = getAxiosPromise("post", baseUrl + `image/${i.data.data.getImages.images[0]._id}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"});
        p2.push(t);
      }
      Promise.all(p2).then(function (imgs) {
        let final = [];
        for (let img of imgs){
          console.log(img)
          final.push({img: encodeURI(img.data.data.getPhoto.url)});
        }
        callback(null, final)
      })
      .catch(function (imgErr) {
        console.error(imgErr);
      });
  })
  .catch(function (err) {
    console.error(err);
  });
  return;
}

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
  voiceSeach,
  createRating,
  updateRating,
  getRatings,
  getImagePage,
  getImageTrio,
  getOldestImage,
  getNewestImage
}