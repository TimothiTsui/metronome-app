import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import Amplify from 'aws-amplify';

Amplify.configure({
	Auth: {
		// REQUIRED - Amazon Cognito Identity Pool ID
		identityPoolId: 'us-east-1:8aa80d16-dbed-4c5c-bd37-811ff00df62f',
		// REQUIRED - Amazon Cognito Region
		region: 'us-east-1',
		// OPTIONAL - Amazon Cognito User Pool ID
		userPoolId: 'us-east-1_sMVcwbzfj',
		// OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
		userPoolWebClientId: 'cutkv6l3b7ep3i4s3ki0iclas',
	}
});

import { init } from '../utils/metronome';
import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane';
import MeterControl from './MeterControl';
import MeterDisplay from './MeterDisplay';
import TempoDisplay from './TempoDisplay';
import TempoSlider from './TempoSlider';
import PlayPauseBtn from './PlayPauseBtn';
import VolumeControls from './VolumeControls';
import preventDoubleTapZoom from '../utils/helpers';

class App extends Component {
  static propTypes = {
    meter: PropTypes.number.isRequired,
    setMeter: PropTypes.func.isRequired,
    setTempo: PropTypes.func.isRequired,
    tempo: PropTypes.number.isRequired,
    togglePlayPause: PropTypes.func.isRequired,
    isPlaying: PropTypes.bool.isRequired
  };

  componentDidMount() {
    init();
    this.bindListeners();
  }

  componentWillUnmount() {
    this.unbindListeners();
  }

  bindListeners = () => {
    this.app.addEventListener('touchstart', preventDoubleTapZoom);
  };

  unbindListeners = () => {
    this.app.removeEventListener('touchstart', preventDoubleTapZoom);
  };

  createAppRef = _ => {
    this.app = _;
  };
  
   publishToIoTTopic = async (message) => {
    const credentials = await Auth.currentCredentials();
  
    const client = new IoTDataPlaneClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });
  
    const command = new PublishCommand({
      topic: 'user/input',
      payload: JSON.stringify(message),
    });
  
    try {
      const data = await client.send(command);
      console.log("Data published successfully", data);
    } catch (error) {
      console.log("An error occurred", error);
      const credentials = await Auth.currentCredentials();
      console.log(credentials);
    }
  };

  // Call the function when the metronome starts playing
  handlePlayPause = () => {
    this.props.togglePlayPause();
    if (!this.props.isPlaying) {
      this.publishToIoTTopic({ message: 'Metronome started playing' });
    }
  };
  

  render() {
    const { isPlaying, meter, setMeter, setTempo, tempo, togglePlayPause } = this.props;
    return (
      <div className="App" ref={this.createAppRef}>
        <div className="top-controls-panel">
          <TempoDisplay tempo={tempo} />
          <PlayPauseBtn isPlaying={this.props.isPlaying} handleClick={this.handlePlayPause} />
        </div>
        <TempoSlider handleChange={setTempo} tempo={tempo} />
        <div className="meter-panel">
          <h3 className="title">Meter</h3>
          <div>
            <MeterDisplay meter={meter} />
            <MeterControl handleChange={setMeter} meter={meter} />
          </div>
        </div>
        <VolumeControls {...this.props} />
      </div>
    );
  }
}

export default App;
