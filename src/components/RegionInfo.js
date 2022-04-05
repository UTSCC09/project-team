import * as React from 'react';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import QuiltedImageList from './QuiltedImageList.js';
import CloseIcon from '@mui/icons-material/Close';
/* https://mui.com/components/cards/#complex-interaction*/


export default function RegionInfo(props) {
  /* Card: https://mui.com/components/cards/#complex-interaction*/
  /*Ratings: https://mui.com/components/rating/ */
  const { owner, close , info, deleteRegion, user } = props;
  console.log(info)
  
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
          {info.locationTags.map((tag) =>  <Chip sx={{m: 1}} key={tag} label={tag} variant="outlined" />)}
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
        
      </CardActions>
    </Card>
  );
}
