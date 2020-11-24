import React, {useState} from 'react';
import Tooltip from './Tooltip'
import {foundersItems, getItemComponents} from '../utils/item.js';
import credits from '../media/credits.png';
import {detailedTime} from "../utils/time";
import checkmark from '../media/checkmark.svg';

function Item(props) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    let name = props.name;
    let item = props.item;

    if (item.mastered && props.hideMastered) return <></>;
    if (foundersItems.includes(name) && props.hideFounders && !item.mastered) return <></>;

    return (
        <div
            className={"item" + (item.mastered ? " item-mastered" : "") + ((item.minMR || 0) > props.mr ? " item-locked" : "")}>
            {showTooltip && <Tooltip title="Information" x={x} y={y}>
                {item.vaulted && <><span className="vaulted-item">VAULTED</span><br/><br/></>}
                {(() => {
                    let components = getItemComponents(item, name);
                    if (Object.keys(components).length === 0) return <span
                        className="item-uncraftable">UNCRAFTABLE</span>;

                    return Object.keys(components).map(item => {
                        return <div key={item}>
                            <img className="component-image"
                                 src={"https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/" + item.toLowerCase().split(" ").join("-") + ".png"}
                                 alt="" width="30px"/>
                            <span
                                className="component-name">{components[item].toLocaleString()}x {item}</span>
                            <br/>
                        </div>
                    })
                })()}
                <br/>
                {(item.buildTime && item.buildTime > 60) &&
                <>
                        <span className="build-time">{detailedTime(item.buildTime)} - <img src={credits} alt=""
                                                                                           width="15px"/> {item.buildPrice.toLocaleString()}{item.minMR ? " - Mastery Rank " + item.minMR : ""}</span>
                    <br/>
                </>
                }
                <br/>
                <span>Ctrl + Left Click for Wiki</span>
            </Tooltip>}
            <div className="button"
                 onMouseOver={e => {
                     setShowTooltip(true);
                     setX(e.clientX + 20);
                     setY(e.clientY + 30);
                 }}
                 onMouseOut={() => {
                     setShowTooltip(false);
                 }}
                 onMouseMove={e => {
                     setX(e.clientX + 20);
                     setY(e.clientY + 30);
                 }}>
                <button className="item-name" onClick={e => {
                    if (e.ctrlKey) {
                        window.open(item.wiki || "https://warframe.fandom.com/wiki/" + props.name);
                    } else {
                        if (props.hideMastered) {
                            setShowTooltip(false);
                        }
                        props.onClick();
                    }
                }}>{name + ((item.maxLvl || 30) !== 30 ? " [" + item.maxLvl + "]" : "")}{item.mastered && <img src={checkmark} className="checkmark" alt=""/>}</button>
            </div>
        </div>
    );
}

export default Item;