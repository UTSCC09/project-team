import React from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import Fab from "@mui/material/Fab";
import api from '../api'
import IconButton from '@mui/material/IconButton';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import Voice from './Voice'
import StopCircleIcon from '@mui/icons-material/StopCircle';
const filter = createFilterOptions();
const tags = ['Attraction', 'Government', 'Restaurant', 'Bank', 'Hotel', 'Event Venue'];
export default class addLocationForm extends React.PureComponent{

    constructor(props){
        super(props);
        this.state= {
            matches: tags,
            completeMatchInfo: [],
            recordState: null
        }
        this.updateResults = this.updateResults.bind(this);
        this.onStop = this.onStop.bind(this);
    }
    onStop(audioData){
      console.log('audioData', audioData);
    }
    updateResults(e){
        let t = this;
        console.log(e.target.value);
        if (e.target.value.length > 4) {
            api.getLocationCoord(e.target.value, true, function (err, res) {
            if (err) console.error(err);
            if (res) {
                console.log(res);
                t.setState({matches: res.data.features.map(a => a.place_name), completeMatchInfo: res.data.features});
            }
            })
        }
        else this.setState({matches: tags});
    }
    updateSearch(e, val){
        if (!val) return;
        console.log(val);

        if (!val.title && tags.indexOf(val) < 0) {
            console.log(this.state.completeMatchInfo.find((x) => x.place_name === val));
            let m = this.state.completeMatchInfo.find((x) => x.place_name === val);
            console.log(m);
            if (m) this.props.searchChange(e, m)
        }
        else if (!val.title) this.props.searchChange(e, val);

    }
    render() {
        const { recordState } = this.state
        return (
        <div id="search-container">
          
              {
                this.state.voiceSearch?
                <Voice> </Voice>
                :
                <Autocomplete
                    id="tags-outlined"
                    sx={{width: 250, backgroundColor: 'white'}}
                    options={this.state.matches}
                    onChange={ this.updateSearch.bind(this) }
                    getOptionLabel={(option) => option.inputValue ? option.title : option}
                    filterSelectedOptions
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params);
                
                        const { inputValue } = params;
                        // Suggest the creation of a new value
                        const isExisting = options.some((option) => inputValue === option.title);
                        if (inputValue !== '' && !isExisting) {
                          filtered.push({
                            inputValue,
                            title: `Search for "${inputValue}"`,
                          });
                        }
                
                        return filtered;
                      }}
                    renderInput={(params) => (
                      <TextField
                      
                        {...params}
                        placeholder="What are you looking for?"
                        onChange={this.updateResults}
                        
                      />
                    
                    )}
                  />
              }
            
              <IconButton color="primary" onClick={this.props.search}>
                <SavedSearchIcon />
              </IconButton>
              {
                this.state.voiceSearch?
                  <IconButton color="error" onClick={() => {this.setState({recordState: RecordState.STOP})}}>
                      <StopCircleIcon />
                  </IconButton>
                :
                  <IconButton color="secondary" onClick={() => {this.setState({voiceSearch: true, recordState: RecordState.START})}}>
                      <KeyboardVoiceIcon />
                  </IconButton>
              }
              
            </div>
        );
    }
}