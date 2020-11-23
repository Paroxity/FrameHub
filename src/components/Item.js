import React from 'react';
import Tooltip from './Tooltip'
import {getItemComponents} from '../utils/item.js';
import credits from '../media/credits.png';

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {"x": 0, "y": 0, "showTooltip": false};
    }

    render() {
        if (this.props.item.mastered && this.props.hideMastered) return <></>;
        if ((this.props.name === "Excalibur Prime" || this.props.name === "Skana Prime" || this.props.name === "Lato Prime") && this.props.hideFounders && !this.props.item.mastered) return <></>;
        return (
            <div
                className={"item" + (this.props.item.mastered ? " item-mastered" : "") + ((this.props.item.minMR || 0) > this.props.mr ? " item-locked" : "")}>
                {this.state.showTooltip && <Tooltip title="Information" x={this.state.x} y={this.state.y}>
                    <>
                        {this.props.item.vaulted && <><span className="vaulted-item">VAULTED</span><br/><br/></>}
                        {(() => {
                            let components = getItemComponents(this.props.item, this.props.name);
                            if (Object.keys(components).length === 0) return <span
                                className="item-uncraftable">UNCRAFTABLE</span>;

                            return Object.keys(components).map(item => {
                                return <div key={item}>
                                    <img className="component-image"
                                         src={"https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/" + item.toLowerCase().split(" ").join("-") + ".png"}
                                         alt="" width="30px"/>
                                    <span
                                        className="component-name">{components[item].toLocaleString() + "x " + item}</span>
                                    <br/>
                                </div>
                            })
                        })()}
                        <br/>
                        {(this.props.item.buildTime && this.props.item.buildTime > 60) &&
                        <>
                                <span className="build-time">{(() => {
                                    let buildTime = this.props.item.buildTime;
                                    let days = Math.floor(buildTime / 86400);
                                    let hours = Math.floor(buildTime % 86400 / 3600);
                                    let minutes = Math.floor(buildTime % 86400 % 3600 / 60);
                                    return (days > 0 ? days + " Day" + (days > 1 ? "s" : "") : "") + " " + (hours > 0 ? hours + " Hour" + (hours > 1 ? "s" : "") : "") + " " + (minutes > 0 ? minutes + " Minutes" : "");
                                })()} - {<img src={credits} alt=""
                                              width="15px"/>} {this.props.item.buildPrice.toLocaleString()}{this.props.item.minMR ? " - Mastery Rank " + this.props.item.minMR : ""}</span>
                            <br/>
                        </>
                        }
                        <br/>
                        <span>Ctrl + Left Click for Wiki</span>
                    </>
                </Tooltip>}
                <div className="button"
                     onMouseOver={() => {
                         this.setState({"showTooltip": true});
                     }}
                     onMouseOut={() => {
                         this.setState({"showTooltip": false});
                     }}
                     onMouseMove={e => {
                         this.setState({"x": e.clientX + 20, "y": e.clientY + 30});
                     }}>
                    <button className="item-name" onClick={(event) => {
                        if (this.props.hideMastered) this.setState({"showTooltip": false});
                        if (event.ctrlKey) {
                            window.open(this.props.item.wiki || "https://warframe.fandom.com/wiki/" + this.props.name);
                        } else {
                            this.props.onClick();
                        }
                    }}>{this.props.name}</button>
                </div>
            </div>
        )
    }
}


export default Item;