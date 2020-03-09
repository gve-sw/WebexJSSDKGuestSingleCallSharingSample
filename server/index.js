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
require('dotenv').config();

const express = require('express');
const { createUser } = require('./jwt');
const { loginWebexGuest } = require('./login');
const APP_ROOT = require('app-root-path');

const app = express();
const port = process.env.PORT || 3000;
const displayName = process.env.GUEST_DISPLAY_NAME || 'SDK Workshop Guest';

app.use(express.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(APP_ROOT.path + '/dist/client'));

app.get('/hello', (req, res) => res.send('Hello World!'));

/**
 * This endpoint does the following things:
 * Creates a Guest User with the submitted data
 * Creates a Webex Space
 * Adds Guest User and "expert" to space
 * Sends details as a space message
 */
app.post('/guest', async (req, res) => {
  // The response should allow the user to open an sdk instance to listen to meetings on the create space.
  try {

    const guestJWT = await createUser({ displayName });
    const guestUser = await loginWebexGuest(guestJWT);

    const response = {
      guestJWT,
      guestUser,
    };

    res.json(response);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!!`));
