import React, { Component } from 'react';

class Card extends Component {
  constructor(props) {
    super(props);

    this.setIcon = this.setIcon.bind(this);
  }

  setIcon(icon, desc) {
    const URL =  `http://openweathermap.org/img/w/${icon}.png`;

    return (
        <img src={URL} alt={desc} className="img-circle weatherIcon" />
    );
  }

  render() {
    const { data: { icon, temp, description, time} } = this.props

    return (
        <div className="card">
          <div>
            {this.setIcon(icon, description)}
          </div>
          <div>
          {temp} ˚C
          </div>
          <div>
           {time}
          </div>
        </div>
    )
  }

}

export default Card
