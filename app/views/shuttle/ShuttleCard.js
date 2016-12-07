import React from 'react';
import {
	View,
	Text,
	ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';

import Card from '../card/Card';
import CardComponent from '../card/CardComponent';
import ShuttleService from '../../services/shuttleService';
import ShuttleOverview from './ShuttleOverview';
import ShuttleStop from '../ShuttleStop';
import LocationRequiredContent from '../common/LocationRequiredContent';
import CardSlider from 'react-native-cards-slider';

const css = require('../../styles/css');
const logger = require('../../util/logger');
const shuttle = require('../../util/shuttle');
const map = require('../../util/map');
const shuttle_routes = require('../../json/shuttle_routes_master.json');

class ShuttleCard extends CardComponent {

	constructor(props) {
		super(props);

		this.shuttleCardRefreshInterval = 1 * 60 * 1000;
		this.shuttleClosestStops = [{ dist: 100000000 },{ dist: 100000000 }];
		this.refreshShuttleCardTimer = null;

		this.state = {
			isRefreshing: false,
			closestStop1Loaded: false,
			closestStop2Loaded: false,
			closestStop1LoadFailed: false,
			closestStop2LoadFailed: false,
			shuttleData: [],
			defaultPosition: {
				coords: { latitude: 32.88, longitude: -117.234 }
			},
		};
	}

	componentDidMount() {
		if (this.props.location) {
			this.refresh();
		}
		this.setupAutoRefresh();
	}

	componentWillReceiveProps(nextProps) {
		// if we have a new location, refresh using that location
		if (!this.props.location
				|| (nextProps.location &&
					(nextProps.location.coords.latitude !== this.props.location.coords.latitude
						|| nextProps.location.coords.longitude !== this.props.location.coords.longitude)
				)) {
			// do not attempt to do refresh location if we are currently in a refresh
			if (!this.state.isRefreshing) {
				this.refreshWithLocation('manual', nextProps.location); // refresh with new location
			}
		}
	}

	componentWillUnmount() {
		clearInterval(this.refreshShuttleCardTimer);
	}

	setupAutoRefresh = () => {
		if (this.refreshShuttleCardTimer) {
			clearInterval(this.refreshShuttleCardTimer);
		}
		// refresh the shuttle card occasionally
		this.refreshShuttleCardTimer = setInterval(_ => {
			this.refreshWithLocation('auto', this.props.location);
		}, this.shuttleCardRefreshInterval);
	}

	refreshWithLocation = (type, location) => {
		if (!this.state.isRefreshing && location) {
			this.setState({ isRefreshing: true });

			this.findClosestShuttleStops(type, location);
		}
	}

	refresh = () => {
		if (this.props.location) {
			this.refreshWithLocation('manual', this.props.location);
		}
	}

	render() {
		return (
			<Card id="shuttle" title="Shuttle" cardRefresh={this.refresh} isRefreshing={this.state.isRefreshing}>
				<CardSlider>
					{ this.renderContent() }
				</CardSlider>
			</Card>
		);
	}

	renderContent() {
		// no permission to get location
		if (this.props.locationPermission !== 'authorized') {
			return (<LocationRequiredContent />);
		}

		// stops haven't loaded yet
		if (!this.state.closestStop1Loaded && !this.state.closestStop2Loaded) {
			return (
				<View style={[css.shuttle_card_row_center, css.shuttle_card_loader]}>
					<ActivityIndicator style={css.shuttle_card_aa} size="large" />
				</View>
			);
		}

		// both stops failed to load
		if (this.state.closestStop1LoadFailed && this.state.closestStop2LoadFailed) {
			return (
				<View style={css.shuttlecard_loading_fail}>
					<Text style={css.fs18}>No Shuttles en Route</Text>
					<Text style={[css.pt10, css.fs12, css.dgrey]}>We were unable to locate any nearby shuttles, please try again later.</Text>
				</View>
			);
		}

		// return loaded rows
		const rows = [];
		if (this.state.closestStop1Loaded) { rows.push(this.renderOverview(0)); }
		if (this.state.closestStop2Loaded) { rows.push(this.renderOverview(1)); }
		return rows;
	}

	renderOverview(i) {
		return (
			<ShuttleOverview
				key={i}
				onPress={this.gotoShuttleStop}
				stopData={this.shuttleClosestStops[i]}
				shuttleData={this.state.shuttleData[i]}
			/>
		);
	}

	// SHUTTLE_CARD
	findClosestShuttleStops = (refreshType, location) => {
		this.shuttleClosestStops[0].dist = 1000000000;
		this.shuttleClosestStops[1].dist = 1000000000;

		for (let i = 0; shuttle_routes.length > i; i++) {
			const shuttleRoute = shuttle_routes[i];

			for (let n = 0; shuttleRoute.stops.length > n; n++) {
				const shuttleRouteStop = shuttleRoute.stops[n];
				const distanceFromStop = map.getDistance(location.coords.latitude, location.coords.longitude, shuttleRouteStop.lat, shuttleRouteStop.lon);

				// Rewrite this later using sortRef from shuttleDetail
				if (distanceFromStop < this.shuttleClosestStops[0].dist) {
					this.shuttleClosestStops[0].stopID = shuttleRouteStop.id;
					this.shuttleClosestStops[0].stopName = shuttleRouteStop.name;
					this.shuttleClosestStops[0].dist = distanceFromStop;
					this.shuttleClosestStops[0].stopLat = shuttleRouteStop.lat;
					this.shuttleClosestStops[0].stopLon = shuttleRouteStop.lon;
				} else if (distanceFromStop < this.shuttleClosestStops[1].dist && this.shuttleClosestStops[0].stopID !== shuttleRouteStop.id) {
					this.shuttleClosestStops[1].stopID = shuttleRouteStop.id;
					this.shuttleClosestStops[1].stopName = shuttleRouteStop.name;
					this.shuttleClosestStops[1].dist = distanceFromStop;
					this.shuttleClosestStops[1].stopLat = shuttleRouteStop.lat;
					this.shuttleClosestStops[1].stopLon = shuttleRouteStop.lon;
				}
			}
		}

		this.fetchShuttleArrivalsByStop(0, this.shuttleClosestStops[0].stopID);
		this.fetchShuttleArrivalsByStop(1, this.shuttleClosestStops[1].stopID);

		if (refreshType === 'auto') {
			// logger.log('Queueing Shuttle Card data refresh in ' + this.shuttleCardRefreshInterval/1000 + ' seconds');
		} else {
			// If manual refresh, reset the Auto refresh timer
			this.setupAutoRefresh();
		}
	}

	fetchShuttleArrivalsByStop = (closestStopNumber, stopID) => {
		logger.log('fetchShuttleArrivalsByStop: stopID: ' + stopID);

		ShuttleService.FetchShuttleArrivalsByStop(stopID)
		.then((responseData) => {
			if (responseData.length > 0 && responseData[0].secondsToArrival) {
				this.setState({ shuttleData : responseData });
				let closestShuttleETA = 999999;

				for (let i = 0; responseData.length > i; i++) {
					const shuttleStopArrival = responseData[i];

					if (shuttleStopArrival.secondsToArrival < closestShuttleETA ) {
						closestShuttleETA = shuttleStopArrival.secondsToArrival;

						this.shuttleClosestStops[closestStopNumber].etaMinutes = shuttle.getMinutesETA(responseData[i].secondsToArrival);
						this.shuttleClosestStops[closestStopNumber].etaSeconds = shuttleStopArrival.secondsToArrival;
						this.shuttleClosestStops[closestStopNumber].routeID = shuttleStopArrival.route.id;
						this.shuttleClosestStops[closestStopNumber].routeName = shuttleStopArrival.route.name;
						this.shuttleClosestStops[closestStopNumber].routeShortName = shuttleStopArrival.route.shortName;
						this.shuttleClosestStops[closestStopNumber].routeColor = shuttleStopArrival.route.color;
					}
				}

				if (this.shuttleClosestStops[closestStopNumber].routeShortName === 'Campus Loop') {
					this.shuttleClosestStops[closestStopNumber].routeShortName = 'L';
				}

				this.shuttleClosestStops[closestStopNumber].routeName = this.shuttleClosestStops[closestStopNumber].routeName.replace(/.*\) /, '').replace(/ - .*/, '');

				if (closestStopNumber === 0) {
					this.setState({
						closestStop1Loaded: true,
						closestStop1LoadFailed: false
					});
				} else if (closestStopNumber === 1) {
					this.setState({
						closestStop2Loaded: true,
						closestStop2LoadFailed: false
					});
				}
			}
			else {
				throw new Error('Invalid response');
			}

			this.setState({ isRefreshing: false });
		})
		.catch((error) => {
			logger.error('ERR: fetchShuttleArrivalsByStop: ' + error + ' (stop: ' + closestStopNumber + ')');

			if (closestStopNumber === 0) {
				this.setState({ closestStop1LoadFailed: true });
			} else if (closestStopNumber === 1) {
				this.setState({ closestStop2LoadFailed: true });
			}

			this.setState({ isRefreshing: false });
		})
		.done();
	}

	gotoShuttleStop = (stopData, shuttleData) => {
		this.props.navigator.push({
			id: 'ShuttleStop',
			name: 'Shuttle Stop',
			component: ShuttleStop,
			title: 'Shuttle',
			stopData,
			currentPosition: this.props.location,
			shuttleData });
	}
}

function mapStateToProps(state, props) {
	return {
		location: state.location.position,
		locationPermission: state.location.permission
	};
}

module.exports = connect(mapStateToProps)(ShuttleCard);
