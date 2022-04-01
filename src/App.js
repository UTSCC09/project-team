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
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import PinDropIcon from '@mui/icons-material/PinDrop';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import AddLocationForm from './components/AddLocationForm.js'
import UserForm from './components/UserForm.js'
import LocationInfo from './components/LocationInfo.js'
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode'
import RegionInfo from './components/RegionInfo.js'
import SearchBar from './components/SearchBar';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import sanitize from "sanitize-filename"
import DirectionsOffIcon from '@mui/icons-material/DirectionsOff';
import api from './api';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { Typography } from '@mui/material';
const DIRECTION_TIMEOUT = 6000;
//import Directions from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9obmd1aXJnaXMiLCJhIjoiY2wwNnMzdXBsMGR2YTNjcnUzejkxMHJ2OCJ9.l5e_mV0U2tpgICFgkHoLOg';

export default class App extends React.PureComponent {
  // setting up mapbox with React: https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
    constructor(props) {
        super(props);
        this.state = {
          lng: -79.3754,
          lat: 43.6506,
          zoom: 12.3,
          initialZoom: 12.3,
          accountForm: false,
          createAccount: false,
          signedIn: false,
          addingLocation: false,
          locationName: null,
          locationDescription: null,
          movingMarker: false,
          detailedLocation: false,
          choosingType: false,
          currentMarker: null,
          image: null,
          currentLocationName: '',
          renderedMarkers: [],
          renderedRegions: [],
          currentLocationTags:[],
          newRegions: [],
          searchTags:[],
          currentLocationDescription:'',
          newMarkers: [],
          highlightedMarkers: [],
          addressSearchMarkers: null,
          mainTag: '',
          tags: [],
          flyTo: [],
          checked: 0
        };
        this.timeoutDirections = this.timeoutDirections.bind(this);
        this.mapContainer = React.createRef();
        this.accountSettings = this.accountSettings.bind(this);
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this)
        this.onLoginFormSubmit = this.onLoginFormSubmit.bind(this);
        this.cancelAccount = this.cancelAccount.bind(this)
        this.toggleAccount = this.toggleAccount.bind(this)
        this.signOut = this.signOut.bind(this);
        this.addMarker = this.addMarker.bind(this);
        this.addLocation = this.addLocation.bind(this);
        this.handleLocationName = this.handleLocationName.bind(this);
        this.doneMarker = this.doneMarker.bind(this);
        this.handleLocationDescription = this.handleLocationDescription.bind(this);
        this.closingLocation = this.closingLocation.bind(this);
        this.producePopup=this.producePopup.bind(this);
        this.addRegion=this.addRegion.bind(this);
        this.createMarker = this.createMarker.bind(this);
        this.getMarkers = this.getMarkers.bind(this);
        this.getRegions = this.getRegions.bind(this);
        this.setImage = this.setImage.bind(this)
        this.uploadImage = this.uploadImage.bind(this);
        this.createRegion = this.createRegion.bind(this);
        this.getImage = this.getImage.bind(this);
        this.deleteRegion = this.deleteRegion.bind(this);
        this.getPinsWithinRegion = this.getPinsWithinRegion.bind(this);
        this.searchForTags = this.searchForTags.bind(this);
        this.removeHighlighted = this.removeHighlighted.bind(this);
        this.error = this.error.bind(this);
        this.displayCustomSearchResults = this.displayCustomSearchResults.bind(this);
        this.voiceSearch = this.voiceSearch.bind(this);
        this.unrenderRegion = this.unrenderRegion.bind(this);
        this.unrenderMarker = this.unrenderMarker.bind(this);
        this.flyToCoord = this.flyToCoord.bind(this);
        this.updateMapStyle = this.updateMapStyle.bind(this);
    }

    unrenderRegion(regionId){
      let copy = [...this.state.renderedRegions];
      let index = this.state.renderedRegions.indexOf(this.state.renderedRegions);
      if (index !== -1){
        copy.splice(index, 1);
        this.setState({renderedRegions: copy});
      }
      this.setState({detailedRegion: false});
      this.state.draw.delete(regionId);
      if (this.state.currentPopup) this.state.currentPopup.remove();
    }
    getPinsWithinRegion(){
      
      console.log(this.state.currentRegion.backId);
      let t = this;
      
  
      api.getPinsWithinPolygon(this.state.currentRegion.backId, function (err, res) {
        if (err) return t.error(err);
        if (res){
          console.log(res);
          console.log(res.data.data.getPinsWithin);
          console.log('test');
          if (res.data.errors && res.data.errors[0].message === "Cannot read properties of null (reading 'features')") {
            console.log('deleted');
            t.unrenderRegion(t.state.currentRegion.id);
            return t.error('The region you were viewing has been deleted by its owner');
          }
          console.log(res);
          let regionTags = [];
          if (!res.data.data.getPinsWithin.pins.length) {
            return t.setState({enclosedTags: [], enclosedImages: [], detailedRegion: true});
          }

          api.getImagesOfPins(res.data.data.getPinsWithin.pins, function (imgErr, imgRes) {
            if(imgErr) return t.error(imgErr);
            if (imgRes) {

              t.setState({detailedRegion: true, enclosedPins: res.data.data.getPinsWithin.pins, enclosedImages: imgRes});
            }
          });
          
          for(let p of res.data.data.getPinsWithin.pins){
            regionTags = regionTags.concat(p.features.properties.tags);
            //remove duplicates
            regionTags = [...new Set(regionTags)];
          }
          t.setState({enclosedTags: regionTags});
          console.log(regionTags);

        }
      });
    }

    noMatchesFound = () =>{
      this.setState({noMatches: true});
      setTimeout(() => {
        this.setState({noMatches: false});
      }, 5000);
    }


    uploadImage(marker, res, t){
        api.uploadImage(marker, function(upErr, res){
          if (upErr) return t.error(upErr);
            
          if (res)
            {
              console.log(res)
              marker.imageId = res.data.data.createImage._id;
              console.log(marker);
              marker.togglePopup = function () {
                api.getImage(marker.imageId, function (imgErr, imgRes) {
                  if(imgErr) return t.error(imgErr);
                  if (imgRes) {
                    console.log(imgRes)
                    let url = imgRes.data.data.getPhoto.url;
                    t.setState({displayImgs: [url]});
                    marker.getPopup().setHTML(t.producePopup(marker.name, marker.tags[0], marker.description, marker.id, url))
                    marker.getPopup().addTo(t.state.map);
                    document.getElementById(marker.id).onclick = function () {
                      t.setState({detailedLocation: true, currentMarker: marker, currentMarkerImages: [url]});
                      
                      console.log(t.state.currentMarker);
                    }
                    document.getElementById(marker.id + '_directions').onclick = function () {
                      t.setState({loading: true});
                      console.log('getting directions');
                      let options = {timeout: DIRECTION_TIMEOUT};
                      let error = (err) => {
                        t.setState({viewingDirections: false}, t.timeoutDirections)
                        return t.error(err);
                      };
                      navigator.geolocation.getCurrentPosition(function (res) {
                        console.log(marker);
                        console.log(res);
                        document.querySelector('.mapbox-directions-profile').style.display='block';
                        
                        t.directions.setOrigin([res.coords.longitude, res.coords.latitude]);
                        t.directions.setDestination([marker._lngLat.lng, marker._lngLat.lat]);
                        console.log(t.directions);
                        t.setState({viewingDirections: true, loading: false});
          
                      }, error, options);
                    }
                  }
                })

                
              }
          }
            
          })
    }

    createMarker(marker, t){
      api.createPin(marker, function (err, res) {
        if (err) return t.error(err);
        if (res) {
          console.log(res);
          marker.id=res.data.data.createPin._id;
          marker.owner = res.data.data.createPin.owner;
          marker.name = res.data.data.createPin.features.properties.name;
          marker.description = res.data.data.createPin.features.properties.description;
          marker.tags = res.data.data.createPin.features.properties.tags;
          marker.setPopup(new mapboxgl.Popup().setHTML(t.producePopup(res.data.data.createPin.features.properties.name, marker.tags[0], marker.description, res.data.data.createPin._id)))
          
          t.uploadImage(marker, res, t);
        }
      });
    }
    createRegion(region, t){
      //let coord = JSON.stringify(region.geometry.coordinates[0])
      //let body = {"query": `mutation { createPolygon(input: { type: \"FeatureCollection\", features: { type: \"Feature\", properties: { name: \"${region.name}\" description: \"${region.description}\" } geometry: { type: "Polygon", coordinates: [ ${coord} ] } } }) { ...on Polygon{ _id type features { type properties { name } geometry { type coordinates }} } ...on Error{ message } }}`}
      api.createPolygon(region, function (err, res) {
        if(err) return t.error(err);
        if (res) {
          console.log(res);
          region.backId = res.data.data.createPolygon._id;
          t.setState(prevState => ({
            renderedRegions: [...prevState.renderedRegions, region]
          }));
        }
      })
    }

    error(err){
      console.error(err);
      this.setState({genericError: err});
      setTimeout(() => {
        this.setState({genericError: null})
      }, 4000);
    }

    getRegions(t, removeOld=false){

      api.getPolygons({lat: t.state.lat, lng: t.state.lng}, function (err, res) {
        if (err) t.error(err);
        if (res) {
          console.log(res);
          if (removeOld) {
            // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
            let diff = t.state.renderedRegions.filter(x => !res.data.data.getNear.polygons.includes(x));
            for (let x of diff){
              console.log(x);
              t.state.draw.delete(x.id)
              let copy = [...t.state.renderedRegions];
              copy.splice(copy.indexOf(x));
              t.setState({renderedRegions: copy});
              

            }
          }
          t.state.draw.changeMode('static');
          let polygons = res.data.data.getNear.polygons;
          console.log(polygons);
          for (let p of polygons){
            let f = t.state.renderedRegions.find(x => x.backId === p._id)
            if (f) continue;
            let newRegion = p.features.geometry;
            
            let v = t.state.draw.add(newRegion);
            newRegion.id = v[0];
            newRegion.name = p.features.properties.name;
            newRegion.owner = p.owner;
            newRegion.backId = p._id;
            newRegion.description = p.features.properties.description;
            t.setState(prevState => ({
              renderedRegions: [...prevState.renderedRegions, newRegion]
            }));
            console.log(v);
          }
        }
      });

    }
    timeoutDirections(){
      this.directions.actions.clearDestination();
      this.directions.removeRoutes();
      this.setState({directionsTimedOut: true});
      setTimeout(() => {
        this.setState({directionsTimedOut: false});
      }, 4000);
    }

    getImage(marker, m, imgId, t){
      console.log(this.state.currentMarkerImages)
      api.getImagesFromIds(this.state.currentMarkerImages, function (err, res) {
        if (err) return t.error(err);
        if (res) {
          console.log(res);
          let url = res[0].data.data.getPhoto.url;
          console.log(marker.rating)
          marker.getPopup().setHTML(t.producePopup(marker.name, marker.tags[0], marker.description, marker.id, url, marker.rating))
          marker.getPopup().addTo(t.state.map);
          document.getElementById(marker.id).onclick = function () {
            console.log(t.state.currentMarker);
            t.setState({detailedLocation: true});
            
          }
          document.getElementById(marker.id + '_directions').onclick = function () {
            t.setState({loading: true});
            console.log('getting directions');
            let options = {timeout: DIRECTION_TIMEOUT};
            let error = (err) => {
              t.error(err);
              t.setState({loading: false}, t.timeoutDirections);
            };
            navigator.geolocation.getCurrentPosition(function (res) {
              console.log(marker);
              console.log(res);
              document.querySelector('.mapbox-directions-profile').style.display='block';
              t.directions.setOrigin([res.coords.longitude, res.coords.latitude]);
              t.directions.setDestination([marker._lngLat.lng, marker._lngLat.lat]);
              
              
              console.log(t.directions);
              t.setState({viewingDirections: true, loading: false});

            }, error, options);
          }
          t.setState({displayImgs: res.map((x) => x.data.data.getPhoto.url)});
          
        }
      });
    }

    getMarkers(t, removeOld=false, search=false){

      api.getPins({lat: t.state.lat, lng:t.state.lng}, function (err, markers) {
        if (err) return t.error(err);
        if (markers) {
          console.log(markers);
          console.log(t.state.renderedMarkers);
          if (removeOld) {
            // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
            /* let diff = t.state.renderedMarkers.filter(x => !markers.data.data.getNear.pins.includes(x));
            for (let x of diff){
              
              if (x._draggable || x._color === "#FF0000") continue;
              x.remove();
              let copy = [...t.state.renderedMarkers];
              copy.splice(copy.indexOf(x));
              t.setState({renderedMarkers: copy});
              console.log(x);
            } */
            for (let x of t.state.renderedMarkers){
              if (!markers.data.data.getNear.pins.find((y) => y._id === x.id)){
                //need to remove x
                if (x._draggable || x._color === "#FF0000") continue;
                x.remove();
                let copy = [...t.state.renderedMarkers];
                copy.splice(copy.indexOf(x), 1);
                t.setState({renderedMarkers: copy});
                console.log(x);
              }
            } 
          }

          
          for (let m of markers.data.data.getNear.pins){

            //if(m in t.state.renderedMarkers) continue;
            console.log(t.state.renderedMarkers);
            console.log(m);
            console.log(t.state.renderedMarkers.find((x) => x.id === m._id))
            if (t.state.renderedMarkers.find((x) => x.id === m._id)) {
              console.log(m);
              continue;
            }
            
            const marker = new mapboxgl.Marker({
              color: "#FFFFFF",
              draggable: false
            }).setLngLat(m.features.geometry.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(""))
              .addTo(t.state.map)
            
            marker.name = m.features.properties.name;
            marker.description = m.features.properties.description;
            marker.id = m._id;
            marker.owner = m.owner;
            marker.tags = m.features.properties.tags;
            api.getRatings(marker.id, function (ratingErr, ratingsRes) {
              if(ratingErr){
                return t.error(ratingErr);
              }
              if(ratingsRes){
                console.log(ratingsRes);
                marker.rating = ratingsRes.data.getRatings.average? Math.round(ratingsRes.data.getRatings.average *10) / 10 : '-';
              }
            });
            marker.togglePopup = function(){
              t.setState({currentMarker: marker})

              if(marker.getPopup().isOpen()){
                marker.getPopup().remove();
              } 
              else{
                t.setState({currentMarker: marker})
                console.log(t.state.currentMarker);
                /* api.getImagesOfPins([marker], function (imgErr, res) {
                  if (imgErr) return console.error(imgErr);
                  if (res) {
                    console.log(res);
                    let imgId = res.data.data.getImages[0]._id;
                    t.getImage(marker, m, imgId, t)
                  }
                }) */
                api.getImageFromPinId(marker.id, function (err, res) {
                  if(err)return t.error(err);
                  
                  if (res) {
                    if (res.data.errors) {
                      if (res.data.errors[0].message === "Cannot read properties of null (reading '_id')") {
                        t.unrenderMarker(marker);
                        return t.error("The location you were trying to view has been deleted by its owner");
                      }
                      return t.error(res.data.errors[0].message);
                    }
                    console.log(res);
                    t.setState({currentMarkerImages: res.data.data.getImages.images});
                    let imgId = res.data.data.getImages.images[0]._id;
                    t.getImage(marker, m, imgId, t)
                  }
                });
              }
            }
            t.setState(prevState => ({
              renderedMarkers: [...prevState.renderedMarkers, marker]
            }));
            
          }
        }
      });
      
    }

    removeRendered(removeHighlighted=false){
      console.log(removeHighlighted);
      let keep = []
      for (let r of this.state.renderedMarkers){
        console.log(r);
        if(!r._draggable){
          console.log(r._color);
          if (r._color !== "#FF0000") {
            r.remove();
          }
          else if (removeHighlighted) r.remove();
          else keep.push(r)
          
        }
        else if (r._color === "#FF0000"){
          if (this.state.searching) {
            keep.push(r);
          }
          else r.remove();
        } 
      }
      //if (!removeHighlighted) {
        this.state.draw.deleteAll();
        this.setState({renderedRegions: []})
      //}
      
      this.setState({renderedMarkers: keep});
      
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
      console.log(this.state.currentMarker);
      this.state.currentMarker && this.state.currentMarker.getPopup().remove()
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
      let t = this;
      map.on('zoomstart', function () {
        t.setState({initialZoom: map.getZoom()});
      })
      map.on('zoomend', function () {
        console.log(map.getZoom());
        if (map.getZoom() >= 13.5 && t.state.initialZoom < 13.5) {
          //if (!t.state.displaySearchResults) {
            t.getMarkers(t);
          //}
          
          t.getRegions(t)
          console.log(!t.state.renderedMarkers);
        }

        if (map.getZoom() < 13.5 && t.state.initialZoom >= 13.5) {
          t.removeRendered(!t.state.searching);
          t.state.currentPopup && t.state.currentPopup.remove();
        }
        
      });





      map.on('dragend', function () {
        t.setState({noMatches: null});
        if (map.getZoom() >= 13.5) {
          t.getMarkers(t, true);
          t.getRegions(t, true);
        }
        if (t.state.displayTagSearchResults && t.state.searching && !t.state.audioTags) {
          console.log('here');
          t.searchForTags();
        }
        else if(t.state.searching && t.state.displayingCustomSearchResults){
          console.log('custom');
          t.performSearch(null, false);
        }
        else if(t.state.audioTags) t.performSearch(null, true);
      })
      const lngTolerance = 0.0006;
      const latTolerance = 0.001;
      map.on('click', (e) => {this.setState({searching: false, searchTags: [], customSearchTags: null, displayingCustomSearchResults: false, audioTags: null, noMatches: null})})
      map.on('click', 'gl-draw-polygon-fill-static.cold', (e) => {
        
        let clickedPolygon = this.state.renderedRegions.find(x => x.id === e.features[0].properties.id);
        console.log(clickedPolygon);
        this.setState({currentRegion: clickedPolygon});
        console.log(clickedPolygon);
        for(let rendered of t.state.renderedMarkers){
          console.log(Math.abs(e.lngLat.lng - rendered._lngLat.lng));
          console.log(Math.abs(e.lngLat.lat - rendered._lngLat.lat));
          if (Math.abs(e.lngLat.lng - rendered._lngLat.lng) <= lngTolerance && Math.abs(e.lngLat.lat - rendered._lngLat.lat) <= latTolerance) {
           //if(e.lngLat.lat === rendered._lngLat.lat && e.lngLat.lng === rendered._lngLat.lng){ 
            return;
          }
        }
        
        let n = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(this.producePopup(clickedPolygon.name, '', clickedPolygon.description, clickedPolygon.id))
          .addTo(this.state.map);
        document.getElementById(clickedPolygon.id).onclick = function (e) {
          console.log(clickedPolygon.id);
          //t.setState({detailedRegion: true, currentRegion: clickedPolygon});
          t.setState({currentRegion: clickedPolygon});
          t.getPinsWithinRegion();
        }
        this.setState({currentPopup: n});
        //document.querySelector("")
      });
      
      //this.getMarkers(this);
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
      /* const drawHot = new MapboxDraw({
        displayControlsDefault: false,
        modes: modes
      });
      map.on('drawHot.create', function (e) {
        console.log('hot');
      });
      map.addControl(drawHot); */
      map.on('draw.create', function (e) {
        console.log(e.features);
        e.features[0].name = t.state.locationName;
        e.features[0].description = t.state.locationDescription;
        e.features[0].owner = t.state.user;
        t.setState(prevState => ({
          newRegions: [...prevState.newRegions, e.features[0]]
        }));
        t.setState({drawingRegion: false});
        console.log(t.state.newRegions);
      });
      map.on('draw.modechange', function (e) {
        t.setState({drawingRegion: false});
      });
      map.on('draw.update', function(e) {
        console.log(e.features);
        console.log(t.state.newRegions.find((x) => x.id === e.features[0].id));
        let old = t.state.newRegions.find((x) => x.id === e.features[0].id);
        let idx = t.state.newRegions.indexOf(old);
        if (idx > -1){
          let copy = [...t.state.newRegions]
          //copy.splice(idx, 1);
          
          let newRegion = e.features[0];
          newRegion.name = old.name;
          newRegion.description = old.description;
          newRegion.owner = old.owner;
          copy[idx] = newRegion;
          t.setState({newRegions: copy});
          /* t.setState(prevState => ({
            newRegions: [...prevState.newRegions, newRegion]
          })); */
        }
      })
      this.state.draw = draw;
   
      map.addControl(draw);
      let directions = new MapboxDirections({
        accessToken: 'pk.eyJ1Ijoiam9obmd1aXJnaXMiLCJhIjoiY2wwNnMzdXBsMGR2YTNjcnUzejkxMHJ2OCJ9.l5e_mV0U2tpgICFgkHoLOg',
        unit: 'metric',
        profile: 'mapbox/driving',
        style: 'mapbox://styles/mapbox/streets-v11',
        interactive: false,
        controls: {profileSwitcher: true}
        
      });     
      directions.onClick = function () {
        //prevent click to add waypoints
        return;
      }
      this.directions = directions;
      map.addControl(directions);
      
      map.on('load', () => {
        map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
        });
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
         
        // add a sky layer that will show when the map is highly pitched
        map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
        }
        });
        });
      this.state.map = map;
      
    }

    onLoginFormSubmit(user){
      console.log(user);
      this.setState({signedIn: true, accountForm: false, user: user.username});
    };

    signOut(event) {
      for(let r of this.state.newRegions){
        this.state.draw.delete(r.id);
      }
      this.setState({signedIn: false, user: null});
      
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
      
      console.log(value);
      this.setState({tags: value.length ? value : []});
      console.log(this.state.tags);
      this.setState({mainTag: value.length ? value[0] : []})
    }

    doneMarker(event){
      const lngTolerance = 0.002;
      const latTolerance = 0.003;

      for(let m of this.state.newMarkers){
        this.createMarker(m, this);
        this.setState(prevState => ({
          renderedMarkers: [...prevState.renderedMarkers, m]
        }));
      }
      for (let r of this.state.newRegions){
        console.log(r)
        this.createRegion(r, this)
        
        console.log(this.state.renderedRegions);
      }
      
      this.state.draw && this.state.draw.changeMode('static');
      if (this.state.zoom > 13.5) {
        this.getRegions(this);
      }
      
      for (let m of this.state.newMarkers){
        m.setDraggable(false);
      }
      this.setState({newMarkers: [], newRegions: []})
      this.setState({movingMarker: false, choosingType: false, drawingRegion: false});
    }

    closingLocation(){
      this.setState({detailedLocation: false, detailedRegion: false});
    }

    deleteRegion(){
      let t = this;
      console.log(this.state.currentRegion.backId);
      api.deletePolygon(this.state.currentRegion.backId, function (err, res) {
        if (err) return t.error(err);
        if (res) {
          t.setState({detailedRegion: false});
          console.log(res)
          t.unrenderRegion(t.state.currentRegion.id)
        }
      });
      return;
      
    }


    unrenderMarker(marker){
      let copy = [...this.state.renderedMarkers];
      let index = this.state.renderedMarkers.indexOf(marker);
      console.log(index);
      if (index !== -1){
        copy.splice(index, 1);
        this.setState({renderedMarkers: copy, detailedLocation: false});
        marker.remove();
      }
    }

    deleteLocation(){
      let t = this;
      api.deletePin(this.state.currentMarker.id, function (err, res) {
        if(err) return t.error(err);
        if(res){
          t.unrenderMarker(t.state.currentMarker);
          t.setState({detailedLocation: false});
          //t.state.currentMarker.remove();
          t.setState({currentMarker: null});
        }

      });
      
    }
    producePopup(name, tag, desc, id, url, ratings='-'){
      console.log(url);
      console.log(ratings);
      //let newurl = "http://localhost:8000/images/Screen Shot 2021-07-12 at 9.56.11 AM.png"
      if (id && url) return `<div id="marker-card" class="card">
                  <div class="card-header"
                style="background-image: url(${encodeURI(url)})"
                  >
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
                            <span class="value">${ratings}</span>
                          </div>
                      </div>
                      <button id=${id + '_directions'} class="directions"></button>
                      <button id=${id} class="btn-menu"></button>
                  </div>
              </div>`
      if (url) return `<div id="marker-card" class="card">
            <div class="card-header"
          style="background-image: url(${url})"
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
                      <span class="value">${ratings}</span>
                    </div>
                </div>
            </div>
        </div>`
        return `<div id="region-card" class="card">
                  <div class="card-body">
                      <h2 class="name">${name}</h2>
                      <div class="location-summary">${desc}</div>
                  </div>
                  <div class="card-footer">
                      <button id=${id} class="btn-menu"></button>
                  </div>
              </div>` 
    }
    flyToCoord(coord) {
      this.state.map.flyTo({
        center: coord,
        zoom: 13.6
      });
    }
    addMarker(event){
      //clear the category selection
      let currTags = this.state.tags;
      let coord = this.state.newCoord;
      this.setState({addingLocation: false, movingMarker: true, tags: [], newCoord: null});
      
      
      let tag = this.state.mainTag
      let name = this.state.locationName;
      let desc = this.state.locationDescription;
      /* card design: https://frontendresource.com/css-cards/ */
      let url = URL.createObjectURL(this.state.image);
      console.log(url);
      let contents = this.producePopup(name, tag, desc, null, url);
      // Set marker options.
      const marker = new mapboxgl.Marker({
        color: "#FFFFFF",
        draggable: true
      }).setLngLat(coord ? coord : [this.state.lng, this.state.lat])
        .setPopup(new mapboxgl.Popup().setHTML(contents))
        .addTo(this.state.map)
      if (coord) this.flyToCoord(coord);
      marker.togglePopup();
      marker.image = this.state.image;
      marker.name = this.state.locationName;
      marker.tags = currTags;
      marker.owner = this.state.user;
      marker.description = this.state.locationDescription;
      console.log(marker.image);
      this.setState(prevState => ({
        newMarkers: [...prevState.newMarkers, marker]
      }));
      this.state.currentMarker = marker;
      let m = this.state.map;
      let t = this;
      marker.togglePopup = function(){
        if(marker.getPopup().isOpen()){
          marker.getPopup().remove();
        } 
        else{
          t.state.currentMarker = marker;
          marker.getPopup().addTo(m);
        }
      }
      

      this.setState(prevState => ({
        renderedMarkers: [...prevState.renderedMarkers, marker]
      }));

    }
    
    locationOptions(){
      this.setState({choosingType: true});
    }

    displayCustomSearchResults(pins){
      this.setState({displayingCustomSearchResults: true});
      console.log(pins)
      if(!pins)return this.noMatchesFound();
      let t = this;
      
      for (let pin of pins){
        let marker = new mapboxgl.Marker({
          color: "#FF0000",
          draggable: false
        }).setLngLat(pin.features.geometry.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(""));
        console.log(pin);
        
        let old = t.state.renderedMarkers.find((x) => x.id === pin._id);
        console.log(old);
        if (old) {
          old.remove();
          let copy = [...this.state.renderedMarkers];
          let index = this.state.renderedMarkers.indexOf(old);
          if (index !== -1){
            copy.splice(index, 1);
            this.setState({renderedMarkers: copy});
          }
        }
        marker.owner = pin.owner;
        marker.id = pin._id;
        marker.togglePopup = function(){
          //t.setState({currentMarker: marker})

          if(marker.getPopup().isOpen()){
            marker.getPopup().remove();
          } 
          else{
            t.setState({currentMarker: marker})
            console.log(t.state.currentMarker);
            api.getImageFromPinId(marker.id, function (err, res) {
              if(err) return t.error(err);
              if (res) {
                console.log(res);
                t.setState({currentMarkerImages: res.data.data.getImages.images});
                let imgId = res.data.data.getImages.images[0]._id;
                t.getImage(marker, pin, imgId, t);
              }
            });
            
          }
        }
        marker.name = pin.features.properties.name;
        marker.description = pin.features.properties.description;
        marker.tags = pin.features.properties.tags;
        marker.addTo(t.state.map)
        console.log(marker);
        t.setState(prevState => ({
          renderedMarkers: [...prevState.renderedMarkers, marker]
        }));
        t.setState(prevState => ({
          highlightedMarkers: [...prevState.highlightedMarkers, marker]
        }));
      }
    }
    searchForTags(){
      if (!this.state.searchTags.length) return;
      let t = this;
      api.searchTags({lat: this.state.lat, lng: this.state.lng}, this.state.searchTags, function (err, res) {
        if(err) return t.error(err);
        if (res){
          console.log(res);
          for(let match of res.data.data.getNear.pins){
            const marker = new mapboxgl.Marker({
              color: "#FF0000",
              draggable: false
            }).setLngLat(match.features.geometry.coordinates)
              .setPopup(new mapboxgl.Popup().setHTML(""))
            console.log(t.state.renderedMarkers);
            let old = t.state.renderedMarkers.find((x) => x.id === match._id)
            //if (old && old._color==='#FFFFFF') {
            if (old){
              console.log(old._color);
              old.remove();
              let copy = [...t.state.renderedMarkers];
              let index = t.state.renderedMarkers.indexOf(old);
              if (index !== -1){
                copy.splice(index, 1);
                t.setState({renderedMarkers: copy});
              }

            }
            marker.id = match._id;
            marker.owner = match.owner
            marker.togglePopup = function(){
              t.setState({currentMarker: marker})

              if(marker.getPopup().isOpen()){
                marker.getPopup().remove();
              } 
              else{
                t.setState({currentMarker: marker})
                console.log(t.state.currentMarker);
                api.getImageFromPinId(marker.id, function (err, res) {
                  if (err)return t.error(err);
                  if (res) {
                    t.setState({currentMarkerImages: res.data.data.getImages.images});
                    let imgId = res.data.data.getImages.images[0]._id;
                    t.getImage(marker, match, imgId, t)
                  }
                })
              }
            }
            console.log(match);
            marker.name = match.features.properties.name;
            marker.description = match.features.properties.description;
            marker.tags = match.features.properties.tags;
            marker.addTo(t.state.map)
            console.log(marker);
            t.setState(prevState => ({
              renderedMarkers: [...prevState.renderedMarkers, marker]
            }));
            t.setState(prevState => ({
              highlightedMarkers: [...prevState.highlightedMarkers, marker]
            }));
            
            
          }
        }
      })
    }

    removeHighlighted(custom=false){
      let keep =[];
      console.log(this.state.renderedMarkers);
      console.log(this.state.customSearchTags);
      console.log(this.state.custom);
      for (let h of this.state.renderedMarkers){
        console.log(h);
        if (!custom && !this.state.audioTags && !this.state.customSearchTags) {
          if (h._color === "#FF0000") {
            h.remove();
          }
          else keep.push(h)
        }
        else if(this.state.audioTags){
          let intersection = this.state.audioTags.filter(value => h.tags.includes(value));
          console.log(intersection);
          if (h._color === "#FF0000" && !intersection.length) {
            h.remove();
          }
          else keep.push(h);
        }
        else if (this.state.customSearchTags) {
          let intersection = this.state.customSearchTags.filter(value => h.tags.includes(value));
          console.log(intersection);
          if (h._color === "#FF0000" && !intersection.length) {
            h.remove();
          }
          else keep.push(h);
        }
        
        
      }
      console.log(keep);
      this.setState({highlightedMarkers: [], renderedMarkers: keep});
    }

    removeMarkerFromRendered(old){
      let copy = [...this.state.renderedMarkers];
      let index = this.state.renderedMarkers.indexOf(old);
      if (index !== -1){
        old.remove();
        copy.splice(index, 1);
        this.setState({renderedMarkers: copy});

      }
    }

    voiceSearch(pins, tags, audio){
      console.log(tags);
      console.log(pins)
      if (this.state.audioTags && this.state.audioTags.length) {
        this.setState({audioTags: null}, function () {
          this.removeHighlighted();
        });
      }
      this.setState({customSearchTags: null, customSearch: null}, function () {
        this.removeHighlighted();
      });
      this.setState({audioTags: tags});
      this.displayCustomSearchResults(pins)
      
    }
    performSearch(e, custom=null){

      let t= this;
      this.removeHighlighted();
      console.log(this.state.customSearch);
      console.log(this.state.audioTags);
      if(this.state.audioTags)console.log(true);
      if (this.state.flyTo.length) console.log(true);
      if(this.state.customSearch || custom) console.log(true);
      if (this.state.flyTo.length) {
        if(this.state.addressSearchMarkers) this.removeMarkerFromRendered(this.state.addressSearchMarkers);
        console.log(this.state.flyTo)
        let t = this;
        this.flyToCoord(this.state.flyTo);
        const marker = new mapboxgl.Marker({
          color: "#0000FF",
          draggable: false
        }).setLngLat(t.state.flyTo)
          .addTo(t.state.map)
        this.setState(prevState => ({
          renderedMarkers: [...prevState.renderedMarkers, marker],
          addressSearchMarkers: marker
        }));
        this.setState({flyTo: [], searchTags: [], customSearchTags: null})
      }
      else if (this.state.customSearch || custom) {
        console.log(this.state.customSearch);
        this.setState({displayTagSearchResults: false});
        if (this.state.customSearch) {
          api.customSearch({lat: this.state.lat, lng: this.state.lng}, this.state.customSearch.inputValue, function (err, res) {
            if (err) return t.error(err);
            console.log(res);
            t.setState({customSearchTags: res.data.data.searchByTag.tags});
            t.removeHighlighted()

            t.displayCustomSearchResults(res.data.data.searchByTag.pins);
          });
        }
        
        
        
      }
      else if(this.state.audioTags){
          
        this.setState({customSearchTags: null});
        api.searchTags({lat: this.state.lat, lng: this.state.lng}, this.state.audioTags, function (err, res) {
          if (err) return t.error(err);
          if (res) {
            console.log(res)
            t.displayCustomSearchResults(res.data.data.getNear.pins);
          }
        });
      }
      else if (!custom) {
        console.log(this.state.audioTags);
        console.log(this.state.customSearchTags);
        if (this.state.customSearchTags) {
          this.setState({customSearchTags: null}, function () {
            this.removeHighlighted();
          });
        }
        this.setState({displayTagSearchResults: true}, function () {
          console.log(this.state.customSearchTags);
          this.searchForTags();
        });
      }
      
    }

    addRegion(e){
      //e.preventDefault();
      this.setState({addingLocation:false, drawingRegion: true, renderedRegions: []});
      this.state.draw.deleteAll();
      this.state.draw.changeMode('draw_polygon');
      
      return;
    }

    setImage(e){
      
      console.log(e.target.files[0])
      this.setState({image: e.target.files[0]});
    }
    handleSearchChange(event, value){
      this.setState({audioTags: null});
      console.log(value);
      if (value.place_name) {
        this.setState({customSearch: null});
        console.log(value);
        this.setState({flyTo: value.geometry.coordinates})
        
      }
      else if (value.title) {
        this.setState({customSearch: value});
      }
      else{
        this.setState({customSearch: null});
        this.setState({searchTags: value.length ? value : [], flyTo: []})
        console.log('searching');
      }
      
    }
    updateAddress(arr, name){
      console.log(arr);
      console.log(name);
      console.log(arr.find((x) => x.place_name === name));
      if (name) {
        this.setState({newCoord: arr.find((x) => x.place_name === name).geometry.coordinates})
      }
    }
    cancelDirections(){
      this.setState({viewingDirections: false}, ()=> {
        document.querySelector('.mapbox-directions-profile').style.display='none';
        console.log(this.directions);
        
        this.directions.actions.clearDestination();
        this.directions.removeRoutes();

      });
    }
    updateMapStyle(index){
      this.setState({checked: index});
      const styles = ['streets-v11', "satellite-v9", 'dark-v10', 'satellite-streets-v11'];
      this.state.map.setStyle('mapbox://styles/mapbox/' + styles[index]);
      //this.state.map.setStyle(style);
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

          locationColor='default'
        }

        /*FAB: https://mui.com/components/floating-action-button/ */
        /* input fields: https://mui.com/components/text-fields/ */
        return (
          <div>
            
            <div className="sidebar">
              Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            
            <Box className='action' sx={{ "& > :not(style)": { m: 1 } }}>
                {
                  this.state.searching?
                  
                  <SearchBar displayVoiceSearch={this.voiceSearch} 
                    pos={{lat: this.state.lat, lng: this.state.lng}} 
                    searchChange = {this.handleSearchChange.bind(this)} 
                    search={this.performSearch.bind(this)}> 
                    onError={this.error}
                  </SearchBar>
                  :
                  <Fab disabled={this.state.drawingRegion} onClick={()=>{this.setState({searching: true})}} color="primary" aria-label="search">
                    <SearchIcon />
                  </Fab>
                }
                
                {
                  this.state.searching?
                  
                  null
                  :
                  
                  this.state.signedIn?
                  <div id='location-btn'>
                  {
                    (this.state.addingLocation || this.state.drawingRegion || this.state.movingMarker)?
                    null
                    :
                    <Fab sx={{marginTop: '7px'}} onClick={ this.signOut } color="error">
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
                  (this.state.signedIn && this.state.choosingType && !this.state.searching)?
                    <div id='types'>
                      <Fab disabled={this.state.drawingRegion} onClick={ this.addLocation } sx={{m: 1}}>
                        <PinDropIcon/>
                      </Fab>

                      <Fab disabled={this.state.drawingRegion} onClick={ () => {this.setState({addingLocation: 'region'})} } sx={{m: 1}}>
                            <HighlightAltIcon />
                      </Fab>
                    </div>
                  
                      :
                    null
                }

                {
                  (this.state.signedIn && !this.state.searching)?
                  
                  <Fab color={locationColor} onClick={ locationClick } aria-label="add">
                    { locationButton }
                  </Fab>
                  
                  :
                  null
                }
                {
                  this.state.viewingDirections?
                  <Fab onClick={this.cancelDirections.bind(this)}>
                    <DirectionsOffIcon />
                  </Fab>
                  :
                  null
                }
                
                
                
            </Box>
            
            <Box id='map-style-control'>
              <Accordion >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                  <Typography>Map Style</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup >
                    <FormControlLabel control={<Checkbox onChange={() => {this.updateMapStyle(0)}} checked={this.state.checked === 0} />} label="Standard" />
                    <FormControlLabel control={<Checkbox checked={this.state.checked === 1} onChange={() => {this.updateMapStyle(1)}} />} label="Satellite" />
                    <FormControlLabel control={<Checkbox checked={this.state.checked === 2} onChange={() => {this.updateMapStyle(2)}} />} label="Dark" />
                    <FormControlLabel control={<Checkbox checked={this.state.checked === 3} onChange={() => {this.updateMapStyle(3)}} />} label="Satellite-Streets" />
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box id='errors-and-warnings'>
              {
                this.state.genericError?
                <Alert severity="error">
                    <AlertTitle>Uh-oh</AlertTitle>
                    {this.state.genericError}
                  </Alert>
                  :
                  null
              }
              {
                  this.state.noMatches?
                  <Alert severity="warning">
                    <AlertTitle>Uh-oh</AlertTitle>
                    Sorry, we couldn't find any matches, try refining your search
                  </Alert>
                  :
                  null
                }
                {
                  this.state.directionsTimedOut?
                  <Alert sx={{m:1}} severity="warning">
                    <AlertTitle>Timed Out</AlertTitle>
                    Sorry, we were unable to find directions, please make sure you have enabled location services.
                  </Alert>
                  :
                  null
                }
            </Box>
            
            {
              (this.state.loading || this.state.detailedRegion || this.state.detailedLocation || this.state.addingLocation || this.state.accountForm) ?
              <div id='overlay' >
              {
                this.state.loading?
                <div>
                  <Typography sx={{margin: 0, left: '50%', transform: "translate(-50%, -50%)", position: 'absolute', top: '30%'}} color={'white'} variant='h6'>
                    Hold tight, we're finding the quickest directions there
                  </Typography>
                  <CircularProgress sx={{margin: 0, position: 'absolute', top: '50%', left: '50%', transform: "translate(-50%, -50%)"}} />
                </div>
                :
                null
              }

              {
                this.state.detailedLocation?
                <LocationInfo deleteLocation={this.deleteLocation.bind(this)} 
                  marker={this.state.currentMarker}
                  close={this.closingLocation} owner={this.state.currentMarker.owner}
                  user={this.state.user}
                  onError={this.error}
                  unrender={this.unrenderMarker}
                  images={this.state.displayImgs}
                  updateImages={(newImg)=>{
                    let c = this.state.displayImgs;
                    c.unshift(newImg);
                    this.setState({displayImgs:c});
                  }}
                  ></LocationInfo>
                :
                null
              }
              {
                this.state.addingLocation?
                <AddLocationForm updateAddress={this.updateAddress.bind(this)} imageChange={this.setImage} region={this.state.addingLocation == 'region'} cancel={() => {this.setState({addingLocation: false}); }} 
                  submit={this.state.addingLocation == 'region' ? this.addRegion : this.addMarker} 
                  tags={this.state.tags} 
                  onError={this.error}
                  categoryChange={this.handleCategoryChange.bind(this)} 
                  changeLocationDescription={this.handleLocationDescription} 
                  changeLocationName={this.handleLocationName}></AddLocationForm>
                :
                null
              }

              
              {
                this.state.accountForm?

                <UserForm 
                  cancel={this.cancelAccount} 
                  onLoginFormSubmit={this.onLoginFormSubmit} 
                  createAccount={true}>
                  onError={this.error}
                </UserForm>
                :
                null
              }
              {
                this.state.detailedRegion?
                <RegionInfo user={this.state.user} deleteRegion={this.deleteRegion} close={this.closingLocation} info={{images: this.state.enclosedImages, name: this.state.currentRegion.name, description: this.state.currentRegion.description, locationTags: this.state.enclosedTags}} owner={this.state.currentRegion.owner}  ></RegionInfo>
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
