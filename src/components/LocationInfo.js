import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CardContent from '@mui/material/CardContent';
import Streetview from 'react-google-streetview';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import MuiImageSlider from 'mui-image-slider';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import api from '../api'
import FormControl from '@mui/material/FormControl'
import CloseIcon from '@mui/icons-material/Close';
/* https://mui.com/components/cards/#complex-interaction*/
const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function LocationInfo(props) {
  /* Card: https://mui.com/components/cards/#complex-interaction*/
  const [expanded, setExpanded] = React.useState(false);
  const [addingImage, setAddImage] = React.useState(false);
  /*Ratings: https://mui.com/components/rating/ */
  const [rating, setRating] = React.useState(0);
  const [streetView, setStreetView] = React.useState(true);
  const [fileUploaded, setFileUpload] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const { owner, close , info, pos, deleteLocation, user, images, updateImages } = props;
  const [displayImages, setDisplayImages] = React.useState(images);
  console.log(info)
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const addImage = (e) => {
    e.preventDefault();
    
    let img = {}
    img.file = file;
    
    let data = new FormData();
    const query = `mutation($file:Upload!){createImage(input:{title: "${info.name}", image:$file}) { ...on Image{ _id, title, image, pin } ...on Error{ message } }}`;
    data.append("operations", JSON.stringify({ query }));
    const map = {"zero":["variables.file"]}
    data.append('map', JSON.stringify(map))
    data.append('zero', file);
    api.uploadImage(info.id, data, function (err, res) {
      if (err) return console.error(err);
      if (res) {
        console.log(res);
        api.getImage(res.data.data.createImage._id, function (err2, res2) {
          if(err2) return console.error(err2);
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

  const fileChange = (e) => {
    setFileUpload(true);
    setFile(e.target.files[0]);
    console.log(e);
    //this.props.imageChange(e);
  }
  /*streetview https://github.com/alexus37/react-google-streetview */
  
  return (
    <div>
    {
      addingImage?
      <form id='new-image-form' className='user-form' onSubmit={addImage}>
          <div className='account-form-title' id='add-image'></div>
        
        <FormControl required={true} sx={{ m: 1, width: 231}} >
          <input
            accept="image/*"
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
          title={info.name}
          subheader={<div></div>}
        />
        <Stack direction="row" sx={{overflow: 'scroll', marginTop:'7px', marginBottom:'2px'}} spacing={1}>
          {info.locationTags.map((tag) =>  <Chip sx={{margin: 'auto'}} label={tag} variant="outlined" />)}
        
        </Stack>

        <FormGroup>
          <FormControlLabel control={<Switch onChange={(e) => {setStreetView(!streetView)}} checked={streetView} />} label="Street View" />
        </FormGroup>


        {
          streetView?
          <div id='street'>
            <Streetview streetViewPanoramaOptions={{position: pos,
            pov: { heading: 0, pitch: 0 },
            zoom: 1,}} apiKey={'AIzaSyDkrJcHAWMRsbbL9i5rzvysM3wyoEl6zQc'}></Streetview>
          </div>
          :
          <div id='images'>
              <MuiImageSlider images={displayImages} />
          </div>
        }
        
        

        <CardContent>
          <Typography paragraph variant="body2" color="text.secondary">
            {info.description}
          </Typography>
        </CardContent>
        <Typography component="legend">Rate this location</Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
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

          
          <IconButton >
            <AddCommentIcon />
          </IconButton>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>Method:</Typography>
            <Typography paragraph>
              review1
            </Typography>
            <Typography paragraph>
              review2
            </Typography>
            <Typography paragraph>
              review3
            </Typography>
            <Typography>
              review5
            </Typography>
          </CardContent>
        </Collapse>
      </Card>

    }
    </div>
  );
}
