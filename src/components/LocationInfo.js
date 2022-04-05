import * as React from 'react';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Streetview from 'react-google-streetview';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import MuiImageSlider from 'mui-image-slider';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import api from '../api'
import FormControl from '@mui/material/FormControl'
import CloseIcon from '@mui/icons-material/Close';
const MAX_FILE_SIZE = 8; //mb
/* https://mui.com/components/cards/#complex-interaction*/


export default function LocationInfo(props) {
  /* Card: https://mui.com/components/cards/#complex-interaction*/
  const [addingImage, setAddImage] = React.useState(false);
  /*Ratings: https://mui.com/components/rating/ */
  const [rating, setRating] = React.useState(0);
  const [streetView, setStreetView] = React.useState(true);
  const [file, setFile] = React.useState(null);
  const [fileTooBig, setFileTooBig] = React.useState(false);
  const { onError, unrender, owner, close , deleteLocation, user, images, updateImages, marker } = props;
  const [order, setOrder] = React.useState(images);
  const [displayImages, setDisplayImages] = React.useState([marker.currentImage]);
  React.useEffect(() => {
    api.getRatings(marker.id, function (err, res) {
      if(err) return onError(err)
      if (res) {
        console.log(res);
        console.log(res.data.getRatings.ratings);
        let original = res.data.getRatings.ratings.find((x) => x.createdBy === user);
        console.log(original);
        if (original) {
          setRating(original.stars);
        }
      }
    })
  }, [marker.id, onError, user]);

  const addImage = (e) => {
    e.preventDefault();
    
    let img = {}
    img.file = file;
    
    let copy = marker;
    copy.image = file;
    api.uploadImage(copy, function (err, res) {
      if (err) return onError(err);
      if (res) {
        console.log(res);
        if (res.data.errors) {
          setAddImage(false);
          if (res.data.errors[0].message === "Cannot read properties of null (reading '_id')") {
            unrender(marker);
            return onError('Sorry, this location no longer exists');
          }
          return onError(res.data.errors[0].message);
        }
        
        api.getImage(res.data.data.createImage._id, function (err2, res2) {
          if(err2) return onError(err2);
          if (res2){
            console.log(res2);
            let copy = [...displayImages];
            copy.unshift(res2.data.data.getPhoto.url);
            setDisplayImages(copy);
            updateImages(res2.data.data.getPhoto.url);
            
          }
        })
        setAddImage(false);
        setFile(null);
      }
    })
  }

  const updateRatings = (e, val) => {
    console.log(user);
    setRating(val);
    api.getRatings(marker.id, function (getErr, getRes) {
      if (getErr) return onError(getErr);
      if (getRes) {
        let original = getRes.data.getRatings.ratings.find((x) => x.createdBy === user);
        console.log(original);
        if (original) {
          api.updateRating(val, marker.id, function (upErr, upRes) {
            if(upErr) return onError(upErr);
            if (upRes) {
              
              console.log(upRes);
            }
          })
        }
        else {
          api.createRating(val, marker.id, function (err, res) {
            if (err) return onError(err);
            if (res) {
              console.log(res);
            }
          });
        }
        
      }
    });
    
    
  }
  const toggleView = (e) => {
    
    //will display latest image first

    //if no next => only image
    /* if (!order.newer) {
      console.log('this is the latest image');
      api.getImageTrio(order, function (err, res) {
        if(err)return onError(err);
        if (res) {
          console.log(res);
          let urls = res.map(a => a.data.data.getPhoto.url);
          setDisplayImages(urls);
          setStreetView(!streetView)
        }
      });
    }
    else{
      //next exists, so need to set 
    } */

    api.getImageTrio(order, function (err, res) {
      if(err)return onError(err);
      if (res) {
        console.log(res);
        let urls = res.map(a => a.data.data.getPhoto.url);
        setDisplayImages(urls);
        setStreetView(!streetView)
      }
    });
    console.log(order);
    console.log(displayImages);
    
    return;
    //only one image
    if (!order.older && !order.newer) return;
    if(order.newer){
      /* api.getImage(order.newer._id, function(newErr, newRes){
        if(newErr) return onError(newErr);
        if(newRes){
          console.log(newRes);
          let copy = [...displayImages];
          copy.push(newRes.data.data.getPhoto.url);
          if (!order.older) {
            //get newest image
            api.getImagePage(marker.id, 'NEWEST', function(newestErr, newestRes){
              if(newestErr) return onError(newestErr);
              if (newestRes) {
                console.log(newestRes);
                api.getImage(newestRes.data.data.getPhoto)
              }
            });
          }
            
          setDisplayImages(copy);

          setStreetView(!streetView);
        }
      }); */
    }
    else if (order.older) {
      api.getImage(order.older._id, function (oldErr, oldRes) {
        if(oldErr) return onError(oldErr);
        if (oldRes) {
          console.log(oldRes);
          setStreetView(!streetView);
        }
      })
    }
    
    //api.getImage(marker.)
  }
  const fileChange = (e) => {
    console.log(e);
    let bytes = e.target.files[0].size;
    console.log(bytes);
    let size = bytes/1000000;
    console.log(size);
    if (size<MAX_FILE_SIZE) {
      setFileTooBig(false);
      setFile(e.target.files[0]);
    }
    else{
      setFileTooBig(true);
    }
    
    
    //this.props.imageChange(e);
  }
  /*streetview https://github.com/alexus37/react-google-streetview */
  const signInPrompt = user ? '' : "\n(You'll need to sign in first.)";
  return (
    <div>
    {
      addingImage?
      <form id='new-image-form' className='user-form' onSubmit={addImage}>
          <div className='account-form-title' id='add-image'></div>
        
        <FormControl required={true} sx={{ m: 1, width: 231}} >
          <input
            accept=".png,.jpg,.jpeg"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={fileChange}
          />
          <label required htmlFor="raised-button-file">
            <Button variant="outlined" component="span">
              Upload an image
            </Button>
          </label> 
        </FormControl>
        {
          fileTooBig?
          <Alert severity="error">
            This file is too big, only files of up to {MAX_FILE_SIZE} MB are supported.
          </Alert>
          :
          null
        }
        <Button disabled={file==null} type='submit' className='form-button' variant="contained" sx={{
          marginBottom: "10px",
        }}>
          Add
        </Button>
        <Button className='form-button' variant="outlined" color="error" onClick={ () => {setAddImage(false); setFile(null); } }sx={{
                  marginLeft: "5px",
                  marginBottom: "10px"
                }}>
                  Cancel
        </Button>
      </form>
    :
      <Card id='location-info' sx={{ maxWidth: 500, overflow: 'scroll', margin: 'auto' }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} >
              {owner[0]}
            </Avatar>
          }
          action={
              <IconButton onClick={close}>
                  <CloseIcon />
              </IconButton>
          }
          title={marker.name}
        />
        <Typography sx={{marginLeft: '5px', width: '10px'}} variant="h6" color="text.secondary">
          Tags:
        </Typography> 
        <Stack direction="row" sx={{overflow: 'scroll', marginTop:'7px', marginBottom:'2px'}} spacing={1}>
          {marker.tags.map((tag) =>  <Chip key={tag} label={tag} variant="outlined" />)}
        
        </Stack>

        <FormGroup sx={{marginLeft: '5%'}} >
            <FormControlLabel control={<Switch onChange={toggleView} checked={streetView} />} label="Street View" />
        </FormGroup>
        
        

        {
          streetView?
          <div id='street'>
            
            <Streetview streetViewPanoramaOptions={{position: marker._lngLat,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,}} apiKey={'AIzaSyDkrJcHAWMRsbbL9i5rzvysM3wyoEl6zQc'}>
            </Streetview>
          </div>
          :
          <div id='images'>
              <MuiImageSlider images={displayImages} />
          </div>
        }
        
        
        
        <CardContent>
          <Typography paragraph variant="body2" color="text.secondary">
            {marker.description}
          </Typography>
        </CardContent>
        <Typography component="legend">Rate this location</Typography>
        <Typography component='legend' color='text.secondary'> {signInPrompt} </Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={updateRatings}
          readOnly={!user}
        />
        <CardActions disableSpacing>
          {
            (user && user === owner)?
              <IconButton onClick={ deleteLocation } >
                <DeleteForeverIcon />
              </IconButton>
            :
            null
          }
          {
            user?
            <IconButton onClick={(e) => {setAddImage(true)}} >
              <AddPhotoAlternateIcon />
            </IconButton>
            :
            null

          }
          
        </CardActions>
      </Card>

    }
    </div>
  );
}
