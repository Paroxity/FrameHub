import PropTypes from "prop-types";
import { useLayoutEffect, useRef, useState } from "react";

function Tooltip(props) {
	const [mouseX, setMouseX] = useState(0);
	const [mouseY, setMouseY] = useState(0);
	const [visible, setVisible] = useState(false);

	const element = useRef();
	const width = useRef(0);
	const height = useRef(0);

	useLayoutEffect(() => {
		if (visible) {
			width.current = parseFloat(element.current.clientWidth);
			height.current = parseFloat(element.current.clientHeight);
		}
	}, [visible]);

	let x = Math.min(
		mouseX + 20,
		document.documentElement.clientWidth - width.current
	);
	let y = Math.min(
		mouseY + 30,
		document.documentElement.clientHeight - height.current
	);

	return (
		<div
			onMouseEnter={event => {
				setMouseX(event.clientX);
				setMouseY(event.clientY);
				setVisible(true);
			}}
			onMouseLeave={() => setVisible(false)}
			onMouseMove={event => {
				setMouseX(event.clientX);
				setMouseY(event.clientY);
			}}>
			{props.children}
			{visible && (
				<div
					className="tooltip"
					style={{ top: `${y}px`, left: `${x}px` }}
					ref={element}>
					{props.title}
					<div className="info">{props.content}</div>
				</div>
			)}
		</div>
	);
}

Tooltip.propTypes = {
	children: PropTypes.node,
	title: PropTypes.string,
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default Tooltip;
