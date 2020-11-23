import React from 'react';
import xIcon from '../media/x-icon.svg';
import checkmark from '../media/checkmark.svg';
import placeholderIcon from '../media/placeholderIcon.svg'

class Toggle extends React.Component {
    render() {
        let toggle = (
            <div className="radio-checkbox">
                <input type="radio" id={this.props.name + "On"} name={this.props.name} className={this.props.selected ? 'selected' : ''} />
                <label htmlFor={this.props.name + "On"} onClick={this.props.onToggle}>{this.props.selected ? <img onDragStart={e => e.preventDefault()} src={checkmark} alt="" ></img> : <img onDragStart={e => e.preventDefault()} src={placeholderIcon} alt="" ></img>}</label>
                <input type="radio" id={this.props.name + "Off"} name={this.props.name} className={!this.props.selected ? 'selected' : ''} />
                <label htmlFor={this.props.name + "Off"} onClick={this.props.onToggle}>{this.props.selected ? <img onDragStart={e => e.preventDefault()} src={placeholderIcon} alt="" ></img> : <img onDragStart={e => e.preventDefault()} src={xIcon} alt="" ></img>}</label>
            </div>
        );
        if (this.props.label) {
            toggle = (
                <div className="labled-input">
                    <span>{this.props.label}</span>
                    {toggle}
                </div>
            )
        }
        return toggle

    }
}

export default Toggle;