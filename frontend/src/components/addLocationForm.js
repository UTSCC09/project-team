import React from 'react';
import { Autocomplete } from '@mui/material';
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import api from '../api'
import { Button } from '@mui/material';
const MAX_FILE_SIZE = 8; //mb
export default class addLocationForm extends React.PureComponent{

    constructor(props){
      super(props);
      this.state = {
        file: false,
        submitAttempt: false,
        matches: [],
        completeMatchInfo: []
      }
      this.fileChange = this.fileChange.bind(this);
      this.attemptSubmit = this.attemptSubmit.bind(this);
    }
    
    fileChange(e){
      let bytes = e.target.files[0].size;
      let size = bytes/1000000;
      if (size < MAX_FILE_SIZE) {
        this.setState({file: true, fileTooBig: false});
        this.props.imageChange(e);
      }
      else{
        this.setState({fileTooBig: true});
      }
      
    }
    attemptSubmit(e){
      e.preventDefault();
      this.setState({submitAttempt: true});
      if(this.state.file){
        this.props.submit(e);

      } 
    }
    updateResults(e){
      let t = this;
      if (e.target.value.length > 4) {
        api.getLocationCoord(e.target.value, true, function (err, res) {
          if (err) return this.props.onError(err);
          if (res) {
            t.setState({matches: res.data.features.map(a => a.place_name), completeMatchInfo: res.data.features});
          }
        });
        
      }
    }
    
    
    render() {
        const categories = ['Attraction', 'Government', 'Restaurant', 'Bank', 'Hotel', 'Event Venue', 'Store', 'Other'];
        /*autocomplete: https://mui.com/components/autocomplete/#multiple-values */
        /* file upload: https://stackoverflow.com/questions/40589302/how-to-enable-file-upload-on-reacts-material-ui-simple-input */
        return (
            
            <div>
              {
                this.props.region?
                <form className='user-form' id='add-location-form' onSubmit={this.props.submit} >
                  <div id='form-title-container'><div className='account-form-title' id='new-region'></div></div>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                    <TextField onChange={this.props.changeLocationName} id='location-name' required={true} variant='outlined' label="Location Name">
                    </TextField>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                  <TextField
                    onChange={this.props.changeLocationDescription}
                    id="outlined-multiline-static"
                    label="Description"
                    multiline
                    required
                    rows={4}
                  />
                  </FormControl>
                  
                  
                  <Button type='submit' className='form-button' variant="contained" sx={{
                    marginBottom: "10px",
                  }}>
                    Add
                  </Button>
                  <Button className='form-button' variant="outlined" color="error" onClick={ this.props.cancel }sx={{
                    marginLeft: "5px",
                    marginBottom: "10px"
                  }}>
                    Cancel
                  </Button>
                        
                </form>
                :
                <form sx={{marginTop: '5px'}} className='user-form' id='add-location-form' onSubmit={this.attemptSubmit} >
                  <div id='form-title-container'><div className='account-form-title' id='new-location'></div></div>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                    <TextField onChange={this.props.changeLocationName} id='location-name' required={true} variant='outlined' label="Location Name">
                    </TextField>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                  <TextField
                    onChange={this.props.changeLocationDescription}
                    id="outlined-multiline-static"
                    label="Description"
                    multiline
                    required
                    rows={4}
                  />
                  </FormControl>
                  
                  <FormControl required={true} sx={{ m: 1, width: 231}}>
                  
                  <Autocomplete
                    multiple
                    id="tags-outlined"
                    options={categories}
                    onChange={ this.props.categoryChange }
                    getOptionLabel={(option) => option}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={/*https://stackoverflow.com/questions/62645466/how-to-make-autocomplete-field-of-material-ui-required*/
                        this.props.tags.length===0 ? "Select Tags" : 'Select Tags'}
                        required={this.props.tags.length === 0}
                        placeholder="Tags"
                      />
                    )}
                  />
                  </FormControl>

                  <FormControl sx={{ m: 1, width: 231}}>
                    <Autocomplete 
                    options={this.state.matches} 
                    onChange={
                      (e, val) => {
                        this.props.updateAddress(this.state.completeMatchInfo, val)
                      }
                    }
                    renderInput={(params) => (
                      <TextField placeholder='Address (optional)' onChange={this.updateResults.bind(this)} {...params} />
                    )}
                    />

                  </FormControl>
                  <FormControl required={true} sx={{ m: 1, width: 231}} >
                  <input
                    accept=".png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={this.fileChange}
                  />
                  <label required htmlFor="raised-button-file">
                    <Button variant="outlined" component="span">
                      Upload an image
                    </Button>
                  </label> 
                  </FormControl>
                  {
                    (this.state.submitAttempt && !this.state.file)?
                    <Alert severity="error">
                      Please upload an image for this location
                    </Alert>
                    :
                    null
                    
                  }
                  {
                    this.state.fileTooBig?
                    <Alert severity="error">
                      This file is too big, only files of up to {MAX_FILE_SIZE} MB are supported.
                    </Alert>
                    :
                    null
                  }


                  
                  
                  <Button type='submit' className='form-button' variant="contained" sx={{
                    marginBottom: "10px",
                  }}>
                    Add
                  </Button>
                  <Button className='form-button' variant="outlined" color="error" onClick={ this.props.cancel }sx={{
                            marginLeft: "5px",
                            marginBottom: "10px"
                          }}>
                            Cancel
                  </Button>
                        
                </form>
              }
                
                
            </div>
        )
    }
}