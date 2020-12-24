import React, { Component } from "react";
import './ActionBox.css'
import ReactCursorPosition from 'react-cursor-position';
import Cursor from './Cursor';
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVER_URL);
class ActionBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeXProportion: 0,
            activeYProportion: 0,
            isActive: false,
            elementDimensions: {
                width: -1,
                height: -1
            }
        }
        this.onPositionChanged = this.onPositionChanged.bind(this);
        this.onActivationChanged = this.onActivationChanged.bind(this);

    }
    componentDidMount() {
        socket.on('connect', () => {
            console.log("Connected to server socket.io");
        });
          
        this.interval = setInterval(() => {
            if(true){
                let data = [this.state.activeXProportion, this.state.activeYProportion];
                // console.log(data);
                if(socket.connected){
                    socket.send(data);
                }
            }
        }, 1000/5);
    }
    
    componentWillUnmount(){
        clearInterval(this.interval);
    }

    onPositionChanged(e){
        if(e.elementDimensions != null){
            this.setState({elementDimensions: e.elementDimensions})
        }
        if(!e.isPositionOutside && this.state.isActive){
            let x = e.position.x;
            let y = e.position.y;
            
            this.setState({activeXProportion: (x / this.state.elementDimensions.width)});
            this.setState({activeYProportion: (y / this.state.elementDimensions.height)});
        }
    }

    onActivationChanged(isActive){
        this.setState({isActive: isActive});
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
                {/* x: {this.state.activeXProportion*100} */}
                {/* y: {this.state.activeYProportion*100} */}
            </ReactCursorPosition>
        </div>
        )}
}

export default ActionBox;
