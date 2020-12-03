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
				<input type="text" min={props.min} max={props.max} value={props.value} onChange={e => {
					let newValue = Math.max(props.min, Math.min(parseInt(e.target.value || 0), props.max));
					if (newValue !== parseInt(props.value)) props.onChange(newValue);
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

export default NumberInput;