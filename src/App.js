import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import LogoutIcon from '@mui/icons-material/Logout';
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText'
import DoneIcon from '@mui/icons-material/Done';
import Input from '@mui/material/Input'
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { OutlinedInput, InputAdornment, IconButton, Button } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Tags from './tags.js'
import InputTags from './tags.js'

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9obmd1aXJnaXMiLCJhIjoiY2wwNnMzdXBsMGR2YTNjcnUzejkxMHJ2OCJ9.l5e_mV0U2tpgICFgkHoLOg';

export default class App extends React.PureComponent {
  // setting up mapbox with React: https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
    constructor(props) {
        super(props);
        this.state = {
          lng: -79.3754,
          lat: 43.6506,
          zoom: 12.3,
          accountForm: false,
          createAccount: false,
          signedIn: false,
          addingLocation: false,
          locationName: null,
          movingMarker: false
        };
        this.mapContainer = React.createRef();
        this.accountSettings = this.accountSettings.bind(this);
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this)
        this.signIn = this.signIn.bind(this)
        this.cancelAccount = this.cancelAccount.bind(this)
        this.toggleAccount = this.toggleAccount.bind(this)
        this.signOut = this.signOut.bind(this);
        this.addMarker = this.addMarker.bind(this);
        this.addLocation = this.addLocation.bind(this);
        this.handleLocationName = this.handleLocationName.bind(this);
        this.doneMarker = this.doneMarker.bind(this);
    }

    handleLocationName(event){
      this.setState({locationName: event.target.value});
    }

    

    accountSettings() {
      this.setState({ accountForm: true })
      document.querySelector('#overlay').style.display='block' //add an overlay

    }
    cancelAccount () {
      this.setState( {accountForm: false} );
      this.setState({ createAccount: false });
      document.querySelector('#overlay').style.display='none'
    }
    toggleAccount () {
      this.setState((prevState) => ({
        createAccount: !prevState.createAccount
      }))
    }

    addLocation() {
      document.querySelector('#overlay').style.display = 'block';
      this.setState({ addingLocation: true });
    }

    componentDidMount() {
        const { lng, lat, zoom } = this.state;
        const map = new mapboxgl.Map({
          container: this.mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [lng, lat],
          zoom: zoom
        });
        map.on('move', () => {
            this.setState({
              lng: map.getCenter().lng.toFixed(4),
              lat: map.getCenter().lat.toFixed(4),
              zoom: map.getZoom().toFixed(2)
            });
        });
        this.map = map;
    }
    signIn(event){
      event.preventDefault();
      this.setState({signedIn: true});
      this.setState({accountForm: false})
      document.querySelector('#overlay').style.display='none'
    };
    signOut(event) {
      this.setState({signedIn: false});
      
    }
    handleClickShowPassword (){
      this.setState((prevState) => ({
        showPassword: !prevState.showPassword
      }))
    };
    handleMouseDownPassword(event){
      event.preventDefault();
    };

    doneMarker(event){
      console.log(document.currentMarker);
      document.currentMarker.setDraggable(false);
      this.setState({movingMarker: false});
    }

    addMarker(event){
      this.setState({addingLocation: false, movingMarker: true})
      document.querySelector('#overlay').style.display='none'
      let tn = "<img class='popup-image' src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Toronto_-_ON_-_Toronto_Harbourfront7.jpg/800px-Toronto_-_ON_-_Toronto_Harbourfront7.jpg'></img>"
     
      let contents = "<div>" + this.state.locationName + "</div>";
      //event.preventDefault();
      // Set marker options.
      const marker = new mapboxgl.Marker({
        color: "#FFFFFF",
        draggable: true
      }).setLngLat([this.state.lng, this.state.lat])
        .setPopup(new mapboxgl.Popup().setHTML(contents))
        .addTo(this.map)
      marker.togglePopup();
      document.currentMarker = marker;
    }

    render() {
        const { lng, lat, zoom } = this.state;
        let usernameHelper;
        let passwordElement = <FormControl sx={{ m: 1}} variant="outlined" className='account-form-element'>
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput id="outlined-adornment-password"
            type={this.state.showPassword ? 'text' : 'password'}
            label="Password"
            value={this.state.password}
            required={true}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={ this.handleClickShowPassword }
                  onMouseDown={ this.handleMouseDownPassword }
                  edge="end"
                >
                  {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          {
            this.state.createAccount?
            <FormHelperText id="password-helper">8-16 characters</FormHelperText>
            :
            null
          }
        </FormControl>
        let toggleForm;
        let formTitle;
        let submitFormBtn;
        let confirmPasswordElement
        if (this.state.createAccount) {   
            submitFormBtn = <Button className='form-button' variant="contained" sx={{
              marginRight: "5px",
            }}>
              Sign up
            </Button>
            formTitle = <div className='account-form-title' id='signup'></div>                   
            usernameHelper = <FormHelperText id="username-helper">Create your username</FormHelperText>;
            confirmPasswordElement= <FormControl sx={{ m: 1}} variant="outlined" className='account-form-element'>
             <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
             <OutlinedInput id="outlined-adornment-password"
               type={this.state.showPassword ? 'text' : 'password'}
               label="ConfirmPassword"
               value={this.state.password}
               endAdornment={
                 <InputAdornment position="end">
                   <IconButton
                     aria-label="toggle password visibility"
                     onClick={ this.handleClickShowPassword }
                     onMouseDown={ this.handleMouseDownPassword }
                     edge="end"
                   >
                     {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                   </IconButton>
                 </InputAdornment>
               }
             />
             <FormHelperText id="confirm-password-helper">Re-enter your password</FormHelperText>
           </FormControl> 
           
           
           toggleForm = <Button id='create-account' variant='text' size='small' onClick={this.toggleAccount}>Already have an account? Sign in.</Button>;


        }
        else{
          submitFormBtn = this.state.addingLocation ?  <Button type='submit' className='form-button' variant="contained" sx={{
            marginBottom: "10px",
          }}>
            Add
          </Button>
          :
          <Button type='submit' className='form-button' variant="contained" sx={{
            marginRight: "5px",
          }}>
            Login
          </Button>
          formTitle = this.state.addingLocation?  <div className='account-form-title' id='new-location'></div> : <div className='account-form-title' id='login'></div>;
          usernameHelper = null;
          toggleForm = <Button id='create-account' variant='text' size='small' onClick={this.toggleAccount}>Don't have an account?</Button>;
        }
        let locationButton;
        let locationClick;
        let locationColor;
        if (this.state.movingMarker) {
          locationButton = <DoneIcon />
          locationClick= this.doneMarker;
          locationColor='success';
        }
        else {
          locationButton=<AddLocationIcon />
          locationClick=this.addLocation;
          locationColor='default'
        }
 
        /*FAB: https://mui.com/components/floating-action-button/ */
        /* input fields: https://mui.com/components/text-fields/ */
        return (
          <div>
            
            <div className="sidebar">
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            
            <Box sx={{ "& > :not(style)": { m: 1 } }}>
                <Fab color="primary" aria-label="search">
                    <SearchIcon />
                </Fab>
                {
                  this.state.signedIn?
                  <Fab onClick={ this.signOut } color="error" aria-label="account">
                    <LogoutIcon />
                  </Fab>
                  
                  :
                  <Fab onClick={ this.accountSettings } color="secondary" aria-label="account">
                    <AccountCircleIcon />
                  </Fab>
                }
                {
                  this.state.signedIn?
                  <Fab color={locationColor} onClick={ locationClick } aria-label="add">
                    { locationButton }
                    
                </Fab>
                :
                null
                }
                
                
            </Box>
            <div id='overlay'>
              {
                this.state.addingLocation?
                <form className='user-form' id='add-location-form' onSubmit={this.addMarker} sx={{ innerHeight: "400px"}}>
                  <div id='form-title-container'>{ formTitle }</div>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                    <TextField onChange={this.handleLocationName} id='location-name' required={true} variant='outlined' label="LocationName">
                    </TextField>
                  </FormControl>
                { submitFormBtn }
                
                </form>
                :
                null
              }
              
              {
                this.state.accountForm?

                <form className='user-form' onSubmit={this.signIn} id='account-form-containter' sx={{
                  innerHeight: "350px",
                }}>
                  <div id='form-title-container'>{ formTitle }</div>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                    <TextField id='username' required={true} variant='outlined' label="Username">
                    </TextField>
                    { usernameHelper }
                  </FormControl>
 
                    
                    { passwordElement }
                  
                    {
                      this.state.createAccount?
                      confirmPasswordElement
                      :
                      null
                    }
                  
                    <div id='account-form-buttons'>
                      <div id='submit-cancel'>
                        { submitFormBtn }
                        <Button className='form-button' variant="outlined" color="error" onClick={ this.cancelAccount }sx={{
                          marginLeft: "5px",
                        }}>
                          Cancel
                        </Button>
                      </div>
                      { toggleForm }
                    </div>
                </form>
                :
                <div></div>
              }
            </div>
            
            <div ref={this.mapContainer} className="map-container" />
          </div>
        );
    }
}