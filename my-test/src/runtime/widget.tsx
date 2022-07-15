/** @jsx jsx */
import { React, ReactDOM, AllWidgetProps, jsx } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import Point from 'esri/geometry/Point'
import FeatureLayer from "esri/layers/FeatureLayer";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Graphic from "esri/Graphic";
import SimpleMarkerSymbol from   "esri/symbols/SimpleMarkerSymbol";
import geometryEngine from  "esri/geometry/geometryEngine";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import Polyline from "esri/geometry/Polyline";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
//componente stateless con funzione
const Coordinate = (props) => {
  console.log('test')
  return (
      <div>
        {props.coord.city}
        {props.coord.latitude}
        {props.coord.longitude}
      </div>
  )
}
export default class Widget extends React.PureComponent<AllWidgetProps<any>, any> {
  state = {
    jimuMapView: null,
    latitude: '',
    longitude: '',
    latitudeClicked:'',
    longitudeClicked:'',
    value: '',
    coordinates: [
      { city: 'Rome', latitude: '41.890210', longitude: '12.492231' }
    ],
    graphicsAfterClick: [],
    point: null,
    paths: [],
    bufferGraphicsAfterClick: [],
    bufferGraphic: false,
  };

  shoot = () => {
    console.log(this.state.latitude, this.state.coordinates[0].city)
    console.log(`stampa di vieww on click ${this.state.latitudeClicked}, ${this.state.longitudeClicked}`)
  };

  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      this.setState({
        jimuMapView: jmv
      })

      jmv.view.on('pointer-move', (evt) => {
        const point: Point = this.state.jimuMapView.view.toMap({
          x: evt.x,
          y: evt.y
        })
        this.setState({
          latitude: point.latitude.toFixed(3),
          longitude: point.longitude.toFixed(3)
        })
      });
      jmv.view.on('click', (evt) => {
        evt.preventDefault();

        const point: Point = this.state.jimuMapView.view.toMap({
          x: evt.x,
          y: evt.y
        })

        this.state.paths.push([point.longitude , point.latitude]);
        this.setState({
          latitudeClicked: point.latitude.toFixed(3),
          longitudeClicked: point.longitude.toFixed(3)
        })
        console.log(point);

        const simpleMarkerSymbol = new SimpleMarkerSymbol({
          color: [226, 119, 40],  // Orange
          outline: {
            color: [255, 255, 255], // White
            width: 1
          }
        });
        const pointGraphic = new Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol
        });
        const graphicsLayer = new GraphicsLayer({
          graphics: [pointGraphic]
        });
        const polyline = new Polyline(
            {
              paths: [
                this.state.paths
                // [12.492353, 41.890181],
                // [12.492353, 42.890181],
                // [12.492353, 43.890181],
              ]
            });
        const lineSymbol = new SimpleLineSymbol({
          color: [226, 119, 40], // RGB color values as an array
          width: 4
        });
        const polylineGraphic = new Graphic({
          geometry: polyline, // Add the geometry created in step 4
          symbol: lineSymbol // Add the symbol created in step 5
        });
        const buffer = geometryEngine.geodesicBuffer(
            pointGraphic.geometry,
            1,
            "kilometers"
        )as __esri.Polygon;

        const bufferGraphic = new Graphic({
          geometry: buffer,
          symbol: new SimpleFillSymbol({
            color: [227, 139, 79, 0.5],
            outline: {
              color: [255, 255, 255, 255],
            },
          }),
        });
        this.state.bufferGraphicsAfterClick.push(bufferGraphic);
        // graphicsLayer.add(bufferGraphic);
        // graphicsLayer.add(pointGraphic);
        // graphicsLayer.add(polylineGraphic);
        graphicsLayer.addMany([pointGraphic,  bufferGraphic, polylineGraphic]);

        this.state.graphicsAfterClick.push(graphicsLayer);
        // Add the layer to the map (accessed through the Experience Builder JimuMapView data source)
        //Due metodi, o si aggiunge ad ogni click un layer o ad ogni click si stampa la lista dei layer
        // this.state.jimuMapView.view.map.add(graphicsLayer);
        console.log(this.state.graphicsAfterClick)
        this.state.jimuMapView.view.map.addMany(this.state.graphicsAfterClick);

      });
    }
  };

  handleChange (event) {
    this.setState({ value: event.target.value })
  }

  handleSubmit (event) {
    alert('A name was submitted: ' + this.state.value)
  }
  formSubmit = (evt) => {
    evt.preventDefault();

    // create a new FeatureLayer
    const point = new Point({
      latitude: 41.890210,
      longitude: 12.492231
    }) ;
    // this.setState({
    //   point: point
    // }) ;
    const simpleMarkerSymbol = new SimpleMarkerSymbol({
      color: [226, 119, 40],  // Orange
      outline: {
        color: [255, 255, 255], // White
        width: 1
      }
    });
    const pointGraphic = new Graphic({
      geometry: point,
      symbol: simpleMarkerSymbol
    });

    const graphicsLayer = new GraphicsLayer({
      graphics: [pointGraphic];
    });
    graphicsLayer.add(pointGraphic);

    // Add the layer to the map (accessed through the Experience Builder JimuMapView data source)
    this.state.jimuMapView.view.goTo(point);
    this.state.jimuMapView.view.map.add(graphicsLayer);
    console.log(`function formSubmit clicked`);
  };
  makePolyline = (evt) => {

  }

  render () {
    return (
      <div className="widget-starter jimu-widget">
        {/* eslint-disable-next-line no-prototype-builtins */}
        {this.props.hasOwnProperty('useMapWidgetIds') && this.props.useMapWidgetIds && this.props.useMapWidgetIds[0] && (
          <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds?.[0]} onActiveViewChange={this.activeViewChangeHandler} />
        )}

        <p>
          Lat/Lon: {this.state.latitude} {this.state.longitude}
        </p>
        <input id="testinput" type="text"/>
        <button onClick={this.shoot}> click for print latitude in console!</button>

        <p>
          Coordinate: {this.state.coordinates.map((coordinate, i) => {
              return   <Coordinate key={i} coord={coordinate}/>
        })
        }
        </p>
        <form onSubmit={this.formSubmit}>
          <div>
            <button>marker di coordinata in codice</button>
          </div>
        </form>
        <form onSubmit={this.makePolyline}>
          <div>
            <button>make polyline</button>
          </div>
        </form>

      </div>
    )
  }
}
