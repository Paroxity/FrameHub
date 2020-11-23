import React, {useEffect, useRef} from 'react';

function LargeButton(props) {
    const subtitleRef = useRef(null);
    const titleRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        let scaleFactor = titleRef.current.clientHeight / buttonRef.current.clientHeight;
        let height = buttonRef.current.clientHeight * scaleFactor;
        buttonRef.current.style.transform = 'scaleY(' + scaleFactor + ')';
        titleRef.current.style.transform = 'scaleY(' + (1 / scaleFactor) + ') translate(0, ' + (subtitleRef.current.clientHeight / 4) + 'px)';
        subtitleRef.current.style.transform = 'scaleY(' + (1 / scaleFactor) + ') translate(0, -' + subtitleRef.current.clientHeight + 'px)';
    }, [titleRef, subtitleRef, buttonRef]);

    const expand = () => {
        let scaleFactor = (titleRef.current.clientHeight + titleRef.current.clientHeight) / buttonRef.current.clientHeight;
        buttonRef.current.style.transform = 'scaleY(1)';
        titleRef.current.style.transform = 'scaleY(1)';
        subtitleRef.current.style.transform = 'scaleY(1)';
    }

    const reset = () => {
        let scaleFactor = titleRef.current.clientHeight / buttonRef.current.clientHeight;
        let height = buttonRef.current.clientHeight * scaleFactor;
        buttonRef.current.style.transform = 'scaleY(' + scaleFactor + ')';
        titleRef.current.style.transform = 'scaleY(' + (1 / scaleFactor) + ') translate(0, ' + (subtitleRef.current.clientHeight / 4) + 'px)';
        subtitleRef.current.style.transform = 'scaleY(' + (1 / scaleFactor) + ') translate(0, -' + subtitleRef.current.clientHeight + 'px)';
    }

    return <div className="button-large" ref={buttonRef} onMouseOver={expand} onMouseOut={reset}>
        <div className="title" ref={titleRef}>{props.children}</div>
        <div className="subtitle" ref={subtitleRef}>{props.subtitle}</div>
    </div>;
}

export default LargeButton;