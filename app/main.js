'use strict';

import React, { Component } from 'react';
import {
	AppRegistry,
	NavigatorIOS,
	BackAndroid,
	StatusBar,
	View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// SETUP / UTIL / NAV / STYLES
var AppSettings = 			require('./AppSettings'),
	general = 				require('./util/general'),
	logger = 				require('./util/logger'),
	css = 					require('./styles/css');

// VIEWS
var Home = 					require('./views/Home'),
	ShuttleStop = 			require('./views/ShuttleStop'),
	SurfReport = 			require('./views/weather/SurfReport'),
	DiningList = 			require('./views/dining/DiningList'),
	DiningDetail = 			require('./views/dining/DiningDetail'),
	DiningNutrition = 		require('./views/dining/DiningNutrition'),
	NewsDetail = 			require('./views/news/NewsDetail'),
	EventDetail = 			require('./views/events/EventDetail'),
	WebWrapper = 			require('./views/WebWrapper');

// GPS
import GeoLocationContainer from './containers/geoLocationContainer';

// VIEWS
import WelcomeWeekView from './views/welcomeWeek/WelcomeWeekView';
import QuicklinksListView from './views/quicklinks/QuicklinksListView';
import EventListView from './views/events/EventListView';
import NewsListView from './views/news/NewsListView';
import DiningListView from './views/dining/DiningListView';
import FeedbackView from './views/FeedbackView';
import PreferencesView from './views/preferences/PreferencesView';
import NearbyMapView from './views/mapsearch/NearbyMapView';

// NAV
import NavigationBarWithRouteMapper from './views/NavigationBarWithRouteMapper';

var Main = React.createClass({

	getInitialState() {
		return {
			inHome: true,
		};
	},

	componentWillMount() {
		// Get icon image bc NavigatorIOS needs it
		if (general.platformIOS()) {
			Icon.getImageSource('cog', 25).then((source) => {
				this.setState({ gearIcon: source });
			});
		}
	},

	componentDidMount() {
		/*
		if (general.platformAndroid()) {
			// Listen to route focus changes
			// Should be a better way to do this...
			this.refs.navRef.refs.navRef.navigationContext.addListener('willfocus', (event) => {

				const route = event.data.route;

				// Make sure renders/card refreshes are only happening when in home route
				if (route.id === "Home") {
					this.setState({inHome: true});
				} else {
					this.setState({inHome: false});
				}
			});

			// Listen to back button on Android
			BackAndroid.addEventListener('hardwareBackPress', () => {
				//console.log(util.inspect(this.refs.navRef.refs.navRef.getCurrentRoutes()));
				//var route = this.refs.navRef.refs.navRef.getCurrentRoutes()[0];

				if(this.state.inHome) {
					BackAndroid.exitApp();
					return false;

				} else {
					this.refs.navRef.refs.navRef.pop();
					return true;
				}
			});
		} else {
			// Pause/resume timeouts
			this.refs.navRef.navigationContext.addListener('didfocus', (event) => {
				const route = event.data.route;

				// Make sure renders/card refreshes are only happening when in home route
				if (route.id === undefined) { //undefined is foxusing "Home"... weird I know
					this.setState({inHome: true});
				} else {
					this.setState({inHome: false});
				}
			});

			// Make all back buttons use text "Back"
			this.refs.navRef.navigationContext.addListener('willfocus', (event) => {
				const route = event.data.route;
				route.backButtonTitle = "Back";
			});
		}*/
	},

	_handleNavigationRequest() {
		// TODO: works on iOS
		this.navRef.push({
			id: 'PreferencesView',
			component: PreferencesView,
			title: 'Settings'
		});
	},

	render: function () {
		let navigator;

		if (general.platformIOS() && this.state.gearIcon) {

			StatusBar.setBarStyle('light-content');

			navigator = (<NavigatorIOS
				initialRoute={{
					component: Home,
					title: AppSettings.APP_NAME,
					passProps: {
						isSimulator: this.props.isSimulator
					},
					backButtonTitle: 'Back',
					rightButtonIcon: this.state.gearIcon,
					onRightButtonPress: () => this._handleNavigationRequest(),
				}}
				style={css.flex}
				itemWrapperStyle={css.navBarIOSWrapperStyle}
				tintColor='#FFFFFF'
				barTintColor='#182B49'
				titleTextColor='#FFFFFF'
				navigationBarHidden={false}
				translucent={false}
				ref={(navRef) => {
					if (navRef) {
						// Make all back buttons use text "Back"
						navRef.navigationContext.addListener('willfocus', (event) => {
							const route = event.data.route;
							route.backButtonTitle = 'Back';
						});
						this.navRef = navRef;
					}
				}}
			/>);
		} else if (general.platformAndroid()) {
			// android we will use NavigationBarWithRouteMapper
			navigator = (
				<NavigationBarWithRouteMapper
					ref={(navRef) => {
						if (navRef) {
							// Listen to route focus changes
							// Should be a better way to do this...
							navRef.refs.navRef.navigationContext.addListener('willfocus', (event) => {
								const route = event.data.route;

								// Make sure renders/card refreshes are only happening when in home route
								if (route.id === 'Home') {
									this.setState({ inHome: true });
								} else {
									this.setState({ inHome: false });
								}
							});

							// Listen to back button on Android
							BackAndroid.addEventListener('hardwareBackPress', () => {
								if (this.state.inHome) {
									BackAndroid.exitApp();
									return false;
								} else {
									navRef.refs.navRef.pop();
									return true;
								}
							});
							this.navRef = navRef;
						}
					}}
					route={{ id: 'Home', name: 'Home', title: AppSettings.APP_NAME }}
					renderScene={this.renderScene}
				/>
			);
		} else {
			navigator = null;
		}

		return (
			<View style={css.flex}>
				<GeoLocationContainer />
				{navigator}
			</View>
		);
	},

	renderScene(route, navigator, index, navState) {
		switch (route.id) {
		case 'Home': 				return (<Home route={route} navigator={navigator} new_timeout={this.newTimeout} do_timeout={this.doTimeout} />);
		case 'PreferencesView': 	return (<PreferencesView route={route} navigator={navigator} />);
		case 'ShuttleStop': 		return (<ShuttleStop route={route} navigator={navigator} />);
		case 'SurfReport': 			return (<SurfReport route={route} navigator={navigator} />);
		case 'DiningListView': 		return (<DiningListView route={route} navigator={navigator} />);
		case 'DiningDetail': 		return (<DiningDetail route={route} navigator={navigator} />);
		case 'DiningNutrition': 	return (<DiningNutrition route={route} navigator={navigator} />);
		case 'NewsDetail': 			return (<NewsDetail route={route} navigator={navigator} />);
		case 'EventDetail': 		return (<EventDetail route={route} navigator={navigator} />);
		case 'WebWrapper': 			return (<WebWrapper route={route} navigator={navigator} />);
		case 'WelcomeWeekView': 	return (<WelcomeWeekView route={route} navigator={navigator} />);
		case 'EventListView': 		return (<EventListView route={route} navigator={navigator} />);
		case 'QuicklinksListView': 	return (<QuicklinksListView route={route} navigator={navigator} />);
		case 'NewsListView': 		return (<NewsListView route={route} navigator={navigator} />);
		case 'FeedbackView': 		return (<FeedbackView route={route} navigator={navigator} />);
		case 'NearbyMapView': 		return (<NearbyMapView route={route} navigator={navigator} />);
		default: 					return (<Home route={route} navigator={navigator} new_timeout={this.newTimeout} do_timeout={this.doTimeout} />);
		}
	}
});

module.exports = Main;
