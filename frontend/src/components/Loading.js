import logo from "../img/logo.png"

const Loading = ({ message = "Loading..." }) => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <img src={logo} alt="Loading..." className="loading-logo" />
                <div className="spinner"></div>
                <p className="loading-text">{message}</p>
            </div>
        </div>
    )
}

export default Loading;
