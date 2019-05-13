# General Overview
This library should be used on longer reading/browsing pages, to popup recently purchase products and use promo codes.

This library is used for promoting products and promo codes towards users, redirecting ratex.co/home with promo code modal or 
ratex.co/home/xxxx page whereby xxxx is the product name when clicked.

## Integration
To implement popup on your website:
1. Copy the following CSS and paste it as close to the opening ```<head>``` tag as possible on the page of your website:
```HTML
<link rel="stylesheet" type="text/css" href="https://github.com/rate-engineering/ratex-live-popup/blob/master/popup.css">
```
2. Copy the following JavaScript and paste it as close to the opening ```<body>``` tag as possible on the page of your website:
```HTML
<script src="https://github.com/rate-engineering/ratex-live-popup/blob/master/popup.js"></script>
<script> popupInit();</script>
```
Make sure hostname of the site is allowed under RateX Store server CORS policy

## Initialisation explanation
The library waits for 10 seconds, retrieve data from the server.

The library has an internal method to check the data, which has 5 cards, that have not been displayed before. 
The card that has passed the check displayed for 5 seconds and fades away.

Next, the following process is repeated:
The library waits for 5 seconds, retrieve data from the server and checks for a card that has not been displayed before.
The passed check card is displayed for 5 seconds and fades away. 

### User interaction
Scenarios that the user interacts with the popup:
* When the page refreshes, the popups only show cards that have not been displayed yet.
The reason behind it is because the library uses local storage for loading and storing the card's id, which is then used for checking the cards.

* When the popup is clicked, the popup redirects to ratex.co/home page depending on what popup it shows:
The promo code popup redirects to ratex.co/home page and shows promo code modal.
The product popup redirects to the ratex.co/home/xxxx page whereby xxxx is the product name.  

* When the user has closed (x) the popup, this library stops showing popups. 

* Whenever the user hovers over the popup, the library prevents the popup from fading away and halts the next interval calling until the user mouse away from the popup.

### Parameters
The ```popupInit()``` has default modifiable parameters : initalTime , interval, duration and numberOfCards.

* initialTime: The time in milliseconds for waiting to show the first popup. The default is 10 seconds.

* interval: The time in milliseconds between each popup. The default is 5 seconds. 

* duration: The time in milliseconds where pop up stays on. This is exclusive of 1 second fade-in and 1 second fade-out animation.
The default is 5 seconds.

* numberOfCards: The number to customize how many cards to read per poll of api feed, as per polling initialTime and interval specified in popupInit. The default is 5.

The timeline of below shows how inititalTime, interval and duration are being used:
![image](https://user-images.githubusercontent.com/21994841/57426259-1a429780-7251-11e9-8b67-625cd90ae297.png)

## Example of usage and parameter modification
```popupInit()```

The number of cards to retrieve from the server is 5.

The library waits for 10 seconds, popup for 5 seconds and fades away.

Next, the library waits for 5 seconds, popup for 5 seconds and fades away whenever there is a new card to show. 


```popupInit(0,1,2,10)```

The number of cards to retrieve from the server is 10.

The library popup for 2 seconds immediately, and fades away.

Next, the library waits for 1 second, popup for 2 seconds and fades away whenever there is a new card to show.
