import React from 'react';

class NumberInput extends React.Component {
    render() {
        return <div className="labled-input">
            <span>{this.props.name}</span>
            <div className="form-bg">
                <div className="input">
                    <input type="text" min={this.props.min} max={this.props.max} value={this.props.value} onChange={e => {
                        let newValue = Math.max(this.props.min, Math.min(parseInt(e.target.value || 0), this.props.max));
                        if (newValue !== parseInt(this.props.value)) this.props.onChange(newValue);
                    }} />
                </div>
            </div>
        </div>
    }
}

export default NumberInput;