import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddLocationIcon from '@mui/icons-material/AddLocation'
import LogoutIcon from '@mui/icons-material/Logout';
import DoneIcon from '@mui/icons-material/Done';
import Chip from '@mui/material/Chip';
import { Button } from '@mui/material';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import PinDropIcon from '@mui/icons-material/PinDrop';
import MenuItem from '@mui/material/MenuItem'
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import AddLocationForm from './components/addLocationForm.js'
import UserForm from './components/UserForm.js'
import LocationInfo from './components/LocationInfo.js'
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode'

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
          locationDescription: null,
          movingMarker: false,
          detailedLocation: false,
          choosingType: false,
          markerCount: 0,
          currentMarker: null,
          currentLocationName: '',
          renderedMarkers: [],
          currentLocationTags:[],
          currentLocationDescription:'',
          newMarkers: [],
          mainTag: '',
          tags: [],
          suggestions: [
            { id: 1, name: "Attraction" },
            { id: 2, name: "Government" }
          ]
        };
        this.reactTags = React.createRef();
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
        this.handleLocationDescription = this.handleLocationDescription.bind(this);
        this.viewingLocation = this.viewingLocation.bind(this);
        this.closingLocation = this.closingLocation.bind(this);
        this.producePopup=this.producePopup.bind(this);
        this.addRegion=this.addRegion.bind(this);
        this.send = this.send.bind(this);
        this.createMarker = this.createMarker.bind(this);
        this.getMarkers = this.getMarkers.bind(this);

    }
    send(method, url, data, callback){
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
          if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
          else callback(null, JSON.parse(xhr.responseText));
      };
      xhr.open(method, url, true);
      if (!data) xhr.send();
      else{
          xhr.setRequestHeader('Content-Type', 'application/json');
          //xhr.setRequestHeader("Access-Control-Allow-Origin ","*");
          xhr.send(JSON.stringify(data));
      }
    }

    

    createMarker(marker, t){
      let lng = marker._lngLat.lng;
      let lat = marker._lngLat.lat;
      
      let body = {"query": `mutation { createPin(input: { type: \"FeatureCollection\", features: { type: \"Feature\", properties: { name: \"${t.state.locationName}\" } geometry: { type: \"Point\", coordinates: [ ${lng}, ${lat} ] } } }) { _id type features { type properties { name } geometry { type coordinates } } } }`}
      this.send('POST', "http://localhost:8000/pin/", body, function (err, res) {
        console.log(res);
        marker.id=res.data.createPin._id;
        marker.name = res.data.createPin.features.properties.name;
        marker.setPopup(new mapboxgl.Popup().setHTML(t.producePopup(res.data.createPin.features.properties.name, '', '', res.data.createPin._id)))
        marker.togglePopup = function(){
          if(marker.getPopup().isOpen()){
            marker.getPopup().remove();
          } 
          else{
            t.setState({currentMarker: marker})
            console.log(t.state.currentMarker);
            marker.getPopup().addTo(t.map);
            document.getElementById(res.data.createPin._id).onclick = function () {
              t.setState({detailedLocation: true});
              console.log(t.state.currentMarker);
            }
          }
        }
      });
    }

    getMarkers(t){

      let body = {"query": "query { listPins(input: { _id: \"placeholder\" }) { _id type features { type properties { name } geometry { type coordinates }}}}"}
      this.send('POST', "http://localhost:8000/pin/", body, function (err, markers) {
        console.log(markers);
        for (let m of markers.data.listPins){
          console.log(m);
          const marker = new mapboxgl.Marker({
            color: "#FFFFFF",
            draggable: false
          }).setLngLat(m.features.geometry.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(t.producePopup(m.features.properties.name, '', '', m._id)))
            .addTo(t.map)
          
          marker.name = m.features.properties.name;
          marker.id = m._id;
          marker.togglePopup = function(){
            if(marker.getPopup().isOpen()){
              marker.getPopup().remove();
            } 
            else{
              t.setState({currentMarker: marker})
              console.log(t.state.currentMarker);
              marker.getPopup().addTo(t.map);
              document.getElementById(m._id).onclick = function () {
                t.setState({detailedLocation: true});
                console.log(t.state.currentMarker);
              }
            }
          }
          t.setState(prevState => ({
            renderedMarkers: [...prevState.renderedMarkers, marker]
          }));
          
        }
        /*  const marker = new mapboxgl.Marker({
          color: "#FFFFFF",
          draggable: true
        }).setLngLat([this.state.lng, this.state.lat])
          .setPopup(new mapboxgl.Popup().setHTML(contents))
          .addTo(this.map)
        marker.togglePopup();
        this.setState(prevState => ({
          newMarkers: [...prevState.newMarkers, marker]
        })); */
      })
    }


    
    

  
    onAddition (tag) {
      const tags = [].concat(this.state.tags, tag)
      this.setState({ tags })
    }

    handleLocationName(event){
      this.setState({locationName: event.target.value});
    }
    handleLocationDescription(event){
      this.setState({locationDescription: event.target.value});
    }
    accountSettings() {
      this.setState({ accountForm: true })
    }
    cancelAccount () {
      this.setState( {accountForm: false} );
      this.setState({ createAccount: false });
    }
    toggleAccount () {
      this.setState((prevState) => ({
        createAccount: !prevState.createAccount
      }))
    }

    addLocation() {
      document.currentMarker && document.currentMarker.getPopup().remove()
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
      this.getMarkers(this);
      let modes = MapboxDraw.modes;
      modes.static = StaticMode;
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        // controls: {
        // polygon: true,
        // trash: true,
        // },
        modes: modes,
        // Set mapbox-gl-draw to draw by default.
        // The user does not have to click the polygon control button first.
        //defaultMode: 'draw_polygon'
        });


      this.draw = draw;
   
      map.addControl(draw);
      
      this.map = map;
    }
    signIn(event){
      event.preventDefault();
      this.setState({signedIn: true});
      this.setState({accountForm: false})
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
    handleCategoryChange(event, value){

            
      this.setState({tags: value.length ? value : []})
      this.setState({mainTag: value.length ? value[0] : []})
    }

    doneMarker(event){
      const lngTolerance = 0.002;
      const latTolerance = 0.003;

      for(let m of this.state.newMarkers){
        this.createMarker(m, this);
      }
      this.map.on('click', 'gl-draw-polygon-fill-static.cold', (e) => {
        console.log(e);
        for(let rendered of this.state.renderedMarkers){
          console.log(Math.abs(e.lngLat.lng - rendered._lngLat.lng));
          console.log(Math.abs(e.lngLat.lat - rendered._lngLat.lat));
          if (Math.abs(e.lngLat.lng - rendered._lngLat.lng) <= lngTolerance && Math.abs(e.lngLat.lat - rendered._lngLat.lat) <= latTolerance) {
            return;
          }
        }
        
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(this.producePopup(this.state.locationName, '', this.state.locationDescription))
          .addTo(this.map);
      })
      this.draw && this.draw.changeMode('static');
      
      for (let m of this.state.newMarkers){
        m.setDraggable(false);
      }
      this.setState({newMarkers: []})
      this.setState({movingMarker: false, choosingType: false, drawingRegion: false});
    }

    viewingLocation(){
      this.setState({detailedLocation: true, currentLocationDescription: document.locationDesc,
      currentLocationName: document.locationName});
    }
    closingLocation(){
      this.setState({detailedLocation: false});
    }

    deleteLocation(){
      console.log(this.state.currentMarker);
      let body = {"query": `mutation { deletePin(input: {_id: \"${this.state.currentMarker.id}\"})}`};
      let t = this;
      this.send('POST', "http://localhost:8000/pin/", body, function (err, res) {
        if (res) {
          t.setState({detailedLocation: false});
          t.state.currentMarker.remove();
          t.setState({currentMarker: null});
          
        }
      });
    }
    producePopup(name, tag, desc, id){
      if (id) return `<div class="card">
                  <div class="card-header"
                style="background-image: url(https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_north_and_south_sides.jpg/1280px-White_House_north_and_south_sides.jpg)"
                  >
                        <div class="card-header-bar">
                          <a href="#" class="btn-message"><span class="sr-only">Message</span></a>
                          <button id=${id} class="btn-menu"></button>
                        </div>
                  </div>

                  <div class="card-body">
                      <h2 class="name">${name}</h2>
                      <h4 class="main-tag">${tag}</h4>
                      <div class="location-summary">${desc}</div>
                  </div>

                  <div class="card-footer">
                      <div class="stats">
                          <div class="stat">
                            <span class="label">Rating</span>
                            <span class="value">-</span>
                          </div>
                      </div>
                  </div>
              </div>`
      return `<div class="card">
      <div class="card-header"
    style="background-image: url(https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_north_and_south_sides.jpg/1280px-White_House_north_and_south_sides.jpg)"
      >
            <div class="card-header-bar">
              <a href="#" class="btn-message"><span class="sr-only">Message</span></a>
            </div>
      </div>

      <div class="card-body">
          <h2 class="name">${name}</h2>
          <h4 class="main-tag">${tag}</h4>
          <div class="location-summary">${desc}</div>
      </div>

      <div class="card-footer">
          <div class="stats">
              <div class="stat">
                <span class="label">Rating</span>
                <span class="value">-</span>
              </div>
          </div>
      </div>
  </div>`      
    }
    addMarker(event){
      //clear the category selection
      let currTags = this.state.tags;
      this.setState({addingLocation: false, movingMarker: true, tags: []});
      
      let tag = this.state.mainTag
      let name = this.state.locationName;
      let desc = this.state.locationDescription;
      /* card design: https://frontendresource.com/css-cards/ */
      let contents = this.producePopup(name, tag, desc);
      // Set marker options.
      const marker = new mapboxgl.Marker({
        color: "#FFFFFF",
        draggable: true
      }).setLngLat([this.state.lng, this.state.lat])
        .setPopup(new mapboxgl.Popup().setHTML(contents))
        .addTo(this.map)
      marker.togglePopup();
      this.setState(prevState => ({
        newMarkers: [...prevState.newMarkers, marker]
      }));
      document.currentMarker = marker;
      let m = this.map;
      marker.togglePopup = function(){
        if(marker.getPopup().isOpen()){
          marker.getPopup().remove();
        } 
        else{
          document.currentMarker = marker;
          marker.getPopup().addTo(m);
        }
      }
      /* let more = document.createElement('button');
      //more.id='more-btn';
      more.className='btn-menu';
      //more.innerHTML='See more'
      more.onclick= function () {
        document.locationName = name;
        document.locationDesc = desc;
        document.locationTag = currTags;
        document.currentMarker = marker;
        document.querySelector('.view-btn').click();
      }
      document.querySelector('.card-header-bar').append(more); */

      this.setState(prevState => ({
        renderedMarkers: [...prevState.renderedMarkers, marker]
      }));

    }
    
    locationOptions(){
      this.setState({choosingType: true});
    }


    addRegion(e){
      //e.preventDefault();
      this.setState({addingLocation:false, drawingRegion: true});
      this.draw.changeMode('draw_polygon')
      
      return;
    }

    render() {
        const { lng, lat, zoom } = this.state;
        
        
        let locationButton;
        let locationClick;
        let locationColor;
        if(this.state.choosingType){//if (this.state.movingMarker) {
          locationButton = <DoneIcon />
          locationClick= this.doneMarker;
          locationColor='success';
        }
        else {
          locationButton=<AddLocationIcon />
          locationClick=this.locationOptions.bind(this);
          //locationClick=this.addLocation;
          locationColor='default'
        }

 
        /*FAB: https://mui.com/components/floating-action-button/ */
        /* input fields: https://mui.com/components/text-fields/ */
        return (
          <div>
            
            <div className="sidebar">
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <Button sx={{display: 'none'}} className='view-btn' onClick={ this.viewingLocation }></Button>
            
            <Box className='action' sx={{ "& > :not(style)": { m: 1 } }}>
                <Fab color="primary" aria-label="search">
                    <SearchIcon />
                </Fab>
                {
                  
                  this.state.signedIn?
                  <div id='location-btn'>
                  {
                    (this.state.addingLocation || this.state.drawingRegion || this.state.movingMarker)?
                    null
                    :
                    <Fab sx={{marginTop: '7px'}} onClick={ this.signOut } color="error" aria-label="account">
                    <LogoutIcon />
                  </Fab>
                  }
                  </div>

                  
                  :
                  <Fab onClick={ this.accountSettings } color="secondary" aria-label="account">
                    <AccountCircleIcon />
                  </Fab>
                }
                {
                  (this.state.signedIn && this.state.choosingType)?
                    <div id='types'>
                      <Fab onClick={ this.addLocation } sx={{m: 1}}>
                        <PinDropIcon/>
                      </Fab>

                      <Fab onClick={ () => {this.setState({addingLocation: 'region'})} } sx={{m: 1}}>
                            <HighlightAltIcon />
                      </Fab>
                    </div>
                  
                      :
                    null
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
            {
              (this.state.detailedLocation || this.state.addingLocation || this.state.accountForm) ?
              <div id='overlay' >

              {
                this.state.detailedLocation?
                <LocationInfo deleteLocation={this.deleteLocation.bind(this)} pos={this.state.currentMarker._lngLat} info={{name: this.state.currentMarker.name, description: "", locationTags: []}} close={this.closingLocation} owner={'John'}></LocationInfo>
                :
                null
              }
              {
                this.state.addingLocation?
                <AddLocationForm region={this.state.addingLocation == 'region'} cancel={() => {this.setState({addingLocation: false}); }} submit={this.state.addingLocation == 'region' ? this.addRegion : this.addMarker} tags={this.state.tags} categoryChange={this.handleCategoryChange.bind(this)} changeLocationDescription={this.handleLocationDescription} changeLocationName={this.handleLocationName}></AddLocationForm>
                :
                null
              }

              
              {
                this.state.accountForm?

                <UserForm cancel={this.cancelAccount} onSignin={this.signIn} createAccount={true}></UserForm>
                :
                null
              }

              
            </div>
            :
            null
            }
            
            <div ref={this.mapContainer} className="map-container" />
          </div>
        );
    }
}
