import React, { Component } from 'react'
 
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
export default class Voice extends React.PureComponent {

    constructor(props) {
        super(props)
     
        this.state = {
          recordState: null
        }
      }
     
      start = () => {
        this.setState({
          recordState: RecordState.START
        })
      }
     
      stop = () => {
        this.setState({
          recordState: RecordState.STOP
        })
      }
     
      //audioData contains blob and blobUrl
      onStop = (audioData) => {
        console.log('audioData', audioData)
      }
     
      render() {
        const { recordState } = this.state
     
        return (
          <div>
            <AudioReactRecorder backgroundColor={'white'} canvasWidth={300} canvasHeight={50} state={recordState} onStop={this.onStop} />
     
            <button onClick={this.start}>Start</button>
            <button onClick={this.stop}>Stop</button>
          </div>
        )
      }
}