import React from 'react';
import { Autocomplete } from '@mui/material';
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField';
import { OutlinedInput, InputAdornment, IconButton, Button } from '@mui/material';

export default class addingLocationForm extends React.PureComponent{
    
    render() {
        const categories = ['Attraction', 'Government', 'Restaurant', 'asasa', 'fghjgshjd', 'fdhjkhjkfdhjk'];
        /*autocomplete: https://mui.com/components/autocomplete/#multiple-values */
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
                <form className='user-form' id='add-location-form' onSubmit={this.props.submit} >
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