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

const baseUrl = 'http://localhost:8000/'

const registerUser = function (username, password, callback) {
  let query = `mutation createUser($input: UserInput) { 
    createUser(input: $input) {
      username
      password
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
      username
      password
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
  signIn
}