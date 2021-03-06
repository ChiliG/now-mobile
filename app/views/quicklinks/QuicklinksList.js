import React from 'react';
import {
	View,
	ListView,
	Text,
	TouchableHighlight,
} from 'react-native';

import QuicklinksItem from './QuicklinksItem';

const css = require('../../styles/css');

export default class QuicklinksList extends React.Component {

	constructor(props) {
		super(props);
		this.datasource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
	}

	render() {
		let quicklinksData = [];

		if (this.props.limitResults) {
			quicklinksData = this.props.data.slice(0, this.props.limitResults);
		} else {
			quicklinksData = this.props.data;
		}
		
		const quicklinksDatasource = this.datasource.cloneWithRows(quicklinksData);

		return (
			<ListView dataSource={quicklinksDatasource} renderRow={
				(row) => <QuicklinksItem data={row} navigator={this.props.navigator} />
			}/>
		);
	}
}