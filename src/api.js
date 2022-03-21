const { default: axios } = require("axios");
const { promise } = require("bcrypt/promises");
//const { base } = require("../api/db/models/pin-model");

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

const deletePin = function(pinId, callback){
  let body = {"query": `mutation { deletePin}`};
  performAxiosRequest("post", baseUrl + 'pin/' + pinId, body, callback);
}

const deletePolygon = function (polyId, callback) {
  let body = {"query": `mutation { deletePolygon}`};
  performAxiosRequest("post", baseUrl + `polygon/${polyId}`, body, callback);
}

const searchTags = function (pos, tags, callback) {
  let body = {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: 20000 tags: ${JSON.stringify(tags)}}) { ...on Pins{ pins{ _id type features { type properties { name description tags } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest("post", baseUrl + 'pin/', body, callback);
}

const createPin = function (marker, callback) {
  console.log(marker);
  let body = {"query": `mutation { createPin(input: { type: \"FeatureCollection\", features: { type: \"Feature\", properties: { name: \"${marker.name}\" description:\"${marker.description}\" tags:${JSON.stringify(marker.tags)}  } geometry: { type: \"Point\", coordinates: [ ${marker._lngLat.lng}, ${marker._lngLat.lat} ] } } }) { ...on Pin{ _id type features { type properties { name description } geometry { type coordinates } } } ...on Error{ message } }}`}
  performAxiosRequest("post", baseUrl + 'pin', body, callback);
}

const getPinsWithinPolygon = function (regionId, callback) {
  //let body = {"query": `query { getPinsWithin(input: {_id: \"${regionId}\"}) { _id type features { type properties { name } geometry { type coordinates }}}}`};
  let body = {"query": "query { getPinsWithin  { ...on Pins { pins { _id type features { type properties { name } geometry { type coordinates } } } } ...on Error{message} }}"}
  performAxiosRequest("post", baseUrl + `polygon/${regionId}`, body, callback)
}

const uploadImage = function (pinId, img, callback) {
  performAxiosRequest("post", baseUrl + `pin/${pinId}/image/`, img, callback);
}

const getImage = function (imgId, callback) {
  console.log(imgId);
  performAxiosRequest("post", baseUrl + `image/${imgId}`, {"query":"query { getPhoto { ...on Photo{ url } ...on Error{ message } }}"}, callback);
}

const getPins = function (pos, callback) {
  let body = {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: 2000 tags: []}) { ...on Pins{ pins{ _id type features { type properties { name description tags } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest("post", baseUrl + 'pin', body, callback);
}

const getPolygons = function (pos, callback) {
  let body= {"query": `query { getNear(input: {lat: ${pos.lat} lon: ${pos.lng} radius: 2000 }) { ...on Polygons{ polygons{ _id type features { type properties { name description } geometry { type coordinates } } } } ...on Error{ message }}}`};
  performAxiosRequest('post', baseUrl + 'polygon', body, callback);
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
      /* executePromises(p2, function (imgErr, imgs) {
        let final = [];
        for (let img of imgs){
          console.log(img)
          final.push({img: encodeURI(img.data.data.getPhoto.url)});
        }
        callback(null, final)
      }) */
  })
  .catch(function (err) {
    console.error(err);
  })


  return;

  executePromises(p, function (err, vals) {
    console.log('a')
    console.log(vals)
    if(vals){
      let p2 =[];
      for (let i of vals){
        let t = getAxiosPromise("post", baseUrl + `image/${i.data.data.getImages[0]._id}`, {"query":"query { getPhoto { url }}"});
        p2.push(t);
      }
      executePromises(p2, function (imgErr, imgs) {
        let final = [];
        for (let img of imgs){
          console.log(img)
          final.push({img: encodeURI(img.data.data.getPhoto.url)});
        }
        callback(null, final)
      })
    }
    
  })

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
  deletePolygon
}