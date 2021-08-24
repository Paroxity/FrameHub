import PropTypes from "prop-types";
import React from "react";

function GluedComponents(props) {
	const children = props.children.filter(child => child !== undefined);
	return children.length === 0 ? null : (
		<div>
			{children.map((child, i) => {
				return (
					<React.Fragment key={i}>
						{i === 0 ? "" : props.separator}
						{child}
					</React.Fragment>
				);
			})}
		</div>
	);
}

GluedComponents.propTypes = {
	separator: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired
};

export default GluedComponents;
