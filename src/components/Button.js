import React from 'react';

function Button(props) {
    return <div className={"button" + (props.centered ? " center" : "") + (props.disabled ? " disabled" : "")}>
        <button onClick={props.onClick} type={props.submit ? "submit" : "button"}>{props.children}</button>
    </div>
}

export default Button;