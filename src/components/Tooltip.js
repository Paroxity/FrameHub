import React, {useLayoutEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

function Tooltip(props) {
	const tooltip = useRef();
	let width = useRef(0);
	let height = useRef(0);
	let [rendered, setRendered] = useState(false);
	let x = props.x;
	let y = props.y;
	useLayoutEffect(() => {
		width.current = parseFloat(tooltip.current.clientWidth);
		height.current = parseFloat(tooltip.current.clientHeight);
		if (!rendered) {
			setRendered(true);
		}
	}, [rendered]);
	if (width.current + props.x > document.documentElement.clientWidth) {
		x = document.documentElement.clientWidth - width.current;
	}
	if (height.current + props.y > document.documentElement.clientHeight) {
		y = document.documentElement.clientHeight - height.current;
	}
	return (
		<div className={"tooltip"} style={{transform: "translate(" + x + "px," + y + "px)"}} ref={tooltip}>
			{props.title}
			<br/>
			<div className="info">{props.children}</div>
		</div>
	);

}

Tooltip.propTypes = {
	x: PropTypes.number.isRequired,
	y: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired
};

export default Tooltip;