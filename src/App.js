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
import Input from '@mui/material/Input'
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { OutlinedInput, InputAdornment, IconButton, Button } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'


mapboxgl.accessToken = 'pk.eyJ1Ijoiam9obmd1aXJnaXMiLCJhIjoiY2wwNnMzdXBsMGR2YTNjcnUzejkxMHJ2OCJ9.l5e_mV0U2tpgICFgkHoLOg';
export default class App extends React.PureComponent {
  // setting up mapbox with React: https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
    constructor(props) {
        super(props);
        console.log(this.state);
        this.state = {
          lng: -79.3754,
          lat: 43.6506,
          zoom: 12.3,
          accountForm: false,
          createAccount: false,
          signedIn: false
        };
        this.mapContainer = React.createRef();
        this.accountSettings = this.accountSettings.bind(this);
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this)
        this.signIn = this.signIn.bind(this)
        this.cancelAccount = this.cancelAccount.bind(this)
        this.toggleAccount = this.toggleAccount.bind(this)
        this.signOut = this.signOut.bind(this);
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
    render() {
        const { lng, lat, zoom } = this.state;

        let usernameHelper;
        let passwordElement = <FormControl sx={{ m: 1}} variant="outlined" className='account-form-element'>
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput id="outlined-adornment-password"
            type={this.state.showPassword ? 'text' : 'password'}
            label="Password"
            value={this.state.password}
            required='true'
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
          submitFormBtn = <Button type='submit' className='form-button' variant="contained" sx={{
            marginRight: "5px",
          }}>
            Login
          </Button>
          formTitle = <div className='account-form-title' id='login'></div>
          usernameHelper = null;
          toggleForm = <Button id='create-account' variant='text' size='small' onClick={this.toggleAccount}>Don't have an account?</Button>;
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
                  <Fab aria-label="add">
                    <AddLocationIcon />
                </Fab>
                :
                null
                }
                
                
            </Box>
            <div id='overlay'>
              
              {
                this.state.accountForm?

                <form onSubmit={this.signIn} id='account-form-containter' sx={{
                  innerHeight: "350px",
                }}>
                  <div id='login-container'>{ formTitle }</div>
                  <FormControl sx={{ m: 1, width: 231}} variant="outlined" className='account-form-element'>
                    <TextField id='username' required='true' variant='outlined' label="Username">
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