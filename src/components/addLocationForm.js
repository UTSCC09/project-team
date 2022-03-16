import React from 'react';
import { Autocomplete } from '@mui/material';
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField';
import FormData from "form-data"

import axios from 'axios' 
import { OutlinedInput, InputAdornment, IconButton, Button } from '@mui/material';

export default class addingLocationForm extends React.PureComponent{

    constructor(props){
      super(props);
      this.handleImage = this.handleImage.bind(this);
      this.sendFiles = this.sendFiles.bind(this);

    }
    send(method, url, data, callback){
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
          if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
          else callback(null, JSON.parse(xhr.responseText));
      };
      xhr.open(method, url, true);
      if (!data) xhr.send();
      else{
          xhr.setRequestHeader('Content-Type', 'application/json');
          //xhr.setRequestHeader("Access-Control-Allow-Origin ","*");
          xhr.send(JSON.stringify(data));
      }
    }
    sendFiles(method, url, data, callback){
      let formdata = new FormData();

      formdata.append("operations", {"query": "mutation($file:Upload!){createImage(input:{title:\"test\",image:$file}){_id,title,image,pin}}"});
      formdata.append("map", {"0":["variables.file"]});
      formdata.append(0, data[0])
      let xhr = new XMLHttpRequest();
      
      xhr.onload = function() {
          if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
          else callback(null, JSON.parse(xhr.responseText));
      };
      xhr.open(method, url, true);
      //xhr.setRequestHeader('Content-Type', "multipart/form-data");
      xhr.send(formdata);
      //xhr.send(data);
  }
    handleImage(e){
      console.log(e)
      if (e.target.files && e.target.files[0]) {
        let img = {}
        img.file = e.target.files[0];
        
        let data = new FormData();
        //let data = {};
        //data.append('operations', '{ "query" : "mutation($file:Upload!){createImage(input:{title: \\\"test\\\", image:$file}) {_id, title, image, pin}}"}');
        const query = 'mutation($file:Upload!){createImage(input:{title: "test", image:$file}) {_id, title, image, pin}}';
        data.append("operations", JSON.stringify({ query }));
        //data.operations = {"query":"mutation($file:Upload!){createImage(input:{title: \"test\", image:$file}) {_id, title, image, pin}}"};
        const map = {"zero":["variables.file"]}
        data.append('map', JSON.stringify(map))
        //data.map = {"0":["variables.file"]};
        data.append('zero', img);
        //data[0] = img
        console.log(data);
        axios({
          method: "post",
          url: "http://localhost:8000/pin/62310a56ca26b64f107de717/image/",
          data: data,
        })
          .then(function (res) {
            console.log(res)
          })
          .catch(function(err){
            console.error(err);
          })
        /* this.sendFiles("POST", "http://localhost:8000/pin/62310a56ca26b64f107de717/image/", data, function (err, res) {
          if(res)console.log(res);
        }) */

      }
    }
    
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
                  <input type="file" name="myImage" onChange={this.props.imageChange} />
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