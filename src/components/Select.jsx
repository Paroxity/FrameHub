import classNames from "classnames";
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";

function Select({ centered, disabled, value, onChange, options = [], placeholder, className }) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);

	const selected = useMemo(() => options.find(o => o.value === value), [options, value]);

	useEffect(() => {
		function onDocumentClick(e) {
			if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener("mousedown", onDocumentClick);
		return () => document.removeEventListener("mousedown", onDocumentClick);
	}, []);

	function toggleOpen() {
		if (disabled) return;
		setOpen(o => !o);
	}

	function selectOption(v) {
		onChange(v);
		setOpen(false);
	}

	return (
		<div className={classNames("form-bg select-container", { center: centered })} ref={rootRef}>
			<div
				className={classNames("input custom-select", className, { disabled })}
				onClick={toggleOpen}
				tabIndex={disabled ? -1 : 0}
			>
				<span className={classNames("select-label", { placeholder: !selected })}>
					{selected ? selected.label : placeholder}
				</span>
				<span className="select-arrow">▾</span>

				{open && (
					<div className="select-dropdown">
						<div className="select-dropdown-box">
							{options.map(opt => (
								<div
									key={opt.value}
									className={classNames("select-option", { selected: opt.value === value })}
									onMouseDown={e => {
										e.preventDefault();
										selectOption(opt.value);
									}}
								>
									{opt.label}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

Select.propTypes = {
	centered: PropTypes.bool,
	disabled: PropTypes.bool,
	value: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
	),
	placeholder: PropTypes.string,
	className: PropTypes.string
};

export default Select;
