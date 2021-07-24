import PropTypes from "prop-types";

function BaseCategoryInfo(props) {
	return (
		<div className="category-info">
			<span className="category-name">{props.name}</span>
			<br />
			<span>
				{props.mastered}/{props.total}
			</span>
			<br />
			<span className="category-xp">
				{props.masteredXP.toLocaleString()}/
				{props.totalXP.toLocaleString()} XP
			</span>
		</div>
	);
}

BaseCategoryInfo.propTypes = {
	name: PropTypes.string.isRequired,
	mastered: PropTypes.number.isRequired,
	total: PropTypes.number.isRequired,
	masteredXP: PropTypes.number.isRequired,
	totalXP: PropTypes.number.isRequired
};

export default BaseCategoryInfo;
