import React from 'react';

class LoadingScreen extends React.Component {
    render() {
        return <div className="loading">
            <h1>Loading...</h1>
            <div className="spinner"/>
        </div>
    }
}

export default LoadingScreen;