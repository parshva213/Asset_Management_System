
const Loading = ({ message = "Loading..." }) => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-logo-text">AMS</div>
                <div className="spinner"></div>
                <p className="loading-text">{message}</p>
            </div>
        </div>
    )
}

export default Loading;
