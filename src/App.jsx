import "./App.css";
// import VideoFlipScreen from "./components/VideoFlipScreen";
import VideoCropper from "./github/GvP";
import VideoCrop from "./perp/VideoCorp";

function App() {
  return (
    <div className="app">
      <h1>Dynamic Flip Screen</h1>
      {/* <VideoFlipScreen /> */}
      <VideoCropper />
    </div>
  );
}

export default App;
