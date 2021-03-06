import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Autocomplete from 'react-google-autocomplete';
import { translate } from '../core/i18n';
import { formatGeoResults } from '../core/util';
import { CONFIG } from '../core/config';
export default class Address extends Component {
    constructor(props) {
        super();
        
        let locationQueryString = '';
        const address = props.location || {};

        if (address.street)
            locationQueryString += address.street;

        if (address.streetNumber)
            locationQueryString += ` ${address.streetNumber}`;

        this.state = {
            deriveOnly: props.deriveOnly,
            countryRestriction: props.countryRestriction,
            locationQueryString,
            countryCode: address.countryCode,
            street: address.street,
            streetNumber: address.streetNumber,
            formattedAddress: address.formattedAddress,
            addressAddition: address.addressAddition,
            city: address.city,
            postalCode: address.postalCode,
            lat: address.lat,
            lng: address.lng
        };
    }

    componentDidMount() {}

    componentWillReceiveProps(nextProps) {
        const newState = {};

        const mutableProps = [
            "locationQueryString",
            "countryCode",
            "street",
            "streetNumber",
            "formattedAddress",
            "addressAddition",
            "city",
            "postalCode",
            "taxNumber",
            "lat",
            "lng"
        ];

        Object.keys(nextProps.location)
        .forEach(propKey => {
            if (mutableProps.indexOf(propKey) > -1) {
                newState[propKey] = nextProps.location[propKey];
            }
        });

        this.setState(newState);
    }
    
    getRequiredStar(mode) {
        return Number(mode) === 2 ? '*' : '';
    }

    isEnabled(mode) {
        return Number(mode) !== 0;
    }

    onAddressFieldChange(fieldKey) {
        return (ev, newValue) => {

            if (fieldKey === 'postalCode') {
                newValue = String(newValue);
                
                newValue = newValue.split('.').join('');
                newValue = newValue.split('+').join('');
                newValue = newValue.split(' ').join('');
    
                if (newValue.charAt() === '-') {
                    return;
                }

                if (isNaN(Number(newValue.replace('-', ''))) || newValue.length > 6) {
                    return;
                }
            }

            const location = this.state;
            
            location[fieldKey] = newValue;

            this.setState(location);

            this.props.onLocationChange &&
            this.props.onLocationChange(location);
        };
    }
    
    render() {
     return <div className="row">
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="row">
                                <div className="col-xs-12 col-sm-8">
                                    <h4>
                                        {translate("LOCATION_STREET") + '*'}
                                    </h4>
                                    <TextField style={{width: '100%'}}>
                                        <Autocomplete
                                            value={this.state.street}
                                            onChange={(ev) => {
                                                const locationQueryString = ev.target.value;

                                                this.setState({
                                                    locationQueryString,
                                                    street: locationQueryString
                                                });
                                            }}
                                            style={{width: '100%'}}
                                            componentRestrictions={{country: this.state.countryRestriction}}
                                            onPlaceSelected={place => {
                                                const locationValue = formatGeoResults([ place ])[0];
                                                let locationQueryString = '';

                                                if (locationValue.route)
                                                    locationQueryString += locationValue.route;

                                                if (locationValue.streetNumber)
                                                    locationQueryString += ` ${locationValue.streetNumber}`;

                                                const location = {
                                                    locationQueryString,
                                                    postalCode: locationValue.postalCode,
                                                    countryCode: locationValue.countryCode,
                                                    city: locationValue.city,
                                                    addressAddition: this.state.addressAddition,
                                                    /*  locationValue.streetNumber ||
                                                        this.state.addressAddition,
                                                    */
                                                    street: locationValue.route,
                                                    streetNumber: locationValue.streetNumber,
                                                    lat: locationValue.lat,
                                                    lng: locationValue.lng
                                                };

                                                this.setState(location);

                                                this.props.onLocationChange(location);
                                            }}
                                            types={[ 'address' ]}
                                        />
                                    </TextField>
                                </div>
                                <div className="col-xs-12 col-sm-4">
                                        <h4 style={{ height: 20 }}>{translate("LOCATION_STREET_NUMBER")}</h4>
                                        <TextField
                                            name="streetNumber"
                                            onChange={this.onAddressFieldChange('streetNumber')}
                                            style={{width: '100%', bottom: 0}}
                                            inputStyle={{width: '100%'}}
                                            value={this.state.streetNumber}
                                        />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                        <h4>{translate("LOCATION_ADDRESS_ADDITION")}</h4>
                                        <TextField
                                            name="addressAddition"
                                            onChange={this.onAddressFieldChange('addressAddition')}
                                            style={{width: '100%'}}
                                            inputStyle={{width: '100%'}}
                                            value={this.state.addressAddition}
                                        />
                                </div>  
                                <div className="col-xs-6">
                                    <h4 >{translate("LOCATION_CITY") + '*'}</h4>
                                    <TextField
                                        disabled={this.state.deriveOnly}
                                        name="city"
                                        onChange={this.onAddressFieldChange('city')}
                                        style={{width: '100%'}}
                                        inputStyle={{width: '100%'}}
                                        value={this.state.city}
                                    />
                                </div>
                                <div className="col-xs-6">
                                    <h4 >{translate("LOCATION_POSTAL_CODE") + '*'}</h4>
                                    <TextField
                                        disabled={this.state.deriveOnly}
                                        type="text"
                                        name="postalCode"
                                        onChange={this.onAddressFieldChange('postalCode')}
                                        style={{width: '100%'}}
                                        inputStyle={{width: '100%'}}
                                        value={this.state.postalCode}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-12">
                                        <h4>{translate("LOCATION_COUNTRY") + '*'}</h4>
                                        <TextField
                                            disabled={true}
                                            name="countryCode"
                                            onChange={this.onAddressFieldChange('countryCode')}
                                            style={{width: '100%'}}
                                            inputStyle={{width: '100%'}}
                                            value={this.state.countryCode}
                                        />
                                </div>
                            </div>
                            { this.props.withTaxNumber &&
                                <div className="row">
                                    <div className="col-xs-12">
                                            <h4>{translate("BILLING_TAX_NUMBER")}</h4>
                                            <TextField
                                                name="taxNumber"
                                                onChange={this.onAddressFieldChange('taxNumber')}
                                                style={{width: '100%'}}
                                                inputStyle={{width: '100%'}}
                                                value={this.state.taxNumber}
                                            />
                                    </div>  
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
    }
}
