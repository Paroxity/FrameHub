import PropTypes from "prop-types";
import React from "react";

function GluedComponents(props) {
	let children = props.children.filter(child => child !== undefined);
	return children.length === 0 ? null : (
		<>
			<span>
				{children.map((child, i) => {
					return (
						<React.Fragment key={i}>
							{i === 0 ? "" : props.separator}
							{child}
						</React.Fragment>
					);
				})}
			</span>
			{props.appendAfter}
		</>
	);
}

GluedComponents.propTypes = {
	separator: PropTypes.string.isRequired,
	appendAfter: PropTypes.node,
	children: PropTypes.node.isRequired
};

export default GluedComponents;
