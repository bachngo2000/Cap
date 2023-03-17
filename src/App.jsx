import { useState } from 'react';
import './App.css';
import APIForm from './Components/APIform';
import Gallery from './Components/gallery';



const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function App() {
  // we want to make the form that users will use in order to establish some base qualities about their screenshots.
  // We first want to establish that there is a set of inputs that we will be asking each user to specify for their screenshot. Add these in a state variable dictionary in App.jsx
  const [inputs, setInputs] = useState({
    url: "",
    format: "",
    no_ads: "",
    no_cookie_banners: "",
    width: "",
    height: "",
  });

  // We need an async function to make our API call with our newly created query, callAPI(). 
  // We will also need a state variable to hold and display the screenshot after we make our API call.
  const [currentImage, setCurrentImage] = useState(null);

  // A state variable to  keep track of all of the images we have taken
  const [prevImages, setPrevImages] = useState([]);

  // a state variable to keep track of our quota values (our limit of calls we started with and how many we have left).
  const [quota, setQuota] = useState(null);

  // async function to make our API call to this quota endpoint.
  const getQuota = async () => {
    const response = await fetch("https://api.apiflash.com/v1/urltoimage/quota?access_key=" + ACCESS_KEY);
    const result = await response.json();
  
    setQuota(result);
  }



  // In our callAPI() function, we will make a fetch call with await, and save the response as a simple json since we added that nice response_type=json parameter to our query string. (Feel free to include console.log(json); if you would like to see what our API gives us back)
  // It's possible to get error messages instead of a screenshot when using callAPI(). We want to keep track of these error messages. 
  // Unfortunately, the response errors from this API are not super informational. To give more information to our users, we can check if we didn't receive a url back 
  // from our API call (meaning a proper screenshot couldn't be taken) and then make our own message! If we do get a url back, we can make it our currentImage
  const callAPI = async (query) => {
    
    const response = await fetch(query);
    const json = await response.json();

    if (json.url == null){
      alert("Oops! Something went wrong with that query, let's try again!")
        }
    else {
      setCurrentImage(json.url);
      setPrevImages((images) => [...images, json.url]);
      reset();
      getQuota();
    }
  }

  // The last helper function we will need is reset(), which will just set the current input variables to "" after our API call so that our form is cleared.
  const reset = () => {
    setInputs({
      url: "",
      format: "",
      no_ads: "",
      no_cookie_banners: "",
      width: "",
      height: "",
    }); 
  }

  const makeQuery = () => {
    let wait_until = "network_idle";
    let response_type = "json";
    let fail_on_status = "400%2C404%2C500-511";
    let url_starter = "https://";
    let fullURL = url_starter + inputs.url;
    let query = `https://api.apiflash.com/v1/urltoimage?access_key=${ACCESS_KEY}&url=${fullURL}&format=${inputs.format}&width=${inputs.width}&height=${inputs.height}&no_cookie_banners=${inputs.no_cookie_banners}&no_ads=${inputs.no_ads}&wait_until=${wait_until}&response_type=${response_type}&fail_on_status=${fail_on_status}`;
    callAPI(query).catch(console.error);
  }

  const submitForm = () => {

    let defaultValues = {
      format: "jpeg",
      no_ads: "true",
      no_cookie_banners: "true",
      width: "1920",
      height: "1080",
    };

    if (inputs.url == "" || inputs.url == " ") {
      alert("You forgot to submit an url!");
    } 
    else {
      for (const [key, value] of Object.entries(inputs)) {
        if (value == ""){
          inputs[key] = defaultValues[key]
        }
      }
      makeQuery();
    }
  }

  return (
    <div className="whole-page">
      <h1>Build Your Own Screenshot! 📸</h1>
      
      <APIForm
        inputs={inputs}
        handleChange={(e) =>
          setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value.trim(),
          }))
        }
        onSubmit={submitForm}
      />

      {currentImage ? (
        <img
          className="screenshot"
          src={currentImage}
          alt="Screenshot returned"
        />
        ) : (
        <div> </div>
      )}

      <div className="container">
        <h3> Current Query Status: </h3>
        <p>
          https://api.apiflash.com/v1/urltoimage?access_key=ACCESS_KEY    
          <br></br>
          &url={inputs.url} <br></br>
          &format={inputs.format} <br></br>
          &width={inputs.width}
          <br></br>
          &height={inputs.height}
          <br></br>
          &no_cookie_banners={inputs.no_cookie_banners}
          <br></br>
          &no_ads={inputs.no_ads}
          <br></br>
        </p>
        <Gallery images={prevImages} />
      </div>

      {quota ? (
        <p className="quota">
          {" "}
          Remaining API calls: {quota.remaining} out of {quota.limit}
        </p>
        ) : (
        <p></p>
      )}

      <br></br>

    </div>
  );
}

export default App
