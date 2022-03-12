import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Streetview from 'react-google-streetview';

import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import ReactStreetview from 'react-streetview';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import QuiltedImageList from './QuiltedImageList.js';
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
  /*Ratings: https://mui.com/components/rating/ */
  const [rating, setRating] = React.useState(0);
  const { owner, close , info, pos, deleteLocation } = props;
  console.log(info)
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  return (
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
      <Stack direction="row" spacing={1}>
        {info.locationTags.map((tag) =>  <Chip label={tag} variant="outlined" />)}
       
      </Stack>



      <div id='street'>
        <Streetview streetViewPanoramaOptions={{position: pos,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,}} apiKey={'AIzaSyDkrJcHAWMRsbbL9i5rzvysM3wyoEl6zQc'}></Streetview>
      </div>

      <CardContent>
        <Typography variant="body2" color="text.secondary">
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
        <IconButton onClick={ deleteLocation } >
          <DeleteForeverIcon />
        </IconButton>
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
  );
}
