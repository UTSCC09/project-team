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
  const { onError, unrender, owner, close , deleteLocation, user, images, marker } = props;
  const [order, setOrder] = React.useState(images);
  const [displayImages, setDisplayImages] = React.useState(null);
  const [imageIds, setImageIds] = React.useState(null);
  React.useEffect(() => {
    api.getRatings(marker.id, function (err, res) {
      if(err) return onError(err)
      if (res) {
        let original = res.data.getRatings.ratings.find((x) => x.createdBy === user);
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
        if (res.data.errors) {
          setAddImage(false);
          if (res.data.errors[0].message === "Cannot read properties of null (reading '_id')") {
            unrender(marker);
            return onError('Sorry, this location no longer exists');
          }
          return onError(res.data.errors[0].message);
        }
        
        api.getImageTrio(marker.id, res.data.data.createImage._id, function (imgErr, imgRes) {
          if(imgErr) return onError(imgErr);
          if (imgRes) {
            let ids = [imgRes.ids.current, imgRes.ids.next, imgRes.ids.previous];
            if ([...new Set(ids)].length === 2) {
              setImageIds([imgRes.ids.current, imgRes.ids.next]);
              setDisplayImages([imgRes.urls.current, imgRes.urls.next]);
            }
            else{
              setImageIds(ids);
              setDisplayImages([imgRes.urls.current, imgRes.urls.next, imgRes.urls.previous]);
            }
            setOrder({_id: imgRes.ids.current});
          }
        });
        
        setAddImage(false);
        setFile(null);
      }
    })
  }

  const updateRatings = (e, val) => {
    setRating(val);
    api.getRatings(marker.id, function (getErr, getRes) {
      if (getErr) return onError(getErr);
      if (getRes) {
        let original = getRes.data.getRatings.ratings.find((x) => x.createdBy === user);
        if (original) {
          api.updateRating(val, marker.id, function (upErr, upRes) {
            if(upErr) return onError(upErr);
          });
        }
        else {
          api.createRating(val, marker.id, function (err, res) {
            if (err) return onError(err);
          });
        }
        
      }
    });
    
    
  }
  const toggleView = (e) => {
    if(!streetView)return;
    let imgId = order._id ? order._id : marker.imageId;
    api.getImageTrio(marker.id, imgId, function (err, res) {
      if(err)return onError(err);
      if (res) {
        let dup = [...new Set([res.ids.current, res.ids.previous, res.ids.next])].length;
        if (dup === 1) {
          setImageIds([res.ids.current]);
          setDisplayImages([res.urls.current]);

        }
        else if (dup === 2) {

          setImageIds([res.ids.current, res.ids.next]);
          setDisplayImages([res.urls.current, res.urls.next]);
        }
        else{
          setImageIds([res.ids.current, res.ids.next, res.ids.previous]);
          setDisplayImages([res.urls.current, res.urls.next, res.urls.previous]);
        }
        setOrder({_id: res.ids.current});
        
        setStreetView(!streetView);
      }
      
    });
  }
  const move = (curr) => {
    let id = imageIds[curr]
    let index = imageIds.indexOf(id)
    api.getImageTrio(marker.id, id, function (err, res) {
      if(err)return onError(err);
      if (res) {
        if (Object.keys(res.ids).length >= 3) {
          if (index === 1) {
            setImageIds([res.ids.previous, id, res.ids.next]);
            setDisplayImages([res.urls.previous, displayImages[curr], res.urls.next]);
          }
          else if (index === 2) {
            setImageIds([res.ids.next, res.ids.previous, id]);
            setDisplayImages([res.urls.next, res.urls.previous,  displayImages[curr]]);
          }
          else{
            setImageIds([id, res.ids.next, res.ids.previous]);
            setDisplayImages([displayImages[curr], res.urls.next, res.urls.previous ]);
          }
        }
        else{
          if (index === 0) {
            setImageIds(id, res.ids[1]);
            setDisplayImages(displayImages[curr], res.urls[1])
          }
          else if (index === 1) {
            //1 is prev/next
            setImageIds([res.ids[1], id]);
            setDisplayImages([res.urls[1], displayImages[curr]]);
          }
        }
      }
      
    });
  }


  
  const fileChange = (e) => {
    let bytes = e.target.files[0].size;
    let size = bytes/1000000;
    if (size<MAX_FILE_SIZE) {
      setFileTooBig(false);
      setFile(e.target.files[0]);
    }
    else{
      setFileTooBig(true);
    }
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
            <FormControlLabel control={<Switch onChange={(e) => {
                if (streetView)toggleView(e);
                else setStreetView(true);
              }} checked={streetView} />} label="Street View" />
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
              <MuiImageSlider onArrowClick={ (curr) => {
                if(imageIds.length >= 3)  move(curr);
              }} images={displayImages} />
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
            (user && !streetView)?
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
