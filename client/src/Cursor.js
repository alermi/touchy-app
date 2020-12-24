import React, { Component } from "react";

class Cursor extends Component {
 
    render(){
        return <div className='cursor'
            style={{
                left: this.props.position.x + 'px',
                top: this.props.position.y + 'px',
                opacity: (this.props.isActive && !this.props.isPositionOutside) ? 1 : 0
            }}
        />
    }
}

export default Cursor;