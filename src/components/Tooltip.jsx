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
	}, [visible, props.content]);

	const x =
		mouseX + width.current + 20 > document.documentElement.clientWidth
			? mouseX - width.current
			: mouseX + 20;
	const y =
		mouseY + height.current + 30 > document.documentElement.clientHeight
			? mouseY - height.current
			: mouseY + 30;

	return (
		<div
			className={props.className}
			onMouseEnter={event => {
				setMouseX(event.clientX);
				setMouseY(event.clientY);
				setVisible(true);
				if (props.onVisibilityChange) props.onVisibilityChange(true);
			}}
			onMouseLeave={() => {
				setVisible(false);
				if (props.onVisibilityChange) props.onVisibilityChange(false);
			}}
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
	className: PropTypes.string,
	children: PropTypes.node,
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	onVisibilityChange: PropTypes.func
};

export default Tooltip;
