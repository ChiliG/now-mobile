import React from 'react';
import {
	View,
	TouchableHighlight,
	Text
} from 'react-native';
import { connect } from 'react-redux';

import Card from '../card/Card';
import CardComponent from '../card/CardComponent';
import LocationRequiredContent from '../common/LocationRequiredContent';
import SearchBar from './SearchBar';
import SearchMap from './SearchMap';
import SearchResults from './SearchResults';
import NearbyMapView from './NearbyMapView';

import NearbyService from '../../services/nearbyService';

const css = require('../../styles/css');
const logger = require('../../util/logger');
const shuttle = require('../../util/shuttle');
const AppSettings = 		require('../../AppSettings');
const general = require('../../util/general');

class SearchCard extends CardComponent {

	constructor(props) {
		super(props);

		this.state = {
			selectedResult: null,
			searchResults: null,
			selectedInvalidated: true,
			refreshing: false
		};
	}

	componentDidMount() {
	}

	shouldComponentUpdate() {
		console.log('Refrishing: ' + this.props.locationPermission);

		if (this.state.selectedInvalidated && this.props.locationPermission === 'authorized') {
			this.state.selectedInvalidated = false;
			return true;
		} else if (this.state.selectedInvalidated) {
			return true;
		} else {
			return false;
		}
	}

	updateSearch = (text) => {
		NearbyService.FetchSearchResults(text).then((result) => {
			if (result.results) {
				// Cutoff excess
				if (result.results.length > 5) {
					result.results = result.results.slice(0, 5);
				}

				this.setState({
					searchResults: result.results,
					selectedResult: result.results[0],
					selectedInvalidated: true
				});
			} else {
				// handle no results
			}
		});
	}

	updateSelectedResult = (index) => {
		const newSelect = this.state.searchResults[index];
		this.setState({
			selectedResult: newSelect,
			selectedInvalidated: true
		});
	}

	gotoNearbyMapView() {
		this.props.navigator.push({ id: 'NearbyMapView', title: 'Search', name: 'NearbyMapView', component: NearbyMapView });
	}

	render() {
		return (
			<Card id="map" title="Map">
				{ this.renderContent() }
			</Card>
		);
	}

	renderContent() {
		if (this.props.locationPermission !== 'authorized') {
			return <LocationRequiredContent />;
		}
		return (
			<View>
				<SearchBar
					update={this.updateSearch}
				/>
				<SearchMap
					location={this.props.location}
					selectedResult={this.state.selectedResult}
					style={css.nearby_map_container}
				/>
				{(this.state.searchResults) ? (
					<SearchResults
						results={this.state.searchResults}
						onSelect={(index) => this.updateSelectedResult(index)}
					/>
				) : (null)}
			</View>
		);
	}
}

function mapStateToProps(state, props) {
	return {
		location: state.location.position,
		locationPermission: state.location.permission
	};
}

module.exports = connect(mapStateToProps)(SearchCard);
