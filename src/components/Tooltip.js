import React, {useEffect, useRef} from "react";

function Tooltip(props) {
    const tooltip = useRef();
    let width = useRef(0);
    let height = useRef(0);
    let x = props.x;
    let y = props.y;
    useEffect(() => {
        width.current = tooltip.current.clientWidth;
        height.current = tooltip.current.clientHeight;
    }, [tooltip])
    if (width.current + props.x > document.documentElement.clientWidth) {
        x = document.documentElement.clientWidth - width.current;
    }
    if (height.current + props.y > document.documentElement.clientHeight) {
        y = document.documentElement.clientHeight - height.current;
    }
    return (
        <div className="tooltip" style={{transform: "translate(" + x + "px," + y+ "px)"}} ref={tooltip}>
            {props.title}
            <br/>
            <div className="info">{props.children}</div>
        </div>
    )

}

export default Tooltip;