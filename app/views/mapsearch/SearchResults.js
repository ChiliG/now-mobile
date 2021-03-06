import React, { PropTypes } from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import css from '../../styles/css';

const SearchResults = ({ results, onSelect }) => (
	<View>
		{results.map((result, index) => (
			<TouchableHighlight
				key={index}
				underlayColor={'rgba(200,200,200,.1)'}
				onPress={() => onSelect(index)}
			>
				<View style={css.destinationcard_marker_row}>
					<Icon name="map-marker" size={30} />
					<Text style={css.destinationcard_marker_label}>{result.title}</Text>
				</View>
			</TouchableHighlight>
		))}
	</View>
);

SearchResults.propTypes = {
	onSelect: PropTypes.func
};

SearchResults.defaultProps = {};

export default SearchResults;
