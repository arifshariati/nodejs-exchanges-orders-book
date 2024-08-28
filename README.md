## NodeJS and Typescript - Get exchanges orders book

Majority of trading platforms are connected to major exchanges around the world. The price offered at any certain point differes from exchange to exchange. The traders are not directly connected to exchanges rather via trading platforms.

Trading platforms can leaverage from various price options available to them via exchanges orders book, during a certain trading activity and calculate price index delievered to theri users. 

### What we need?
As a trading platform, to calculate price index, we need a way to collect orders book from exchanges, perform required calculations and make it available to users.  

[!Note]
> The request for getting orders book from exchanges can be originated either by platform user or platform internal component or system.

### Technial flow
We need to expose a REST endpoint. Whenever the endpoint is hit, it goes and fetches orders book from various exchanges, prunes the incoming data, calculate price index and finally return the price index. 

Orders book from exchanges can be received via REST API and web sockets endpoints. Below is step by step flow;

  1. User hits REST endpoint
  2. Once endpoint hit, server initiates parallel REST and Web Sockets calls to exchanges endpoints.
  3. Once all the request to exchanges are finallized, the servers calculates price index.
  4. Finally the endpoint returns price index to user or request originator. 

### Tech Stack
We shall develop the endpoint in Node JS and Typescript using Nest JS. 
