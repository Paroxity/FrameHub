import React from "react";

function Tooltip(props) {
    return (
        <div className="tooltip" style={{transform: "translate(" + props.x + "px," + props.y + "px)"}}>
            {props.title}
            <div className="info">{props.children}</div>
        </div>
    )

}

export default Tooltip;