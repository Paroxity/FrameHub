import PropTypes from "prop-types";
import React, {useState} from "react";
import Tooltip from "./Tooltip";

function NumberInput(props) {
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const [showTooltip, setShowTooltip] = useState(false);
	return <div className="labeled-input"
		onMouseOver={e => {
			setX(e.clientX + 20);
			setY(e.clientY + 30);
			setShowTooltip(true);
		}}
		onMouseOut={() => {
			setShowTooltip(false);
		}}
		onMouseMove={e => {
			setX(e.clientX + 20);
			setY(e.clientY + 30);
		}}
	>
		<span>{props.name}</span>
		<div className="form-bg">
			<div className="input">
				<input type="text" readOnly={props.disabled} min={props.min} max={props.max} value={props.value}
					onChange={e => {
						let newValue = Math.max(props.min, Math.min(parseInt(e.target.value || 0), props.max));
						if (isNaN(newValue)) newValue = parseInt(props.value);
						if (newValue !== parseInt(props.value) && props.onChange && !props.disabled) props.onChange(newValue);
					}}/>
			</div>
		</div>
		{showTooltip &&
		<Tooltip x={x} y={y} title={props.name}>
			{props.tooltip}
			<p>Maximum value: {props.max}</p>
		</Tooltip>
		}
	</div>;
}

NumberInput.propTypes = {
	name: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	min: PropTypes.number.isRequired,
	max: PropTypes.number.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	onChange: PropTypes.func,
	tooltip: PropTypes.node
};

export default NumberInput;