import React, { Component } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import LoadingIndicator from  'react-loading-indicator';
import { WEATHER_KEYS } from './constants'
import axios from 'axios'
import Card from './Card'
import './App.css'



const renderSuggestion = ({ formattedSuggestion }) => (
    <div>
      <strong>{formattedSuggestion.mainText}</strong>
      {' '}
      <small>{formattedSuggestion.secondaryText}</small>
    </div>
);

const shouldFetchSuggestions = ({ value }) => value.length > 2;



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      geocodeResults: null,
      loading: false,
      forecastData: null,
      data: {}
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(address) {
    this.setState({
      address,
      geocodeResults: null,
    });
  }

  handleSelect(address) {
    this.setState({
      address,
      loading: true,
    });

    geocodeByAddress(address)
        .then(results => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          axios.get(`${WEATHER_KEYS.url}lat=${lat}&lon=${lng}&mode=json&appid=${WEATHER_KEYS.id}&units=metric`)
              .then((res) => {
                this.setState({ loading: false, data: {city: res.data.city.name, country: res.data.city.country} });
                this.sortByDate(res.data.list)
              })
        })
        .catch(error => {
          console.log('Geocode Error', error);
          this.setState({ loading: false });
        });
  }

  onError(status, clearSuggestions) {
    console.log(
        'Error happened while fetching suggestions from Google Maps API',
        status
    );
    clearSuggestions();
  };

  formatDate(dateTxt) {
    const monthNames = ["January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ]
    let parsedDate = dateTxt.replace(/-0+/g, '-')
    let date = parsedDate.split(' ')[0].split('-')
    return `${date[2]} ${monthNames[date[1]]}`
  }

  formatTimeHour(dateTxt) {
    return parseInt(dateTxt.split(' ')[1].split(':')[0])
  }

  sortByDate(data) {
    const d = data
        .map((d) => {
          const day = (new Date(d['dt_txt'])).toString().substring(0,3)
          const monthNames = ["January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
          ]
          let parsedDate = d.dt_txt.replace(/-0+/g, '-')
          let date = parsedDate.split(' ')[0].split('-')

          const obj = {
            time: `${day} ${date[2]} ${monthNames[date[1]]}`,
            temp: Math.round(d.main.temp),
            len: 1,
            min: Math.round(d.main.temp_min * 10) / 10,
            max: Math.round(d.main.temp_max * 10) / 10,
            description: d.weather[0].description,
            icon: d.weather[0].icon
          };
          return obj;
        })
        .reduce((last,now, currentIndex) => {
          if(currentIndex === 0) {
            last.push(now);
            return last;
          }
          var index = last.findIndex((i, index) => {
            return i.time === now.time;
          });

          if(index === -1) {
            last.push(now);
          } else {
            let item = last[index];
            item.len += 1;
          }

          return last;
        },[]);

    this.setState( { forecastData: d })
    localStorage.setItem(`weather of ${this.state.data.city}`, JSON.stringify(d));
  }



  render() {

    const inputProps = {
      type: 'text',
      value: this.state.address,
      onChange: this.handleChange,
      autoFocus: true,
      placeholder: 'Search Places',
      name: 'searchBar',
      id: 'my-input-id',
    };

    return (
        <div>
          <div className="header-title">
            <h2>Weather Forecast</h2>
          </div>
          <hr/>
          <h3 className="subtitle">What's your weather?</h3>
          <div className="searchbar-container">
            <PlacesAutocomplete
                renderSuggestion={renderSuggestion}
                inputProps={inputProps}
                classNames={{input:'form-searchbar', autocompleteContainer: 'my-autocomplete-container', autocompleteItem: 'search-item'}}
                onSelect={this.handleSelect}
                onEnterKeyDown={this.handleSelect}
                onError={this.onError}
                shouldFetchSuggestions={shouldFetchSuggestions}
            />
          </div>
          { this.state.loading && (
              <div className="loader">
                <LoadingIndicator />
              </div>
          )}
          {
            this.state.forecastData &&
            <div className="results-container">
              <div className="address-title">{this.state.data.city}, {this.state.data.country}</div>
              <div className="card-container">
              { this.state.forecastData.map(card => {
                return <Card key={this.state.forecastData.time}
                             data={card}/>
              })}
            </div>
            </div>
          }

        </div>
    )
  }
}

export default App;
