import React from 'react';
import {
	View,
	Text,
	TouchableHighlight,
} from 'react-native';

import DismissibleCard from '../card/DismissibleCard';

const css = require('../../styles/css');

export default class MultipleChoiceCard extends React.Component {

	render() {
		return (
			<DismissibleCard ref={(c) => { this._card = c; }}>
				<View style={css.card_text_container}>
					<Text style={css.card_button_text}>
						Are you sure you wanna dismiss me?
					</Text>
				</View>
				<View style={css.card_row_container}>
					<TouchableHighlight style={css.card_button_container} underlayColor="#DDD" onPress={() => this._card.dismissCard()}>
						<Text style={css.card_button_text}>Yes</Text>
					</TouchableHighlight>
					<TouchableHighlight style={css.card_button_container} underlayColor="#DDD" onPress={() => console.log('No')}>
						<Text style={css.card_button_text}>No</Text>
					</TouchableHighlight>
				</View>
				<View style={css.card_footer_container}>
					<TouchableHighlight style={css.card_button_container} underlayColor="#DDD" onPress={() => this._card.dismissCard()}>
						<Text style={css.card_button_text}>Maybe</Text>
					</TouchableHighlight>
					<TouchableHighlight style={css.card_button_container} underlayColor="#DDD" onPress={() => console.log('No')}>
						<Text style={css.card_button_text}>Surprise Me</Text>
					</TouchableHighlight>
				</View>
			</DismissibleCard>
		);
	}
}
