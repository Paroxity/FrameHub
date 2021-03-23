import PropTypes from "prop-types";

function FormInput(props) {
	return (
		<div className="form-bg center">
			<div className="input">
				<input
					type={props.type}
					placeholder={props.placeholder}
					autoComplete={props.autoComplete ? "on" : "off"}
					onChange={e => props.valueSetter(e.target.value)}
				/>
			</div>
		</div>
	);
}

FormInput.propTypes = {
	type: PropTypes.string,
	placeholder: PropTypes.string,
	autoComplete: PropTypes.bool,
	valueSetter: PropTypes.func.isRequired
};

export default FormInput;
