1.⁠ ⁠Setup Steps
After completing the npm installation, I integrated the PrimeVue library into the project to build the user interface. For state management, I used the Pinia library. I incorporated Vue Router to handle navigation between pages. Additionally, I included the vue-tsc library in the project for unit testing purposes. Within PrimeVue, I integrated the Aura theme to provide support for both dark and light modes. However, due to issues encountered on the socket side, I was not able to dedicate sufficient time to fully implement this feature.

2.⁠ ⁠Technologies Used
Vue 3, Composition API, Socket (Finnhub.IO), PrimeVue, Pinia, TypeScript, Atomic Design, Vite

3.⁠ ⁠Project Structure
By applying Atomic Design principles, I made the components both globally accessible and split them into smaller, manageable parts to improve readability. With the use of Composition API and Pinia, I managed store data in a more performant and optimized way.

4.⁠ ⁠Key Decisions and Their Rationale
On the TrackerPage, I considered whether it would be better to manage data received from the WebSocket via a store or directly as an object. I concluded that using a store would be the most correct and performant approach.

There were occasional disruptions in the data received through the socket. For this reason, I was unable to fully address two minor type errors that appeared while writing unit tests, as I could not test them without a live data stream. To avoid risking the stability of the project, I chose not to intervene in these errors. I attach great importance to type safety; only on the tracker page, and only due to the lack of data flow and testing opportunity, did I have to use any in one instance.

Currently, data colors do not update because, due to problems with the socket connection (caused by Finnhub.IO), the same data is received repeatedly and recent changes are not reflected in the UI. In the video I will include in my submission email, you can see this feature working; however, at the moment, the connection takes longer and the data remains static.

To ensure users are not left waiting without feedback while data loads, I added a loading screen. The loading bar remains active until the data arrives. When the user leaves the tracker page, I terminate the websocket connection and clean up watchers to keep RAM usage to a minimum. Similarly, I clear any unnecessary setTimeout functions in the websocket logic to prevent unnecessary resource consumption.

That concludes my explanation. Thank you for taking the time to read.