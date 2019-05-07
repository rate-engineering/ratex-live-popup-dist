# General Overview
The purpose of this library is to show other live feeds of people had purchased products or use promo codes.
By using this library, it popups up the relevant information of the products or codes based on the set timings.
The placement of the library would be where users spend more time on reading or a good place for live feed.

## Integration
```
Add <link rel="stylesheet" href="URL_TO_STYLE_HERE"> at the header / head of the page
Add <script type='text/javascript' async=false defer=false src='URL_TO_SCRIPT_HERE'></script> and <script>popupInit();</script> at the body of the page.
```

### Prerequisites
Make sure hostname of the site is allowed under RateX Store server CORS policy

## Initialisation explanation
![image](https://user-images.githubusercontent.com/21994841/56939494-41a3b100-6b3b-11e9-970e-9bfd7014c7d5.png)

```
initialTime - Time in milliseconds waiting before retrieving the initial set of data which can be set to 0 for 0 milliseconds.
interval - Time in milliseconds waiting before retrieving the new set of data which can be set to 0 for 0 milliseconds.
duration - Time in milliseconds where pop up stays on. This is exclusive of 1-second fade-in and 1-second fade-out animation
numberOfCards: number of popups to display and used for limiting how many data to fetch it out.

popupData - Object for storing the data to display out the popup.
repeadIdCheck - An array used to check the id of the data.
initalTimer - Timer where the popup retrieves the data initially.
interval timer - Timer where the popup retrieves the data at an interval.
durationTimer - Timer where pop up stays on. This is exclusive of 1-second fade-in and 1-second fade-out animation

trigger - Object for checking whether the display exit or not
trigger.timeOutFlag - Boolean for an indication that the durationTimer has run out.
trigger.onMouseOver - Boolean for an indication whether the user hovers over the popup or not.

// Enumerated types
localStorageKey - String for the id of the local storage.

popup - Object of strings for the id/class style according to the CSS stylesheet

popupContainerStatus - Object of strings for the status of the popup
popupContainerStatus.out - String for the popup does not display at all
popupContainerStatus.entrance - String for the popup fade in with the animation
popupContainerStatus.exit - String the popup fade out with animation
fadeOutAnimationTime - Time in milliseconds where popup fade out, which is set according to the fade-out animation time 1 second.

defaultRetrievalTime - Time in milliseconds use to set the initalTime back to default if the check of initalTime is invalid and set the interval back to default if the interval if the check of interval check is invalid.
defaultDuration - Time in milliseconds use to set the duration back to default if the check of the duration is invalid.
durationLimit - Time in milliseconds making sure that the duration is not set lower than the durationLimit(2000).
defaultNumberOfCards - Number use to set the numberOfCards back to default if the check of the numberOfCards is invalid.
```

The calling procedures are as follows excluding mouseover the popup scenario:
1) The popup waits for the initalTime to expire, retrieve the data and display the popup till the duration time is up. 
2) Once the duration finish, the display fades away and the popup waits for the interval time to expire.
3) The popup display till the duration time is u and repeats back step 2.
4) In any point of time, if the user closes the popup, the popup will pause the polling and hence the entire popup sequence.

When user mouseover the popup:
1) The display won't disappear until the user mouseout the popup.
2) If the user mouseover and mouseout rapidly, the popup still waits until the duration time is up.

## Note
The data shown on the popup is stored in local storage (and their index method for each type of data) so that no duplicate data will be shown to the user.
