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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import ReactStreetview from 'react-streetview';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

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

export default function RegionInfo(props) {
  /* Card: https://mui.com/components/cards/#complex-interaction*/
  const [expanded, setExpanded] = React.useState(false);
  /*Ratings: https://mui.com/components/rating/ */
  const [rating, setRating] = React.useState(0);
  const { owner, close , info, deleteRegion, user } = props;
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
        titleTypographyProps={{variant:'h3' }}
        title={info.name}
      />
      <Stack sx={{overflow: 'scroll', m: 1}} direction="row" spacing={1}>
      {
        info.locationTags.length?
        <div>
          <Typography sx={{marginLeft: '0px'}} variant="h6" color="text.secondary">
            Found here:
          </Typography> 
          {info.locationTags.map((tag) =>  <Chip sx={{m: 1}} label={tag} variant="outlined" />)}
        </div>
        :
        <Typography sx={{margin: 'auto'}} variant="body" color="text.secondary">
          Nothing here yet, try adding some pins within this region.
        </Typography> 
      }        
      
       
      </Stack>

        <QuiltedImageList images={info.images}></QuiltedImageList>

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {info.description}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        {
          (user === owner)?
          <IconButton onClick={ deleteRegion } >
            <DeleteForeverIcon />
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
  );
}
