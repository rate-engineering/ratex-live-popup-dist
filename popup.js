/*
 * This function may take in parameter of initialTime , followUpTime and duration, numberofCards
 * Usage in sequence order:
  * popupInit()
  * 1) Wait for 10 seconds, display appear for 5 seconds (exclusive of 1 second entrance and 1 second exit).
  * 2) The display fade out.
  * 3) Wait for 5 seconds, the interval time retrieve next data and display again
  * 4) Repeat step 3
  * 
  * popupInit(0, 13000, 7000)
  * 1) Popup immediately appear, display appear for 7 seconds (exclusive of 1 second entrance and 1 second exit).
  * 2) The display fade out.
  * 3) Wait for 13 seconds, the interval time retrieve next data and display again
  * 4) Repeat step 3
  * 
  * User is able to click the display with the following:
    * close (x) to close the display.
    * others open a new tab directs them to ratex.co products or coupons depending on the display shown.
  * Notes:
    * Ensure that this function and style are loaded before instantiating, i.e.
    * <link rel="stylesheet" href="URL_TO_STYLE_HERE">
    * <script type='text/javascript' async=false defer=false src='URL_TO_SCRIPT_HERE'></script>
    * <script>popupInit();</script>
  * 
*/
// closure used lexical scoping such that other functions are not be able to called
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures

/**
 * @param  {number} initialTime   Time in milliseconds for waiting to show the first popup.
 * @param  {number} interval      Time in milliseconds between each popup.
 * @param  {number} duration      Time in milliseconds where pop up stays on. This is exclusive of 1 second fade-in and 1 second fade-out animation.
 * @param  {number} numberOfCards Customize how many cards to read per poll of api feed, as per polling initialTime and interval specified in popupInit.
*/
function popupInit(initialTime = 10000, interval = 5000, duration = 5000, numberOfCards = 5) {
  let popupData = {}; // Object for storing the data to display out the popup.
  let repeatIdCheck = []; // An array used to check the id of the data.
  let initialTimer; // Timer where the popup retrieves the data initially.
  let intervalTimer; //  Timer where the popup retrieves the data at an interval.
  let durationTimer; // Timer where pop up stays on. This is exclusive of 1-second fade-in and 1-second fade-out animation


  let trigger = {
    timeOutFlag : false, // Boolean for an indication that the durationTimer has run out.
    onMouseOver : false, // oolean for an indication whether the user hovers over the popup or not.
  };

  // enum 
  // String for the id of the local storage.
  const localStorageKey = 'popupIdList'; 

  // Id/class style according to the CSS stylesheet
  const popup = {
    popupContainerClass: 'popupContainer',
    imageId: 'imageContent',
    titleId: 'title',
    nameId: 'name',
    timeId: 'time',
    closeId: 'close'
  }

  // The status of the popup
  const popupContainerStatus = {
    out: 'popupContainerOut', // String for the popup does not display at all
    entrance: 'popupContainerEntrance', // String for the popup fade in with the animation
    exit: 'popupContainerExit', // String the popup fade out with animation
  }

  // Time taken to fade out
  const fadeOutAnimationTime = 1000;

  // Set up the app fomo popup
  function setup(){
    const hasPopupIdList = localStorage.getItem(localStorageKey) !== null &&
      Array.isArray(JSON.parse(localStorage.getItem(localStorageKey)));
    if (hasPopupIdList) {
      repeatIdCheck = JSON.parse(localStorage.getItem(localStorageKey));
    }
    const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
    
    // Setting the default time for handling strange parameters
    const defaultRetreivalTime = 10000;
    const defaultDuration = 5000;
    const durationLimit = 2000;
    const defaultNumberOfCards = 5;
    
    // Prevent calling popupSetup function twice
    if (!popupContainer) {
      if (typeof initialTime !== 'number' || initialTime < 0) {
        initialTime = defaultRetreivalTime;
      }
      if (typeof interval !== 'number' || interval < 0) {
        interval = defaultRetreivalTime - defaultDuration;
      }
      interval = interval + fadeOutAnimationTime;
      if (typeof duration !== 'number' || duration <= 0 || duration < durationLimit) {
        duration = defaultDuration;
      }
      if (typeof numberOfCards !== 'number' || numberOfCards < 1) {
        numberOfCards = defaultNumberOfCards;
      }
      createDisplay();
      // when time reaches the initalTime , intervally calls the incoming data, retrieve data and display. 
      initialTimer = setTimeout(function () {
        retrieveData();
      }, initialTime);
    }
  }
  // Create the display of app fomo
  function createDisplay() {
    const popupElement = document.createElement('div');
    popupElement.className = popup.popupContainerClass;
    popupElement.id = popupContainerStatus.out;
    popupElement.innerHTML =
      `<img id=${popup.imageId} />
       <div class='textContainer'>
          <div class='closeContainer'>
          <div id=${popup.titleId}></div>
          <svg id=${popup.closeId} xmlns='http://www.w3.org/2000/svg'
          viewPort= '0 0 12 12' width='11' height='11' fill= 'none'>
            <line x1=1 y1=11 x2= 11 y2=1 stroke=white stroke-width=2></line>
            <line x1=1 y1=1 x2= 11 y2=11 stroke=white stroke-width=2></line>
          </svg>
        </div>
       <div id=${popup.nameId}></div>
       <div id=${popup.timeId}></div>`;
    document.body.appendChild(popupElement);

    popupElement.onclick = function (e) {
      if (e.target.id === popup.closeId || 
          e.target.className === 'SVGAnimatedString' || 
          e.srcElement.matches('svg') || 
          e.srcElement.matches('line')
          ) {
        closePopup();
      } else {
        openInNewTab();
      }
    }
    popupElement.onmouseover = function (e) {
      trigger.onMouseOver = true;
    }
    popupElement.onmouseleave = function (e) {
      trigger.onMouseOver = false;
      if(trigger.timeOutFlag){
        animationForExit();
      }
    }
  }

  // Retrieve the data from ratex.co/store/api/feed
  function retrieveData() {
    const xhr = new XMLHttpRequest();
    // only accurately fetch even number of datas
    const cardNumber = numberOfCards % 2 === 1 ? numberOfCards + 1 : numberOfCards;
    xhr.open('GET', `https://ratex.co/store/api/feed?limit=${cardNumber}`, true);
    xhr.addEventListener("load", function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.response);
        const dataFound = findUniqueID(data.data);
        popupData = {};
        if(!!dataFound){
          popupData.date = calTimeDiff(dataFound.last_success);
          if (dataFound.type === "PRODUCT") {
            popupData.title = "Someone recently purchased";
            popupData.name = dataFound.product.name;
            popupData.image = dataFound.product.images[0];
            popupData.id = `P${dataFound.product.id}`;
            popupData.link = `https://ratex.co/home/${dataFound.product.slug}/p/${dataFound.product.id}`;
          } else {
            popupData.title = "Someone recently used";
            popupData.name = dataFound.coupon.code;
            popupData.image = `https://s3-ap-southeast-1.amazonaws.com/ratex-merchants/icons/ecommerce/${dataFound.coupon.merchant}.png`;
            popupData.id = `C${dataFound.coupon.id}`;
            popupData.link = `https://ratex.co/home/shops#voucher=${dataFound.coupon.id}`;
          }
        }
        updateDisplay();
      }
      // rerun retrieveData if it is server error
      if (xhr.status === 500) {
        retrieveData();
      } 
    }, false);
    xhr.send();
  }

  function findUniqueID(data){
    // reverse the data 
    numberOfCards % 2 === 1 ? data.reverse().splice(0 , 1) :data.reverse();
    return data.find(function(element) {
      const dataId = element.type === "PRODUCT" ?
       `P${element.product.id}` :
       `C${element.coupon.id}`;
       if (repeatIdCheck.indexOf(dataId) === -1) {
         return element;
       } 
    });
  }

  // Calcute the difference between today's time and data's time 
  function calTimeDiff(time) {
    const todayDate = new Date();
    const compareDate = new Date(time);
    const timeDiff = Math.abs(todayDate.getTime() - compareDate.getTime());
    const seconds = 1000;
    const minutes =  seconds * 60;
    const hours = minutes * 60;
    const day = hours * 24;
    let diffDays;
    if(seconds > timeDiff){
      diffDays = `${timeDiff} milliseconds ago`;
    }
    if(timeDiff > seconds){
      diffDays = `${Math.ceil(timeDiff / seconds)} seconds ago`;
    }
    if (timeDiff > minutes) {
      diffDays = `${Math.ceil(timeDiff / minutes)} minutes ago`;
    }
    if (timeDiff > hours) {
      diffDays = `${Math.ceil(timeDiff / hours)} hours ago`;
    }
    if (timeDiff > day) {
      diffDays = `${Math.ceil(timeDiff / day)} days ago`;
    }
    return diffDays;
  }

  // Update the display
  function updateDisplay() {
    if (popupData.name !== undefined){
      const imageContent = document.getElementById(popup.imageId);
      if (imageContent) {
        imageContent.setAttribute('alt', popupData.name);
        imageContent.setAttribute('src', popupData.image);
      }
      const title = document.getElementById(popup.titleId);
      if (title) {
        title.innerText = popupData.title;
      }
      const name = document.getElementById(popup.nameId);
      if (name) {
        name.innerText = popupData.name;
      }
      const time = document.getElementById(popup.timeId);
      if (time && !! popupData.date) {
        time.innerText = popupData.date;
      }
      const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
      if (popupContainer) {
        popupContainer.id = popupContainerStatus.entrance;
      }
      // update the check
      repeatIdCheck.push(popupData.id);
      localStorage.setItem(localStorageKey, JSON.stringify(repeatIdCheck));
      trigger.onMouseOver = false;
      trigger.timeOutFlag = false;
    }
    appearDurationBeforeExit();
  }

  // Duration that the app fomo appears before it disappear
  function appearDurationBeforeExit() {
    durationTimer = setTimeout(function () {
      trigger.timeOutFlag = true;
      animationForExit(); 
    }, duration);
  }

  function animationForExit(){
    const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
    if (popupContainer && !trigger.onMouseOver && trigger.timeOutFlag) {
      popupContainer.id = popupContainerStatus.exit;
      incomingIntervalUpdate();
    }
  }

  // Handles at an interval of followUp time to get the data 
  function incomingIntervalUpdate() {
    intervalTimer = setTimeout(function () {
      retrieveData();
    }, interval);
  }

  // Open a new tab base on the link
  function openInNewTab() {
    if (!!popupData.link) {
      const win = window.open(popupData.link, '_blank');
      win.focus();
    }
  }

  // Close the app fomo popup
  function closePopup() {
    const popupContainer = document.getElementsByClassName(popup.popupContainerClass)[0];
    if (popupContainer) {
      // To make it "disappear"
      popupContainer.id = popupContainerStatus.exit;
    }
    // Stop the time
    clearTimeout(initialTimer);
    clearTimeout(intervalTimer);
    clearTimeout(durationTimer);
  }
  setup();
}
