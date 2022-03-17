import React from 'react';
import { OutlinedInput, InputAdornment, IconButton, Button } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'
import LogoutIcon from '@mui/icons-material/Logout';
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField';
import api from '../api';
export default class UserForm extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = {
            createAccount: this.props.createAccount,
            showPassword: false,
            errorMessage: ''
        }
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this)
        this.toggleAccount = this.toggleAccount.bind(this);
        this.handleOnSubmit = this.handleOnSubmit.bind(this);
        
        
    }
    handleClickShowPassword (){
        this.setState((prevState) => ({
            showPassword: !prevState.showPassword
        }))
    };
    handleMouseDownPassword(event){
        event.preventDefault();
    };
    toggleAccount () {
        this.setState((prevState) => ({
          createAccount: !prevState.createAccount
        }))
    }

    handleOnSubmit(event) {
      event.preventDefault();
      const username = event.target.username.value;
      const password = event.target.password.value;

      if (this.state.createAccount) {
        api.registerUser(username, password, (err, user) => {
          console.log(user);
          if (user.data.createUser.message) { 
            this.setState((prevState) => ({
              errorMessage: user.data.createUser.message
            }));
            return;
          }
          this.props.onLoginFormSubmit(user);
        });
      } else {
        api.signIn(username, password, (err, user) => {
          if (user.data.signin.message) {
            this.setState((prevState) => ({
              errorMessage: user.data.signin.message
            }));
            return;
          }
          this.props.onLoginFormSubmit(user);
        });
      }


    }

    render(){
        let usernameHelper;
        let passwordElement = <FormControl sx={{ m: 1}} variant="outlined" className='account-form-element'>
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput id="outlined-adornment-password"
            type={this.state.showPassword ? 'text' : 'password'}
            label="Password"
            id="password"
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
            submitFormBtn = <Button type='submit' className='form-button' variant="contained" sx={{
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
          formTitle =  <div className='account-form-title' id='login'></div>;
          usernameHelper = null;
          toggleForm = <Button id='create-account' variant='text' size='small' onClick={this.toggleAccount}>Don't have an account?</Button>;
        }
        return (
        <form className='user-form' onSubmit={this.handleOnSubmit} id='account-form-containter' sx={{
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

              <div id='error_message'>{this.state.errorMessage}</div>
            
              <div id='account-form-buttons'>
                <div id='submit-cancel'>
                  { submitFormBtn }
                  <Button className='form-button' variant="outlined" color="error" onClick={ this.props.cancel }sx={{
                    marginLeft: "5px",
                  }}>
                    Cancel
                  </Button>
                </div>
                { toggleForm }
              </div>
          </form>
          )
    }
}
