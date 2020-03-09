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
const Webex = require('webex');

const { updateStatus, getUrlParams } = require('./utils');
let meetingHasVideo = false;

// There are a few different ways we'll get a meeting Object, so let's
// put meeting handling inside its own function.
function bindMeetingEvents(meeting) {
  // call is a call instance, not a promise, so to know if things break,
  // we'll need to listen for the error event. Again, this is a rather naive
  // handler.
  meeting.on('error', (err) => {
    console.error(err);
  });

  // Handle media streams changes to ready state
  meeting.on('media:ready', (media) => {
    if (!media) {
      return;
    }
    if (media.type === 'local') {
      document.getElementById('self-view').srcObject = media.stream;
      document.getElementById('microphone-state').setAttribute('data-balloon', 'on');
      document.getElementById('camera-state').setAttribute('data-balloon', 'on');
    }
    if (media.type === 'remoteVideo') {
      document.getElementById('remote-view-video').srcObject = media.stream;
    }
    if (media.type === 'remoteAudio') {
      document.getElementById('remote-view-audio').srcObject = media.stream;
    }
    if (media.type === 'remoteShare') {
      // Remote share streams become active immediately on join, even if nothing is being shared
      document.getElementById('remote-screen').srcObject = media.stream;
    }
  });

  // Handle media streams stopping
  meeting.on('media:stopped', (media) => {
    // Remove media streams
    if (media.type === 'local') {
      document.getElementById('self-view').srcObject = null;
      document.getElementById('microphone-state').setAttribute('data-balloon', 'off');
      document.getElementById('camera-state').setAttribute('data-balloon', 'off');
    }
    if (media.type === 'remoteVideo') {
      document.getElementById('remote-view-video').srcObject = null;
    }
    if (media.type === 'remoteAudio') {
      document.getElementById('remote-view-audio').srcObject = null;
    }
    if (media.type === 'remoteShare') {
      // Remote share streams become active immediately on join, even if nothing is being shared
      document.getElementById('remote-screen').srcObject = null;
    }
  });

  // Handler for content updates so we can show and hide the remote video
  // and content accordingly
  meeting.members.on('members:content:update', (payload) => {
    console.log(`who started sharing: ${payload.activeContentSharingId};`);
    console.log(`who stopped sharing: ${payload.endedContentSharingId};`);
    var theContentDiv = document.getElementById("remote-content-div");
    var theVideoDiv = document.getElementById("remote-video-div");

    if (payload.activeContentSharingId != null) {
      theContentDiv.style.display = "block";
      theVideoDiv.style.display = "none";
    }
    else {
      theContentDiv.style.display = "none";
      theVideoDiv.style.display = "block";
    }
  });

  document.getElementById('start-sending-audio').addEventListener('click', () => {
    if (meeting) {
      meeting.unmuteAudio().then(() => {
        document.getElementById('microphone-state').setAttribute('data-balloon', 'on');
      });
    }
  });

  document.getElementById('stop-sending-audio').addEventListener('click', () => {
    if (meeting) {
      meeting.muteAudio().then(() => {
        document.getElementById('microphone-state').setAttribute('data-balloon', 'off');
      });
    }
  });

  document.getElementById('start-sending-video').addEventListener('click', () => {

    if (meeting) {

      // Add video to the call only if it had not been added already by a previous
      // click on the Start Video button
      if (meetingHasVideo == false) {
        console.log("about to getMediaStreams()..");
        meeting.getMediaStreams({ sendVideo: true }, { video: true })
          .then(([localStream]) => meeting.updateVideo({
            stream: localStream,
            sendVideo: true,
            receiveVideo: true
          }))
          .then(() => {
            meetingHasVideo = true;
          });

      }

      meeting.unmuteVideo().then(() => {
        document.getElementById('camera-state').setAttribute('data-balloon', 'on');
        document.getElementById('stop-sending-video').disabled = false;
      });
    }
  });

  document.getElementById('stop-sending-video').addEventListener('click', () => {
    if (meeting) {
      meeting.muteVideo().then(() => {
        document.getElementById('camera-state').setAttribute('data-balloon', 'off');

      });
    }
  });

  // Of course, we'd also like to be able to end the call:
  document.getElementById('hangup').addEventListener('click', () => {
    if (meeting) {
      meeting.leave().then(() => {
        document.getElementById('microphone-state').setAttribute('data-balloon', 'off');
        document.getElementById('camera-state').setAttribute('data-balloon', 'off');
        document.getElementById('hangup').disabled = true;
        document.getElementById('call').disabled = false;

        document.getElementById('stop-sending-video').disabled = true;
        document.getElementById('start-sending-audio').disabled = true;
        document.getElementById('stop-sending-audio').disabled = true;
        document.getElementById('start-sending-video').disabled = true;

        updateStatus('Disconnected.');

      });
    }
  });
}

// Join the meeting and add media
function joinMeeting(meeting) {
  return meeting.join().then(() => {
    document.getElementById('call').disabled = true;
    document.getElementById('hangup').disabled = false;
    document.getElementById('stop-sending-video').disabled = false;
    document.getElementById('start-sending-audio').disabled = false;
    document.getElementById('stop-sending-audio').disabled = false;
    document.getElementById('start-sending-video').disabled = false;
    updateStatus('Connected to Expert');
    const mediaSettings = {
      receiveVideo: true,
      receiveAudio: true,
      receiveShare: true,
      sendVideo: false, // Start call with no video
      sendAudio: true,
      sendShare: false,
    };


    return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
      const [localStream, localShare] = mediaStreams;

      meeting.addMedia({
        localShare,
        localStream,
        mediaSettings,
      });
    });



  });
}

// We are not yet using destination in connectToMeeting, it is just a placeholder
// the destination is passed as a URL parameter
function connectToMeeting(jwt, destination) {
  updateStatus('Connecting to Webex');

  const webex = Webex.init();
  webex.once(`ready`, () => {
    webex.authorization.requestAccessTokenFromJwt({ jwt }).then(() => {
      updateStatus('Webex connected...');


      webex.meetings.register().then(() => {
        //  Disable the button to connect call until all is propertly initialized  
        //document.getElementById('call').disabled = true;
        console.log("about to register the call button... ");

        document.getElementById('call').addEventListener('click', () => {
          const params = getUrlParams(window.location.href);
          console.log("trying to call: ", params.destination);
          // Create the meeting
          console.log("creating a meeting with destination", params.destination)
          return webex.meetings.create(params.destination).then((meeting) => {
            // Pass the meeting to our join meeting helper
            updateStatus('Calling.');
            joinMeeting(meeting);
            return bindMeetingEvents(meeting);
          });

        });

        updateStatus('Webex connected, waiting for expert...');
        document.getElementById('call').disabled = false;
      });

    });
  });
}

module.exports = { bindMeetingEvents, connectToMeeting, joinMeeting };
