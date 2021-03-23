import PropTypes from "prop-types";
import React from "react";

function NumberInput(props) {
	return (
		<div className="labeled-input">
			<span>{props.name}</span>
			<div className="form-bg">
				<div className="input">
					<input
						type="text"
						disabled={props.disabled}
						min={props.min}
						max={props.max}
						value={props.value}
						onChange={e => {
							let newValue = Math.max(
								props.min,
								Math.min(parseInt(e.target.value || 0), props.max)
							);
							if (isNaN(newValue)) newValue = parseInt(props.value);
							if (
								newValue !== parseInt(props.value) &&
								props.onChange &&
								!props.disabled
							)
								props.onChange(newValue);
						}}
					/>
				</div>
			</div>
		</div>
	);
}

NumberInput.propTypes = {
	name: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	min: PropTypes.number.isRequired,
	max: PropTypes.number.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	onChange: PropTypes.func
};

export default NumberInput;
