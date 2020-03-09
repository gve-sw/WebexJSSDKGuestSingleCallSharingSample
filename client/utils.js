/*
Copyright (c) 2020 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*/

function updateStatus(status) {
  document.getElementById('status').setAttribute('data-balloon', status);
}

function getUrlParams(urlString) {
  const params = {};
  var url = new URL(urlString);
  // We only need a destination parameter, but we handle it as if multiple 
  // in case of any future additions
  ['destination'].forEach((key) => {
    params[key] = url.searchParams.get(key);
  });
  return params;
}

function postData(url = '', data = {}) {
  return fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then((response) => {
    return response.json();
  });
}

//Function just to login the guest, no need to create the space
function createGuest(params) {
  const postUrl = './guest';
  updateStatus('Creating Guest');

  return postData(postUrl, params)
    .then((postResponse) => {
      console.log(postResponse);
      updateStatus('Guest Created');
      return postResponse;
    })
    .catch((e) => {
      console.error(e);
      updateStatus('Error: Unable to create guest');
    });
}

module.exports = { createGuest, postData, getUrlParams, updateStatus };
