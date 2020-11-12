# NOTE

As of November 2020, there is now a version of this sample code that uses Flask for the back end instead of node.js so there is no need to use parcel. The use of the Cisco UI Kit has also been optimized. Further enhancements will be performed on that repository:  
https://github.com/gve-sw/GVE_Devnet_Webex_Meeting_Custom_Guest_Join_Call

# Webex JS SDK Guest Single Call with sharing sample

Welcome to the Webex JS SDK Guest Single Call with sharing sample

In this sample, you will be able to see an example of a front-end and back-end solution that utilizes the Webex Javascript SDK to place a call to a destination URI specified as a URL parameter. It utilizes Guest tokens. 

This sample is focused on connecting a customer to an expert, so the call is initially set up without sending any video to allow caller to decide when to start doing so.


### Step 0: Setup

- Open and login to the Webex Teams desktop or web client <https://teams.webex.com>.
- Clone this git repository with:

```bash
git clone https://www.github.com/gve-sw/WebexJSSDKGuestSingleCallSharingSample.git
```

- Change into the repository directory:

```bash
cd WebexJSSDKGuestSingleCallSharingSample
```

- Open our project with VS Code:

```bash
code .
```

- Install package dependencies:

```bash
npm install
```

- Start the server:

```bash
npm start
```
 
### Step 1: Creating a JWT to configure the guest shared secret

For this sample, the end user will be a Webex Teams Guest User.
This user is a dynamically created user that does not require an existing Webex Teams account to utilize Webex Teams services.
To be able to create these Guest Users, you will need to create a "Guest Issuer" account on the Webex for Developers portal.

- Login to the Webex for Developers site at <https://developer.webex.com>

  - Once logged in, click on "My Webex Teams Apps" under your profile at the top
  - Click "Create a New App" button
  - Click "Create a Guest Issuer"
  - Choose a name, example: "Webex Teams SDK Workshop"
  - Note: Free users cannot create guest issuers (request a demo account from your instructor)

Let's update the project "secrets" file.
This file contains secrets to your application and should not be saved in the repo.
(Our `.gitignore` file makes it so that this file will not be saved to our git project.)

- In the project files, copy the `.env.default` file and save it as `.env`

  - Copy the values from the Guest Issuer screen in the developer portal and save them in the `.env` file.
  - Your `.env` file should now have values for `GUEST_ISSUER_ID` and `GUEST_SHARED_SECRET`. You can also set the `GUEST_DISPLAY_NAME`to whatever you want the guest caller to be identified at at the other end of a call. If you wish to change the guest token expiration from the default 90 minutes to something else, set `GUEST_TOKEN_EXPIRATION` to the proper value (in seconds)
  - To update your application with these changes, we need to restart.
    - Press "control-c" to kill the server
    - Run `npm start` to restart


### Step 2: Running the code

  - Open a web browser to our web server at <http://localhost:3000/index.html?destination=foo@acme.com> (replace foo@acme.com with the URI of the destination of the call, could be a user or the URI of a Webex meeting)
  - Once the green Call button is enabled, click on it to place a call to the destination specified in the URL parameter. 
  - In a few seconds, you should see the call in the browser!
  - The call will appear video muted initially. You can click on the green camera icon to start sending video. 
  - You can mute your audio or video at any time using the corresponding icons.
  - The gray webex, mic and camera icons on the right contain the status of the call and the webex connection, you can mouse over them to reveal the status

