import React, { Component } from "react";
import './ActionBox.css'
import ReactCursorPosition from 'react-cursor-position';
import Cursor from './Cursor';
import { io } from "socket.io-client";

class ActionBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeXProportion: 0,
            activeYProportion: 0,
            isActive: false,
            isPositionOutside: true,
            elementDimensions: {
                width: -1,
                height: -1
            }
        }
        this.onPositionChanged = this.onPositionChanged.bind(this);
        this.onActivationChanged = this.onActivationChanged.bind(this);

    }
    componentDidMount() {
        this.socket = io(process.env.REACT_APP_SERVER_URL);

        this.socket.on('connect', () => {
            console.log("Connected to server socket.io");
        });
          
        this.interval = setInterval(() => {
            this.sendData();
        }, 1000/5);
    }
    
    sendData(){
        if(!this.state.isPositionOutside && this.state.isActive){
            let data = [this.state.activeXProportion, this.state.activeYProportion];
            if(this.socket.connected){
                this.socket.send(data);
            }
        }
    }

    componentWillUnmount(){
        clearInterval(this.interval);
    }

    onPositionChanged(e){
        if(e.elementDimensions != null){
            this.setState({elementDimensions: e.elementDimensions})
        }

        this.setState({isPositionOutside: e.isPositionOutside});
        console.log(e.isPositionOutside);
        if(!e.isPositionOutside){
            let x = e.position.x;
            let y = e.position.y;
            
            this.setState({activeXProportion: (x / this.state.elementDimensions.width)});
            this.setState({activeYProportion: (y / this.state.elementDimensions.height)});
        }
    }

    onActivationChanged(e){
        this.setState({isActive: e.isActive});
        //TODO: If activation turned true, send data in order to not miss quick taps.
    }

    render(){
        return (
        <div className="Action-box">          
            <ReactCursorPosition 
                    style={{width: '100%' }} 
                    activationInteractionTouch='touch'
                    onPositionChanged={this.onPositionChanged}
                    onActivationChanged={this.onActivationChanged}>
                <Cursor className="cursor"/>
                isActive: {this.state.isActive ? 'true ' : 'false '}  <br/>
                isPositionOutside: {this.state.isPositionOutside?'true' : 'false'} <br/>
                x: {this.state.activeXProportion}  <br/>
                y: {this.state.activeYProportion} <br/>
            </ReactCursorPosition>
        </div>
        )}
}

export default ActionBox;
