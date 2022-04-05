import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
export default class Gallery extends React.PureComponent{
    constructor(props){
        super(props);
        this.state= {
            current: true,
            previous: null,
            next: true
        }
        //this.updateCurrent = this.updateCurrent.bind(this);
        this.nextImage = this.nextImage.bind(this);
        this.prevImage = this.prevImage.bind(this);

    }
    nextImage(){

    }

    prevImage(){
        this.setState({current: this.state.previous, previous: this.state.previous.previous, next: this.state.current})
    }

    render(){
        return(
            <div id='gallery'>
                {
                    this.state.previous?
                    <IconButton onClick={this.prevImage}>
                        <NavigateBeforeIcon />
                    </IconButton>
                    :
                    null
                }
                <Box>
                    <img id='current-image' src={"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Toronto_-_ON_-_Royal_York_Hotel.jpg/2560px-Toronto_-_ON_-_Royal_York_Hotel.jpg"}/>
                </Box>
                {
                    this.state.next?
                    <IconButton onClick={this.nextImage}>
                        <NavigateNextIcon />
                    </IconButton>
                    :
                    null
                }
            </div>
        )
    }
}