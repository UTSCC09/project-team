
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:8000/'

const registerUser = async function (username, password) {
  let query = `mutation createUser($input: UserInput) { 
    createUser(input: $input) {
      username
      password
    }
  }`;

  return fetch(baseUrl + 'user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          username : username,
          password : password
        }
      }
    })
  })
  .then(r => r.json())
}

const signin = async function (username, password) {
  let query = `query signin($input: UserInput) {
    signin(input: $input) {
      username
      password
    }
  }`;

  return fetch(baseUrl + 'user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept' : 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          username: username,
          password: password
        }
      }
    })
  })
  .then(r => r.json())
}


module.exports = {
  registerUser,
  signin
}