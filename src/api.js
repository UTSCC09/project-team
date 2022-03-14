
const fetch = require('node-fetch');

const registerUser = async function (username, password) {
  let query = `mutation createUser($input: UserInput) { 
    createUser(input: $input) {
      username
      password
    }
  }`;

  fetch('http://localhost:8000/user', {
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
  .then(data => console.log('data returned: ', data));
}

registerUser("Not", "World");

module.exports = {
  registerUser
}